// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransactionValidator {
    event TransactionCreated(address indexed sender, string recipient, uint256 amount, bytes32 txHash);

    function createTransaction(string memory recipient, uint256 amount) public returns (bytes32) {
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, recipient, amount, block.timestamp));
        emit TransactionCreated(msg.sender, recipient, amount, txHash);
        return txHash;
    }

    function validateTransaction(bytes32 txHash) public pure returns (bool) {
        // For demo, always returns true
        return true;
    }
} 