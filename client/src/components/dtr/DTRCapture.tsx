import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Upload, CheckCircle2, XCircle, SlidersHorizontal, Image, ZoomIn, Move, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { DtrFormat } from '@shared/schema';
import { mlService, ImageEnhancementOptions, DTRPrediction } from '@/lib/services/mlService';
import notificationService from '@/lib/services/notificationService';

// CSS styles for the capture component
const CAPTURE_STYLES = {
  container: 'flex flex-col md:flex-row gap-6',
  captureSection: 'flex-1 flex flex-col gap-4',
  previewSection: 'flex-1 flex flex-col gap-4',
  webcamContainer: 'relative rounded-lg overflow-hidden bg-black flex items-center justify-center h-[350px]',
  webcam: 'h-full w-full object-contain',
  captureControls: 'flex flex-wrap justify-center gap-2 mt-2',
  button: 'btn-primary flex items-center gap-2 px-3 py-2 text-sm',
  secondaryButton: 'btn-outline flex items-center gap-2 px-3 py-2 text-sm',
  dangerButton: 'flex items-center gap-2 px-3 py-2 text-sm bg-error text-white hover:bg-error-darker rounded-md',
  previewContainer: 'relative rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center h-[300px]',
  previewImage: 'max-h-full max-w-full object-contain',
  previewMessage: 'text-gray-500 text-center',
  enhancementsPanel: 'mt-4 p-4 bg-white rounded-lg shadow-sm',
  enhancementToggle: 'flex items-center gap-2 mb-2',
  enhancementToggleLabel: 'flex-1 text-sm',
  enhancementToggleSwitch: 'relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200',
  enhancementToggleSwitchActive: 'bg-primary',
  enhancementToggleSlider: 'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
  enhancementToggleSliderActive: 'translate-x-5',
  formGroup: 'mb-4',
  formLabel: 'block text-sm font-medium text-gray-700 mb-1',
  formSelect: 'w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary',
  formInput: 'w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary',
  resultPanel: 'mt-4 p-4 bg-white rounded-lg shadow-sm',
  resultField: 'flex justify-between mb-2',
  resultFieldLabel: 'text-sm font-medium text-gray-700',
  resultFieldValue: 'text-sm text-gray-900',
  resultConfidence: 'text-xs px-2 py-1 rounded-full',
  resultConfidenceHigh: 'bg-success-lighter text-success-darker',
  resultConfidenceMedium: 'bg-warning-lighter text-warning-darker',
  resultConfidenceLow: 'bg-error-lighter text-error-darker',
};

const DTRCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [prediction, setPrediction] = useState<DTRPrediction | null>(null);
  const [matchedFormat, setMatchedFormat] = useState<DtrFormat | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showEnhancementOptions, setShowEnhancementOptions] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState<ImageEnhancementOptions>({
    denoise: true,
    sharpen: true,
    contrast: true,
    perspective: false,
    removeBackground: false,
  });
  
  // Get available DTR formats
  const { data: dtrFormats = [] } = useQuery<DtrFormat[]>({
    queryKey: ['/api/dtr-formats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dtr-formats');
      return await res.json();
    }
  });
  
  // Get employees for selection
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/employees');
      return await res.json();
    }
  });
  
  // Submit DTR mutation
  const submitDTRMutation = useMutation({
    mutationFn: async (dtrData: any) => {
      const res = await apiRequest('POST', '/api/dtrs', dtrData);
      return await res.json();
    },
    onSuccess: () => {
      notificationService.success('DTR Submitted', 'The DTR has been successfully submitted.');
      
      // Reset the state
      setCapturedImage(null);
      setEnhancedImage(null);
      setPrediction(null);
      setMatchedFormat(null);
      
      // Invalidate queries to refresh DTR list
      queryClient.invalidateQueries({ queryKey: ['/api/dtrs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dtrs/recent'] });
    },
    onError: (error: any) => {
      notificationService.error('DTR Submission Failed', error.message || 'Failed to submit the DTR.');
    }
  });
  
  // Submit unknown DTR format mutation
  const submitUnknownFormatMutation = useMutation({
    mutationFn: async (formatData: any) => {
      const res = await apiRequest('POST', '/api/dtr-formats/unknown', formatData);
      return await res.json();
    },
    onSuccess: () => {
      notificationService.success(
        'Unknown Format Submitted', 
        'The unknown DTR format has been submitted for review.'
      );
      
      // Reset the state
      setCapturedImage(null);
      setEnhancedImage(null);
      setPrediction(null);
      setMatchedFormat(null);
    },
    onError: (error: any) => {
      notificationService.error(
        'Format Submission Failed', 
        error.message || 'Failed to submit the unknown DTR format.'
      );
    }
  });
  
  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setEnhancedImage(null);
      setPrediction(null);
      setMatchedFormat(null);
    }
  }, [webcamRef]);
  
  // Process the captured image
  const processImage = useCallback(async () => {
    if (!capturedImage) return;
    
    setProcessing(true);
    
    try {
      // First enhance the image
      const enhancedImg = await mlService.processDTRImage(capturedImage, enhancementOptions);
      setEnhancedImage(enhancedImg);
      
      // Then analyze the enhanced image
      const analysis = await mlService.analyzeDTRImage(enhancedImg, dtrFormats);
      
      if (analysis.prediction) {
        setPrediction(analysis.prediction);
        setMatchedFormat(analysis.matchedFormat);
        
        // If high confidence and matched format, suggest submit
        if (analysis.confidence > 0.85 && analysis.matchedFormat) {
          notificationService.success(
            'DTR Analysis Complete', 
            `Recognized as ${analysis.matchedFormat.name} format with high confidence.`
          );
        } 
        // If medium confidence, suggest verification
        else if (analysis.confidence > 0.6) {
          notificationService.info(
            'DTR Analysis Complete', 
            'Please verify the extracted information before submitting.'
          );
        } 
        // If low confidence or no match, suggest unknown format
        else {
          notificationService.warning(
            'DTR Format Not Recognized', 
            'This appears to be an unknown DTR format. Please submit it for review.'
          );
        }
      } else {
        notificationService.error(
          'DTR Analysis Failed', 
          'Could not extract information from the image.'
        );
      }
    } catch (error) {
      console.error('Error processing image:', error);
      notificationService.error(
        'Processing Failed', 
        'An error occurred while processing the image.'
      );
    } finally {
      setProcessing(false);
    }
  }, [capturedImage, enhancementOptions, dtrFormats]);
  
  // Reset the capture
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setEnhancedImage(null);
    setPrediction(null);
    setMatchedFormat(null);
    setSelectedEmployee('');
  }, []);
  
  // Toggle an enhancement option
  const toggleEnhancement = useCallback((option: keyof ImageEnhancementOptions) => {
    setEnhancementOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  }, []);
  
  // Submit the DTR
  const submitDTR = useCallback(() => {
    if (!prediction || !selectedEmployee) {
      notificationService.warning(
        'Missing Information', 
        'Please select an employee and ensure all DTR data is available.'
      );
      return;
    }
    
    const dtrData = {
      employeeId: parseInt(selectedEmployee),
      date: prediction.date,
      timeIn: prediction.timeIn,
      timeOut: prediction.timeOut,
      regularHours: prediction.regularHours,
      overtimeHours: prediction.overtimeHours || 0,
      breakHours: prediction.breakHours || 1,
      remarks: matchedFormat ? `Auto-processed using ${matchedFormat.name} format` : 'Manually verified'
    };
    
    submitDTRMutation.mutate(dtrData);
  }, [prediction, selectedEmployee, matchedFormat, submitDTRMutation]);
  
  // Submit as unknown format
  const submitAsUnknown = useCallback(() => {
    if (!capturedImage || !enhancedImage) {
      notificationService.warning(
        'Missing Image', 
        'Please capture a DTR image first.'
      );
      return;
    }
    
    const formatData = {
      rawText: prediction ? JSON.stringify(prediction) : '',
      imageData: enhancedImage,
      companyId: null,
      parsedData: prediction ? JSON.stringify(prediction) : null
    };
    
    submitUnknownFormatMutation.mutate(formatData);
  }, [capturedImage, enhancedImage, prediction, submitUnknownFormatMutation]);
  
  // Get confidence class based on value
  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.8) return CAPTURE_STYLES.resultConfidenceHigh;
    if (confidence >= 0.6) return CAPTURE_STYLES.resultConfidenceMedium;
    return CAPTURE_STYLES.resultConfidenceLow;
  };
  
  // Get webcam constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };
  
  return (
    <div className={CAPTURE_STYLES.container}>
      <div className={CAPTURE_STYLES.captureSection}>
        <h2 className="text-xl font-bold mb-4">Capture DTR</h2>
        
        <div className={CAPTURE_STYLES.webcamContainer}>
          {capturedImage ? (
            <img 
              src={enhancedImage || capturedImage} 
              alt="Captured DTR" 
              className={CAPTURE_STYLES.webcam}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className={CAPTURE_STYLES.webcam}
            />
          )}
        </div>
        
        <div className={CAPTURE_STYLES.captureControls}>
          {!capturedImage ? (
            <button 
              onClick={capturePhoto}
              className={CAPTURE_STYLES.button}
            >
              <Camera size={16} />
              Capture Photo
            </button>
          ) : (
            <>
              <button 
                onClick={resetCapture}
                className={CAPTURE_STYLES.secondaryButton}
              >
                <RefreshCw size={16} />
                Retake Photo
              </button>
              
              <button
                onClick={() => setShowEnhancementOptions(!showEnhancementOptions)}
                className={CAPTURE_STYLES.secondaryButton}
              >
                <SlidersHorizontal size={16} />
                Enhancements
              </button>
              
              {!processing && !prediction ? (
                <button 
                  onClick={processImage}
                  className={CAPTURE_STYLES.button}
                >
                  <Sparkles size={16} />
                  Process Image
                </button>
              ) : processing ? (
                <button className={CAPTURE_STYLES.button} disabled>
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </button>
              ) : null}
            </>
          )}
        </div>
        
        {showEnhancementOptions && capturedImage && (
          <div className={CAPTURE_STYLES.enhancementsPanel}>
            <h3 className="text-sm font-bold mb-3">Image Enhancement Options</h3>
            
            <div className={CAPTURE_STYLES.enhancementToggle}>
              <label className={CAPTURE_STYLES.enhancementToggleLabel}>Denoise Image</label>
              <button 
                className={`${CAPTURE_STYLES.enhancementToggleSwitch} ${enhancementOptions.denoise ? CAPTURE_STYLES.enhancementToggleSwitchActive : ''}`}
                onClick={() => toggleEnhancement('denoise')}
              >
                <span 
                  className={`${CAPTURE_STYLES.enhancementToggleSlider} ${enhancementOptions.denoise ? CAPTURE_STYLES.enhancementToggleSliderActive : ''}`}
                />
              </button>
            </div>
            
            <div className={CAPTURE_STYLES.enhancementToggle}>
              <label className={CAPTURE_STYLES.enhancementToggleLabel}>Sharpen Text</label>
              <button 
                className={`${CAPTURE_STYLES.enhancementToggleSwitch} ${enhancementOptions.sharpen ? CAPTURE_STYLES.enhancementToggleSwitchActive : ''}`}
                onClick={() => toggleEnhancement('sharpen')}
              >
                <span 
                  className={`${CAPTURE_STYLES.enhancementToggleSlider} ${enhancementOptions.sharpen ? CAPTURE_STYLES.enhancementToggleSliderActive : ''}`}
                />
              </button>
            </div>
            
            <div className={CAPTURE_STYLES.enhancementToggle}>
              <label className={CAPTURE_STYLES.enhancementToggleLabel}>Improve Contrast</label>
              <button 
                className={`${CAPTURE_STYLES.enhancementToggleSwitch} ${enhancementOptions.contrast ? CAPTURE_STYLES.enhancementToggleSwitchActive : ''}`}
                onClick={() => toggleEnhancement('contrast')}
              >
                <span 
                  className={`${CAPTURE_STYLES.enhancementToggleSlider} ${enhancementOptions.contrast ? CAPTURE_STYLES.enhancementToggleSliderActive : ''}`}
                />
              </button>
            </div>
            
            <div className={CAPTURE_STYLES.enhancementToggle}>
              <label className={CAPTURE_STYLES.enhancementToggleLabel}>Fix Perspective</label>
              <button 
                className={`${CAPTURE_STYLES.enhancementToggleSwitch} ${enhancementOptions.perspective ? CAPTURE_STYLES.enhancementToggleSwitchActive : ''}`}
                onClick={() => toggleEnhancement('perspective')}
              >
                <span 
                  className={`${CAPTURE_STYLES.enhancementToggleSlider} ${enhancementOptions.perspective ? CAPTURE_STYLES.enhancementToggleSliderActive : ''}`}
                />
              </button>
            </div>
            
            <div className={CAPTURE_STYLES.enhancementToggle}>
              <label className={CAPTURE_STYLES.enhancementToggleLabel}>Remove Background</label>
              <button 
                className={`${CAPTURE_STYLES.enhancementToggleSwitch} ${enhancementOptions.removeBackground ? CAPTURE_STYLES.enhancementToggleSwitchActive : ''}`}
                onClick={() => toggleEnhancement('removeBackground')}
              >
                <span 
                  className={`${CAPTURE_STYLES.enhancementToggleSlider} ${enhancementOptions.removeBackground ? CAPTURE_STYLES.enhancementToggleSliderActive : ''}`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={CAPTURE_STYLES.previewSection}>
        <h2 className="text-xl font-bold mb-4">DTR Information</h2>
        
        {prediction ? (
          <>
            <div className={CAPTURE_STYLES.resultPanel}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Extracted DTR Data</h3>
                <span 
                  className={`${CAPTURE_STYLES.resultConfidence} ${getConfidenceClass(prediction.confidence)}`}
                >
                  {Math.round(prediction.confidence * 100)}% Confidence
                </span>
              </div>
              
              <div className={CAPTURE_STYLES.resultField}>
                <span className={CAPTURE_STYLES.resultFieldLabel}>Date:</span>
                <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.date}</span>
              </div>
              
              <div className={CAPTURE_STYLES.resultField}>
                <span className={CAPTURE_STYLES.resultFieldLabel}>Time In:</span>
                <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.timeIn}</span>
              </div>
              
              <div className={CAPTURE_STYLES.resultField}>
                <span className={CAPTURE_STYLES.resultFieldLabel}>Time Out:</span>
                <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.timeOut}</span>
              </div>
              
              <div className={CAPTURE_STYLES.resultField}>
                <span className={CAPTURE_STYLES.resultFieldLabel}>Regular Hours:</span>
                <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.regularHours}</span>
              </div>
              
              {prediction.overtimeHours > 0 && (
                <div className={CAPTURE_STYLES.resultField}>
                  <span className={CAPTURE_STYLES.resultFieldLabel}>Overtime Hours:</span>
                  <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.overtimeHours}</span>
                </div>
              )}
              
              <div className={CAPTURE_STYLES.resultField}>
                <span className={CAPTURE_STYLES.resultFieldLabel}>Break Hours:</span>
                <span className={CAPTURE_STYLES.resultFieldValue}>{prediction.breakHours}</span>
              </div>
              
              {matchedFormat && (
                <div className={CAPTURE_STYLES.resultField}>
                  <span className={CAPTURE_STYLES.resultFieldLabel}>Format Detected:</span>
                  <span className={CAPTURE_STYLES.resultFieldValue}>{matchedFormat.name}</span>
                </div>
              )}
            </div>
            
            <div className={CAPTURE_STYLES.formGroup}>
              <label className={CAPTURE_STYLES.formLabel}>
                Select Employee
              </label>
              <select
                className={CAPTURE_STYLES.formSelect}
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={submitDTR}
                disabled={!selectedEmployee || submitDTRMutation.isPending}
                className={CAPTURE_STYLES.button}
              >
                {submitDTRMutation.isPending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Submit DTR
              </button>
              
              {(!matchedFormat || prediction.confidence < 0.6) && (
                <button
                  onClick={submitAsUnknown}
                  disabled={submitUnknownFormatMutation.isPending}
                  className={CAPTURE_STYLES.secondaryButton}
                >
                  {submitUnknownFormatMutation.isPending ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Submit as Unknown Format
                </button>
              )}
            </div>
          </>
        ) : capturedImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-center text-gray-700 mb-4">
              {processing ? 
                'Processing image and extracting DTR data...' :
                'Click "Process Image" to extract DTR information'
              }
            </p>
            {processing && (
              <RefreshCw size={24} className="animate-spin text-primary" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Image size={48} className="text-gray-400 mb-4" />
            <p className="text-center text-gray-500">
              Capture a photo of a DTR to begin processing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DTRCapture;