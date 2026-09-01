import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_RESUMES, SampleResumePreset } from '../data/sampleResumes';
import { parseResumeContent } from '../utils/interviewEngine';

interface PrepRoomViewProps {
  resumeText: string;
  fileName: string | null;
  onUpdateResume: (text: string, fileName: string | null) => void;
  onEnterInterview: () => void;
  isGenerating?: boolean;
}

export const PrepRoomView: React.FC<PrepRoomViewProps> = ({
  resumeText,
  fileName,
  onUpdateResume,
  onEnterInterview,
  isGenerating = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpdateResume(content || '', file.name);
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert('Error reading file. Please paste the text or try another file.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleLoadSample = (preset: SampleResumePreset) => {
    onUpdateResume(preset.fullText, `${preset.name} (Sample Resume).txt`);
  };

  const clearResume = () => {
    onUpdateResume('', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasContent = resumeText.trim().length > 20;
  const parsedInfo = hasContent ? parseResumeContent(resumeText) : null;
  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#fbfbfa] py-16 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Eyebrow */}
        <div className="text-center mb-3">
          <span className="text-[11px] tracking-[0.28em] font-semibold text-stone-500 uppercase">
            INTELLIGENT INTERVIEWING
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif-headline text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 text-center mb-6">
          Your resume is your script.
        </h1>

        {/* Subtitle description */}
        <p className="text-stone-600 text-center max-w-2xl text-[14px] sm:text-[15px] leading-relaxed mb-12 font-normal">
          Upload your resume or paste your qualifications. prepIQ's advanced evaluation engine dynamically maps your credentials to generate a highly rigorous, realistic, and tailored 5-question mock interview focused entirely on your background.
        </p>

        {/* Horizontal separator */}
        <div className="w-full h-px bg-stone-200 mb-12" />

        {/* Central Qualifications Card */}
        <div className="w-full bg-white border border-stone-200 shadow-sm mb-10 overflow-hidden">
          
          {/* Card Header */}
          <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-stone-800" strokeWidth={1.75} />
              <h2 className="font-serif-headline text-lg sm:text-xl font-bold text-stone-900">
                Upload Qualifications & Credentials
              </h2>
            </div>
            {hasContent && (
              <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 font-medium border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Resume Loaded
              </span>
            )}
          </div>

          {/* Tab Selection */}
          <div className="p-8 pt-6">
            <div className="grid grid-cols-2 gap-0 border border-stone-300 p-0.5 mb-6 bg-stone-100">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-3 text-xs tracking-wider uppercase font-bold transition-all duration-150 ${
                  activeTab === 'upload'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                UPLOAD FILE
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`py-3 text-xs tracking-wider uppercase font-bold transition-all duration-150 ${
                  activeTab === 'paste'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                PASTE PLAIN TEXT
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {activeTab === 'upload' && (
              <div>
                {!fileName && !hasContent ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed transition-all duration-150 py-16 px-6 flex flex-col items-center justify-center cursor-pointer text-center ${
                      isDragging
                        ? 'border-stone-800 bg-stone-100'
                        : 'border-stone-300 bg-stone-50/40 hover:bg-stone-50/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {/* Upload Icon */}
                    <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-4 text-stone-700">
                      <Upload className="w-5 h-5" strokeWidth={1.8} />
                    </div>

                    <p className="text-stone-900 font-bold text-sm sm:text-base mb-1">
                      Select or drag resume document
                    </p>
                    <p className="text-stone-500 text-xs font-normal">
                      Supports PDF, TXT, MD up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-stone-200 bg-stone-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-stone-900 text-white mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-stone-900">
                            {fileName || 'Custom Qualifications Document'}
                          </p>
                          <span className="text-[11px] bg-stone-200 text-stone-800 px-2 py-0.5 font-medium">
                            {wordCount} words
                          </span>
                        </div>
                        {parsedInfo && (
                          <p className="text-xs text-stone-600 mt-1">
                            Detected Profile: <strong className="text-stone-900">{parsedInfo.roleTitle}</strong> • {parsedInfo.keywords.slice(0, 4).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold px-3 py-2 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 transition"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={clearResume}
                        className="p-2 border border-stone-300 bg-white hover:bg-rose-50 hover:border-rose-300 text-stone-600 hover:text-rose-600 transition"
                        title="Remove resume"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Paste Plain Text */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => onUpdateResume(e.target.value, e.target.value.trim() ? 'Pasted Resume.txt' : null)}
                    placeholder="Paste your resume, curriculum vitae, LinkedIn summary, or specific project milestones here..."
                    className="w-full p-4 text-xs sm:text-sm font-mono border border-stone-300 focus:border-stone-900 focus:outline-none bg-stone-50/50 resize-y leading-relaxed text-stone-800"
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] text-stone-400 font-mono">
                    {wordCount} words | {resumeText.length} chars
                  </div>
                </div>
              </div>
            )}

            {/* Preset Samples Selector */}
            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  Try instant sample credentials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_RESUMES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadSample(preset)}
                      className="text-[11px] font-semibold px-2.5 py-1 border border-stone-200 bg-stone-50 hover:bg-stone-200 text-stone-700 transition"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Enter Interview Room Action Button */}
        <div className="w-full flex flex-col items-center">
          <button
            type="button"
            disabled={!hasContent || isProcessing || isGenerating}
            onClick={onEnterInterview}
            className={`w-72 sm:w-88 py-4 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-200 ${
              hasContent && !isGenerating
                ? 'bg-stone-900 hover:bg-black text-white shadow-md hover:shadow-lg transform active:scale-[0.99] cursor-pointer'
                : 'bg-[#9f9c96] text-white/90 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center space-x-2">
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                  <span>SYNTHESIZING QUESTIONS...</span>
                </>
              ) : (
                <>
                  <span>ENTER INTERVIEW ROOM</span>
                  {hasContent && <ArrowRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </span>
          </button>

          {/* Footnote note below button */}
          <p className="text-[11px] sm:text-xs text-stone-500 mt-4 text-center max-w-lg leading-relaxed">
            {isGenerating 
              ? 'Our AI engine is currently analyzing your work history and generating 5 rigorous scenario questions...'
              : 'Your resume will be parsed and used to configure a customized technical & behavioral interview tailored to you.'}
          </p>
        </div>

      </div>
    </div>
  );
};
