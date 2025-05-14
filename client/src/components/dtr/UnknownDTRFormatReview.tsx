import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, Trash, RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface UnknownFormat {
  id: number;
  rawText: string;
  companyId: number | null;
  createdAt: string;
  parsedData: any;
  imageData: string | null;
  isProcessed: boolean | null;
}

interface ExtractRule {
  label: string;
  key: string;
  value: string;
}

const UnknownDTRFormatReview = () => {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<UnknownFormat | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formatName, setFormatName] = useState('');
  const [patternValue, setPatternValue] = useState('');
  const [extractionRules, setExtractionRules] = useState<ExtractRule[]>([
    { label: 'Employee Name', key: 'employeeName', value: '$1' },
    { label: 'Employee ID', key: 'employeeId', value: '$2' },
    { label: 'Date', key: 'date', value: '$3' },
    { label: 'Time In', key: 'timeIn', value: '$4' },
    { label: 'Time Out', key: 'timeOut', value: '$5' }
  ]);

  // Fetch unknown DTR formats
  const { data: unknownFormats, isLoading } = useQuery({
    queryKey: ['/api/unknown-dtr-formats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/unknown-dtr-formats');
      return await res.json() as UnknownFormat[];
    }
  });

  // Approve a DTR format mutation
  const approveMutation = useMutation({
    mutationFn: async (formatId: number) => {
      if (!formatName || !patternValue) {
        throw new Error('Format name and pattern are required');
      }

      // Convert extraction rules to object
      const extractionRulesObj: Record<string, string> = {};
      extractionRules.forEach(rule => {
        if (rule.value) {
          extractionRulesObj[rule.key] = rule.value;
        }
      });

      const response = await apiRequest('POST', `/api/unknown-dtr-formats/${formatId}/approve`, {
        name: formatName,
        pattern: patternValue,
        extractionRules: extractionRulesObj,
        companyId: selectedFormat?.companyId
      });

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Format Approved',
        description: 'The DTR format has been approved and added to known formats',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/unknown-dtr-formats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dtr-formats'] });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to approve format: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const handleApprove = (format: UnknownFormat) => {
    setSelectedFormat(format);

    // Initialize form with default values based on parsed data
    setFormatName(`Company ${format.companyId || 'Unknown'} Format`);
    
    // Create a simple pattern matching the structure
    const lines = format.rawText.split('\n');
    const escapedLines = lines.map(line => line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    setPatternValue(escapedLines);

    // Try to find some extraction rules if we have parsed data
    if (format.parsedData) {
      const newRules = [...extractionRules];
      if (format.parsedData.employeeName) {
        const index = newRules.findIndex(r => r.key === 'employeeName');
        if (index >= 0) newRules[index].value = '$1';
      }
      if (format.parsedData.employeeId) {
        const index = newRules.findIndex(r => r.key === 'employeeId');
        if (index >= 0) newRules[index].value = '$2';
      }
      if (format.parsedData.date) {
        const index = newRules.findIndex(r => r.key === 'date');
        if (index >= 0) newRules[index].value = '$3';
      }
      setExtractionRules(newRules);
    }

    setShowDialog(true);
  };

  // Handle extraction rule change
  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...extractionRules];
    newRules[index].value = value;
    setExtractionRules(newRules);
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      // Standalone component behavior - go back in history
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Default fallback is dashboard
        window.location.href = '/';
      }
    }
  };

  // Detect if used as a standalone component or within DTR Format Management
  // This is for demonstration only - in a real implementation, we would use props
  const isStandalone = window.location.pathname.includes('unknown-dtr-formats');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Only show back button if this is a standalone page */}
          {isStandalone && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoBack}
              className="h-8 w-8 p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="sr-only">Back</span>
            </Button>
          )}
          <h3 className="text-xl font-bold">Unknown DTR Format Review</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : unknownFormats?.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No unknown DTR formats to review</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unknownFormats?.filter(format => !format.isProcessed).map((format) => (
                <TableRow key={format.id}>
                  <TableCell>{format.id}</TableCell>
                  <TableCell>{format.companyId || 'Unknown'}</TableCell>
                  <TableCell>{new Date(format.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                      Needs Review
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprove(format)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review DTR Format</DialogTitle>
            <DialogDescription>
              Review the DTR text and create a pattern and extraction rules to enable automatic processing
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="format" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="format">Format Details</TabsTrigger>
              <TabsTrigger value="raw">Raw DTR Text</TabsTrigger>
              {selectedFormat?.imageData && (
                <TabsTrigger value="image">Image</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formatName">Format Name</Label>
                  <Input 
                    id="formatName" 
                    value={formatName} 
                    onChange={(e) => setFormatName(e.target.value)} 
                    placeholder="Company X DTR Format" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company ID</Label>
                  <Input 
                    id="companyId" 
                    value={selectedFormat?.companyId || ''} 
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">
                  Pattern (RegExp)
                  <span className="text-xs text-muted-foreground ml-2">
                    Use .* for any text, use capturing groups () for data extraction
                  </span>
                </Label>
                <Textarea 
                  id="pattern" 
                  value={patternValue} 
                  onChange={(e) => setPatternValue(e.target.value)} 
                  rows={4}
                  placeholder="Employee:\s*([^\n]+).*Date:\s*(\d{2}/\d{2}/\d{4}).*"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Extraction Rules
                  <span className="text-xs text-muted-foreground ml-2">
                    Use $1, $2, etc. to reference captured groups from the pattern
                  </span>
                </Label>
                <div className="space-y-2">
                  {extractionRules.map((rule, index) => (
                    <div key={rule.key} className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Label htmlFor={`rule-${index}`}>{rule.label}</Label>
                      </div>
                      <div className="col-span-2">
                        <Input 
                          id={`rule-${index}`} 
                          value={rule.value} 
                          onChange={(e) => handleRuleChange(index, e.target.value)} 
                          placeholder="$1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw">
              <div className="border rounded-md p-3 bg-gray-50 whitespace-pre-wrap font-mono text-sm">
                {selectedFormat?.rawText}
              </div>
            </TabsContent>

            {selectedFormat?.imageData && (
              <TabsContent value="image">
                <div className="flex justify-center">
                  <img 
                    src={selectedFormat.imageData} 
                    alt="DTR scan" 
                    className="max-w-full border rounded-md" 
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedFormat && approveMutation.mutate(selectedFormat.id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve Format
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnknownDTRFormatReview;