import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw, Check, X, Edit, Eye } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import UnknownDTRFormatReview from './UnknownDTRFormatReview';

interface DTRFormat {
  id: number;
  name: string;
  companyId: number | null;
  pattern: string;
  extractionRules: Record<string, string>;
  example: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

const DTRFormatManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('known');

  // Fetch known DTR formats
  const { data: formats, isLoading } = useQuery({
    queryKey: ['/api/dtr-formats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dtr-formats');
      return await res.json() as DTRFormat[];
    }
  });

  // Toggle format active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/dtr-formats/${id}`, {
        isActive
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Format Updated',
        description: 'The DTR format status has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dtr-formats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update format: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">DTR Format Management</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Format
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="known" className="flex-1">Known Formats</TabsTrigger>
          <TabsTrigger value="unknown" className="flex-1">Review New Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="known" className="pt-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : formats?.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No DTR formats defined yet. Add a format or review unknown formats.</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formats?.map((format) => (
                    <TableRow key={format.id}>
                      <TableCell>{format.id}</TableCell>
                      <TableCell className="font-medium">{format.name}</TableCell>
                      <TableCell>{format.companyId || 'All'}</TableCell>
                      <TableCell>
                        {format.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant={format.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ 
                              id: format.id, 
                              isActive: !format.isActive 
                            })}
                          >
                            {format.isActive ? (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unknown" className="pt-4">
          <UnknownDTRFormatReview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DTRFormatManagement;