# Digital Certificate DApp

A decentralized application (DApp) for issuing, verifying, and managing digital certificates on the blockchain with IPFS storage.

## 🏗️ Architecture

This is a monorepo project consisting of three main components:

### 1. Smart Contract (`/smart_contract`)
- **Technology**: Solidity, Hardhat
- **Features**:
  - Issue certificates to recipients
  - Verify certificate authenticity
  - Revoke certificates with reason tracking
  - Authorization management for issuers
  - Event emission for all certificate operations

### 2. Client (`/client`)
- **Technology**: React, Vite, Web3.js
- **Features**:
  - MetaMask integration for wallet connection
  - Certificate issuance interface
  - Certificate verification with QR code support
  - QR code scanning for verification
  - Responsive UI design

### 3. Server (`/server`)
- **Technology**: Node.js, Express
- **Features**:
  - API endpoints for certificate operations
  - IPFS integration for metadata storage
  - File upload support
  - RESTful API design

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MetaMask browser extension
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd certifcate-dapp
```

2. Install dependencies for all packages:
```bash
npm run install:all
```

Or install individually:
```bash
cd smart_contract && npm install
cd ../client && npm install
cd ../server && npm install
```

### Configuration

#### Smart Contract
1. Copy `.env.example` to `.env` in the `smart_contract` directory
2. Update the environment variables:
```env
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
```

#### Client
1. Copy `.env.example` to `.env` in the `client` directory
2. Update the contract address after deployment:
```env
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

#### Server
1. Copy `.env.example` to `.env` in the `server` directory
2. Configure IPFS and other settings:
```env
PORT=3001
IPFS_URL=http://localhost:5001
```

## 🔧 Development

### Smart Contract

Compile contracts:
```bash
cd smart_contract
npm run compile
```

Run tests:
```bash
npm run test
```

Deploy to local network:
```bash
# Start local node
npm run node

# Deploy (in another terminal)
npm run deploy
```

Deploy to testnet:
```bash
npm run deploy:sepolia
```

### Client

Start development server:
```bash
cd client
npm run dev
```

Build for production:
```bash
npm run build
```

### Server

Start development server:
```bash
cd server
npm run dev
```

Start production server:
```bash
npm start
```

## 📋 Usage

1. **Deploy Smart Contract**: Deploy the CertificateRegistry contract to your chosen network
2. **Update Configuration**: Update the contract address in the client `.env` file
3. **Start Services**:
   - Start the server: `cd server && npm run dev`
   - Start the client: `cd client && npm run dev`
4. **Connect Wallet**: Open the client in your browser and connect MetaMask
5. **Issue Certificates**: Use the Issue Certificate tab to create new certificates
6. **Verify Certificates**: Use the Verify Certificate tab to verify existing certificates

## 🔐 Smart Contract Functions

### Main Functions
- `issueCertificate(address recipient, string ipfsHash)`: Issue a new certificate
- `verifyCertificate(uint256 certificateId)`: Verify certificate validity
- `revokeCertificate(uint256 certificateId, string reason)`: Revoke a certificate
- `authorizeIssuer(address issuer)`: Authorize a new issuer (admin only)
- `revokeIssuer(address issuer)`: Revoke issuer authorization (admin only)

### View Functions
- `getCertificate(uint256 certificateId)`: Get certificate details
- `getRecipientCertificates(address recipient)`: Get all certificates for a recipient
- `isAuthorizedIssuer(address)`: Check if an address is an authorized issuer

## 🌐 API Endpoints

### Certificate Endpoints
- `POST /api/certificates/metadata`: Upload certificate metadata to IPFS
- `GET /api/certificates/metadata/:hash`: Retrieve metadata from IPFS
- `POST /api/certificates/generate`: Generate certificate data

### IPFS Endpoints
- `POST /api/ipfs/upload-json`: Upload JSON data to IPFS
- `POST /api/ipfs/upload-file`: Upload file to IPFS
- `GET /api/ipfs/:hash`: Retrieve data from IPFS

## 🧪 Testing

Run smart contract tests:
```bash
cd smart_contract
npm run test
```

## 📦 Technologies Used

- **Blockchain**: Ethereum, Solidity
- **Smart Contract Framework**: Hardhat
- **Frontend**: React, Vite
- **Web3**: Web3.js
- **Backend**: Node.js, Express
- **Storage**: IPFS
- **QR Code**: qrcode.react, html5-qrcode

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.
