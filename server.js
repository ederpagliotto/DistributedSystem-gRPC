const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('smartRetailShop.proto', {});
const smartRetailProto =
  grpc.loadPackageDefinition(packageDefinition).smartretail;

const server = new grpc.Server();

const products = [
  { id: 1, barcode: '12345', name: 'Smart TV', price: 450.0 },
  { id: 2, barcode: '54321', name: 'Laptop', price: 800.5 },
  { id: 3, barcode: '00000', name: 'Smartphone', price: 999.99 },
  { id: 1, barcode: '11111', name: 'Videogame', price: 500.0 },
  { id: 2, barcode: '22222', name: 'Keyboard', price: 80.5 },
];

function getItemData(barcode) {
  return products.find((product) => product.barcode === barcode);
}
