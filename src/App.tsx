import React, { useState } from 'react';
import { Header } from './components/Header';
import { PrepRoomView } from './components/PrepRoomView';
import { ActiveSessionView } from './components/ActiveSessionView';
import { ReportLedgerView } from './components/ReportLedgerView';
import { fetchAIGeneratedQuestions, fetchAIGeneratedReport, generateTailoredQuestions } from './utils/interviewEngine';
import { InterviewQuestion, CandidateAnswer, InterviewReport } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'prep' | 'interview' | 'report'>('prep');
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [candidateRole, setCandidateRole] = useState<string>('Specialist');

  const handleUpdateResume = (text: string, name: string | null) => {
    setResumeText(text);
    setFileName(name);
    if (!text.trim()) {
      setQuestions([]);
      setReport(null);
    }
  };

  const handleEnterInterview = async () => {
    if (!resumeText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await fetchAIGeneratedQuestions(resumeText);
      setQuestions(result.questions);
      setCandidateRole(result.roleTitle || 'Candidate');
      setCurrentTab('interview');
    } catch (err) {
      console.warn('Error loading questions:', err);
      const fallbackQuestions = generateTailoredQuestions(resumeText);
      setQuestions(fallbackQuestions);
      setCurrentTab('interview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteInterview = async (answers: CandidateAnswer[]) => {
    setIsGenerating(true);
    try {
      const generatedReport = await fetchAIGeneratedReport(candidateRole, answers);
      setReport(generatedReport);
      setCurrentTab('report');
    } catch (err) {
      console.warn('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNewSession = async () => {
    if (resumeText.trim()) {
      await handleEnterInterview();
    } else {
      setCurrentTab('prep');
    }
  };

  const hasResume = resumeText.trim().length > 15;
  const hasCompletedInterview = report !== null;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        hasResume={hasResume}
        hasCompletedInterview={hasCompletedInterview}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'prep' && (
          <PrepRoomView
            resumeText={resumeText}
            fileName={fileName}
            onUpdateResume={handleUpdateResume}
            onEnterInterview={handleEnterInterview}
            isGenerating={isGenerating}
          />
        )}

        {currentTab === 'interview' && questions.length > 0 && (
          <ActiveSessionView
            questions={questions}
            resumeText={resumeText}
            onCompleteInterview={handleCompleteInterview}
            onReturnToPrep={() => setCurrentTab('prep')}
          />
        )}

        {currentTab === 'report' && report && (
          <ReportLedgerView
            report={report}
            questions={questions}
            onStartNewSession={handleStartNewSession}
            onReturnToPrep={() => setCurrentTab('prep')}
          />
        )}
      </main>
    </div>
  );
}
