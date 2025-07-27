// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionValidator {
    struct Transaction {
        address sender;
        address recipient;
        uint amount;
        uint timestamp;
        bool validated;
    }

    mapping(bytes32 => Transaction) public transactions;

    event TransactionCreated(address sender, address recipient, uint amount, bytes32 txHash, uint timestamp);
    event TransactionValidated(address sender, bytes32 txHash);

    function createTransaction(address recipient, uint amount) public returns (bytes32) {
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Recipient is required");

        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, recipient, amount, block.timestamp));

        transactions[txHash] = Transaction(msg.sender, recipient, amount, block.timestamp, false);
        emit TransactionCreated(msg.sender, recipient, amount, txHash, block.timestamp);
        return txHash;
    }

    function validateTransaction(bytes32 txHash) public {
        Transaction storage txn = transactions[txHash];
        require(txn.sender != address(0), "Transaction does not exist");
        require(!txn.validated, "Transaction already validated");
        txn.validated = true;
        emit TransactionValidated(txn.sender, txHash);
    }
}
