import { useState } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import axios from "axios"

type AiResponse={
  checkpoints:{ [key:string]:string},
  summary:string
}

export default function ImageCheckpointUI() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [aiResponse ,setAiResponse ]= useState<AiResponse | null>(null)

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setSelectedImage(e.target?.result as string);
      setIsComplete(false);
    };
    reader.readAsDataURL(file);
  }
};

const handleReset =()=>{
  setIsComplete(false)
  setSelectedImage(null)
}

    const  handleSubmit = async  () => {
    try {
       if (!selectedImage) return;

    setIsLoading(true);
    setIsComplete(false);
    
    // Simulate API call with 5 second wait
const res = await axios.post(
  "https://api-worker.dev-f07.workers.dev/api/gpt-image",
  {
    imageBase64: selectedImage.replace(/^data:image\/\w+;base64,/, "")
  },
  {
    headers: {
      "Content-Type": "application/json"
    }
  }
);

  if(res){
    const msg = JSON.parse(res.data.choices[0].message.content)
    setAiResponse(msg)
    setIsComplete(true)
  }


    } catch (error) {
      console.log("Error while sending the request",error);
    }finally{
      setIsLoading(false)
    }
  };
 console.log(aiResponse);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Image Checkpoint Analyzer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isLoading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-300 mb-2">Click to upload an image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, or GIF</p>
                </label>
              </div>

              {selectedImage && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      {isLoading ? 'Processing...' : 'Analyze Image'}
                    </button>
                    
                    <button
                      onClick={handleReset}
                      disabled={isLoading}
                      className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Results Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
          
            
              <div className="space-y-4">
                

                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p className="text-gray-400">Running checkpoint analysis...</p>
                  </div>
                )}

                {isComplete && !isLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 size={24} />
                      <span className="font-semibold">Analysis Complete</span>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-lg">Checkpoint Results</h3>
                      <div className="space-y-2 text-sm">
                    {aiResponse?.checkpoints && (
  Object.entries(aiResponse.checkpoints).map(([key, value], idx) => (
    <div key={idx} className="flex justify-between">
      <span className="text-gray-400">{key}:</span>
      <span className={value == "passed" ? "text-green-400" : "text-red-400"}>
        {value == "passed" ? "✓ Passed" : "✗ Failed"}
      </span>
    </div>
  ))
)}

                      
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm text-gray-300">
                        {aiResponse?.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}