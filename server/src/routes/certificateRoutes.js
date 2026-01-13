const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Upload certificate metadata to IPFS
router.post('/metadata', certificateController.uploadMetadata);

// Get certificate metadata from IPFS
router.get('/metadata/:hash', certificateController.getMetadata);

// Generate certificate data
router.post('/generate', certificateController.generateCertificateData);

module.exports = router;
