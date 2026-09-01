import { InterviewQuestion, CandidateAnswer, InterviewReport, AnswerFeedback } from '../types';

export function parseResumeContent(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let candidateName = 'Candidate';
  let roleTitle = 'Specialist';
  
  if (lines.length > 0) {
    candidateName = lines[0].replace(/[^a-zA-Z\s]/g, '').trim() || 'Candidate';
  }
  
  const textLower = text.toLowerCase();
  
  if (textLower.includes('staff') || textLower.includes('principal')) {
    roleTitle = textLower.includes('software') || textLower.includes('engineer') ? 'Staff Software Engineer' : 'Staff Lead';
  } else if (textLower.includes('product manager') || textLower.includes('lead product')) {
    roleTitle = 'Product Manager';
  } else if (textLower.includes('machine learning') || textLower.includes('ml engineer') || textLower.includes('nlp')) {
    roleTitle = 'Machine Learning Engineer';
  } else if (textLower.includes('data engineer') || textLower.includes('data science')) {
    roleTitle = 'Data Engineer / Scientist';
  } else if (textLower.includes('frontend') || textLower.includes('full stack') || textLower.includes('backend')) {
    roleTitle = 'Software Engineer';
  } else if (lines.length > 1) {
    roleTitle = lines[1].slice(0, 40);
  }

  // Extract key technologies or concepts
  const keywordsFound: string[] = [];
  const candidateKeywords = [
    'Kafka', 'Rust', 'Go', 'Python', 'Kubernetes', 'PostgreSQL', 'AWS', 'GCP', 'Distributed Systems',
    'RAG', 'LLM', 'PyTorch', 'vLLM', 'Fine-tuning', 'Vector Search',
    'PLG', 'Enterprise', 'A/B Testing', 'Product Strategy', 'Pricing',
    'React', 'TypeScript', 'GraphQL', 'Microservices', 'Docker', 'Redis'
  ];

  for (const kw of candidateKeywords) {
    if (text.includes(kw)) {
      keywordsFound.push(kw);
    }
  }

  return {
    candidateName,
    roleTitle,
    keywords: keywordsFound.length > 0 ? keywordsFound : ['Core Domain Knowledge', 'System Architecture', 'Leadership']
  };
}

export function generateTailoredQuestions(resumeText: string): InterviewQuestion[] {
  const parsed = parseResumeContent(resumeText);
  const textLower = resumeText.toLowerCase();

  // Tailor questions specifically to the domain
  if (textLower.includes('distributed') || textLower.includes('staff') || textLower.includes('kafka') || textLower.includes('sharding')) {
    return [
      {
        id: 1,
        category: 'Technical Architecture',
        question: `Walk me through how you architected the high-throughput transactional engine on your resume. How did you guarantee partition tolerance and avoid dual-write anomalies across distributed datastores?`,
        contextFromResume: `Anchored in your experience handling distributed ledger operations, multi-region synchronization, and zero-anomaly guarantees.`,
        keyEvaluationCriteria: [
          'Demonstrates clear understanding of distributed consensus (Raft/Paxos) or Two-Phase Commit',
          'Details transactional outbox, idempotency keys, or event log replay',
          'Identifies trade-offs between consistency (CP) and availability (AP) under network partitions'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `In our high-throughput ledger, we enforced strong consistency by implementing the Transactional Outbox pattern paired with Debezium and Kafka. When a payment state transitioned, state updates and domain events were written in a single ACID transaction to the local PostgreSQL shard. An asynchronous CDC consumer picked up events to broadcast to downstream consumers with strict idempotency keys. Under network partitions, we chose consistency over availability for financial balances while queueing retryable non-blocking metadata.`
      },
      {
        id: 2,
        category: 'Domain Deep Dive',
        question: `You noted optimizing database indexing and connection pooling to drop p99 query latency significantly. What exact profiling tools and metrics did you monitor, and what was the bottleneck?`,
        contextFromResume: `Referencing your performance tuning achievements on PostgreSQL workloads.`,
        keyEvaluationCriteria: [
          'Mentions specific profiling utilities (pg_stat_statements, EXPLAIN ANALYZE, buffer hits)',
          'Explains lock contention, buffer pool sizing, or vacuuming strategies',
          'Articulates before-and-after baseline metrics clearly'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We started by analyzing pg_stat_statements to identify queries with the highest total execution time and buffer reads. Using EXPLAIN ANALYZE, we spotted sequential scans on heavily queried composite fields. We introduced partial indexes on hot payment statuses, tuned work_mem, and migrated from direct connections to PgBouncer connection pooling with transaction pooling mode, dropping p99 from 480ms to under 120ms.`
      },
      {
        id: 3,
        category: 'Problem Solving',
        question: `Tell me about the major cascading failure you mitigated during a peak traffic event. How did you diagnose the root cause in real-time under pressure?`,
        contextFromResume: `Directly drawn from your Black Friday resilience response and adaptive rate-limiting.`,
        keyEvaluationCriteria: [
          'Clear STAR format (Situation, Task, Action, Result)',
          'Demonstrates calm root-cause triage (telemetry, dashboards, error budgets)',
          'Discusses defensive design: circuit breakers, fallback degradation, load shedding'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `During peak volume, our primary settlement cache suffered a cache stampede when a hot payment key expired, saturating our primary database connections. I identified the spike in connection wait queues via Grafana dashboards. I enacted emergency circuit-breaking, fell back to stale read replicas for non-critical lookups, and dynamically activated token-bucket load shedding. We resolved the incident in 8 minutes with zero transaction loss.`
      },
      {
        id: 4,
        category: 'Behavioral & Leadership',
        question: `As a technical leader mentoring engineers across multiple time zones, how do you handle strong disagreement over architectural decisions or RFC standards?`,
        contextFromResume: `Anchored in your leadership and RFC standardization across distributed teams.`,
        keyEvaluationCriteria: [
          'Values psychological safety and objective decision frameworks',
          'Uses proof-of-concepts, benchmark data, and user needs rather than authority',
          'Demonstrates ability to disagree and commit with alignment'
        ],
        recommendedTimeMinutes: 2,
        sampleModelAnswer: `When disagreements arise on an RFC, I avoid philosophical debates and shift focus to measurable criteria: latency SLAs, operational complexity, and blast radius. I ask both sides to build minimal prototypes and run benchmarks. If consensus remains split, I hold an open synchronous design review, walk through the trade-off matrix, make the executive call with documented rationale, and ensure the team aligns fully.`
      },
      {
        id: 5,
        category: 'Failure & Resilience',
        question: `Reflect on a critical technical decision or architecture you championed in the past that did not scale as expected. What did you learn and how did you pivot?`,
        contextFromResume: `Evaluates self-awareness, technical humility, and long-term architectural foresight.`,
        keyEvaluationCriteria: [
          'Honest acknowledgment of personal assumptions that proved wrong',
          'Strategic pivot without blaming external team members or tools',
          'Concrete systemic safeguards introduced to prevent recurrence'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `Early on, I advocated for premature service decomposition, breaking a payment flow into four microservices before our traffic profile justified it. The overhead of network latency and distributed tracing quickly outweighed modularity benefits. I owned the miscalculation, proposed merging two tightly coupled services into a cohesive modular service, and established traffic volume thresholds before approving future service extractions.`
      }
    ];
  } else if (textLower.includes('product') || textLower.includes('pm') || textLower.includes('plg')) {
    return [
      {
        id: 1,
        category: 'Technical Architecture',
        question: `Walk me through how you discovered the customer need for your AI copilot and prioritized features for the 0-to-1 MVP. What trade-offs did you make?`,
        contextFromResume: `Anchored in your 0-to-1 enterprise generative AI product launch.`,
        keyEvaluationCriteria: [
          'Clear user discovery methodology and pain-point synthesis',
          'Ruthless prioritization framework (e.g. RICE, Kano, Value vs Effort)',
          'Clear definition of early MVP success metrics'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We conducted 35 in-depth user interviews across enterprise accounts and found users spent 40% of their workday summarizing unstructured documents. We scoped the MVP strictly to automated summarization and citation retrieval, deliberately deprioritizing multimodal file parsing until we validated core retention. This allowed us to ship in 10 weeks and hit an 82% weekly active rate.`
      },
      {
        id: 2,
        category: 'Domain Deep Dive',
        question: `You improved Average Contract Value (ACV) by 34% through tiered packaging. How did you validate willingness-to-pay and structure the paywall gates?`,
        contextFromResume: `Referencing your enterprise pricing and monetization strategy achievements.`,
        keyEvaluationCriteria: [
          'Explains quantitative pricing validation (Van Westendorp, conjoint analysis)',
          'Clear packaging logic (usage limits vs feature gating)',
          'Cross-functional alignment with Sales and Customer Success'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We ran Van Westendorp price sensitivity surveys across 200 qualified accounts and analyzed historic consumption patterns. We discovered that enterprise buyers valued compliance audit logs and custom SLA guarantees far more than raw seat volume. We packaged advanced enterprise security as the premium tier gate, unlocking a 34% increase in contract value with zero churn impact.`
      },
      {
        id: 3,
        category: 'Problem Solving',
        question: `Describe an A/B experiment you ran that failed or yielded counter-intuitive results. How did you diagnose the qualitative cause and adjust course?`,
        contextFromResume: `Evaluating your analytical rigor and ability to learn from experiment failures.`,
        keyEvaluationCriteria: [
          'Sound experimental design (hypothesis, sample sizing, power calculation)',
          'Qualitative investigation into unexpected metrics',
          'Actionable next steps derived from failure'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We hypothesized that removing friction by skipping credit card entry on trial signup would increase converted paid accounts. Signups jumped 140%, but 30-day paid conversion plunged by 50% because low-intent users were flooding the onboarding pipeline. We added targeted qualification questions instead, restoring high-intent lead volume while increasing trial-to-paid conversion.`
      },
      {
        id: 4,
        category: 'Behavioral & Leadership',
        question: `How do you manage tension between engineering demanding technical debt refactoring and executive stakeholders pushing for rapid feature launches?`,
        contextFromResume: `Drawn from your experience leading cross-functional engineering and design pods.`,
        keyEvaluationCriteria: [
          'Balances short-term business momentum with long-term platform health',
          'Quantifies tech debt in business terms (outage risks, velocity drag)',
          'Implements structured allocation (e.g., 20% continuous tech debt budget)'
        ],
        recommendedTimeMinutes: 2,
        sampleModelAnswer: `I bridge this gap by translating tech debt into business impact: latency regressions, engineering sprint velocity, and downtime risk. I established a recurring 20% platform allocation in every sprint for debt remediation, which engineering owned directly. This maintained predictability for executive commitments while steadily improving our build and test release cycles.`
      },
      {
        id: 5,
        category: 'Failure & Resilience',
        question: `Tell me about a time you had to sunset a feature or pivot a product direction after significant sunk cost. How did you communicate this to stakeholders?`,
        contextFromResume: `Assessing resilience, courage, and transparent leadership.`,
        keyEvaluationCriteria: [
          'Avoids sunk cost fallacy with objective data',
          'Empathetic and transparent communication with users and internal teams',
          'Reallocation of resources toward high-impact opportunities'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We spent three months building a complex collaborative whiteboard feature that our analytics showed only 3% of active users touched past day one. Rather than investing more in marginal enhancements, I presented the retention data transparently to leadership, deprecated the beta with a 60-day migration window, and reallocated our engineering squad to our high-performing AI workflow.`
      }
    ];
  } else if (textLower.includes('machine learning') || textLower.includes('ml') || textLower.includes('rag') || textLower.includes('pytorch')) {
    return [
      {
        id: 1,
        category: 'Technical Architecture',
        question: `Explain how you architected your hybrid retrieval system combining BM25 keyword search with dense HNSW vector indexing. How do you balance retrieval latency with recall precision?`,
        contextFromResume: `Anchored in your enterprise RAG and vector database indexing implementation.`,
        keyEvaluationCriteria: [
          'Detailed explanation of reciprocal rank fusion (RRF) or cross-encoder re-ranking',
          'Discusses chunking strategies, embedding dimensions, and ANN trade-offs',
          'Addresses cold-start indexing and latency constraints'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We implemented a two-stage hybrid retrieval pipeline. In stage one, we query BM25 for exact terminology and HNSW vector index in Milvus for semantic similarity in parallel. We combine candidate pools using Reciprocal Rank Fusion (RRF). In stage two, we pass top-50 results through a lightweight cross-encoder re-ranker, outputting the top 5 chunks into the LLM context window with sub-60ms retrieval latency.`
      },
      {
        id: 2,
        category: 'Domain Deep Dive',
        question: `You reduced LLM serving costs by 65% via dynamic batching and quantization. What quantization techniques (AWQ, GPTQ, INT4/INT8) did you evaluate, and how did you measure perplexity degradation?`,
        contextFromResume: `Referencing your inference optimization on vLLM and NVIDIA H100 clusters.`,
        keyEvaluationCriteria: [
          'Distinguishes activation-aware quantization (AWQ) vs post-training quantization (GPTQ)',
          'Explains continuous batching and KV cache memory management in vLLM',
          'Quantifies benchmark evaluations (MMLU, GSM8K, Perplexity)'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We benchmarked FP16 against AWQ and GPTQ INT4 on our domain evaluation datasets. AWQ preserved 99.2% of FP16 accuracy on domain reasoning tasks while reducing VRAM footprint by 58%. Combined with PagedAttention and continuous batching in vLLM, we boosted throughput by 3.8x, allowing us to halve our GPU instance count.`
      },
      {
        id: 3,
        category: 'Problem Solving',
        question: `How do you systematically detect and prevent hallucination in production LLM pipelines where domain accuracy is non-negotiable?`,
        contextFromResume: `Focusing on your automated continuous evaluation and synthetic benchmarking.`,
        keyEvaluationCriteria: [
          'Mentions grounding verification, chain-of-thought verification, or G-Eval/Ragas frameworks',
          'Implements confidence thresholding and graceful fallback prompts',
          'Monitors production drift with automated synthetic test suites'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `We employ a multi-layer guardrail system. First, prompts enforce strict citation mapping where every assertion must reference a retrieved chunk ID. Second, an asynchronous validator model scores faithfulness using the RAGAS framework. If citation overlap or confidence falls below 0.85, the system falls back to a clarified refusal or human escalation.`
      },
      {
        id: 4,
        category: 'Behavioral & Leadership',
        question: `When collaborating with product and frontend teams who expect deterministic software, how do you manage expectations around non-deterministic AI behavior?`,
        contextFromResume: `Drawn from cross-functional AI product integration and SLA definitions.`,
        keyEvaluationCriteria: [
          'Sets probabilistic SLAs and error budgets clearly',
          'Designs graceful UI failure modes (retry, fallback, explanation)',
          'Educates stakeholders with clear benchmark dashboards'
        ],
        recommendedTimeMinutes: 2,
        sampleModelAnswer: `I treat non-deterministic systems like probabilistic search engines. I establish quantitative accuracy SLAs (e.g. 96% factual precision) with automated regression dashboards. I collaborate with design early to create defensive UI patterns like confidence indicators, editable draft outputs, and one-click feedback buttons so users remain in control.`
      },
      {
        id: 5,
        category: 'Failure & Resilience',
        question: `Tell me about a model fine-tuning run or experiment that failed to generalize in production despite strong training metrics. How did you resolve the distribution shift?`,
        contextFromResume: `Evaluating real-world applied ML debugging and data curation rigor.`,
        keyEvaluationCriteria: [
          'Identifies data leakage or out-of-distribution real-world prompts',
          'Focuses on dataset curation, synthetic data filtering, and validation splits',
          'Emphasizes iterative feedback loops over blind hyperparameter tuning'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `During a domain fine-tuning project, our validation loss looked great, but production logs showed severe repetition loops on long user prompts. We discovered our synthetic training dataset lacked multi-turn conversation samples and varied formatting. We revised our data generation pipeline with diverse persona prompts, added hard negative samples, and retrained with DPO alignment to achieve solid generalization.`
      }
    ];
  } else {
    // Generic fallback based on parsed qualifications
    return [
      {
        id: 1,
        category: 'Technical Architecture',
        question: `Looking at your recent work as a ${parsed.roleTitle}, what is the most technically complex system or project you delivered? Walk me through the high-level architecture.`,
        contextFromResume: `Focusing on your core projects, technical decisions, and architecture strategy.`,
        keyEvaluationCriteria: [
          'Clear articulation of components, protocols, and data models',
          'Justifies architectural choices with concrete business requirements',
          'Discusses scalability, observability, and resilience patterns'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `In my recent role, I led the architecture of our core service handling millions of operations daily. We structured the backend around modular microservices connected via asynchronous messaging queues, with a caching layer in front of our primary database. This design reduced latency by 45% while handling peak load surges smoothly.`
      },
      {
        id: 2,
        category: 'Domain Deep Dive',
        question: `You highlighted skills in ${parsed.keywords.slice(0, 3).join(', ')}. Could you discuss a scenario where you had to push these tools to their limits to solve a challenging performance problem?`,
        contextFromResume: `Referencing your highlighted technical competencies and stack proficiency.`,
        keyEvaluationCriteria: [
          'Deep conceptual mastery of the underlying framework/database/language',
          'Details specific profiling and bottleneck identification',
          'Demonstrates systematic debugging methodology'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `When scaling our services, we encountered significant query bottlenecking under concurrent traffic. By profiling execution plans, we identified missing compound indexes and excessive N+1 queries. We restructured our ORM layer, introduced batching, and added Redis caching for frequently accessed read models, improving overall throughput by 3x.`
      },
      {
        id: 3,
        category: 'Problem Solving',
        question: `Describe a high-stakes production incident or blocker you faced. What was your step-by-step triage process from detection to post-mortem?`,
        contextFromResume: `Evaluating your incident response, crisis management, and engineering rigor.`,
        keyEvaluationCriteria: [
          'Clear STAR structure (Situation, Task, Action, Result)',
          'Focuses on immediate containment before permanent resolution',
          'Emphasizes blameless post-mortem culture and automated regression tests'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `When an unexpected memory leak caused rolling pod restarts during business hours, I immediately declared an incident and rolled back the latest canary deployment to restore customer uptime. I then reproduced the leak in staging using heap snapshots, identified an unclosed connection stream, patched the issue with automated regression tests, and led a blameless post-mortem.`
      },
      {
        id: 4,
        category: 'Behavioral & Leadership',
        question: `Tell me about a time you had to deliver a critical milestone with shifting requirements or tight deadlines. How did you prioritize and keep stakeholders aligned?`,
        contextFromResume: `Assessing time management, execution discipline, and cross-functional communication.`,
        keyEvaluationCriteria: [
          'Prioritizes ruthlessly based on business impact',
          'Proactive and transparent communication with leadership',
          'Protects team morale and delivery quality'
        ],
        recommendedTimeMinutes: 2,
        sampleModelAnswer: `With launch deadlines fast approaching and new requirements emerging, I scheduled an emergency alignment meeting with key stakeholders. We mapped all deliverables into 'Must-Have MVP', 'Fast Follow', and 'Nice to Have'. By de-scoping non-critical visual polish to a fast-follow release, we delivered the core functionality on time with zero defects.`
      },
      {
        id: 5,
        category: 'Failure & Resilience',
        question: `What is the most valuable professional failure or mistake you have experienced in your career, and how did it fundamentally shape how you work today?`,
        contextFromResume: `Evaluating self-awareness, resilience, and commitment to continuous growth.`,
        keyEvaluationCriteria: [
          'Authentic vulnerability and accountability',
          'Clear lessons learned translated into enduring habits',
          'Demonstrates emotional intelligence and maturity'
        ],
        recommendedTimeMinutes: 3,
        sampleModelAnswer: `Early in my career, I deployed a database migration without taking a fresh snapshot, causing 20 minutes of unexpected downtime. I immediately owned the error and helped restore operations. Since then, I have championed automated zero-downtime migration protocols, rigorous rollback runbooks, and comprehensive staging verification across every team I join.`
      }
    ];
  }
}

export function evaluateCandidateResponse(question: InterviewQuestion, answerText: string, timeSeconds: number): AnswerFeedback {
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 10) {
    return {
      score: 35,
      communicationScore: 40,
      rigorScore: 30,
      strengths: ['Addressed the topic promptly'],
      improvements: [
        'Answer was extremely brief. Provide concrete context and specifics.',
        'Use the STAR structure (Situation, Task, Action, Result) to frame your narrative.',
        'Highlight specific metrics, tools, and quantifiable outcomes.'
      ],
      critique: 'The response lacked sufficient technical depth and context. In an interview setting, expand on your specific role, technical trade-offs, and measurable outcomes.'
    };
  }

  // Calculate score based on depth, presence of key terms, structure, and length
  let baseScore = Math.min(88, 55 + Math.floor(wordCount / 5));
  
  const hasNumbers = /\d+/.test(answerText);
  const hasTradeoffs = /(trade-off|because|however|latency|throughput|decision|instead|benchmark|metric|scaling)/i.test(answerText);
  const hasStructure = /(first|second|initially|result|then|finally|led to|impact)/i.test(answerText);

  if (hasNumbers) baseScore += 4;
  if (hasTradeoffs) baseScore += 5;
  if (hasStructure) baseScore += 4;

  const finalScore = Math.min(96, Math.max(62, baseScore));
  const commScore = Math.min(98, finalScore + (hasStructure ? 3 : -2));
  const rigorScore = Math.min(97, finalScore + (hasTradeoffs ? 4 : -3));

  const strengthsList: string[] = [];
  const improvementsList: string[] = [];

  if (hasNumbers) {
    strengthsList.push('Backed claims with concrete metrics and quantitative data.');
  } else {
    improvementsList.push('Incorporate more specific quantitative metrics (e.g. % improvement, latency ms, dollar savings).');
  }

  if (hasTradeoffs) {
    strengthsList.push('Clearly articulated engineering trade-offs and decision rationales.');
  } else {
    improvementsList.push('Explicitly address alternative approaches you rejected and why.');
  }

  if (hasStructure) {
    strengthsList.push('Well-structured narrative that guided the listener from context to outcome.');
  } else {
    improvementsList.push('Frame your narrative more explicitly with Situation, Action, and Business Result.');
  }

  if (strengthsList.length === 0) {
    strengthsList.push('Directly answered the core prompt with relevant domain concepts.');
  }
  if (improvementsList.length === 0) {
    improvementsList.push('Consider elaborating further on post-launch learnings and long-term maintainability.');
  }

  return {
    score: finalScore,
    communicationScore: commScore,
    rigorScore: rigorScore,
    strengths: strengthsList,
    improvements: improvementsList,
    starBreakdown: {
      situation: 'Established operational context and challenging requirements.',
      task: 'Identified the critical objective and technical constraints.',
      action: 'Executed architectural decisions, tooling implementation, and cross-team alignment.',
      result: 'Delivered measurable uptime, latency optimization, and sustained team impact.'
    },
    critique: finalScore > 85 
      ? 'Strong, articulate response demonstrating authentic domain authority, clear structural cadence, and high technical rigor.'
      : 'Good foundational answer with relevant concepts. Elevate it further by emphasizing specific trade-offs and quantifiable business results.'
  };
}

export function generateFullReport(candidateRole: string, answers: CandidateAnswer[]): InterviewReport {
  const count = Math.max(1, answers.length);
  const avgOverall = Math.round(answers.reduce((acc, a) => acc + a.feedback.score, 0) / count);
  const avgComm = Math.round(answers.reduce((acc, a) => acc + a.feedback.communicationScore, 0) / count);
  const avgRigor = Math.round(answers.reduce((acc, a) => acc + a.feedback.rigorScore, 0) / count);

  return {
    candidateRole: candidateRole || 'Candidate',
    overallScore: avgOverall || 86,
    summaryExecutive: `Candidate demonstrated strong domain mastery tailored to ${candidateRole}. Key strengths include structural storytelling, technical trade-off awareness, and clear articulation under realistic pressure.`,
    metricScores: {
      technicalAccuracy: avgRigor || 88,
      starStructure: avgComm || 85,
      clarityArticulation: Math.min(98, Math.round((avgComm + avgOverall) / 2) || 87),
      depthAndExamples: Math.min(95, Math.round((avgRigor + avgOverall) / 2) || 86)
    },
    keyStrengths: [
      'Strong architectural clarity and technical vocabulary grounded in real-world experience.',
      'Effective balance of technical depth with strategic executive-level perspective.',
      'Demonstrated accountability and proactive crisis management during deep-dive scenarios.'
    ],
    keyImprovements: [
      'Further amplify quantitative metrics and exact baseline numbers in initial answers.',
      'Explicitly discuss trade-offs and alternative architectures considered before settling on solutions.',
      'Keep behavioral storytelling concise to leave maximum room for technical deep dives.'
    ],
    answers: answers,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}

// Async AI API wrappers calling OpenAI backend
export async function fetchAIGeneratedQuestions(resumeText: string): Promise<{ questions: InterviewQuestion[]; roleTitle: string; candidateName: string; provider?: string }> {
  try {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        return {
          questions: data.questions,
          roleTitle: data.roleTitle || 'Candidate',
          candidateName: data.candidateName || 'Candidate',
          provider: data.provider || 'OpenAI / Gemini',
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI generation unavailable, using local deterministic engine:', err);
  }

  const parsed = parseResumeContent(resumeText);
  return {
    questions: generateTailoredQuestions(resumeText),
    roleTitle: parsed.roleTitle,
    candidateName: parsed.candidateName,
    provider: 'Local Engine (Instant)',
  };
}

export async function fetchAIEvaluatedAnswer(
  question: InterviewQuestion,
  answerText: string,
  timeSeconds: number
): Promise<AnswerFeedback> {
  try {
    const res = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answerText, timeSeconds }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.feedback && typeof data.feedback.score === 'number') {
        return data.feedback;
      }
    }
  } catch (err) {
    console.warn('Backend AI evaluation unavailable, using local evaluator:', err);
  }

  return evaluateCandidateResponse(question, answerText, timeSeconds);
}

export async function fetchAIGeneratedReport(
  candidateRole: string,
  answers: CandidateAnswer[]
): Promise<InterviewReport> {
  try {
    const res = await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateRole, answers }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.report && typeof data.report.overallScore === 'number') {
        return {
          ...data.report,
          candidateRole: candidateRole || 'Candidate',
          answers: answers,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI report generation unavailable, using local ledger:', err);
  }

  return generateFullReport(candidateRole, answers);
}

