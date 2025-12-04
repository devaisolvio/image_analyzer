import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, CircleQuestionMark } from 'lucide-react';
import axios from "axios"

type AiResponse={
  checkpoints:{ [key:string]:string},
  evaluation_summary : {
      overall_assessment: string,
  key_strengths: [string],
  critical_issues: [string ],
  failed_checkpoints: [string
  ],
  recommendation: string
  }
}

export default function ImageCheckpointUI() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [aiResponse ,setAiResponse ]= useState<AiResponse | null>(null)
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sign Intelligence Analyzer</h1>
        
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
            <div className=' relative mb-4 flex items-center justify-between w-full' >
              <h2 className="text-xl font-semibold ">Analysis Results</h2>
              <p className='bg-blue-600   rounded-lg px-1 py-1  flex gap-2'      onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>Rubrik Info <CircleQuestionMark/></p>
             
          <div
    className={`
      absolute right-30 -top-10 mb-2 w-80 bg-slate-900 text-white rounded-lg shadow-2xl z-50 p-4 border border-slate-700
      transition-all duration-200 ease-out
      ${showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
    `}
  >
          {/* Header */}
          <div className="border-b border-slate-700 pb-2 mb-3">
            <h3 className="font-bold text-sm text-blue-400">Banner Quality Rubric</h3>
            <p className="text-xs text-slate-400 mt-0.5">All 6 checkpoints must pass</p>
          </div>

          {/* Checkpoints Grid */}
          <div className="space-y-2.5">
            {/* Attention */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">👁️</span>
                <span className="font-semibold text-xs text-blue-300">Attention</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                Headline ≥20% • 1 focal point • Max 5 elements • ≥20% white space • Bold colors
              </p>
            </div>

            {/* Clarity */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">💬</span>
                <span className="font-semibold text-xs text-blue-300">Clarity</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                Understand &lt;2s • Max 3 info pieces • ≤8 word headline • Max 2 locations
              </p>
            </div>

            {/* Emotion */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">❤️</span>
                <span className="font-semibold text-xs text-blue-300">Emotion</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                Min 2 power words • Urgency language • Action verb CTA • Appealing imagery
              </p>
            </div>

            {/* Typography */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">🔤</span>
                <span className="font-semibold text-xs text-blue-300">Typography</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                Max 3 fonts • Headline 3x body size • Price ≥15% height • Professional fonts
              </p>
            </div>

            {/* Contrast */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">🎨</span>
                <span className="font-semibold text-xs text-blue-300">Contrast</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                7:1 contrast ratio • All text readable • No text on busy backgrounds
              </p>
            </div>

            {/* Imagery */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">🖼️</span>
                <span className="font-semibold text-xs text-blue-300">Imagery</span>
              </div>
              <p className="text-xs text-slate-300 leading-tight">
                Hero image ≥30% • High resolution • Professional photos • Appetizing food
              </p>
            </div>
          </div>

          {/* Auto-Fail */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="bg-red-900/30 border border-red-700/50 rounded p-2">
              <p className="text-xs font-semibold text-red-400 mb-1">Auto-Fail if:</p>
              <p className="text-xs text-slate-300 leading-tight">
                Missing info • 4+ locations • 3+ sponsors • Design defects • Unprofessional look
              </p>
            </div>
          </div>
        </div>
      </div>
            
          
            
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
      <span className={value == "pass" ? "text-green-400" : "text-red-400"}>
        {value == "pass" ? "✓ Passed" : "✗ Failed"}
      </span>
    </div>
  ))
)}

                      
                      </div>
                    </div>

                        
                   {aiResponse?.evaluation_summary && (
  <div className="bg-gray-700 rounded-lg p-4 mt-4">
    <h3 className="font-semibold mb-2">Evaluation Summary</h3>

    {/* Overall Assessment */}
    <p className="text-sm text-gray-300 mb-3">
      <span className="font-semibold text-white">Overall Assessment: </span>
      {aiResponse.evaluation_summary.overall_assessment}
    </p>

    {/* Key Strengths */}
    <div className="mb-3">
      <h4 className="font-semibold text-white text-sm">Key Strengths:</h4>
      <ul className="list-disc ml-5 text-gray-300 text-sm">
        {aiResponse.evaluation_summary.key_strengths?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>

    {/* Critical Issues */}
    <div className="mb-3">
      <h4 className="font-semibold text-white text-sm">Critical Issues:</h4>
      <ul className="list-disc ml-5 text-red-300 text-sm">
        {aiResponse.evaluation_summary.critical_issues?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>

    {/* Failed Checkpoints */}
    <div className="mb-3">
      <h4 className="font-semibold text-white text-sm">Failed Checkpoints:</h4>
      <ul className="list-disc ml-5 text-yellow-300 text-sm">
        {aiResponse.evaluation_summary.failed_checkpoints?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>

    {/* Recommendation */}
    <p className="text-sm text-green-300 mt-3">
      <span className="font-semibold text-white">Recommendation: </span>
      {aiResponse.evaluation_summary.recommendation}
    </p>
  </div>
)}

                  </div>
                )}
              </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}