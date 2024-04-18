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
