import { useState } from 'react';
import { getContract } from '../utils/web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contracts/CertificateRegistry';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import './VerifyCertificate.css';

function VerifyCertificate({ web3 }) {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (showQRScanner) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(decodedText) {
        scanner.clear();
        setShowQRScanner(false);
        // Extract certificate ID from QR code
        try {
          const data = JSON.parse(decodedText);
          setCertificateId(data.certificateId.toString());
        } catch {
          setCertificateId(decodedText);
        }
      }

      function onScanError(error) {
        console.warn(`QR Scan Error: ${error}`);
      }

      return () => {
        scanner.clear();
      };
    }
  }, [showQRScanner]);

  const verifyCertificate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const contract = getContract(CONTRACT_ABI, CONTRACT_ADDRESS);
      const result = await contract.methods.verifyCertificate(certificateId).call();

      const [isValid, cert] = result;
      
      const formattedCert = {
        id: cert.id.toString(),
        issuer: cert.issuer,
        recipient: cert.recipient,
        ipfsHash: cert.ipfsHash,
        issuedAt: new Date(Number(cert.issuedAt) * 1000).toLocaleDateString(),
        isValid: isValid && !cert.isRevoked,
        isRevoked: cert.isRevoked,
        revokeReason: cert.revokeReason
      };

      setCertificate(formattedCert);
      
      // Generate QR code value
      const qrData = JSON.stringify({
        certificateId: formattedCert.id,
        recipient: formattedCert.recipient,
        verifyUrl: `${window.location.origin}/verify/${formattedCert.id}`
      });
      setQrValue(qrData);

    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-certificate">
      <h2>Verify Certificate</h2>
      
      <div className="verify-options">
        <button 
          onClick={() => setShowQRScanner(!showQRScanner)}
          className="scan-button"
        >
          {showQRScanner ? 'Close Scanner' : 'Scan QR Code'}
        </button>
      </div>

      {showQRScanner && (
        <div className="qr-scanner-container">
          <div id="qr-reader"></div>
        </div>
      )}

      <form onSubmit={verifyCertificate}>
        <div className="form-group">
          <label>Certificate ID:</label>
          <input
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Enter certificate ID"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="verify-button">
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {certificate && (
        <div className={`certificate-info ${certificate.isValid ? 'valid' : 'invalid'}`}>
          <div className="validity-badge">
            {certificate.isValid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
          </div>

          <div className="cert-details">
            <div className="detail-row">
              <span className="label">Certificate ID:</span>
              <span className="value">{certificate.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Issuer:</span>
              <span className="value">{certificate.issuer}</span>
            </div>
            <div className="detail-row">
              <span className="label">Recipient:</span>
              <span className="value">{certificate.recipient}</span>
            </div>
            <div className="detail-row">
              <span className="label">Issued On:</span>
              <span className="value">{certificate.issuedAt}</span>
            </div>
            <div className="detail-row">
              <span className="label">IPFS Hash:</span>
              <span className="value">{certificate.ipfsHash}</span>
            </div>
            {certificate.isRevoked && (
              <div className="detail-row revoked">
                <span className="label">Revocation Reason:</span>
                <span className="value">{certificate.revokeReason}</span>
              </div>
            )}
          </div>

          {certificate.isValid && qrValue && (
            <div className="qr-code-display">
              <h3>Certificate QR Code</h3>
              <QRCodeSVG value={qrValue} size={200} />
              <p className="qr-hint">Scan this QR code to verify the certificate</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyCertificate;
