const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('smartRetailShop.proto', {});
const smartRetailProto =
  grpc.loadPackageDefinition(packageDefinition).smartretail;

const server = new grpc.Server();
