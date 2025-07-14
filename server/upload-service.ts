import multer from 'multer';
import * as XLSX from 'xlsx';
import sharp from 'sharp';
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
    fileSize: 50 * 1024 * 1024, // 50MB limit
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

// Extract images from Excel file
const extractImagesFromExcel = async (filePath: string): Promise<Record<string, string>> => {
  const imageMap: Record<string, string> = {};
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Excel files with embedded images require special handling
    // For now, we'll create a placeholder system for image references
    // In a production environment, you'd use a library like node-xlsx with image extraction
    
    // This is a simplified version - in reality, extracting images from Excel is complex
    // We'll create a system where users can upload images separately or reference them by URL
    
    console.log('Excel file processed. Image extraction would require additional library support.');
    return imageMap;
  } catch (error) {
    console.error('Error extracting images from Excel:', error);
    return {};
  }
};

// Parse Excel file and extract product data
export const parseExcelFile = async (filePath: string): Promise<ParsedProduct[]> => {
  const products: ParsedProduct[] = [];
  
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract images (simplified for now)
    const imageMap = await extractImagesFromExcel(filePath);
    
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
      productCode: findColumnIndex(headers, ['product code', 'code', 'item code']),
      category: findColumnIndex(headers, ['product category', 'category']),
      subCategory: findColumnIndex(headers, ['sub category', 'subcategory']),
      specs: findColumnIndex(headers, ['product specs', 'specs', 'specification']),
      hocPrice: findColumnIndex(headers, ['hoc price', 'house price', 'cost']),
      ukPrice: findColumnIndex(headers, ['uk price', 'retail price', 'price']),
      link: findColumnIndex(headers, ['uk product link', 'link', 'url']),
      supplier: findColumnIndex(headers, ['supplier', 'manufacturer'])
    };
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || cell === '')) {
        continue;
      }
      
      const product: ParsedProduct = {
        type: getCellValue(row, columnMap.type) || 'Product',
        productCode: getCellValue(row, columnMap.productCode) || `AUTO-${Date.now()}-${i}`,
        category: getCellValue(row, columnMap.category) || 'General',
        subCategory: getCellValue(row, columnMap.subCategory) || '',
        specs: getCellValue(row, columnMap.specs) || '',
        hocPrice: getCellValue(row, columnMap.hocPrice) || '0',
        ukPrice: getCellValue(row, columnMap.ukPrice) || '0',
        link: getCellValue(row, columnMap.link) || null,
        unit: 'unit', // Default unit
        leadTime: 7, // Default lead time
        moq: 1, // Default minimum order quantity
        supplier: getCellValue(row, columnMap.supplier) || 'Unknown',
        imageUrl: imageMap[i] || null
      };
      
      // Clean up price values
      product.hocPrice = cleanPriceValue(product.hocPrice);
      product.ukPrice = cleanPriceValue(product.ukPrice);
      
      products.push(product);
    }
    
    console.log(`Parsed ${products.length} products from Excel file`);
    return products;
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Helper function to find column index by possible names
const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toLowerCase() || '';
    if (possibleNames.some(name => header.includes(name.toLowerCase()))) {
      return i;
    }
  }
  return -1;
};

// Helper function to get cell value safely
const getCellValue = (row: any[], columnIndex: number): string => {
  if (columnIndex === -1 || !row[columnIndex]) {
    return '';
  }
  return String(row[columnIndex]).trim();
};

// Helper function to clean price values
const cleanPriceValue = (price: string): string => {
  if (!price) return '0';
  
  // Remove currency symbols and clean up
  const cleaned = price.toString()
    .replace(/[£$€,]/g, '')
    .replace(/[^\d.]/g, '')
    .trim();
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? '0' : number.toString();
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
          supplier: productData.supplier
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