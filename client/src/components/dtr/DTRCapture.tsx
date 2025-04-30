import * as React from "react";
import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, File, X, Check, ImageOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { processDTRImage, ParsedDTRData } from "@/lib/services/ocrService";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DTRCaptureProps {
  onSuccess: (dtrData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const DTRCapture: React.FC<DTRCaptureProps> = ({ 
  onSuccess, 
  onError,
  onCancel 
}) => {
  const [captureMethod, setCaptureMethod] = useState<string>("camera");
  const [processing, setProcessing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedDTRData | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPreviewImage(reader.result);
            setCapturedImage(reader.result);
          }
        };
        
        reader.readAsDataURL(file);
      }
    }
  });

  // Camera capture handling
  const captureImage = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPreviewImage(imageSrc);
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // Process the captured/uploaded image
  const processImage = async () => {
    if (!capturedImage) {
      toast({
        title: "No image",
        description: "Please capture or upload an image first.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      // First process the image with OCR
      const dtrData = await processDTRImage(capturedImage);
      setResult(dtrData);
      
      // If high confidence and doesn't need review, automatically submit
      if (dtrData.confidence > 0.7 && !dtrData.needsReview) {
        submitDTR(dtrData);
      }
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the DTR image. Please try again or use a clearer image.",
        variant: "destructive"
      });
      onError("Failed to process the DTR image");
    } finally {
      setProcessing(false);
    }
  };

  // Submit the processed DTR data
  const submitDTR = async (dtrData: ParsedDTRData) => {
    try {
      // Prepare DTR data for API submission
      const newDTR = {
        employeeId: dtrData.employeeId,
        date: dtrData.date || new Date().toISOString().split('T')[0],
        timeIn: dtrData.timeIn || "09:00",
        timeOut: dtrData.timeOut || "17:00",
        breakHours: dtrData.breakHours || 1,
        overtimeHours: dtrData.overtimeHours || 0,
        remarks: dtrData.remarks || "",
        type: dtrData.type || "Daily",
        status: "Pending",
        submissionDate: new Date().toISOString().split('T')[0],
      };
      
      // Calculate regular hours (server will do this too)
      const inHour = parseInt(newDTR.timeIn.split(':')[0]);
      const inMinute = parseInt(newDTR.timeIn.split(':')[1]);
      const outHour = parseInt(newDTR.timeOut.split(':')[0]);
      const outMinute = parseInt(newDTR.timeOut.split(':')[1]);
      
      const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute) - (newDTR.breakHours * 60);
      const regularHours = Math.max(0, totalMinutes / 60);
      
      // If this is a new DTR format, log it for learning
      if (dtrData.needsReview) {
        await apiRequest("POST", "/api/dtr-formats", { 
          rawText: dtrData.rawText,
          parsedData: dtrData,
          companyId: dtrData.companyId
        });
      }
      
      // Submit the DTR
      const response = await apiRequest("POST", "/api/dtrs", {
        ...newDTR,
        regularHours
      });
      
      toast({
        title: "DTR Submitted",
        description: "The DTR has been successfully processed and submitted.",
      });
      
      onSuccess(response);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit the DTR. Please try again.",
        variant: "destructive"
      });
      
      onError("Failed to submit the DTR");
    }
  };

  const resetCapture = () => {
    setPreviewImage(null);
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">Capture DTR</h3>
        <p className="text-sm text-gray-500">
          Upload a DTR image or use the webcam to capture it. The system will automatically process and extract relevant data.
        </p>
      </div>
      
      <Tabs value={captureMethod} onValueChange={setCaptureMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">
            <Camera className="mr-2 h-4 w-4" />
            Use Camera
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="space-y-4">
          {!previewImage ? (
            <div className="rounded-md overflow-hidden bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 720,
                  height: 480,
                  facingMode: "environment"
                }}
                className="w-full"
              />
              <div className="bg-black p-2 flex justify-center">
                <Button onClick={captureImage} className="bg-white text-black hover:bg-gray-200">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img src={previewImage} alt="Captured DTR" className="w-full rounded-md" />
              <div className="absolute top-2 right-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetCapture}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          {!previewImage ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                isDragActive ? "border-primary bg-blue-50" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Drag & drop a DTR image here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports JPG, JPEG, PNG files
              </p>
            </div>
          ) : (
            <div className="relative">
              <img src={previewImage} alt="Uploaded DTR" className="w-full rounded-md" />
              <div className="absolute top-2 right-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetCapture}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {previewImage && (
        <div className="mt-6 space-y-4">
          <Button onClick={processImage} disabled={processing} className="w-full">
            {processing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Process DTR
              </>
            )}
          </Button>
          
          {result && (
            <div className="space-y-4">
              <Alert className={result.confidence > 0.7 ? "bg-green-50" : "bg-amber-50"}>
                <AlertDescription className="text-sm">
                  {result.confidence > 0.7
                    ? "Successfully processed the DTR with high confidence."
                    : "The DTR was processed but may need manual verification."}
                </AlertDescription>
              </Alert>
              
              {result.needsReview && (
                <div className="p-4 border rounded-md bg-yellow-50">
                  <p className="text-sm font-medium text-amber-800">New DTR Format Detected</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This format hasn't been fully recognized. The system will learn from your corrections.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Employee:</span>
                  <span>{result.employeeName || "Not detected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Date:</span>
                  <span>{result.date || "Not detected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Time In:</span>
                  <span>{result.timeIn || "Not detected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Time Out:</span>
                  <span>{result.timeOut || "Not detected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Format:</span>
                  <span>{result.type || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Confidence:</span>
                  <span>{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => submitDTR(result)} className="flex-1">
                  Submit DTR
                </Button>
                <Button variant="outline" onClick={resetCapture} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default DTRCapture;