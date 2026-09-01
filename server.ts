import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy clients for OpenAI and Gemini
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Check AI status
app.get("/api/ai-status", (req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    activeProvider: hasOpenAI ? "OpenAI (GPT-4o)" : hasGemini ? "Google Gemini" : "Deterministic Engine",
    hasOpenAI,
    hasGemini,
  });
});

// Helper to query LLM (OpenAI first, then Gemini)
async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      return response.choices[0]?.message?.content || "{}";
    } catch (err: any) {
      console.warn("OpenAI API call failed, attempting fallback:", err?.message || err);
    }
  }

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt ? systemPrompt + "\n\n" : ""}${prompt}`,
        config: {
          responseMimeType: "application/json",
        }
      });
      return response.text || "{}";
    } catch (err: any) {
      console.warn("Gemini API call failed:", err?.message || err);
    }
  }

  throw new Error("No active AI provider configured or API call failed.");
}

// API: Generate Tailored Questions from Resume using OpenAI / Gemini
app.post("/api/generate-questions", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 10) {
    return res.status(400).json({ error: "Valid resume text is required." });
  }

  const systemPrompt = `You are prepIQ's chief interviewer and hiring evaluation engine. Your job is to extract exact claims, technologies, metrics, and leadership experiences from a candidate's resume and generate 5 rigorous, tailored interview questions.

Categories MUST be exactly:
1. "Technical Architecture" (id: 1, 3 mins recommended)
2. "Domain Deep Dive" (id: 2, 3 mins recommended)
3. "Problem Solving" (id: 3, 3 mins recommended)
4. "Behavioral & Leadership" (id: 4, 2 mins recommended)
5. "Failure & Resilience" (id: 5, 3 mins recommended)

Format your response as a valid JSON object with the following structure:
{
  "roleTitle": "Candidate's inferred title (e.g., Staff Distributed Systems Engineer)",
  "candidateName": "Inferred Name or Candidate",
  "questions": [
    {
      "id": 1,
      "category": "Technical Architecture",
      "question": "Rigorous question referencing specific claims/tools in their resume...",
      "contextFromResume": "Why we are asking: Anchored in your bullet point regarding...",
      "keyEvaluationCriteria": [
        "Evaluation criterion 1",
        "Evaluation criterion 2",
        "Evaluation criterion 3"
      ],
      "recommendedTimeMinutes": 3,
      "sampleModelAnswer": "Exemplary high-performing answer following the STAR methodology..."
    }
  ]
}`;

  const prompt = `Generate the 5 tailored interview questions for this candidate resume:\n\n${resumeText.slice(0, 4000)}`;

  try {
    const rawJson = await callLLM(prompt, systemPrompt);
    const parsed = JSON.parse(rawJson);
    res.json({
      success: true,
      provider: getOpenAIClient() ? "OpenAI (GPT-4o)" : "Google Gemini",
      roleTitle: parsed.roleTitle || "Senior Specialist",
      candidateName: parsed.candidateName || "Candidate",
      questions: parsed.questions || []
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to generate AI questions",
    });
  }
});

// API: Evaluate Candidate Answer using OpenAI / Gemini
app.post("/api/evaluate-answer", async (req, res) => {
  const { question, answerText, timeSeconds } = req.body;
  if (!question || !answerText) {
    return res.status(400).json({ error: "Question and answerText are required." });
  }

  const systemPrompt = `You are an executive interviewer scoring a candidate's verbal response in a high-stakes mock interview.
Analyze the answer against the question's key evaluation criteria, STAR framework (Situation, Task, Action, Result), quantitative metrics, and depth.

Respond with a JSON object:
{
  "score": 85, // integer 0-100
  "communicationScore": 88, // integer 0-100
  "rigorScore": 84, // integer 0-100
  "strengths": ["Concrete strength 1", "Concrete strength 2"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
  "starBreakdown": {
    "situation": "Brief assessment of how they set the context...",
    "task": "Assessment of the core objective...",
    "action": "Assessment of their specific technical/strategic actions...",
    "result": "Assessment of the business impact and metrics..."
  },
  "critique": "2-3 sentences of constructive executive commentary."
}`;

  const prompt = `Question Category: ${question.category}
Question: ${question.question}
Expected Criteria: ${JSON.stringify(question.keyEvaluationCriteria)}

Candidate Answer (${timeSeconds || 60} seconds):
"${answerText}"`;

  try {
    const rawJson = await callLLM(prompt, systemPrompt);
    const parsed = JSON.parse(rawJson);
    res.json({
      success: true,
      feedback: parsed
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to evaluate answer with AI",
    });
  }
});

// API: Generate Comprehensive Report using OpenAI / Gemini
app.post("/api/generate-report", async (req, res) => {
  const { candidateRole, answers } = req.body;

  const systemPrompt = `You are the lead bar-raiser synthesizing a candidate's complete 5-question mock interview performance.
Respond with a JSON object:
{
  "overallScore": 86, // integer 0-100
  "summaryExecutive": "A 2-paragraph executive assessment of the candidate's hiring readiness, domain depth, communication poise, and architectural rigor.",
  "metricScores": {
    "technicalAccuracy": 88,
    "starStructure": 84,
    "clarityArticulation": 87,
    "depthAndExamples": 85
  },
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "keyImprovements": ["Improvement 1", "Improvement 2", "Improvement 3"]
}`;

  const prompt = `Candidate Role: ${candidateRole}
Interview Performance Summary:
${JSON.stringify(answers, null, 2)}`;

  try {
    const rawJson = await callLLM(prompt, systemPrompt);
    const parsed = JSON.parse(rawJson);
    res.json({
      success: true,
      report: parsed
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to generate report with AI",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`prepIQ Server running on port ${PORT}`);
  });
}

startServer();
