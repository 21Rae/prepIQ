import React, { useState } from 'react';
import { 
  Award, CheckCircle2, TrendingUp, AlertTriangle, Download, 
  RotateCcw, ChevronDown, ChevronUp, FileText, Share2, Sparkles, BookOpen 
} from 'lucide-react';
import { InterviewReport, InterviewQuestion } from '../types';

interface ReportLedgerViewProps {
  report: InterviewReport;
  questions: InterviewQuestion[];
  onStartNewSession: () => void;
  onReturnToPrep: () => void;
}

export const ReportLedgerView: React.FC<ReportLedgerViewProps> = ({
  report,
  questions,
  onStartNewSession,
  onReturnToPrep
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'Tier 1 • Exceptional', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
    if (score >= 80) return { grade: 'Tier 2 • Strong Hire', color: 'text-stone-900 bg-stone-100 border-stone-300' };
    if (score >= 70) return { grade: 'Tier 3 • Meets Standard', color: 'text-amber-800 bg-amber-50 border-amber-300' };
    return { grade: 'Needs Revision', color: 'text-rose-800 bg-rose-50 border-rose-300' };
  };

  const gradeInfo = getScoreGrade(report.overallScore);

  const handleCopyReport = () => {
    const text = `prepIQ Mock Interview Report
Role: ${report.candidateRole}
Overall Score: ${report.overallScore}/100 (${gradeInfo.grade})
Date: ${report.timestamp}

Metric Scores:
- Technical Accuracy: ${report.metricScores.technicalAccuracy}%
- STAR Framework Rigor: ${report.metricScores.starStructure}%
- Articulation & Clarity: ${report.metricScores.clarityArticulation}%
- Depth & Examples: ${report.metricScores.depthAndExamples}%

Executive Summary:
${report.summaryExecutive}

Key Strengths:
${report.keyStrengths.map(s => `- ${s}`).join('\n')}

Areas for Growth:
${report.keyImprovements.map(i => `- ${i}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#fbfbfa] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Summary Banner */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
            <div>
              <span className="text-[11px] tracking-[0.25em] font-semibold text-stone-500 uppercase">
                OFFICIAL REPORT LEDGER
              </span>
              <h1 className="font-serif-headline text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                Candidate Evaluation Matrix
              </h1>
              <p className="text-xs text-stone-600 mt-1">
                Target Role: <strong className="text-stone-900">{report.candidateRole}</strong> • Generated {report.timestamp}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyReport}
                className="px-3.5 py-2 text-xs font-bold border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 flex items-center space-x-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-bold border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Print</span>
              </button>
            </div>
          </div>

          {/* Scorecard Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 items-center">
            <div className="p-6 bg-stone-50 border border-stone-200 text-center flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold tracking-widest text-stone-500 uppercase">
                OVERALL INDEX
              </span>
              <div className="font-serif-headline text-6xl font-bold text-stone-900 my-2">
                {report.overallScore}
                <span className="text-xl text-stone-400 font-sans font-normal">/100</span>
              </div>
              <span className={`text-xs px-3 py-1 font-bold border ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </span>
            </div>

            <div className="md:col-span-2 space-y-3.5 pl-0 md:pl-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>Technical Rigor & Accuracy</span>
                  <span>{report.metricScores.technicalAccuracy}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2">
                  <div 
                    className="bg-stone-900 h-2 transition-all duration-500" 
                    style={{ width: `${report.metricScores.technicalAccuracy}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>STAR Format & Situation Framework</span>
                  <span>{report.metricScores.starStructure}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2">
                  <div 
                    className="bg-stone-900 h-2 transition-all duration-500" 
                    style={{ width: `${report.metricScores.starStructure}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>Clarity & Executive Articulation</span>
                  <span>{report.metricScores.clarityArticulation}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2">
                  <div 
                    className="bg-stone-900 h-2 transition-all duration-500" 
                    style={{ width: `${report.metricScores.clarityArticulation}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>Depth of Examples & Metrics</span>
                  <span>{report.metricScores.depthAndExamples}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2">
                  <div 
                    className="bg-stone-900 h-2 transition-all duration-500" 
                    style={{ width: `${report.metricScores.depthAndExamples}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary paragraph */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
              Executive Evaluation Summary
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              {report.summaryExecutive}
            </p>
          </div>
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center space-x-2 pb-4 border-b border-stone-100 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h3 className="font-serif-headline text-lg font-bold text-stone-900">
                Key Observed Strengths
              </h3>
            </div>
            <ul className="space-y-3">
              {report.keyStrengths.map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <span className="font-bold text-stone-900 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center space-x-2 pb-4 border-b border-stone-100 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <h3 className="font-serif-headline text-lg font-bold text-stone-900">
                Targeted Growth Opportunities
              </h3>
            </div>
            <ul className="space-y-3">
              {report.keyImprovements.map((imp, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <span className="font-bold text-stone-900 mt-0.5">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Question-by-Question Deep Dive Ledger */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 sm:p-10">
          <div className="pb-6 border-b border-stone-100 mb-6">
            <h2 className="font-serif-headline text-2xl font-bold text-stone-900">
              Question-by-Question Breakdown
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Review your recorded transcripts, granular rubric scores, and benchmark executive model answers.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const answer = report.answers.find(a => a.questionId === q.id);
              const isExpanded = expandedQuestion === q.id;
              const qScore = answer ? answer.feedback.score : 80;

              return (
                <div key={q.id} className="border border-stone-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full p-5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                          {q.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="text-xs font-bold px-2 py-1 bg-white border border-stone-300 text-stone-900 font-mono">
                        {qScore}/100
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-600" /> : <ChevronDown className="w-4 h-4 text-stone-600" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6 bg-white space-y-5 border-t border-stone-200">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Full Interview Question
                        </span>
                        <p className="font-serif-headline text-base font-bold text-stone-900">
                          "{q.question}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Your Recorded Response
                        </span>
                        <div className="p-4 bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                          {answer?.transcript || 'No verbal transcript provided.'}
                        </div>
                      </div>

                      {answer?.feedback && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-50/50 border border-emerald-200">
                            <span className="text-[11px] font-bold text-emerald-900 uppercase block mb-1.5">
                              Observed Strengths
                            </span>
                            <ul className="text-xs text-emerald-900 space-y-1">
                              {answer.feedback.strengths.map((str, sIdx) => (
                                <li key={sIdx}>• {str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-amber-50/50 border border-amber-200">
                            <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1.5">
                              Critique & Recommendations
                            </span>
                            <ul className="text-xs text-amber-900 space-y-1">
                              {answer.feedback.improvements.map((imp, iIdx) => (
                                <li key={iIdx}>• {imp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                          Exemplary Benchmark Response
                        </span>
                        <div className="p-4 bg-stone-900 text-white text-xs sm:text-sm leading-relaxed font-serif-headline italic">
                          "{q.sampleModelAnswer}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartNewSession}
            className="w-full sm:w-auto px-8 py-4 bg-stone-900 hover:bg-black text-white text-xs font-bold tracking-widest uppercase shadow-md transition"
          >
            Start New Mock Session
          </button>
          <button
            onClick={onReturnToPrep}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold tracking-widest uppercase transition"
          >
            Edit Resume &amp; Settings
          </button>
        </div>

      </div>
    </div>
  );
};
