import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { Upload, Camera, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { processDTRImage, ParsedDTRData } from '@/lib/services/ocrService';

interface DTRUploadProps {
  onProcessed: (data: ParsedDTRData) => void;
  onCancel: () => void;
}

const DTRUpload = ({ onProcessed, onCancel }: DTRUploadProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // For file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    },
    maxFiles: 1,
  });

  // Handle camera captured image
  const handleCaptureComplete = (imageSrc: string) => {
    setPreviewImage(imageSrc);
    setActiveTab('process');
  };

  // Process image with OCR
  const processImage = async () => {
    if (!previewImage) return;
    
    try {
      setIsProcessing(true);
      
      // Create a fake progress indicator (since OCR processing doesn't report progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      // Process the image
      const result = await processDTRImage(previewImage);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Pass the result to parent component
      onProcessed(result);
      
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Failed to process the DTR image. Please try again.',
        variant: 'destructive',
      });
      console.error('Error processing DTR image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear the current image
  const clearImage = () => {
    setPreviewImage(null);
    setUploadProgress(0);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Scan or Upload DTR</h3>
      
      {!previewImage ? (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Upload DTR
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drag and drop your DTR image here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse your files
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="camera">
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef => {
                    if (webcamRef) {
                      // Store webcam ref in state or use it directly
                      (window as any).webcamRef = webcamRef;
                    }
                  }}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 720,
                    height: 480,
                    facingMode: "environment"
                  }}
                  className="w-full"
                />
                <div className="bg-black p-2 flex justify-center">
                  <Button 
                    onClick={() => {
                      const webcamRef = (window as any).webcamRef;
                      if (webcamRef) {
                        const imageSrc = webcamRef.getScreenshot();
                        if (imageSrc) {
                          handleCaptureComplete(imageSrc);
                        }
                      }
                    }} 
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Position the DTR document clearly in frame and ensure good lighting.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-[4/3] relative bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={previewImage} 
                alt="DTR Preview" 
                className="w-full h-full object-contain"
              />
              
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-md">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm mt-2">Processing DTR...</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={clearImage}
              disabled={isProcessing}
            >
              Take Another
            </Button>
            <Button 
              onClick={processImage}
              disabled={isProcessing}
            >
              Process DTR
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default DTRUpload;