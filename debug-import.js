const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Test the image extraction and assignment logic
const testImageAssignment = async () => {
  try {
    // Read the Excel file
    const filePath = 'attached_assets/House Of Clarence1_1752488521619.xlsx';
    const data = fs.readFileSync(filePath);
    const workbook = XLSX.read(data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Simulate the image map (use some dummy image URLs)
    const imageMap = {
      'xl/media/image1.png': '/uploads/extracted-images/image1.png',
      'xl/media/image2.png': '/uploads/extracted-images/image2.png',
      'xl/media/image3.png': '/uploads/extracted-images/image3.png',
    };
    
    // Test the getImageForProduct function
    const getImageForProduct = (imageMap, rowIndex, productCode) => {
      const images = Object.values(imageMap);
      if (images.length === 0) return null;
      
      // Simple distribution: assign images in order
      const imageIndex = Math.floor((rowIndex - 1) % images.length);
      return images[imageIndex] || null;
    };
    
    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] || [];
      if (row.some(cell => 
        typeof cell === 'string' && 
        (cell.toLowerCase().includes('product') || 
         cell.toLowerCase().includes('category') || 
         cell.toLowerCase().includes('price'))
      )) {
        headerRowIndex = i;
        break;
      }
    }
    
    console.log('Header row index:', headerRowIndex);
    console.log('Headers:', jsonData[headerRowIndex]);
    
    // Test image assignment for first few products
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 6, jsonData.length); i++) {
      const row = jsonData[i] || [];
      if (row.every(cell => !cell || cell === '')) continue;
      
      const productCode = row[0] || `AUTO-${Date.now()}-${i}`;
      const imageUrl = getImageForProduct(imageMap, i, productCode);
      console.log(`Row ${i}: Product ${productCode} -> Image: ${imageUrl}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testImageAssignment();