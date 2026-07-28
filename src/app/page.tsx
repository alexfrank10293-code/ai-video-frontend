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
  
  // Default to the deployed Render backend so it works out of the box on Vercel
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai-video-backend-3g6j.onrender.com";

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
    <div className="min-h-screen bg-transparent text-slate-200 font-sans p-6 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <main className="max-w-4xl mx-auto space-y-12 py-12">
        
        {/* Header */}
        <header className="text-center space-y-6 animate-[fadeInUp_0.8s_ease-out_forwards]">
          <div className="inline-block relative animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-30 animate-pulse-slow"></div>
            <h1 className="relative text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm animate-gradient-x px-4 py-2">
              AI Video Factory
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light tracking-wide opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
            Zero-cost, fully decoupled automated video generation powered by Wan2.2 & Kokoro-TTS.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          
          {/* Form Column */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-[2rem] p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-700 hover:border-indigo-500/30">
            <form onSubmit={handleGenerate} className="space-y-7">
              
              <div className="space-y-3 group">
                <label className="text-sm font-semibold tracking-wide text-slate-400 ml-1 transition-colors group-focus-within:text-indigo-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  Video Script
                </label>
                <textarea 
                  required
                  rows={4}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="A cinematic drone shot over a glowing cyberpunk city..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide text-slate-400 ml-1">Reference Image (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 bg-slate-950/40 hover:bg-slate-900/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500 mb-3 relative z-10" />
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors relative z-10">
                    {image ? (
                      <span className="text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full">{image.name}</span>
                    ) : "Click to drop an image"}
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

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3 group">
                  <label className="text-sm font-semibold tracking-wide text-slate-400 ml-1 transition-colors group-focus-within:text-indigo-400">Language</label>
                  <div className="relative">
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer hover:bg-slate-900 shadow-inner"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">▼</div>
                  </div>
                </div>
                
                <div className="space-y-3 group">
                  <label className="text-sm font-semibold tracking-wide text-slate-400 ml-1 transition-colors group-focus-within:text-indigo-400">Aspect Ratio</label>
                  <div className="relative">
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer hover:bg-slate-900 shadow-inner"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">▼</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={!script.trim() || !!jobId}
                  className="relative w-full overflow-hidden bg-slate-800 text-white font-bold tracking-wide rounded-2xl py-4 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0 group border border-slate-700/50 hover:border-indigo-500/50"
                >
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {jobId && !isComplete ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-white/90" /> 
                        <span className="animate-pulse">Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" /> 
                        Generate Magic
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Result Column */}
          <div className="flex flex-col space-y-6">
            
            {/* Status Panel */}
            <div className={`p-6 rounded-[2rem] border transition-all duration-700 ease-in-out backdrop-blur-xl ${
              error ? 'bg-red-950/20 border-red-900/50 text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 
              isComplete ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 
              jobId ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 
              'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:bg-slate-900/60'
            }`}>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-3 flex items-center gap-3">
                Live Status
                {jobId && !isComplete && !error && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
                  </span>
                )}
              </h3>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <p className="font-mono text-sm tracking-tight break-words transition-opacity duration-300">
                  {error ? `[ERROR] ${error}` : status ? `> ${status}` : "> Awaiting input..."}
                </p>
              </div>
              {jobId && <p className="font-mono text-xs opacity-40 mt-3 pl-2">ID: {jobId}</p>}
            </div>

            {/* Video Player */}
            <div className="flex-1 bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2rem] p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group transition-all duration-700 hover:border-slate-700/80">
              
              {/* Subtle inner glow for empty state */}
              {!isComplete && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              )}

              {isComplete && jobId ? (
                <div className="w-full h-full flex flex-col items-center justify-between space-y-4 animate-[fadeInUp_0.6s_ease-out_forwards] p-4">
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex items-center justify-center relative group-hover:border-slate-700 transition-colors">
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
                    className="relative w-full overflow-hidden bg-slate-800 text-white font-bold tracking-wide rounded-xl py-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] transform hover:-translate-y-1 active:translate-y-0 border border-emerald-500/30 hover:border-emerald-500/60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 animate-gradient-x opacity-90 hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5 animate-bounce" /> 
                      Download Masterpiece
                    </div>
                  </a>
                </div>
              ) : (
                <div className="text-center opacity-30 group-hover:opacity-70 transition-all duration-700 transform group-hover:scale-110 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                    <PlayCircle className="w-20 h-20 mx-auto mb-6 stroke-1 relative z-10" />
                  </div>
                  <p className="text-sm font-semibold tracking-widest uppercase text-slate-400">Canvas Ready</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
