
import React, { useCallback, useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LinkData {
  url: string;
  categories: string[];
}

interface FileUploadProps {
  onUpload: (data: LinkData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateJsonData = (data: any): LinkData[] => {
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    return data.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Item at index ${index} must be an object`);
      }
      
      if (!item.url || typeof item.url !== 'string') {
        throw new Error(`Item at index ${index} must have a valid "url" field`);
      }
      
      if (!item.categories || !Array.isArray(item.categories)) {
        throw new Error(`Item at index ${index} must have a "categories" array`);
      }

      return {
        url: item.url,
        categories: item.categories.filter(cat => typeof cat === 'string')
      };
    });
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        throw new Error('Please upload a valid JSON file');
      }

      const text = await file.text();
      const jsonData = JSON.parse(text);
      const validatedData = validateJsonData(jsonData);
      
      console.log('Processed JSON data:', validatedData);
      onUpload(validatedData);
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      processFile(jsonFile);
    } else {
      toast.error('Please drop a JSON file');
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : isProcessing
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isDragOver
              ? 'bg-blue-100 text-blue-600'
              : isProcessing
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isProcessing ? (
              <div className="animate-spin">
                <File size={24} />
              </div>
            ) : (
              <Upload size={24} />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isProcessing ? 'Processing...' : 'Upload JSON File'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isDragOver
                ? 'Drop your JSON file here'
                : isProcessing
                ? 'Validating and processing your data...'
                : 'Drag and drop your JSON file here, or click to browse'
              }
            </p>
          </div>
          
          {!isProcessing && (
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Upload size={16} className="mr-2" />
              Choose File
            </button>
          )}
        </div>
      </div>
      
      {/* Format Example */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          Expected JSON Format:
        </h4>
        <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`[
  {
    "url": "https://example.com/link1",
    "categories": ["Technical", "Partnership"]
  },
  {
    "url": "https://example.com/link2", 
    "categories": ["Project Timeline"]
  }
]`}
        </pre>
      </div>
    </div>
  );
};

export default FileUpload;
