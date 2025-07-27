// backend/blockchain.js
import Web3 from 'web3';

const contractABI = [ 
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "recipient",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "txHash",
          "type": "bytes32"
        }
      ],
      "name": "TransactionCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "recipient",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "createTransaction",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "txHash",
          "type": "bytes32"
        }
      ],
      "name": "validateTransaction",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ];

const contractAddress = '0xc683EE9b201Bcd553A1c0415822f5ed5c9149655'; // your deployed address

// Initialize Web3 with error handling
let web3 = null;
let contract = null;

try {
  // Try to connect to local blockchain first
  web3 = new Web3('http://localhost:8545');
  
  // Test the connection
  web3.eth.net.isListening()
    .then(() => {
      console.log('✅ Connected to local blockchain at http://localhost:8545');
      contract = new web3.eth.Contract(contractABI, contractAddress);
    })
    .catch((error) => {
      console.log('❌ Local blockchain not available, using fallback mode');
      console.log('Error:', error.message);
      web3 = null;
      contract = null;
    });
} catch (error) {
  console.log('❌ Failed to initialize Web3, using fallback mode');
  console.log('Error:', error.message);
  web3 = null;
  contract = null;
}

// Function to check if blockchain is available
export const isBlockchainAvailable = () => {
  return web3 !== null && contract !== null;
};

export { web3, contract };
