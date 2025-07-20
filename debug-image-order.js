import fs from 'fs';
import { execSync } from 'child_process';

// Check what product specs we have and their order
const response = execSync('curl -s "http://localhost:5000/api/products"', {encoding: 'utf8'});
const products = JSON.parse(response);

console.log('First 10 products with their specs and images:');
products.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.productCode}: ${p.specs.substring(0, 40)}...`);
  console.log(`   Image: ${p.imageUrl || 'NO IMAGE'}`);
  console.log(`   Price: £${p.ukPrice}`);
  console.log('');
});

// Check what images we extracted
console.log('\nExtracted images in order:');
try {
  const images = fs.readdirSync('uploads/extracted-images/').sort();
  images.slice(0, 10).forEach((img, i) => {
    console.log(`Image ${i+1}: ${img}`);
  });
} catch (e) {
  console.log('Could not read images directory');
}