import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('issue');

  const handleConnect = ({ web3: web3Instance, account: accountAddress }) => {
    setWeb3(web3Instance);
    setAccount(accountAddress);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 Digital Certificate DApp</h1>
        <WalletConnect onConnect={handleConnect} />
      </header>

      <main className="app-main">
        {!web3 ? (
          <div className="welcome-message">
            <h2>Welcome to the Digital Certificate DApp</h2>
            <p>Please connect your wallet to continue</p>
            <div className="features">
              <div className="feature">
                <span className="icon">📜</span>
                <h3>Issue Certificates</h3>
                <p>Create and issue blockchain-verified certificates</p>
              </div>
              <div className="feature">
                <span className="icon">✅</span>
                <h3>Verify Authenticity</h3>
                <p>Verify certificates using QR codes or ID</p>
              </div>
              <div className="feature">
                <span className="icon">🔒</span>
                <h3>Secure & Transparent</h3>
                <p>Stored on blockchain with IPFS metadata</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <nav className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'issue' ? 'active' : ''}`}
                onClick={() => setActiveTab('issue')}
              >
                Issue Certificate
              </button>
              <button
                className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
                onClick={() => setActiveTab('verify')}
              >
                Verify Certificate
              </button>
            </nav>

            <div className="tab-content">
              {activeTab === 'issue' && <IssueCertificate web3={web3} />}
              {activeTab === 'verify' && <VerifyCertificate web3={web3} />}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Ethereum, IPFS, and React</p>
      </footer>
    </div>
  );
}

export default App;

