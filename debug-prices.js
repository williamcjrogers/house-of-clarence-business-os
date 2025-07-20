const fs = require('fs');

// Get a few sample products and check their prices
const curl = require('child_process').execSync;
const response = curl('curl -s "http://localhost:5000/api/products"', {encoding: 'utf8'});
const products = JSON.parse(response);

console.log('Total products:', products.length);
console.log('\nFirst 5 products with their prices:');
products.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.productCode} - ${p.specs.substring(0, 50)}...`);
  console.log(`   HOC: £${p.hocPrice} | UK: £${p.ukPrice}`);
});

console.log('\nProducts with non-zero prices:');
const productsWithPrices = products.filter(p => 
  parseFloat(p.hocPrice) > 0 || parseFloat(p.ukPrice) > 0
);
console.log('Products with prices:', productsWithPrices.length);

if (productsWithPrices.length > 0) {
  productsWithPrices.slice(0, 3).forEach((p, i) => {
    console.log(`${i+1}. ${p.productCode} - ${p.specs.substring(0, 50)}...`);
    console.log(`   HOC: £${p.hocPrice} | UK: £${p.ukPrice}`);
  });
}