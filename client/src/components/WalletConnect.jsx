import { useState, useEffect } from 'react';
import { initWeb3, isMetaMaskInstalled, formatAddress } from '../utils/web3';
import './WalletConnect.css';

function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      const { web3, account } = await initWeb3();
      if (account) {
        setAccount(account);
        onConnect({ web3, account });
      }
    } catch (err) {
      console.error('Auto-connect failed:', err);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
      }

      const { web3, account } = await initWeb3();
      setAccount(account);
      onConnect({ web3, account });
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (account) {
    return (
      <div className="wallet-connected">
        <span className="status-indicator"></span>
        <span className="account-address">{formatAddress(account)}</span>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button 
        onClick={connectWallet} 
        disabled={loading}
        className="connect-button"
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default WalletConnect;
