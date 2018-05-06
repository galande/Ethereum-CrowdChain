import web3 from './web3';
import compiledFactory from './build/CampaignFactory.json';

const instance = new web3.eth.
Contract(JSON.parse(compiledFactory.interface), '0xD4A6b586b2E2A662c75A90ad1fb4966958B24b90');

export default instance;
