// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EvidenceChain {
    // Structure to hold Evidence details
    struct Evidence {
        string id;          // Unique Evidence ID (e.g., EV-1024)
        string caseId;      // Associated Case ID (e.g., CASE-2025-001)
        string fileHash;    // Cryptographic Hash of the file (or filename for demo)
        string docType;     // Type of evidence (Image, Video, etc.)
        string custodian;   // Current Officer in charge (Badge ID)
        uint256 timestamp;  // Time of recording
    }

    // List to store all evidence records
    Evidence[] public evidenceLog;

    // Events to broadcast actions to the network
    event EvidenceAdded(string id, string caseId, string custodian, uint256 timestamp);
    event CustodyTransferred(string id, string newCustodian, uint256 timestamp);

    // Function to add new evidence to the blockchain
    function addEvidence(
        string memory _id,
        string memory _caseId,
        string memory _fileHash,
        string memory _docType,
        string memory _custodian
    ) public {
        evidenceLog.push(Evidence(_id, _caseId, _fileHash, _docType, _custodian, block.timestamp));
        emit EvidenceAdded(_id, _caseId, _custodian, block.timestamp);
    }

    // Function to transfer custody of evidence
    function transferCustody(string memory _id, string memory _newCustodian) public {
        for(uint i=0; i<evidenceLog.length; i++) {
            // Compare strings by hashing them first
            if(keccak256(bytes(evidenceLog[i].id)) == keccak256(bytes(_id))) {
                evidenceLog[i].custodian = _newCustodian;
                emit CustodyTransferred(_id, _newCustodian, block.timestamp);
                break;
            }
        }
    }

    // Function to retrieve the entire ledger history
    function getAllEvidence() public view returns (Evidence[] memory) {
        return evidenceLog;
    }
}