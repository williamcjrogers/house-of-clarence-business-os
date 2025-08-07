import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Download, CheckCircle, AlertCircle, Loader2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface WebScraperProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScrapeResult {
  message: string;
  results: {
    imported: number;
    errors: string[];
  };
}

export default function WebScraper({ isOpen, onClose }: WebScraperProps) {
  const [siteUrl, setSiteUrl] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("generic");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available scraper profiles
  const { data: profilesData } = useQuery({
    queryKey: ['/api/scraper-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/scraper-profiles');
      if (!response.ok) {
        throw new Error('Failed to fetch scraper profiles');
      }
      return response.json();
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: async (data: { siteUrl: string; profileName: string }) => {
      const response = await fetch('/api/scrape-competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: data.siteUrl,
          profileName: data.profileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scraping failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setScrapeResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Scraping Complete",
        description: `Successfully imported ${data.results.imported} products from competitor site`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScrape = () => {
    if (!siteUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    scrapeMutation.mutate({
      siteUrl: siteUrl.trim(),
      profileName: selectedProfile,
    });
  };

  const handleClose = () => {
    setSiteUrl("");
    setSelectedProfile("generic");
    setScrapeResult(null);
    onClose();
  };

  const resetScraper = () => {
    setSiteUrl("");
    setSelectedProfile("generic");
    setScrapeResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Competitor Catalog Scraper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Scrape competitor product catalogs:</strong><br />
              Enter a competitor's website URL to automatically import their product catalog. 
              Select a scraping profile that matches the site structure for best results.
            </AlertDescription>
          </Alert>

          {!scrapeResult ? (
            <>
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="site-url">Competitor Website URL</Label>
                <Input
                  id="site-url"
                  type="url"
                  placeholder="https://competitor-site.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  disabled={scrapeMutation.isPending}
                />
              </div>

              {/* Profile Selection */}
              <div className="space-y-2">
                <Label htmlFor="profile-select">Scraping Profile</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scraping profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profilesData?.profiles?.map((profile: string) => (
                      <SelectItem key={profile} value={profile}>
                        {profile.charAt(0).toUpperCase() + profile.slice(1)}
                        {profile === 'lussostone' && ' (Lusso Stone)'}
                        {profile === 'boutiquestone' && ' (Boutique Stone)'}
                        {profile === 'generic' && ' (Generic/Unknown Sites)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Info */}
              {selectedProfile && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="text-sm text-blue-700">
                      <strong>Profile: {selectedProfile}</strong>
                      <br />
                      {selectedProfile === 'lussostone' && 'Optimized for Lusso Stone bathroom products and fittings'}
                      {selectedProfile === 'boutiquestone' && 'Optimized for Boutique Stone tiles and surfaces'}
                      {selectedProfile === 'generic' && 'General purpose scraper for most e-commerce sites'}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scrape Progress */}
              {scrapeMutation.isPending && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">Scraping in Progress</p>
                        <p className="text-sm text-orange-700">
                          Analyzing {new URL(siteUrl).hostname} and extracting product data...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleScrape}
                  disabled={scrapeMutation.isPending || !siteUrl.trim()}
                  className="flex-1"
                >
                  {scrapeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Start Scraping
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Scraping Complete!</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800 text-lg">Import Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700">
                      <strong>{scrapeResult.results.imported}</strong> products successfully imported
                      from <strong>{new URL(siteUrl).hostname}</strong>
                    </p>
                  </CardContent>
                </Card>

                {scrapeResult.results.errors.length > 0 && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Warnings ({scrapeResult.results.errors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {scrapeResult.results.errors.map((error, index) => (
                          <p key={index} className="text-sm text-amber-700">
                            • {error}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={resetScraper} variant="outline" className="flex-1">
                  Scrape Another Site
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  View Products
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}