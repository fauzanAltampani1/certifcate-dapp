const express = require('express');
const router = express.Router();
const ipfsController = require('../controllers/ipfsController');

// Upload JSON data to IPFS
router.post('/upload-json', ipfsController.uploadJSON);

// Upload file to IPFS
router.post('/upload-file', ipfsController.getUploadMiddleware(), ipfsController.uploadFile);

// Get data from IPFS
router.get('/:hash', ipfsController.getData);

module.exports = router;
