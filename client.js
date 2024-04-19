const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const packageDefinition = protoLoader.loadSync('smartRetailShop.proto', {});
const smartRetailProto =
  grpc.loadPackageDefinition(packageDefinition).smartretail;

const client = new smartRetailProto.SmartRetail(
  'localhost:50051',
  grpc.credentials.createInsecure(),
);

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

let baggedItems = [];

async function main() {
  console.log('Welcome to Smart Retail Checkout!');
  await askForChoice();
}

async function askForChoice() {
  console.log('\nSelect an option:');
  console.log('1: List Products');
  console.log('2: Scan Item');
  console.log('3: Bag Item');
  console.log('4: Track Bagged Items');
  console.log('5: Checkout');
  console.log('6: Exit');

  const choice = await askQuestion('Enter choice: ');
  console.log('*******************************************');
  processChoice(choice.trim());
}

main();
