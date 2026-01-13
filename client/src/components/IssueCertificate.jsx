import { useState } from 'react';
import { getContract, getAccount } from '../utils/web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contracts/CertificateRegistry';
import './IssueCertificate.css';

function IssueCertificate({ web3 }) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [certificateData, setCertificateData] = useState({
    name: '',
    course: '',
    date: '',
    description: ''
  });
  const [ipfsHash, setIpfsHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToIPFS = async (data) => {
    // Placeholder for IPFS upload - in production, this should use a real IPFS service
    // For now, we'll simulate by creating a hash from the data
    const jsonString = JSON.stringify(data);
    const simulatedHash = 'Qm' + btoa(jsonString).substring(0, 44);
    return simulatedHash;
  };

  const issueCertificate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!web3.utils.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Upload certificate data to IPFS
      const hash = await uploadToIPFS(certificateData);
      setIpfsHash(hash);

      // Get contract instance
      const contract = getContract(CONTRACT_ABI, CONTRACT_ADDRESS);
      const account = getAccount();

      // Issue certificate
      const tx = await contract.methods
        .issueCertificate(recipientAddress, hash)
        .send({ from: account });

      const certificateId = tx.events.CertificateIssued.returnValues.certificateId;

      setSuccess(`Certificate issued successfully! Certificate ID: ${certificateId}`);
      
      // Reset form
      setRecipientAddress('');
      setCertificateData({
        name: '',
        course: '',
        date: '',
        description: ''
      });
    } catch (err) {
      console.error('Error issuing certificate:', err);
      setError(err.message || 'Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-certificate">
      <h2>Issue Certificate</h2>
      <form onSubmit={issueCertificate}>
        <div className="form-group">
          <label>Recipient Address:</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label>Recipient Name:</label>
          <input
            type="text"
            name="name"
            value={certificateData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Course/Program:</label>
          <input
            type="text"
            name="course"
            value={certificateData.course}
            onChange={handleInputChange}
            placeholder="Blockchain Development"
            required
          />
        </div>

        <div className="form-group">
          <label>Completion Date:</label>
          <input
            type="date"
            name="date"
            value={certificateData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={certificateData.description}
            onChange={handleInputChange}
            placeholder="Certificate description..."
            rows="4"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Issuing...' : 'Issue Certificate'}
        </button>
      </form>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      {ipfsHash && (
        <div className="ipfs-info">
          <p>IPFS Hash: {ipfsHash}</p>
        </div>
      )}
    </div>
  );
}

export default IssueCertificate;
