import path from 'path';
import fs from 'fs';
import { importProductsFromExcel } from './upload-service';
import { importProductsFromPDF } from './pdf-parser';

export const preloadData = async (): Promise<void> => {
  try {
    console.log('Starting data preload process...');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
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
        console.log(`File not found for preload: ${file.name}`);
      }
    }
    
    console.log('Data preload process completed');
  } catch (error) {
    console.error('Error in preload process:', error);
  }
};