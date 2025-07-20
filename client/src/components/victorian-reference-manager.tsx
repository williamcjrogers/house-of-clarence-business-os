import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, Home, Search, Filter, Eye, 
  Archive, Plus, X, ChevronRight, Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VictorianReference {
  id: string;
  name: string;
  style: string;
  keyFeatures: string[];
  colorPalette: string[];
  materials: string[];
  architecturalElements: string[];
  filePath: string;
  description: string;
  analysisDate: string;
}

interface VictorianReferenceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VictorianReferenceManager({ isOpen, onClose }: VictorianReferenceManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedReference, setSelectedReference] = useState<VictorianReference | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: references = [], isLoading } = useQuery<VictorianReference[]>({
    queryKey: ['/api/victorian-references'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('victorian-image', file);
      
      const response = await fetch('/api/save-victorian-reference', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to save Victorian reference');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/victorian-references'] });
      setSelectedFile(null);
      setIsUploading(false);
      toast({
        title: "Reference saved",
        description: "Victorian house reference has been analyzed and saved",
      });
    },
    onError: () => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "Could not save the Victorian reference",
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
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    uploadMutation.mutate(selectedFile);
  };

  const filteredReferences = references.filter(ref =>
    ref.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ref.style.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ref.keyFeatures.some(feature => 
      feature.toLowerCase().includes(searchFilter.toLowerCase())
    )
  );

  const renderUploadSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Victorian House Reference
        </CardTitle>
        <CardDescription>
          Upload photos of traditional Victorian houses to build your reference library
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <Home className="h-8 w-8 text-green-600 mx-auto" />
              <p className="font-medium text-green-600">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">Ready to analyze</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="font-medium">Upload Victorian House Photo</p>
              <p className="text-sm text-gray-500">Click to select an image file</p>
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

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Archive className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Save Reference
              </>
            )}
          </Button>
          
          {selectedFile && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Analyzing architectural features...</span>
              <span>Please wait</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReferencesLibrary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Victorian Reference Library ({references.length})
        </CardTitle>
        <CardDescription>
          Your collection of traditional Victorian house references
        </CardDescription>
        
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by style, features, or name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="text-center py-8">
              <Progress value={undefined} className="w-32 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Loading references...</p>
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No Victorian references found</p>
              <p className="text-sm text-gray-400">Upload some photos to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferences.map((ref) => (
                <Card 
                  key={ref.id} 
                  className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReference(ref)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{ref.name}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {ref.style}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Key Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ref.keyFeatures.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {ref.keyFeatures.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{ref.keyFeatures.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Colors:</span>
                        <div className="flex gap-1 mt-1">
                          {ref.colorPalette.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderReferenceDetail = () => {
    if (!selectedReference) return null;

    return (
      <Dialog open={!!selectedReference} onOpenChange={() => setSelectedReference(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {selectedReference.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Style</Label>
                <Badge variant="default" className="mt-1">{selectedReference.style}</Badge>
              </div>
              <div>
                <Label className="font-medium">Analysis Date</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedReference.analysisDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <Label className="font-medium">Description</Label>
              <p className="text-sm text-gray-700 mt-1">{selectedReference.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Key Features</Label>
                <ul className="text-sm mt-1 space-y-1">
                  {selectedReference.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <Label className="font-medium">Materials</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedReference.materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="font-medium">Color Palette</Label>
              <div className="flex gap-2 mt-1">
                {selectedReference.colorPalette.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-medium">Architectural Elements</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedReference.architecturalElements.map((element, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedReference(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // TODO: Integrate with mood board analyzer
                  toast({
                    title: "Feature coming soon",
                    description: "Compare with catalogue functionality will be available soon",
                  });
                }}
              >
                <Palette className="h-4 w-4 mr-2" />
                Compare with Catalogue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Victorian House References
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {renderUploadSection()}
            {renderReferencesLibrary()}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Build a library of Victorian house references for design comparisons
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
      
      {renderReferenceDetail()}
    </Dialog>
  );
}