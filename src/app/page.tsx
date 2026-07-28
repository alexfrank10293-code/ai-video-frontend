"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Loader2, UploadCloud, Video, Download, PlayCircle } from "lucide-react";

export default function Home() {
  const [script, setScript] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [lengthSecs, setLengthSecs] = useState("10");

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;

    setError(null);
    setStatus("Submitting job...");
    setIsComplete(false);
    setJobId(null);

    const formData = new FormData();
    formData.append("script", script);
    if (image) formData.append("image", image);
    formData.append("language", language);
    formData.append("aspect_ratio", aspectRatio);
    formData.append("target_length_seconds", lengthSecs);

    try {
      const res = await axios.post(`${API_URL}/api/generate-video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJobId(res.data.jobId);
      setStatus("Job queued. Waiting for backend...");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setStatus(null);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && !isComplete && !error) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/api/status/${jobId}`);
          setStatus(res.data.status);
          
          if (res.data.error) {
            setError(res.data.error);
            clearInterval(interval);
          } else if (res.data.status === "Complete") {
            setIsComplete(true);
            clearInterval(interval);
          }
        } catch (err: any) {
          setError(err.response?.data?.error || err.message);
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [jobId, isComplete, error, API_URL]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 selection:bg-indigo-500 selection:text-white">
      <main className="max-w-4xl mx-auto space-y-12 py-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            AI Video Factory
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Zero-cost, fully decoupled automated video generation powered by Wan2.2 & Kokoro-TTS.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Form Column */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Video Script</label>
                <textarea 
                  required
                  rows={4}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="A cinematic drone shot over a glowing cyberpunk city..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Reference Image (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-300">
                    {image ? image.name : "Click to upload an image"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!script.trim() || !!jobId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                {jobId && !isComplete ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" /> Generate Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Column */}
          <div className="flex flex-col space-y-6">
            
            {/* Status Panel */}
            <div className={`p-6 rounded-3xl border transition-all ${
              error ? 'bg-red-950/30 border-red-900/50 text-red-400' : 
              isComplete ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 
              jobId ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-400' : 
              'bg-slate-900/30 border-slate-800/50 text-slate-500'
            }`}>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                Status Dashboard
                {jobId && !isComplete && !error && <span className="relative flex h-3 w-3 ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
              </h3>
              <p className="font-mono text-sm tracking-tight break-words">
                {error ? `❌ ${error}` : status ? `> ${status}` : "> Ready to generate..."}
              </p>
              {jobId && <p className="font-mono text-xs opacity-50 mt-2">Job ID: {jobId}</p>}
            </div>

            {/* Video Player */}
            <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
              {isComplete && jobId ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                  {/* Notice: since it's an ephemeral backend file, we show it directly via standard browser download/player using API_URL */}
                  <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center relative">
                     <video 
                        controls 
                        autoPlay 
                        src={`${API_URL}/api/download/${jobId}`}
                        className="w-full h-full object-contain"
                     />
                  </div>
                  <a 
                    href={`${API_URL}/api/download/${jobId}`} 
                    download="final_video.mp4"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  >
                    <Download className="w-5 h-5" /> Download Result
                  </a>
                </div>
              ) : (
                <div className="text-center opacity-40 group-hover:opacity-60 transition-opacity">
                  <PlayCircle className="w-16 h-16 mx-auto mb-4 stroke-1" />
                  <p className="text-sm">Video Preview</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
