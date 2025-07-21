import { execSync } from 'child_process';

console.log('Testing product count and display...');

// Get products from API
const response = execSync('curl -s "http://localhost:5000/api/products"', {encoding: 'utf8'});
const products = JSON.parse(response);

console.log(`Total products from API: ${products.length}`);
console.log('\nFirst 5 products:');
products.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ID: ${p.id}, Code: ${p.productCode}, Specs: ${p.specs.substring(0, 30)}...`);
  console.log(`   Price: £${p.ukPrice}, Image: ${p.imageUrl ? 'YES' : 'NO'}`);
  console.log('');
});

console.log('\nProducts with real prices (not £0.00):');
const withPrices = products.filter(p => parseFloat(p.ukPrice) > 0);
console.log(`Count: ${withPrices.length}`);
withPrices.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.productCode}: £${p.ukPrice} - ${p.specs.substring(0, 40)}...`);
});

console.log('\nProducts with images:');
const withImages = products.filter(p => p.imageUrl);
console.log(`Count: ${withImages.length}`);