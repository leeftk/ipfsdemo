
const ipfsApi = require('ipfs-api');
const ipfs = new ipfsApi({ host: 'localhost', port: 5001, protocol: 'http' });

export default ipfs; 