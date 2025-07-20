const { importProductsFromPDF } = require('./server/pdf-parser.ts');

async function testPDFImport() {
  try {
    console.log('Testing PDF import...');
    const results = await importProductsFromPDF('uploads/test-construction.pdf');
    console.log('Import results:', results);
  } catch (error) {
    console.error('PDF import failed:', error.message);
  }
}

testPDFImport();