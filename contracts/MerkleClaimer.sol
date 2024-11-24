// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleClaimer is Ownable {
    bytes32 public merkleRoot; // Корень Merkle Tree
    mapping(address => bool) public hasClaimed; // Учет получателей

    event Claimed(address indexed claimer);
    event MerkleRootUpdated(bytes32 indexed newMerkleRoot);
    constructor(bytes32 _merkleRoot) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }
    function verifyClaim(address claimer, bytes32[] calldata _merkleProof) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(claimer));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }
    // Функция для получения корня дерева
    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }
    function claim(bytes32[] calldata _merkleProof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        // Хэширование текущего адреса
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));

        // Проверка доказательства
        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );

        hasClaimed[msg.sender] = true;

        emit Claimed(msg.sender);
    }
}
