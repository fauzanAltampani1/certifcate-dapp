const ipfsService = require('../utils/ipfs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class IPFSController {
  // Upload JSON data to IPFS
  async uploadJSON(req, res, next) {
    try {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          error: 'No data provided'
        });
      }

      const ipfsHash = await ipfsService.uploadJSON(data);

      res.json({
        success: true,
        ipfsHash,
        gateway: `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${ipfsHash}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload file to IPFS
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const ipfsHash = await ipfsService.uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      res.json({
        success: true,
        ipfsHash,
        filename: req.file.originalname,
        gateway: `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${ipfsHash}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Get data from IPFS
  async getData(req, res, next) {
    try {
      const { hash } = req.params;

      if (!hash) {
        return res.status(400).json({
          error: 'IPFS hash is required'
        });
      }

      const data = await ipfsService.getJSON(hash);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = new IPFSController();
