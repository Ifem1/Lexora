import hashlib
import json

import pytest


CREATOR = "0x1111111111111111111111111111111111111111"
COUNTERPARTY = "0x2222222222222222222222222222222222222222"
UNRELATED = "0x3333333333333333333333333333333333333333"


def propose(contract, agreement_id="AGREEMENT-001", required=1000, maximum=1000):
    return contract.propose_agreement(
        agreement_id,
        COUNTERPARTY,
        CREATOR,
        "private_agreement_breach",
        "v1",
        "Test agreement",
        "0xdesc",
        "0xobligations",
        "0xcriteria",
        "0xevidence",
        json.dumps(["PAY", "REWORK", "NO_ACTION"]),
        maximum,
        required,
        7,
        30,
        45,
    )


def accept(contract, direct_vm, agreement_id="AGREEMENT-001"):
    direct_vm.sender = COUNTERPARTY
    agreement = json.loads(contract.get_agreement(agreement_id))
    contract.accept_agreement(agreement_id, 1, agreement["commitment"])


def fund(contract, direct_vm, amount, agreement_id="AGREEMENT-001"):
    direct_vm.sender = CREATOR
    direct_vm.value = amount
    try:
        contract.deposit_escrow(agreement_id)
    finally:
        direct_vm.value = 0


def open_dispute(contract, direct_vm, agreement_id="AGREEMENT-001"):
    direct_vm.sender = CREATOR
    return contract.open_dispute(
        agreement_id,
        "0xmanifest",
        "Material delivery dispute",
        "AGREEMENT_DISPUTE",
        7,
        False,
    )


def test_proposal_acceptance_and_pickling(direct_vm, direct_deploy):
    direct_vm.check_pickling = True
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR

    assert propose(contract) == "AGREEMENT-001"
    agreement = json.loads(contract.get_agreement("AGREEMENT-001"))
    assert agreement["lifecycleState"] == "PROPOSED"
    assert agreement["funder"] == CREATOR
    assert agreement["proposedAt"] > 0
    assert agreement["acceptanceDeadlineTs"] - agreement["proposedAt"] == 7 * 86400

    accept(contract, direct_vm)
    accepted = json.loads(contract.get_agreement("AGREEMENT-001"))
    assert accepted["lifecycleState"] == "ACCEPTED_PENDING_FUNDING"
    assert accepted["acceptedAt"] >= accepted["proposedAt"]
    assert contract.get_funding_state("AGREEMENT-001") == "UNFUNDED"


def test_invalid_acceptance_cancellation_and_mutation_rejected(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    agreement = json.loads(contract.get_agreement("AGREEMENT-001"))

    direct_vm.sender = UNRELATED
    with pytest.raises(AssertionError, match="Only the counterparty may accept"):
        contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])

    direct_vm.sender = COUNTERPARTY
    with pytest.raises(AssertionError, match="Agreement commitment mismatch"):
        contract.accept_agreement("AGREEMENT-001", 1, "0xwrong")
    contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])
    with pytest.raises(AssertionError, match="Agreement is not proposed"):
        contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])

    direct_vm.sender = CREATOR
    with pytest.raises(AssertionError, match="Accepted agreements cannot be cancelled"):
        contract.cancel_agreement("AGREEMENT-001")


def test_duplicate_parties_ids_and_unsafe_remedy_sets_rejected(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR

    with pytest.raises(AssertionError, match="Creator and counterparty cannot be identical"):
        contract.propose_agreement(
            "AGREEMENT-X", CREATOR, CREATOR, "private_agreement_breach", "v1",
            "Test agreement", "0xdesc", "0xobligations", "0xcriteria", "0xevidence",
            json.dumps(["PAY", "NO_ACTION"]), 1000, 1000, 7, 30, 45,
        )

    with pytest.raises(AssertionError, match="NO_ACTION must remain permitted"):
        contract.propose_agreement(
            "AGREEMENT-NO-FALLBACK", COUNTERPARTY, CREATOR,
            "private_agreement_breach", "v1", "Test agreement",
            "0xdesc", "0xobligations", "0xcriteria", "0xevidence",
            json.dumps(["PAY"]), 1000, 1000, 7, 30, 45,
        )

    propose(contract)
    with pytest.raises(AssertionError, match="Agreement ID already exists"):
        propose(contract)


def test_acceptance_deadline_uses_transaction_time(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract, "AGREEMENT-TIME")
    agreement_json = json.loads(contract.get_agreement("AGREEMENT-TIME"))
    assert agreement_json["acceptanceDeadlineTs"] - agreement_json["proposedAt"] == 7 * 86400

    # Direct Mode 0.29.2 does not apply direct_vm.warp() to GenVM's documented
    # standard-library transaction clock. Set only the stored boundary so the
    # acceptance-expiry guard itself remains covered deterministically.
    stored = contract._get_agreement("AGREEMENT-TIME")
    stored.acceptance_deadline_ts = type(stored.acceptance_deadline_ts)(1)
    contract.agreements["AGREEMENT-TIME"] = stored
    direct_vm.sender = COUNTERPARTY
    with pytest.raises(AssertionError, match="acceptance window has expired"):
        contract.accept_agreement("AGREEMENT-TIME", 1, agreement_json["commitment"])

def test_real_payable_escrow_zero_topup_overfunding_and_conservation(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)

    direct_vm.sender = CREATOR
    direct_vm.value = 0
    with pytest.raises(AssertionError, match="must include native GEN value"):
        contract.deposit_escrow("AGREEMENT-001")

    direct_vm.sender = UNRELATED
    direct_vm.value = 100
    with pytest.raises(AssertionError, match="Only the designated funder"):
        contract.deposit_escrow("AGREEMENT-001")
    direct_vm.value = 0

    fund(contract, direct_vm, 400)
    first = json.loads(contract.get_escrow("AGREEMENT-001"))
    assert first["totalDeposited"] == 400
    assert first["available"] == 400
    assert contract.get_funding_state("AGREEMENT-001") == "PARTIALLY_FUNDED"
    assert json.loads(contract.get_agreement("AGREEMENT-001"))["lifecycleState"] == "ACCEPTED_PENDING_FUNDING"

    direct_vm.sender = CREATOR
    direct_vm.value = 601
    with pytest.raises(AssertionError, match="exceeds required funding"):
        contract.deposit_escrow("AGREEMENT-001")
    direct_vm.value = 0

    fund(contract, direct_vm, 600)
    final = json.loads(contract.get_escrow("AGREEMENT-001"))
    assert final["totalDeposited"] == 1000
    assert final["available"] == 1000
    assert final["reserved"] == 0
    assert final["claimable"] == 0
    assert final["refundable"] == 0
    assert final["paid"] == 0
    assert final["refunded"] == 0
    assert sum(final[key] for key in (
        "available", "reserved", "claimable", "refundable", "paid", "refunded"
    )) == final["totalDeposited"]
    assert contract.get_funding_state("AGREEMENT-001") == "FUNDED"
    assert json.loads(contract.get_agreement("AGREEMENT-001"))["lifecycleState"] == "ACTIVE"


def test_dispute_requires_active_agreement_derives_parties_and_reserves_once(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)

    direct_vm.sender = CREATOR
    with pytest.raises(AssertionError, match="ACTIVE funded agreement"):
        open_dispute(contract, direct_vm)

    fund(contract, direct_vm, 1000)

    direct_vm.sender = UNRELATED
    with pytest.raises(AssertionError, match="accepted agreement party"):
        contract.open_dispute(
            "AGREEMENT-001", "0xmanifest", "Invalid outsider dispute",
            "AGREEMENT_DISPUTE", 7, False,
        )

    case_id = open_dispute(contract, direct_vm)
    case = json.loads(contract.get_case(case_id))
    escrow = json.loads(contract.get_escrow("AGREEMENT-001"))

    assert case["agreementId"] == "AGREEMENT-001"
    assert case["claimant"].lower() == CREATOR.lower()
    assert case["respondent"].lower() == COUNTERPARTY.lower()
    assert case["reservedAmount"] == 1000
    assert escrow["available"] == 0
    assert escrow["reserved"] == 1000
    assert escrow["activeDisputeId"] == case_id

    with pytest.raises(AssertionError, match="Only one unresolved monetary dispute"):
        open_dispute(contract, direct_vm)

    with pytest.raises(AssertionError, match="Legacy create_case is disabled"):
        contract.create_case(
            "private_agreement_breach", "0xlegacy", "Legacy bypass",
            "AGREEMENT_DISPUTE", COUNTERPARTY, 7, False,
        )


def test_evidence_is_append_only_deduplicated_and_locked(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)
    fund(contract, direct_vm, 1000)
    case_id = open_dispute(contract, direct_vm)

    direct_vm.sender = CREATOR
    contract.submit_claim(case_id, "0xclaim", "", "0xsummary")
    evidence_id = contract.submit_evidence_record(
        case_id, "CLAIMANT_EVIDENCE", "CONTRACT", "",
        "Accepted scope and delivery requirements", "0xev-1",
    )
    assert evidence_id.startswith("EVIDENCE-")

    with pytest.raises(AssertionError, match="Duplicate evidence commitment"):
        contract.submit_evidence_record(
            case_id, "CLAIMANT_EVIDENCE", "CONTRACT", "",
            "Duplicate", "0xev-1",
        )

    direct_vm.sender = COUNTERPARTY
    with pytest.raises(AssertionError, match="Only the claimant may submit claimant evidence"):
        contract.submit_evidence_record(
            case_id, "CLAIMANT_EVIDENCE", "CONTRACT", "",
            "Wrong role", "0xev-2",
        )
    contract.submit_response(case_id, "0xresponse", "")
    contract.submit_evidence_record(
        case_id, "RESPONDENT_EVIDENCE", "MESSAGE", "",
        "Response evidence", "0xev-3",
    )

    contract.lock_evidence(case_id)
    locked = json.loads(contract.get_case(case_id))
    assert locked["evidenceState"] == "EVIDENCE_LOCKED"
    assert locked["evidenceRoot"].startswith("0x")

    with pytest.raises(AssertionError, match="Original evidence is locked"):
        contract.submit_evidence_record(
            case_id, "COUNTER_EVIDENCE", "OTHER", "",
            "Late original evidence", "0xev-4",
        )
    with pytest.raises(AssertionError, match="Replaceable evidence roots are disabled"):
        contract.submit_evidence(case_id, "0xmanifest", "0xroot")


def test_ruling_economic_fields_are_deterministically_bounded(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract, maximum=1000, required=1000)
    accept(contract, direct_vm)
    fund(contract, direct_vm, 1000)
    case_id = open_dispute(contract, direct_vm)

    ruling = contract._parse_ruling(
        json.dumps({
            "outcome": "CLAIMANT_PREVAILS",
            "confidence": 94,
            "liabilityBps": 15000,
            "remedy": {"action": "PAY", "amountBasis": "model text ignored for amount", "deadlineDays": 0, "notes": ""},
            "reasoningSummary": "bounded test",
            "proceduralWarnings": [],
            "ruleApplication": [],
            "evidenceMap": [],
        }),
        case_id,
        "RULING-TEST",
    )
    assert int(ruling.liability_bps) == 10000
    assert int(ruling.bounded_award) == 1000

    no_award = contract._parse_ruling(
        json.dumps({
            "outcome": "RESPONDENT_PREVAILS",
            "confidence": 80,
            "liabilityBps": 10000,
            "remedy": {"action": "PAY", "deadlineDays": 0},
        }),
        case_id,
        "RULING-NO-AWARD",
    )
    assert int(no_award.liability_bps) == 0
    assert int(no_award.bounded_award) == 0

    with pytest.raises(AssertionError, match="not permitted by the accepted agreement"):
        contract._parse_ruling(
            json.dumps({
                "outcome": "CLAIMANT_PREVAILS",
                "confidence": 80,
                "liabilityBps": 10000,
                "remedy": {"action": "REFUND", "deadlineDays": 0},
            }),
            case_id,
            "RULING-BAD-REMEDY",
        )


def test_cancel_releases_reservation_and_prevents_double_spend(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)
    fund(contract, direct_vm, 1000)
    case_id = open_dispute(contract, direct_vm)

    contract.cancel_case(case_id)
    case = json.loads(contract.get_case(case_id))
    escrow = json.loads(contract.get_escrow("AGREEMENT-001"))
    assert case["status"] == "CANCELLED"
    assert escrow["reserved"] == 0
    assert escrow["available"] == 1000
    assert escrow["activeDisputeId"] == ""


def test_legacy_economic_bypasses_are_disabled(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    with pytest.raises(AssertionError, match="accept_ruling cannot bypass"):
        contract.accept_ruling("CASE-X", "RULING-X")
    with pytest.raises(AssertionError, match="mark_settled is disabled"):
        contract.mark_settled("CASE-X")
