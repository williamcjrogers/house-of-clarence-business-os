import multer from 'multer';
import XLSX from 'xlsx';
import sharp from 'sharp';
import yauzl from 'yauzl';
import { storage } from './storage';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xlsx', '.xls'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        allowedTypes.some(type => file.originalname.toLowerCase().endsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

interface ParsedProduct {
  type: string;
  productCode: string;
  category: string;
  subCategory: string;
  specs: string;
  hocPrice: string;
  ukPrice: string;
  link: string | null;
  unit: string | null;
  leadTime: number;
  moq: number;
  supplier: string;
  imageUrl?: string;
}

// Create images directory if it doesn't exist
const ensureImagesDirectory = () => {
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  return imagesDir;
};

// Extract images from Excel file and create row-to-image mapping
const extractImagesFromExcel = async (filePath: string): Promise<Record<number, string>> => {
  const rowImageMap: Record<number, string> = {};
  
  try {
    // Create directory for extracted images
    const imagesDir = path.join('uploads', 'extracted-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // First, extract all images from the Excel archive
    const imageFiles: Record<string, string> = {};
    
    await new Promise<void>((resolve, reject) => {
      yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          console.error('Error opening Excel file as ZIP:', err);
          resolve();
          return;
        }

        if (!zipfile) {
          resolve();
          return;
        }

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          // Look for image files in the media folder
          if (entry.fileName.startsWith('xl/media/') && 
              (entry.fileName.endsWith('.png') || 
               entry.fileName.endsWith('.jpg') || 
               entry.fileName.endsWith('.jpeg') ||
               entry.fileName.endsWith('.gif') ||
               entry.fileName.endsWith('.tmp'))) {
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                console.error('Error reading image entry:', err);
                zipfile.readEntry();
                return;
              }

              if (!readStream) {
                zipfile.readEntry();
                return;
              }

              // Handle .tmp files by giving them proper extensions
              const originalName = path.basename(entry.fileName);
              const imageFileName = originalName.endsWith('.tmp') 
                ? `extracted-${Date.now()}-${originalName.replace('.tmp', '.png')}`
                : `extracted-${Date.now()}-${originalName}`;
              const imagePath = path.join(imagesDir, imageFileName);
              const writeStream = fs.createWriteStream(imagePath);
              
              readStream.pipe(writeStream);
              
              writeStream.on('close', () => {
                // Store the relative path for serving
                const relativePath = `/uploads/extracted-images/${imageFileName}`;
                imageFiles[entry.fileName] = relativePath;
                console.log(`Extracted image: ${entry.fileName} -> ${relativePath}`);
                zipfile.readEntry();
              });

              writeStream.on('error', (err) => {
                console.error('Error writing image file:', err);
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          console.log(`Extracted ${Object.keys(imageFiles).length} images from Excel file`);
          resolve();
        });

        zipfile.on('error', (err) => {
          console.error('Error processing ZIP file:', err);
          resolve();
        });
      });
    });

    // Now map images to rows based on their position in the Excel file
    // Since Excel embeds images sequentially, we'll map them to data rows
    const imageUrls = Object.values(imageFiles);
    if (imageUrls.length > 0) {
      // Read the Excel file to get row count and map images accordingly
      const data = fs.readFileSync(filePath);
      const workbook = XLSX.read(data, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Find header row
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
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

      // Map images to product rows (starting after header row)
      let imageIndex = 0;
      for (let i = headerRowIndex + 1; i < jsonData.length && imageIndex < imageUrls.length; i++) {
        const row = jsonData[i] as any[];
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell === '')) {
          continue;
        }
        
        // Skip section header rows
        const firstCell = row[0] ? String(row[0]).trim() : '';
        const secondCell = row[1] ? String(row[1]).trim() : '';
        
        if (firstCell.length === 1 && firstCell.match(/[A-Z]/) && secondCell && !row[2]) {
          continue;
        }
        
        // Check if this row has product data
        const hasProductData = row.some((cell, index) => {
          if (!cell) return false;
          const cellStr = String(cell).trim();
          return cellStr && cellStr !== '' && index > 0; // Skip first column for product code
        });
        
        if (hasProductData) {
          rowImageMap[i] = imageUrls[imageIndex];
          console.log(`Mapped row ${i} to image: ${imageUrls[imageIndex]}`);
          imageIndex++;
        }
      }
    }
    
    return rowImageMap;
  } catch (error) {
    console.error('Error extracting images from Excel:', error);
    return rowImageMap;
  }
};

// Helper function to find column index by header names
const findColumnIndex = (headers: string[], searchTerms: string[]): number => {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (!header) continue;
    
    const lowerHeader = header.toLowerCase().trim();
    for (const term of searchTerms) {
      if (lowerHeader.includes(term.toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
};

// Helper function to get cell value safely
const getCellValue = (row: any[], columnIndex: number): string => {
  if (columnIndex === -1 || !row || columnIndex >= row.length) {
    return '';
  }
  const value = row[columnIndex];
  return value ? String(value).trim() : '';
};

// Helper function to clean price values
const cleanPriceValue = (price: string): string => {
  if (!price) return '0';
  // Remove currency symbols and normalize
  return price.replace(/[£$€,]/g, '').trim() || '0';
};

// Helper function to get image for a specific row
const getImageForRow = (rowImageMap: Record<number, string>, rowIndex: number): string | null => {
  return rowImageMap[rowIndex] || null;
};

// Parse Excel file and extract product data
export const parseExcelFile = async (filePath: string): Promise<ParsedProduct[]> => {
  const products: ParsedProduct[] = [];
  
  try {
    const data = fs.readFileSync(filePath);
    const workbook = XLSX.read(data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract images with row mapping
    const rowImageMap = await extractImagesFromExcel(filePath);
    
    // Find header row (looking for key columns)
    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
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
    
    if (headerRowIndex === -1) {
      throw new Error('Could not find header row in Excel file');
    }
    
    const headers = jsonData[headerRowIndex] as string[];
    
    // Map column indices based on your spreadsheet structure
    const columnMap = {
      type: findColumnIndex(headers, ['type', 'item type']),
      productCode: findColumnIndex(headers, ['s.no', 'product code', 'code', 'item code']),
      category: findColumnIndex(headers, ['product category', 'category']),
      subCategory: findColumnIndex(headers, ['title / location', 'title/location', 'sub category', 'subcategory']),
      specs: findColumnIndex(headers, ['product specs', 'specs', 'specification']),
      hocPrice: findColumnIndex(headers, ['hoc price', 'house price', 'cost']),
      ukPrice: findColumnIndex(headers, ['uk price', 'retail price', 'price']),
      link: findColumnIndex(headers, ['uk - product link', 'uk product link', 'link', 'url']),
      supplier: findColumnIndex(headers, ['supplier', 'manufacturer'])
    };
    
    // Process data rows
    let currentCategory = 'General';
    
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || cell === '')) {
        continue;
      }
      
      // Check if this is a section header row (like "A", "KITCHEN")
      const firstCell = getCellValue(row, 0);
      const secondCell = getCellValue(row, 1);
      
      // If first cell is a letter and second cell is a category name, update current category
      if (firstCell.length === 1 && firstCell.match(/[A-Z]/) && secondCell && !getCellValue(row, 2)) {
        currentCategory = secondCell;
        continue;
      }
      
      // Skip section header rows that don't have product data
      if (!getCellValue(row, columnMap.productCode) && !getCellValue(row, columnMap.specs)) {
        continue;
      }
      
      const productCode = getCellValue(row, columnMap.productCode) || `AUTO-${Date.now()}-${i}`;
      const imageUrl = getImageForRow(rowImageMap, i);
      console.log(`Product ${productCode} (row ${i}) assigned image: ${imageUrl}`);
      
      const product: ParsedProduct = {
        type: getCellValue(row, columnMap.type) || 'Product',
        productCode: productCode,
        category: getCellValue(row, columnMap.category) || currentCategory,
        subCategory: getCellValue(row, columnMap.subCategory) || '',
        specs: getCellValue(row, columnMap.specs) || '',
        hocPrice: getCellValue(row, columnMap.hocPrice) || '0',
        ukPrice: getCellValue(row, columnMap.ukPrice) || '0',
        link: getCellValue(row, columnMap.link) || null,
        unit: 'unit', // Default unit
        leadTime: 7, // Default lead time
        moq: 1, // Default minimum order quantity
        supplier: getCellValue(row, columnMap.supplier) || 'Unknown',
        imageUrl: imageUrl
      };
      
      // Clean up price values
      product.hocPrice = cleanPriceValue(product.hocPrice);
      product.ukPrice = cleanPriceValue(product.ukPrice);
      
      // Only add products with meaningful data
      if (product.specs || product.hocPrice !== '0' || product.ukPrice !== '0') {
        products.push(product);
      }
    }
    
    console.log(`Parsed ${products.length} products from Excel file`);
    return products;
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};



// Import products into storage
export const importProductsFromExcel = async (filePath: string): Promise<{ success: number, errors: string[] }> => {
  const results = { success: 0, errors: [] };
  
  try {
    const products = await parseExcelFile(filePath);
    
    for (const productData of products) {
      try {
        await storage.createProduct({
          type: productData.type,
          productCode: productData.productCode,
          category: productData.category,
          subCategory: productData.subCategory || null,
          specs: productData.specs,
          hocPrice: productData.hocPrice,
          ukPrice: productData.ukPrice,
          link: productData.link,
          unit: productData.unit || null,
          leadTime: productData.leadTime,
          moq: productData.moq,
          supplier: productData.supplier,
          imageUrl: productData.imageUrl
        });
        
        results.success++;
      } catch (error) {
        results.errors.push(`Failed to import product ${productData.productCode}: ${error.message}`);
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return results;
  } catch (error) {
    results.errors.push(`Failed to process Excel file: ${error.message}`);
    return results;
  }
};

export const uploadMiddleware = upload.single('excelFile');