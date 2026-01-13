const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let admin;
  let issuer;
  let recipient;
  let unauthorized;

  beforeEach(async function () {
    [admin, issuer, recipient, unauthorized] = await ethers.getSigners();

    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the admin as the deployer", async function () {
      expect(await certificateRegistry.admin()).to.equal(admin.address);
    });

    it("Should authorize admin as issuer by default", async function () {
      expect(await certificateRegistry.isAuthorizedIssuer(admin.address)).to.be.true;
    });
  });

  describe("Issuer Management", function () {
    it("Should allow admin to authorize issuer", async function () {
      const tx = await certificateRegistry.authorizeIssuer(issuer.address);
      await expect(tx)
        .to.emit(certificateRegistry, "IssuerAuthorized")
        .withArgs(issuer.address, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      expect(await certificateRegistry.isAuthorizedIssuer(issuer.address)).to.be.true;
    });

    it("Should not allow non-admin to authorize issuer", async function () {
      await expect(
        certificateRegistry.connect(unauthorized).authorizeIssuer(issuer.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should allow admin to revoke issuer", async function () {
      await certificateRegistry.authorizeIssuer(issuer.address);
      
      const tx = await certificateRegistry.revokeIssuer(issuer.address);
      await expect(tx)
        .to.emit(certificateRegistry, "IssuerRevoked")
        .withArgs(issuer.address, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      expect(await certificateRegistry.isAuthorizedIssuer(issuer.address)).to.be.false;
    });

    it("Should not allow revoking admin", async function () {
      await expect(
        certificateRegistry.revokeIssuer(admin.address)
      ).to.be.revertedWith("Cannot revoke admin");
    });
  });

  describe("Certificate Issuance", function () {
    beforeEach(async function () {
      await certificateRegistry.authorizeIssuer(issuer.address);
    });

    it("Should allow authorized issuer to issue certificate", async function () {
      const ipfsHash = "QmTest123";
      
      const tx = await certificateRegistry.connect(issuer).issueCertificate(recipient.address, ipfsHash);
      await expect(tx)
        .to.emit(certificateRegistry, "CertificateIssued")
        .withArgs(1, issuer.address, recipient.address, ipfsHash, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.id).to.equal(1);
      expect(cert.issuer).to.equal(issuer.address);
      expect(cert.recipient).to.equal(recipient.address);
      expect(cert.ipfsHash).to.equal(ipfsHash);
      expect(cert.isRevoked).to.be.false;
    });

    it("Should not allow unauthorized to issue certificate", async function () {
      await expect(
        certificateRegistry.connect(unauthorized).issueCertificate(recipient.address, "QmTest")
      ).to.be.revertedWith("Only authorized issuers can perform this action");
    });

    it("Should not allow empty IPFS hash", async function () {
      await expect(
        certificateRegistry.connect(issuer).issueCertificate(recipient.address, "")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should track recipient certificates", async function () {
      await certificateRegistry.connect(issuer).issueCertificate(recipient.address, "QmTest1");
      await certificateRegistry.connect(issuer).issueCertificate(recipient.address, "QmTest2");

      const recipientCerts = await certificateRegistry.getRecipientCertificates(recipient.address);
      expect(recipientCerts.length).to.equal(2);
      expect(recipientCerts[0]).to.equal(1);
      expect(recipientCerts[1]).to.equal(2);
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await certificateRegistry.authorizeIssuer(issuer.address);
      await certificateRegistry.connect(issuer).issueCertificate(recipient.address, "QmTest");
    });

    it("Should verify valid certificate", async function () {
      const [isValid, cert] = await certificateRegistry.verifyCertificate(1);
      expect(isValid).to.be.true;
      expect(cert.id).to.equal(1);
    });

    it("Should return false for revoked certificate", async function () {
      await certificateRegistry.connect(issuer).revokeCertificate(1, "Test revoke");
      
      const [isValid] = await certificateRegistry.verifyCertificate(1);
      expect(isValid).to.be.false;
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await certificateRegistry.authorizeIssuer(issuer.address);
      await certificateRegistry.connect(issuer).issueCertificate(recipient.address, "QmTest");
    });

    it("Should allow issuer to revoke certificate", async function () {
      const reason = "No longer valid";
      
      const tx = await certificateRegistry.connect(issuer).revokeCertificate(1, reason);
      await expect(tx)
        .to.emit(certificateRegistry, "CertificateRevoked")
        .withArgs(1, issuer.address, reason, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.isRevoked).to.be.true;
      expect(cert.revokeReason).to.equal(reason);
    });

    it("Should allow admin to revoke certificate", async function () {
      await certificateRegistry.revokeCertificate(1, "Admin revoke");
      
      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.isRevoked).to.be.true;
    });

    it("Should not allow unauthorized to revoke certificate", async function () {
      await expect(
        certificateRegistry.connect(unauthorized).revokeCertificate(1, "Unauthorized")
      ).to.be.revertedWith("Only issuer or admin can revoke certificate");
    });

    it("Should not allow revoking already revoked certificate", async function () {
      await certificateRegistry.connect(issuer).revokeCertificate(1, "First revoke");
      
      await expect(
        certificateRegistry.connect(issuer).revokeCertificate(1, "Second revoke")
      ).to.be.revertedWith("Certificate already revoked");
    });
  });
});
