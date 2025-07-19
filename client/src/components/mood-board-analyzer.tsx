import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Image as ImageIcon, Palette, Package, 
  Eye, Sparkles, X, ChevronRight, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface MoodBoardAnalysis {
  visualElements: {
    colors: Array<{ color: string; hex: string; percentage: number }>;
    styles: string[];
    materials: string[];
    themes: string[];
  };
  matchingProducts: Array<{
    product: Product;
    matchScore: number;
    matchReasons: string[];
  }>;
  designInsights: string[];
  suggestions: string[];
}

interface MoodBoardAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoodBoardAnalyzer({ isOpen, onClose }: MoodBoardAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MoodBoardAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const analysisMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('moodboard', imageFile);
      
      const response = await fetch('/api/analyze-moodboard', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze mood board');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: `Found ${data.matchingProducts.length} matching products`,
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the mood board. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    analysisMutation.mutate(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadArea = () => (
    <div className="space-y-6">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <img 
              src={previewUrl} 
              alt="Mood board preview"
              className="mx-auto max-h-64 rounded-lg shadow-lg"
            />
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Ready to analyze
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Mood Board</h3>
              <p className="text-gray-600 mt-1">
                Upload an image of your design inspiration
              </p>
            </div>
            <Button variant="outline">
              Choose Image
            </Button>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-4">
        <Button 
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="flex-1"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 mr-2" />
              Analyze Mood Board
            </>
          )}
        </Button>
        
        {selectedFile && (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Analyzing visual elements...</span>
            <span>Please wait</span>
          </div>
          <Progress value={undefined} className="w-full" />
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Visual Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Analysis
            </CardTitle>
            <CardDescription>
              Detected colors, styles, and materials from your mood board
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Colors */}
            <div>
              <h4 className="font-medium mb-2">Dominant Colors</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.visualElements.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-medium">{color.color}</span>
                    <span className="text-xs text-gray-500">{color.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Styles & Materials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Detected Styles</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.visualElements.styles.map((style, index) => (
                    <Badge key={index} variant="secondary">{style}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Materials</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.visualElements.materials.map((material, index) => (
                    <Badge key={index} variant="outline">{material}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Insights */}
            <div>
              <h4 className="font-medium mb-2">Design Insights</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {analysis.designInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Matching Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Matching Products ({analysis.matchingProducts.length})
            </CardTitle>
            <CardDescription>
              Products from your catalogue that match this mood board
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {analysis.matchingProducts.map((match, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {match.product.imageUrl ? (
                            <img
                              src={match.product.imageUrl}
                              alt={match.product.specs}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm truncate">{match.product.specs}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {Math.round(match.matchScore)}% match
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {match.product.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">£{match.product.hocPrice}</span>
                            <span className="mx-2">•</span>
                            <span>{match.product.supplier}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Why it matches:</span>
                            <span className="ml-1">{match.matchReasons.join(', ')}</span>
                          </div>
                          
                          {match.product.link && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(match.product.link, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Product
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Design Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Mood Board Analysis
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          {!analysis ? renderUploadArea() : renderAnalysis()}
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Upload a mood board image to find matching products
          </div>
          <div className="flex gap-2">
            {analysis && (
              <Button variant="outline" onClick={handleReset}>
                Analyze Another
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}