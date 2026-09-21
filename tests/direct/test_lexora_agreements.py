import json

import pytest


CREATOR = "0x1111111111111111111111111111111111111111"
COUNTERPARTY = "0x2222222222222222222222222222222222222222"
UNRELATED = "0x3333333333333333333333333333333333333333"


def propose(contract, agreement_id="AGREEMENT-001"):
    return contract.propose_agreement(
        agreement_id, COUNTERPARTY, CREATOR, "private_agreement_breach", "v1",
        "Test agreement", "0xdesc", "0xobligations", "0xcriteria", "0xevidence",
        json.dumps(["PAY", "REFUND"]), 1000, 1000, 7, 30, 45,
    )


def test_proposal_acceptance_and_pickling(direct_vm, direct_deploy):
    direct_vm.check_pickling = True
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    assert propose(contract) == "AGREEMENT-001"
    agreement = json.loads(contract.get_agreement("AGREEMENT-001"))
    assert agreement["lifecycleState"] == "PROPOSED"
    assert agreement["funder"] == CREATOR
    assert agreement["proposedAt"] == 1735689600

    direct_vm.sender = COUNTERPARTY
    contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])
    accepted = json.loads(contract.get_agreement("AGREEMENT-001"))
    assert accepted["lifecycleState"] == "ACCEPTED_PENDING_FUNDING"
    assert accepted["acceptedAt"] == 1735689600


def test_invalid_acceptance_and_mutation_are_rejected(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    agreement = json.loads(contract.get_agreement("AGREEMENT-001"))

    direct_vm.sender = UNRELATED
    with direct_vm.expect_revert("Only the counterparty may accept"):
        contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])

    direct_vm.sender = COUNTERPARTY
    with direct_vm.expect_revert("Agreement commitment mismatch"):
        contract.accept_agreement("AGREEMENT-001", 1, "0xwrong")
    contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])
    with direct_vm.expect_revert("Agreement is not proposed"):
        contract.accept_agreement("AGREEMENT-001", 1, agreement["commitment"])


def test_duplicate_parties_and_ids_are_rejected(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    with direct_vm.expect_revert("Creator and counterparty cannot be identical"):
        contract.propose_agreement(
            "AGREEMENT-X", CREATOR, CREATOR, "private_agreement_breach", "v1",
            "Test agreement", "0xdesc", "0xobligations", "0xcriteria", "0xevidence",
            "[]", 1000, 1000, 7, 30, 45,
        )
    propose(contract)
    with direct_vm.expect_revert("Agreement ID already exists"):
        propose(contract)


def test_only_creator_can_cancel_and_activation_requires_funding(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract)
    direct_vm.sender = COUNTERPARTY
    with direct_vm.expect_revert("Only the creator may cancel"):
        contract.cancel_agreement("AGREEMENT-001")
    with direct_vm.expect_revert("Agreement is not awaiting funding"):
        contract.activate_agreement("AGREEMENT-001")
    direct_vm.sender = CREATOR
    contract.cancel_agreement("AGREEMENT-001")
    assert contract.get_agreement_state("AGREEMENT-001") == "CANCELLED"


def test_acceptance_deadline_uses_transaction_time(direct_vm, direct_deploy):
    direct_vm.warp("2025-01-01T00:00:00Z")
    contract = direct_deploy("contracts/LexoraArbitration.py")
    direct_vm.sender = CREATOR
    propose(contract, "AGREEMENT-TIME")
    agreement = json.loads(contract.get_agreement("AGREEMENT-TIME"))
    assert agreement["proposedAt"] == 1735689600
    assert agreement["acceptanceDeadlineTs"] == 1736294400
