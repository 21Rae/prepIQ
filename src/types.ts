export interface ResumeData {
  fileName?: string;
  fileSize?: string;
  rawText: string;
  roleTitle?: string;
  yearsOfExperience?: string;
  topSkills?: string[];
  companies?: string[];
}

export interface InterviewQuestion {
  id: number;
  category: 'Technical Architecture' | 'Behavioral & Leadership' | 'Domain Deep Dive' | 'Problem Solving' | 'Failure & Resilience';
  question: string;
  contextFromResume: string;
  keyEvaluationCriteria: string[];
  recommendedTimeMinutes: number;
  sampleModelAnswer: string;
}

export interface AnswerFeedback {
  score: number; // 0 - 100
  communicationScore: number;
  rigorScore: number;
  strengths: string[];
  improvements: string[];
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  critique: string;
}

export interface CandidateAnswer {
  questionId: number;
  transcript: string;
  durationSeconds: number;
  feedback: AnswerFeedback;
}

export interface InterviewReport {
  candidateRole: string;
  overallScore: number;
  summaryExecutive: string;
  metricScores: {
    technicalAccuracy: number;
    starStructure: number;
    clarityArticulation: number;
    depthAndExamples: number;
  };
  keyStrengths: string[];
  keyImprovements: string[];
  answers: CandidateAnswer[];
  timestamp: string;
}
