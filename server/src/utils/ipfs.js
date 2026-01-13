const { create } = require('ipfs-http-client');

class IPFSService {
  constructor() {
    // Initialize IPFS client
    // For production, use Infura or Pinata
    this.client = null;
    this.initClient();
  }

  async initClient() {
    try {
      // Default to local IPFS node
      // In production, use: https://ipfs.infura.io:5001 or similar
      const ipfsUrl = process.env.IPFS_URL || 'http://localhost:5001';
      
      this.client = create({ url: ipfsUrl });
      console.log('IPFS client initialized');
    } catch (error) {
      console.error('Failed to initialize IPFS client:', error.message);
      console.log('IPFS functionality will use simulation mode');
    }
  }

  async uploadJSON(data) {
    try {
      if (this.client) {
        // Upload to actual IPFS
        const result = await this.client.add(JSON.stringify(data));
        return result.path;
      } else {
        // Simulation mode - generate hash from data
        const jsonString = JSON.stringify(data);
        const simulatedHash = 'Qm' + Buffer.from(jsonString).toString('base64').substring(0, 44);
        console.log('Simulated IPFS upload:', simulatedHash);
        return simulatedHash;
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async getJSON(hash) {
    try {
      if (this.client) {
        // Retrieve from actual IPFS
        const stream = this.client.cat(hash);
        let data = '';

        for await (const chunk of stream) {
          data += chunk.toString();
        }

        return JSON.parse(data);
      } else {
        // Simulation mode - return mock data
        return {
          simulated: true,
          hash,
          message: 'IPFS simulation mode - actual data would be retrieved here'
        };
      }
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      throw new Error('Failed to retrieve from IPFS');
    }
  }

  async uploadFile(fileBuffer, filename) {
    try {
      if (this.client) {
        const result = await this.client.add({
          path: filename,
          content: fileBuffer
        });
        return result.path;
      } else {
        // Simulation mode
        const simulatedHash = 'Qm' + Buffer.from(filename + Date.now()).toString('base64').substring(0, 44);
        return simulatedHash;
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }
}

module.exports = new IPFSService();
