import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ExcelUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResult {
  imported: number;
  errors: string[];
}

export default function ExcelUpload({ isOpen, onClose }: ExcelUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data.results);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Upload Complete",
        description: `Successfully imported ${data.results.imported} products`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isExcel = allowedTypes.includes(file.type) || 
                   file.name.toLowerCase().endsWith('.xlsx') || 
                   file.name.toLowerCase().endsWith('.xls');
    
    if (!isExcel) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-500" />
                Excel Upload
              </CardTitle>
              <CardDescription>
                Upload your House of Clarence product catalog with images
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Expected Excel Format:</strong><br />
              Columns: Type, Product Code, Category, Sub Category, Product Specs, HOC Price, UK Price, UK Product Link, Supplier<br />
              Images should be embedded in the Excel file for each product row.
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          {!selectedFile && !uploadResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-700 mb-2">
                Drop your Excel file here, or click to browse
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Supports .xlsx and .xls files up to 50MB
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* File Selected */}
          {selectedFile && !uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-neutral-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={resetUpload}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Import
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing Excel file...</span>
              </div>
              <Progress value={50} className="w-full" />
              <p className="text-xs text-neutral-500">
                Reading Excel data, extracting images, and importing products...
              </p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Upload Complete!</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">
                    Successfully Imported: {uploadResult.imported} products
                  </p>
                </div>
                
                {uploadResult.errors.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800 mb-2">
                      Errors ({uploadResult.errors.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 mb-1">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline" className="flex-1">
                  Upload Another File
                </Button>
                <Button onClick={onClose} className="flex-1">
                  View Products
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}