const ganache = require('ganache-cli');
const Web3 = require('web3');
const assert = require('assert');
//Create web3 instance of ganache
const web3 = new Web3(ganache.provider());
//Require compiled contracts from directory.
const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign;

//Deploy fresh contract before each test
beforeEach( async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data:compiledFactory.bytecode})
        .send({from:accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({from: accounts[0], gas: '1000000'});

    const addresses = await factory.methods.getDeployedContracts().call();
    const campaignAddress = addresses[0];

    campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaign Contract', () =>{

    it('Deploys both factory and campaign', ()=>{
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('Should mark caller as the manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('Should allow people to contribute money and mark them as approvars', async () =>{
        await campaign.methods.contribute().send({value: '200', from: accounts[1]});
        const isContributer = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributer);
    });

    it('Should allow to contribute more than minimum', async () =>{
        try{
            await campaign.methods.contribute().send({value: '5', from: accounts[1]});
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('Should allow manager to create payment request', async () =>{
      await campaign.methods.createRequest('Buy Batteries', '100', accounts[2])
            .send({from: accounts[0], gas: '1000000'});

      const request = await campaign.methods.requests(0).call();
      assert.equal('Buy Batteries', request.description);
    });

    it('Should pass all end-to-end full test', async () =>{
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei('10', 'ether')
      });

      await campaign.methods
        .createRequest('Buy Batteries', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({
          from: accounts[0],
          gas: '1000000'
        });

      await campaign.methods.approveRequest(0).send({
        from:accounts[0],
        gas: '1000000'
      });

      let balanceBefore = await web3.eth.getBalance(accounts[1]);
      balanceBefore = web3.utils.fromWei(balanceBefore, 'ether');
      balanceBefore = parseFloat(balanceBefore);

      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '1000000'
      });

      let balanceAfter = await web3.eth.getBalance(accounts[1]);
      balanceAfter = web3.utils.fromWei(balanceAfter, 'ether');
      balanceAfter = parseFloat(balanceAfter);
      console.log(balanceAfter);
      console.log(balanceBefore);

      assert(balanceAfter > balanceBefore);
    });
});
