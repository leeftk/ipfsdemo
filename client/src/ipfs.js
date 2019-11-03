//const IPFS = require('ipfs');
const ipfsApi = require('ipfs-api');
const ipfs = new ipfsApi({ host: 'localhost', port: 5001, protocol: 'http' });
//const node = new IPFS();

export default ipfs; 