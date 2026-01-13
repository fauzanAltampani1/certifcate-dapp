// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateRegistry
 * @dev Smart contract for issuing, verifying, and revoking digital certificates
 */
contract CertificateRegistry {
    
    struct Certificate {
        uint256 id;
        address issuer;
        address recipient;
        string ipfsHash; // IPFS hash containing certificate metadata
        uint256 issuedAt;
        bool isRevoked;
        string revokeReason;
    }
    
    // State variables
    uint256 private certificateCounter;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;
    mapping(address => bool) public authorizedIssuers;
    address public admin;
    
    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed issuer,
        address indexed recipient,
        string ipfsHash,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revokedBy,
        string reason,
        uint256 timestamp
    );
    
    event IssuerAuthorized(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }
    
    modifier certificateExists(uint256 _certificateId) {
        require(_certificateId > 0 && _certificateId <= certificateCounter, "Certificate does not exist");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedIssuers[msg.sender] = true;
        certificateCounter = 0;
    }
    
    /**
     * @dev Authorize an address to issue certificates
     * @param _issuer Address to authorize
     */
    function authorizeIssuer(address _issuer) external onlyAdmin {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already authorized");
        
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer, block.timestamp);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param _issuer Address to revoke
     */
    function revokeIssuer(address _issuer) external onlyAdmin {
        require(authorizedIssuers[_issuer], "Issuer not authorized");
        require(_issuer != admin, "Cannot revoke admin");
        
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer, block.timestamp);
    }
    
    /**
     * @dev Issue a new certificate
     * @param _recipient Address of certificate recipient
     * @param _ipfsHash IPFS hash containing certificate metadata
     * @return certificateId The ID of the newly issued certificate
     */
    function issueCertificate(
        address _recipient,
        string memory _ipfsHash
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        certificateCounter++;
        uint256 newCertificateId = certificateCounter;
        
        Certificate memory newCertificate = Certificate({
            id: newCertificateId,
            issuer: msg.sender,
            recipient: _recipient,
            ipfsHash: _ipfsHash,
            issuedAt: block.timestamp,
            isRevoked: false,
            revokeReason: ""
        });
        
        certificates[newCertificateId] = newCertificate;
        recipientCertificates[_recipient].push(newCertificateId);
        issuerCertificates[msg.sender].push(newCertificateId);
        
        emit CertificateIssued(
            newCertificateId,
            msg.sender,
            _recipient,
            _ipfsHash,
            block.timestamp
        );
        
        return newCertificateId;
    }
    
    /**
     * @dev Verify if a certificate is valid
     * @param _certificateId The ID of the certificate to verify
     * @return isValid Whether the certificate is valid
     * @return cert The certificate details
     */
    function verifyCertificate(uint256 _certificateId) 
        external 
        view 
        certificateExists(_certificateId)
        returns (bool isValid, Certificate memory cert) 
    {
        Certificate memory certificate = certificates[_certificateId];
        return (!certificate.isRevoked, certificate);
    }
    
    /**
     * @dev Revoke a certificate
     * @param _certificateId The ID of the certificate to revoke
     * @param _reason Reason for revocation
     */
    function revokeCertificate(
        uint256 _certificateId,
        string memory _reason
    ) external certificateExists(_certificateId) {
        Certificate storage certificate = certificates[_certificateId];
        
        require(
            msg.sender == certificate.issuer || msg.sender == admin,
            "Only issuer or admin can revoke certificate"
        );
        require(!certificate.isRevoked, "Certificate already revoked");
        
        certificate.isRevoked = true;
        certificate.revokeReason = _reason;
        
        emit CertificateRevoked(_certificateId, msg.sender, _reason, block.timestamp);
    }
    
    /**
     * @dev Get all certificates issued to a recipient
     * @param _recipient Address of the recipient
     * @return Certificate IDs
     */
    function getRecipientCertificates(address _recipient) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return recipientCertificates[_recipient];
    }
    
    /**
     * @dev Get all certificates issued by an issuer
     * @param _issuer Address of the issuer
     * @return Certificate IDs
     */
    function getIssuerCertificates(address _issuer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return issuerCertificates[_issuer];
    }
    
    /**
     * @dev Get certificate details by ID
     * @param _certificateId The ID of the certificate
     * @return Certificate details
     */
    function getCertificate(uint256 _certificateId) 
        external 
        view 
        certificateExists(_certificateId)
        returns (Certificate memory) 
    {
        return certificates[_certificateId];
    }
    
    /**
     * @dev Get total number of certificates issued
     * @return Total count
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateCounter;
    }
    
    /**
     * @dev Check if an address is an authorized issuer
     * @param _address Address to check
     * @return Boolean indicating authorization status
     */
    function isAuthorizedIssuer(address _address) external view returns (bool) {
        return authorizedIssuers[_address];
    }
}
