const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('smartRetailShop.proto', {});
const smartRetailProto =
  grpc.loadPackageDefinition(packageDefinition).smartretail;

const server = new grpc.Server();

//simulating products
const products = [
  { id: 1, barcode: '12345', name: 'Smart TV', price: 450.0 },
  { id: 2, barcode: '54321', name: 'Laptop', price: 800.5 },
  { id: 3, barcode: '00000', name: 'Smartphone', price: 999.99 },
  { id: 1, barcode: '11111', name: 'Videogame', price: 500.0 },
  { id: 2, barcode: '22222', name: 'Keyboard', price: 80.5 },
];

// getting item data based on barcode
function getItemData(barcode) {
  return products.find((product) => product.barcode === barcode);
}

//calculating total
function calculateTotal(baggedItems) {
  let total = 0;
  baggedItems.forEach((barcode) => {
    const itemData = getItemData(barcode);
    if (itemData) {
      total += itemData.price;
    }
  });
  return total.toFixed(2);
}

const baggedItems = [];

server.addService(smartRetailProto.SmartRetail.service, {
  ScanItem: (call, callback) => {
    const barcode = call.request.barcode;
    const itemData = getItemData(barcode);

    if (itemData) {
      callback(null, {
        success: true,
        itemName: itemData.name,
        price: itemData.price,
      });
    } else {
      callback(null, {
        success: false,
      });
    }
  },

  //methods
  BagItem: (call, callback) => {
    const barcode = call.request.barcode;
    console.log(`Item with barcode ${barcode} bagged`);
    baggedItems.push(barcode);
    callback(null, {
      success: true,
    });
  },

  Checkout: (call, callback) => {
    const total = calculateTotal(baggedItems);
    callback(null, {
      total: total,
    });
  },

  ListProducts: (call) => {
    products.forEach((product) => {
      call.write({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
      });
    });
    call.end();
  },

  TrackBaggedItems: (call) => {
    call.on('data', (request) => {
      const barcode = request.barcode;
      console.log(`Tracking item with barcode ${barcode}`);
      baggedItems.push(barcode);
      call.write({ success: true });
    });

    call.on('end', () => {
      console.log('Tracking ended.');
      call.end();
    });
  },

  ListProducts: (call) => {
    products.forEach((product) => {
      call.write(product);
    });
    call.end();
  },

  TrackBaggedItems: (call) => {
    baggedItems.forEach((barcode) => {
      call.write({ barcode });
    });
    call.end();
  },
});

server.bindAsync(
  '127.0.0.1:50051',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err != null) {
      console.error(err);
      return;
    }
    server.start();
    console.log(`Server running at http://127.0.0.1:${port}`);
  },
);
