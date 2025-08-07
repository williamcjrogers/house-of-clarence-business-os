const fs = require('fs');

// Read the extracted products
const products = JSON.parse(fs.readFileSync('extracted-products.json', 'utf8'));

// Generate TypeScript array
const tsArray = products.map(p => {
  const specs = p.specs.replace(/'/g, "\\'");
  return `  { 
    id: ${p.id},
    productCode: '${p.productCode}',
    category: '${p.category}',
    subCategory: '${p.subCategory}',
    type: '${p.type}',
    specs: '${specs}',
    hocPrice: '${p.hocPrice}',
    ukPrice: '${p.ukPrice}',
    link: '${p.link || ''}',
    unit: '${p.unit}',
    leadTime: ${p.leadTime},
    moq: ${p.moq},
    supplier: '${p.supplier}',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }`;
}).join(',\n');

console.log('Generated TypeScript array for', products.length, 'products');
fs.writeFileSync('sample-products-ts.txt', tsArray);
console.log('First product preview:', products[0].specs);