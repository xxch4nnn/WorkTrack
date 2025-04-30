import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCameraAvailable, setIsCameraAvailable] = useState<boolean>(true);
  const { toast } = useToast();

  // Get available camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        // First request permission to ensure devices list is complete
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setCameraDevices(videoDevices);
        
        // Select the back camera by default (if available)
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        setSelectedDeviceId(backCamera?.deviceId || (videoDevices[0]?.deviceId || ''));
        setIsCameraAvailable(videoDevices.length > 0);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsCameraAvailable(false);
        toast({
          title: 'Camera Access Denied',
          description: 'Please allow camera access to use this feature.',
          variant: 'destructive',
        });
      }
    }
    
    getDevices();
  }, [toast]);

  // Switch to next camera
  const switchCamera = useCallback(() => {
    if (cameraDevices.length <= 1) return;
    
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setSelectedDeviceId(cameraDevices[nextIndex].deviceId);
    
    toast({
      title: 'Camera Switched',
      description: `Now using: ${cameraDevices[nextIndex].label || 'Camera ' + (nextIndex + 1)}`,
    });
  }, [cameraDevices, selectedDeviceId, toast]);

  // Capture the image
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      } else {
        toast({
          title: 'Capture Failed',
          description: 'Failed to take the photo. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [onCapture, toast]);

  if (!isCameraAvailable) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <Camera className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Camera not available</h3>
        <p className="text-gray-500 mt-2">
          We couldn't access your camera. Please make sure you've granted camera permissions and try again.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={{
            deviceId: selectedDeviceId,
            facingMode: selectedDeviceId ? undefined : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
          screenshotFormat="image/jpeg"
          className="w-full rounded-lg"
          screenshotQuality={0.9}
          mirrored={false}
        />
        
        {cameraDevices.length > 1 && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 p-2 h-auto"
            onClick={switchCamera}
            title="Switch camera"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={capture}
          className="px-6"
        >
          <Camera className="mr-2 h-4 w-4" />
          Capture DTR
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Position the DTR document clearly in frame and ensure good lighting.
      </p>
    </div>
  );
}