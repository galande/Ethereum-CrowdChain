const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

//delete build directory and all files in it.
const buildPath = path.resolve(__dirname, 'build');
console.log('Removing build directory and all files in it.')
fs.removeSync(buildPath);
console.log('Removed build directory and all files in it.')

//Compile contracts from CONTRACTS directory.
const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const output = solc.compile(source, 1).contracts;
console.log('Contract compiled...')

//create build folder
fs.ensureDirSync(buildPath);

//Create new file for each contract.
for (let contract in output){
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':','') + '.json'),
    output[contract]
  );
  console.log('Written compiled contract ' + contract + ' in ' + contract.replace(':','') + '.json file.');
}
