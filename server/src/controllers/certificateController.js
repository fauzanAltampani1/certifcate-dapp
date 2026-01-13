const ipfsService = require('../utils/ipfs');

class CertificateController {
  // Upload certificate metadata to IPFS
  async uploadMetadata(req, res, next) {
    try {
      const { name, course, date, description, recipient } = req.body;

      if (!name || !course || !date) {
        return res.status(400).json({
          error: 'Missing required fields: name, course, date'
        });
      }

      const metadata = {
        name,
        course,
        date,
        description,
        recipient,
        timestamp: new Date().toISOString()
      };

      const ipfsHash = await ipfsService.uploadJSON(metadata);

      res.json({
        success: true,
        ipfsHash,
        metadata
      });
    } catch (error) {
      next(error);
    }
  }

  // Retrieve certificate metadata from IPFS
  async getMetadata(req, res, next) {
    try {
      const { hash } = req.params;

      if (!hash) {
        return res.status(400).json({
          error: 'IPFS hash is required'
        });
      }

      const metadata = await ipfsService.getJSON(hash);

      res.json({
        success: true,
        metadata
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate certificate data for a given ID
  async generateCertificateData(req, res, next) {
    try {
      const { certificateId, name, course, issuer } = req.body;

      const certificateData = {
        certificateId,
        name,
        course,
        issuer,
        issuedDate: new Date().toISOString(),
        verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/verify/${certificateId}`
      };

      res.json({
        success: true,
        data: certificateData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CertificateController();
