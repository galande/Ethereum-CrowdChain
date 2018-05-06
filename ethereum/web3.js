import Web3 from 'web3';

let web3;

if ( typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
  //we are in browser and having metamask installed.
  web3 = new Web3(window.web3.currentProvider);
}else{
  //we are in next server and metamask not installed
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/k6koqnBm6esL2uSbRJNA'
  );

  web3 = new Web3(provider);
}

export default web3;
