// Quick test to check if prices are in database
import { exec } from 'child_process';

// Test upload and check results
const command = `curl -X POST -F "excelFile=@attached_assets/House\\ Of\\ Clarence1_1752488521619.xlsx" http://localhost:5000/api/upload-excel 2>/dev/null`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Upload error:', error);
    return;
  }
  
  console.log('Upload result:', stdout);
  
  // Check database for non-zero prices
  setTimeout(() => {
    exec('curl -s "http://localhost:5000/api/products" | head -1000', (err, out) => {
      if (err) return;
      
      const products = JSON.parse(out);
      const withPrices = products.filter(p => parseFloat(p.ukPrice) > 0 || parseFloat(p.hocPrice) > 0);
      
      console.log(`Total products: ${products.length}`);
      console.log(`Products with prices: ${withPrices.length}`);
      
      if (withPrices.length > 0) {
        console.log('Sample priced products:');
        withPrices.slice(0, 3).forEach(p => {
          console.log(`- ${p.productCode}: HOC=£${p.hocPrice}, UK=£${p.ukPrice}`);
        });
      } else {
        console.log('No products with prices found - issue still exists');
      }
    });
  }, 3000);
});