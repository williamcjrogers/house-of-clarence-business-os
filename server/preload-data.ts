import path from 'path';
import fs from 'fs';
import { importProductsFromExcel } from './upload-service';
import { importProductsFromPDF } from './pdf-parser';

export const preloadData = async (): Promise<void> => {
  try {
    console.log('Starting data preload process...');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }
    
    // List of files to preload
    const preloadFiles = [
      {
        name: 'House Of Clarence.xlsx',
        type: 'excel'
      },
      {
        name: 'IT_25017 - Tredean, Lime Grove, Guildford.pdf',
        type: 'pdf'
      },
      {
        name: 'FF&E - 22, Buckingham Road, whetstone, n20 9bx (3).pdf',
        type: 'pdf'
      }
    ];
    
    for (const file of preloadFiles) {
      const filePath = path.join(uploadsDir, file.name);
      
      if (fs.existsSync(filePath)) {
        console.log(`Preloading ${file.name}...`);
        
        try {
          if (file.type === 'excel') {
            const results = await importProductsFromExcel(filePath);
            console.log(`Excel import results: ${results.success} products imported, ${results.errors.length} errors`);
            if (results.errors.length > 0) {
              console.log('Excel import errors:', results.errors);
            }
          } else if (file.type === 'pdf') {
            const results = await importProductsFromPDF(filePath);
            console.log(`PDF import results: ${results.success} products imported, ${results.errors.length} errors`);
            if (results.errors.length > 0) {
              console.log('PDF import errors:', results.errors);
            }
          }
        } catch (error) {
          console.error(`Error preloading ${file.name}:`, error);
        }
      } else {
        console.log(`File not found for preload: ${file.name} - adding sample data`);
        
        // Add sample data if files are not available (for production demo)
        if (file.type === 'excel') {
          await addSampleProducts();
        }
      }
    }
    
    console.log('Data preload process completed');
  } catch (error) {
    console.error('Error in preload process:', error);
    // Add sample data as fallback
    await addSampleProducts();
  }
};

const addSampleProducts = async () => {
  try {
    const { storage } = await import('./storage');
    
    const sampleProducts = [
      {
        type: 'Product',
        productCode: 'HOC-001',
        category: 'Kitchen',
        subCategory: 'Worktop',
        specs: 'Premium sintered stone worktop with luxury finish',
        hocPrice: '2695.00',
        ukPrice: '5500.00',
        link: 'https://example.com/worktop',
        unit: '1 No',
        leadTime: 14,
        moq: 1,
        supplier: 'House of Clarence',
        imageUrl: null
      },
      {
        type: 'Product', 
        productCode: 'HOC-002',
        category: 'Bathroom',
        subCategory: 'Basin Mixer',
        specs: 'Brushed stainless crosshead deck mounted basin mixer tap',
        hocPrice: '118.73',
        ukPrice: '257.00',
        link: 'https://example.com/mixer',
        unit: '1 No',
        leadTime: 7,
        moq: 1,
        supplier: 'House of Clarence',
        imageUrl: null
      }
    ];
    
    for (const product of sampleProducts) {
      await storage.createProduct(product);
    }
    
    console.log('Added sample products for demonstration');
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
};