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
// array to store bagged items.
let baggedItems = [];

async function main() {
  console.log('Welcome to Smart Retail Checkout!');
  await askForChoice();
}

// asking for user choice.
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

// switch case function to process funtionality depending on user choice.
async function processChoice(choice) {
  switch (choice) {
    case '1':
      const listProductsStream = client.ListProducts();
      listProductsStream.on('data', (product) => {
        console.log(
          `ID: ${product.id}, Barcode: ${product.barcode}, Name: ${
            product.name
          }, Price: $${product.price.toFixed(2)}`,
        );
      });
      listProductsStream.on('end', () => {
        console.log('*******************************************');
        askForChoice();
      });
      break;
    case '2':
      const barcode = await askQuestion('Enter item barcode: ');
      client.ScanItem({ barcode }, (error, response) => {
        if (error) {
          console.error(error);
        } else {
          if (response.success) {
            console.log(`Scanned item: ${response.itemName}`);
            console.log(`Price: $${response.price.toFixed(2)}`);
            baggedItems.push({
              barcode,
              itemName: response.itemName,
              price: response.price,
            });
          } else {
            console.log('Item not found.');
          }
          console.log('*******************************************');
          askForChoice();
        }
      });
      break;
    case '3':
      if (baggedItems.length === 0) {
        console.log('Anything was scanned yet!');
        console.log('*******************************************');
        askForChoice();
        break;
      }
      const bagChoice = await askQuestion(
        'Please enter barcode of item to bag (or "all"): ',
      );
      if (bagChoice === 'all') {
        for (const item of baggedItems) {
          client.BagItem({ barcode: item.barcode }, (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log(`Bagged: ${item.itemName}`);
            }
          });
        }
      } else {
        const foundItem = baggedItems.find(
          (item) => item.barcode === bagChoice,
        );
        if (foundItem) {
          client.BagItem({ barcode: bagChoice }, (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log(`Bagged: ${foundItem.itemName}`);
            }
          });
        } else {
          console.log('Item not found in scanned list.');
        }
      }
      console.log('*******************************************');
      askForChoice();
      break;
    case '4':
      const trackBaggedItemsStream = client.TrackBaggedItems({});
      trackBaggedItemsStream.on('data', (response) => {
        console.log(`Item with barcode ${response.barcode} is being tracked.`);
      });
      trackBaggedItemsStream.on('error', (error) => {
        console.error('Failed to track item:', error.message);
      });
      trackBaggedItemsStream.on('end', () => {
        console.log('Tracking ended.');
        console.log('*******************************************');
        askForChoice();
      });
      break;
    case '5':
      if (baggedItems.length === 0) {
        console.log('No items scanned yet.');
        console.log('*******************************************');
        askForChoice();
        break;
      }
      client.Checkout({}, (error, response) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Your total is: $${response.total.toFixed(2)}`);
          console.log('Thank you for shopping!!!');
          console.log('*******************************************');
          askForChoice();
        }
      });
      break;
    case '6':
      console.log('Exiting...');
      rl.close();
      break;
    default:
      console.log('Invalid choice.');
      askForChoice();
      break;
  }
}

main();
