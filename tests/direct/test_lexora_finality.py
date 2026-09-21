import json

import pytest

from test_lexora_agreements import (
    CREATOR,
    COUNTERPARTY,
    accept,
    fund,
    open_dispute,
    propose,
)


def setup_funded_dispute(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)
    fund(contract, direct_vm, 1000)
    case_id = open_dispute(contract, direct_vm)
    return contract, case_id


def store_initial_ruling(contract, case_id, *, outcome="CLAIMANT_PREVAILS", bps=6000, action="PAY"):
    ruling_id = "RULING-TEST-INITIAL"
    ruling = contract._parse_ruling(
        json.dumps({
            "outcome": outcome,
            "confidence": 90,
            "liabilityBps": bps,
            "remedy": {"action": action, "amountBasis": "", "deadlineDays": 0, "notes": ""},
            "reasoningSummary": "test ruling",
            "proceduralWarnings": [],
            "ruleApplication": [],
            "evidenceMap": [],
        }),
        case_id,
        ruling_id,
    )
    contract.rulings[ruling_id] = ruling
    case = contract._get_case(case_id)
    case.ruling_id = ruling_id
    case.initial_ruling_id = ruling_id
    case.status = "RULING_ISSUED"
    case.appeal_deadline_ts = type(case.appeal_deadline_ts)(
        int(contract._agreement_now()) + 3 * 86400
    )
    contract.cases[case_id] = case
    return ruling_id


def test_appeal_evidence_is_separate_from_locked_original(direct_vm, direct_deploy):
    contract, case_id = setup_funded_dispute(direct_vm, direct_deploy)

    direct_vm.sender = CREATOR
    contract.submit_claim(case_id, "0xclaim", "", "0xsummary")
    contract.submit_evidence_record(
        case_id, "CLAIMANT_EVIDENCE", "CONTRACT", "",
        "Original evidence", "0xoriginal",
    )

    direct_vm.sender = COUNTERPARTY
    contract.submit_response(case_id, "0xresponse", "")
    direct_vm.sender = CREATOR
    contract.lock_evidence(case_id)
    original = json.loads(contract.get_case_evidence(case_id, False))
    original_root = json.loads(contract.get_case(case_id))["evidenceRoot"]

    store_initial_ruling(contract, case_id)

    appeal_id = contract.submit_appeal_evidence(
        case_id, "PUBLIC_RECORD", "https://example.com/evidence",
        "New material evidence", "0xappeal",
    )
    assert appeal_id.startswith("EVIDENCE-")
    assert len(json.loads(contract.get_case_evidence(case_id, False))) == len(original)
    assert len(json.loads(contract.get_case_evidence(case_id, True))) == 1
    assert json.loads(contract.get_case(case_id))["evidenceRoot"] == original_root


def test_invalid_duplicate_and_expired_appeal_paths_reject_before_consensus(direct_vm, direct_deploy):
    contract, case_id = setup_funded_dispute(direct_vm, direct_deploy)
    store_initial_ruling(contract, case_id)
    direct_vm.sender = CREATOR

    with pytest.raises(AssertionError, match="Invalid appeal ground"):
        contract.appeal_ruling(
            case_id,
            json.dumps({"appealGround": "ANYTHING_I_WANT", "appealStatement": "invalid"}),
        )

    case = contract._get_case(case_id)
    case.appeal_id = "RULING-ALREADY-APPEALED"
    contract.cases[case_id] = case
    with pytest.raises(AssertionError, match="Only one application-level appeal"):
        contract.appeal_ruling(
            case_id,
            json.dumps({"appealGround": "PROCEDURAL_ERROR", "appealStatement": "second appeal"}),
        )

    case.appeal_id = ""
    case.appeal_deadline_ts = type(case.appeal_deadline_ts)(1)
    contract.cases[case_id] = case
    with pytest.raises(AssertionError, match="appeal window has expired"):
        contract.appeal_ruling(
            case_id,
            json.dumps({"appealGround": "PROCEDURAL_ERROR", "appealStatement": "too late"}),
        )


def test_settlement_moves_reserved_to_claimable_and_releases_unused(direct_vm, direct_deploy):
    contract, case_id = setup_funded_dispute(direct_vm, direct_deploy)
    store_initial_ruling(contract, case_id, bps=6000)

    case = contract._get_case(case_id)
    case.appeal_deadline_ts = type(case.appeal_deadline_ts)(1)
    contract.cases[case_id] = case
    contract.finalize_no_appeal(case_id)

    escrow = json.loads(contract.get_escrow("AGREEMENT-001"))
    settlement = json.loads(contract.get_settlement(case_id))
    case_json = json.loads(contract.get_case(case_id))

    assert case_json["status"] == "SETTLEMENT_READY"
    assert settlement["awardAmount"] == 600
    assert settlement["releasedAmount"] == 400
    assert escrow["reserved"] == 0
    assert escrow["claimable"] == 600
    assert escrow["available"] == 400
    assert (
        escrow["available"] + escrow["reserved"] + escrow["claimable"]
        + escrow["refundable"] + escrow["paid"] + escrow["refunded"]
        == escrow["totalDeposited"]
    )

    with pytest.raises(AssertionError, match="Settlement has already been prepared"):
        contract._prepare_settlement(case_id)

    with pytest.raises(AssertionError, match="actual GEN transfer"):
        contract.finalize_zero_award_settlement(case_id)

def test_zero_award_settlement_can_finalize_without_outward_transfer(direct_vm, direct_deploy):
    contract, case_id = setup_funded_dispute(direct_vm, direct_deploy)
    store_initial_ruling(
        contract, case_id,
        outcome="RESPONDENT_PREVAILS",
        bps=10000,
        action="NO_ACTION",
    )
    case = contract._get_case(case_id)
    case.appeal_deadline_ts = type(case.appeal_deadline_ts)(1)
    contract.cases[case_id] = case
    contract.finalize_no_appeal(case_id)

    settlement = json.loads(contract.get_settlement(case_id))
    assert settlement["awardAmount"] == 0

    contract.finalize_zero_award_settlement(case_id)
    case_json = json.loads(contract.get_case(case_id))
    escrow = json.loads(contract.get_escrow("AGREEMENT-001"))
    assert case_json["status"] == "SETTLED"
    assert case_json["settlementState"] == "SETTLED"
    assert escrow["activeDisputeId"] == ""

def test_no_appeal_finalization_requires_expired_window(direct_vm, direct_deploy):
    contract, case_id = setup_funded_dispute(direct_vm, direct_deploy)
    store_initial_ruling(contract, case_id, outcome="RESPONDENT_PREVAILS", bps=0, action="NO_ACTION")

    with pytest.raises(AssertionError, match="appeal window is still open"):
        contract.finalize_no_appeal(case_id)

    case = contract._get_case(case_id)
    case.appeal_deadline_ts = type(case.appeal_deadline_ts)(1)
    contract.cases[case_id] = case
    contract.finalize_no_appeal(case_id)
    case_json = json.loads(contract.get_case(case_id))
    assert case_json["finalRulingId"] == "RULING-TEST-INITIAL"
    assert case_json["status"] == "SETTLEMENT_READY"

def test_available_funds_can_only_become_refundable_after_dispute_window(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    accept(contract, direct_vm)
    fund(contract, direct_vm, 1000)

    with pytest.raises(AssertionError, match="dispute window is still open"):
        contract.prepare_funder_refund("AGREEMENT-001")

    agreement = contract._get_agreement("AGREEMENT-001")
    agreement.dispute_deadline_ts = type(agreement.dispute_deadline_ts)(1)
    contract.agreements["AGREEMENT-001"] = agreement
    contract.prepare_funder_refund("AGREEMENT-001")
    escrow = json.loads(contract.get_escrow("AGREEMENT-001"))
    assert escrow["available"] == 0
    assert escrow["refundable"] == 1000
    assert escrow["refunded"] == 0
    assert escrow["refundTransferPending"] is False

    # The outward REFUNDABLE -> transferred/refunded confirmation remains a
    # Studio/runtime verification step; Direct Mode must not fake that success.

