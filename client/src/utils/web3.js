import Web3 from 'web3';

let web3;
let account;

/**
 * Initialize Web3 and connect to MetaMask
 */
export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      account = accounts[0];
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        account = accounts[0];
        window.location.reload();
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
      return { web3, account };
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw new Error('Failed to connect to MetaMask');
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

/**
 * Get Web3 instance
 */
export const getWeb3 = () => {
  if (!web3) {
    throw new Error('Web3 not initialized. Call initWeb3() first.');
  }
  return web3;
};

/**
 * Get current account
 */
export const getAccount = () => {
  if (!account) {
    throw new Error('No account connected');
  }
  return account;
};

/**
 * Get contract instance
 */
export const getContract = (abi, address) => {
  const web3Instance = getWeb3();
  return new web3Instance.eth.Contract(abi, address);
};

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Get network ID
 */
export const getNetworkId = async () => {
  const web3Instance = getWeb3();
  return await web3Instance.eth.net.getId();
};

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
