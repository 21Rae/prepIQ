import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, Clock, ArrowRight, ArrowLeft, 
  HelpCircle, CheckCircle, Sparkles, AlertCircle, RefreshCw, Award
} from 'lucide-react';
import { InterviewQuestion, CandidateAnswer, ResumeData } from '../types';
import { evaluateCandidateResponse, parseResumeContent, fetchAIEvaluatedAnswer } from '../utils/interviewEngine';

interface ActiveSessionViewProps {
  questions: InterviewQuestion[];
  resumeText: string;
  onCompleteInterview: (answers: CandidateAnswer[]) => void;
  onReturnToPrep: () => void;
}

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  questions,
  resumeText,
  onCompleteInterview,
  onReturnToPrep
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, CandidateAnswer>>({});
  const [currentText, setCurrentText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showContextWhy, setShowContextWhy] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const parsed = parseResumeContent(resumeText);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Load existing answer if user navigates back and forth
  useEffect(() => {
    if (answers[currentQ.id]) {
      setCurrentText(answers[currentQ.id].transcript);
    } else {
      setCurrentText('');
      setShowModelAnswer(false);
    }
  }, [currentIndex, currentQ.id]);

  // Speech synthesis for question
  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentQ.question);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can type your response directly.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setCurrentText((prev) => prev ? `${prev} ${finalTranscript}` : finalTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.error('Speech recognition error', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
        setIsRecording(false);
      }
    }
  };

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndNext = async () => {
    setIsEvaluating(true);
    const finalAnswerText = currentText.trim() || 'No verbal response recorded. Candidate moved to next question.';
    
    let feedback;
    try {
      feedback = await fetchAIEvaluatedAnswer(currentQ, finalAnswerText, timerSeconds);
    } catch (err) {
      feedback = evaluateCandidateResponse(currentQ, finalAnswerText, timerSeconds);
    }
    
    const newAnswers = {
      ...answers,
      [currentQ.id]: {
        questionId: currentQ.id,
        transcript: finalAnswerText,
        durationSeconds: timerSeconds,
        feedback: feedback
      }
    };
    
    setAnswers(newAnswers);
    setIsEvaluating(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 5 questions
      const answerList = Object.values(newAnswers);
      onCompleteInterview(answerList);
    }
  };

  const handleUseModelAnswer = () => {
    setCurrentText(currentQ.sampleModelAnswer);
  };

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).filter(Boolean).length : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#fbfbfa] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Top bar with progression and timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs bg-stone-200 text-stone-800 px-2 py-0.5 font-semibold">
                {currentQ.category}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Simulating interview for <strong className="text-stone-800">{parsed.roleTitle}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 border border-stone-300 text-stone-700 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-xs font-semibold px-2.5 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-600"
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={onReturnToPrep}
              className="text-xs font-semibold px-3 py-1.5 text-stone-500 hover:text-stone-900"
            >
              Exit Session
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 sm:p-10 mb-8">
          
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="font-serif-headline text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
              "{currentQ.question}"
            </h2>
            <button
              onClick={handleSpeakQuestion}
              className={`p-2.5 border transition ${
                isSpeaking 
                  ? 'bg-stone-900 text-white border-stone-900' 
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-300 text-stone-700'
              }`}
              title="Read Question Aloud"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Context from Resume Drawer */}
          <div className="border-t border-stone-100 pt-5 mt-5">
            <button
              onClick={() => setShowContextWhy(!showContextWhy)}
              className="flex items-center space-x-2 text-xs font-bold text-stone-700 hover:text-stone-900 uppercase tracking-wider mb-2"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Why prepIQ asks this from your credentials</span>
            </button>
            
            {showContextWhy && (
              <div className="bg-stone-50 border border-stone-200 p-4 text-xs text-stone-700 leading-relaxed space-y-2">
                <p>
                  <strong>Context anchor:</strong> {currentQ.contextFromResume}
                </p>
                <div>
                  <strong className="block text-stone-900 mb-1">What top interviewers evaluate:</strong>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600">
                    {currentQ.keyEvaluationCriteria.map((crit, idx) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Candidate Response Workspace */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 sm:p-10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Your Answer / Response
              </span>
              {isRecording && (
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                  Listening (Live Mic)...
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold border transition ${
                  isRecording
                    ? 'bg-rose-600 border-rose-600 text-white shadow'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-300 text-stone-800'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-stone-600" />}
                <span>{isRecording ? 'Stop Recording' : 'Record Voice'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="text-xs font-semibold px-3 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-700 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                <span>{showModelAnswer ? 'Hide Benchmark' : 'View Model Answer'}</span>
              </button>
            </div>
          </div>

          {/* Model Answer Preview if requested */}
          {showModelAnswer && (
            <div className="mb-4 p-4 bg-amber-50/70 border border-amber-200 text-xs leading-relaxed text-amber-950">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Benchmark Executive Model Response
                </span>
                <button
                  onClick={handleUseModelAnswer}
                  className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Insert into my answer
                </button>
              </div>
              <p className="font-serif-headline text-sm italic text-amber-900">
                "{currentQ.sampleModelAnswer}"
              </p>
            </div>
          )}

          <textarea
            rows={7}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Type your response here using the STAR format (Situation, Task, Action, Result) or speak using the voice recording button..."
            className="w-full p-4 text-xs sm:text-sm font-sans border border-stone-300 focus:border-stone-900 focus:outline-none bg-stone-50/40 resize-y leading-relaxed text-stone-900"
          />

          <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
            <span>
              {wordCount} words {wordCount > 40 ? '• Recommended depth met' : '• Aim for 50-120 words with clear metrics'}
            </span>
            <span className="font-mono text-[11px]">
              Recommended time: ~{currentQ.recommendedTimeMinutes} mins
            </span>
          </div>
        </div>

        {/* Navigation actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border border-stone-300 flex items-center space-x-2 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                : 'bg-white hover:bg-stone-100 text-stone-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </button>

          <button
            type="button"
            disabled={isEvaluating}
            onClick={handleSaveAndNext}
            className={`px-8 py-3 text-xs font-bold tracking-widest uppercase text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition ${
              isEvaluating ? 'bg-stone-700 cursor-wait' : 'bg-stone-900 hover:bg-black'
            }`}
          >
            {isEvaluating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <span>{isLastQuestion ? 'Complete & Generate Ledger' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
