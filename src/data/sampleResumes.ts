export interface SampleResumePreset {
  id: string;
  name: string;
  role: string;
  experience: string;
  snippet: string;
  fullText: string;
}

export const SAMPLE_RESUMES: SampleResumePreset[] = [
  {
    id: 'staff-swe',
    name: 'Staff Software Engineer',
    role: 'Staff Distributed Systems Engineer',
    experience: '8+ Years',
    snippet: 'Ex-Stripe / Uber, Large-scale microservices, Kafka, Go, Rust, Postgres partitioning.',
    fullText: `ALEXANDER VANCE
Staff Software Engineer | Distributed Systems & High-Throughput Infrastructure
San Francisco, CA | alex.vance@example.com | github.com/avance

SUMMARY
Staff Infrastructure Engineer with 8+ years architecting globally distributed transactional systems. Led payments processing resilience engine processing $4.2B annually at sub-25ms latency. Expert in distributed consensus (Raft/Paxos), distributed state machines, Event Sourcing, Go, Rust, and PostgreSQL sharding.

WORK EXPERIENCE
Staff Software Engineer — Global Payment Infrastructure (2022 – Present)
- Architected active-active multi-region ledger engine on AWS & GCP supporting 45,000 requests/sec with zero dual-write anomalies.
- Implemented transactional outbox pattern with Kafka and Debezium, dropping reconciliation mismatches by 99.4%.
- Mentored a team of 14 engineers across 3 time zones; authored the engineering RFC standard for asynchronous reliability.

Senior Software Engineer — Distributed Core (2019 – 2022)
- Re-architected core settlement pipeline from monolithic Python batch jobs to streaming Go pipeline, reducing overnight batch latency from 6 hours to 4 minutes.
- Designed custom distributed lock manager in Rust on top of etcd with automated lease renewal and partition tolerance.
- Mitigated major cascading failure during Black Friday peak by implementing adaptive token bucket rate-limiting with circuit breakers.

Software Engineer — Platform Backend (2017 – 2019)
- Developed gRPC microservices in Go and containerized deployments across Kubernetes.
- Optimized database indexing and connection pooling on PostgreSQL, boosting p99 query speed by 62%.

SKILLS & TECHNOLOGIES
Languages: Go, Rust, TypeScript, Python, SQL, C++
Systems & Data: Kafka, PostgreSQL, Redis, etcd, Cassandra, Elasticsearch, Kubernetes, Docker, AWS, Terraform
Architectures: Distributed Transactions, Event-Driven Architecture, High Availability, Fault Tolerance, CQRS`
  },
  {
    id: 'lead-pm',
    name: 'Lead Product Manager',
    role: 'Lead AI & Growth Product Manager',
    experience: '6+ Years',
    snippet: 'B2B SaaS, AI copilot workflows, experimentation & pricing tier optimization.',
    fullText: `SARAH CHEN
Lead Product Manager — AI & Enterprise Platform
New York, NY | sarah.chen@example.com | linkedin.com/in/sarahchen-pm

SUMMARY
Product leader with 6+ years driving zero-to-one AI products and enterprise PLG monetization. Launched generative workflow platform that captured $18M ARR in year one. Passionate about customer discovery, data-driven experimentation, and cross-functional alignment.

EXPERIENCE
Lead Product Manager — Enterprise AI Platform (2022 – Present)
- Conceived and launched enterprise generative AI assistant, scaling user adoption from 0 to 180,000 WAU across Fortune 500 accounts in 9 months.
- Led cross-functional squad of 12 engineers, 2 UX designers, and 2 data scientists from initial user research through GA.
- Partnered with enterprise sales to design tiered seat pricing, increasing Average Contract Value (ACV) by 34%.

Senior Product Manager — Growth & Onboarding (2020 – 2022)
- Overhauled self-serve activation funnel, increasing day-14 retention by 22% via personalized onboarding checklist experiments.
- Designed and launched collaborative workspace features that unlocked viral team invites (K-factor 1.4).

Product Manager — Analytics & Core UI (2018 – 2020)
- Shipped customizable dashboard reporting suite used by over 50,000 corporate managers daily.

SKILLS
Product: Product Strategy, Roadmap Execution, User Research, Wireframing, Pricing & Packaging, GTM Strategy
Metrics: A/B Testing, Cohort Analysis, Mixpanel, Amplitude, SQL, SQL queries, Figma, Linear, Jira`
  },
  {
    id: 'senior-ml',
    name: 'Senior ML Engineer',
    role: 'Senior Machine Learning / NLP Engineer',
    experience: '5+ Years',
    snippet: 'LLM fine-tuning, RAG architectures, vector search, PyTorch, vLLM, latency optimization.',
    fullText: `ELENA ROSTOVA
Senior Machine Learning Engineer
Seattle, WA | elena.rostova@example.com | github.com/erostova

SUMMARY
Machine Learning Engineer specializing in LLM serving infrastructure, Retrieval-Augmented Generation (RAG), and agentic workflows. Reduced LLM inference serving cost by 65% via dynamic batching, speculative decoding, and quantization (AWQ/GPTQ).

EXPERIENCE
Senior ML Engineer — LLM Platform & Applied AI (2022 – Present)
- Built enterprise hybrid retrieval engine combining BM25 keyword search with dense HNSW vector indexing in Milvus/Qdrant over 120M documents.
- Fine-tuned 8B-70B parameter open-weights models (Llama, Mistral) using LoRA/QLoRA on internal domain datasets, matching proprietary baseline accuracy.
- Optimized serving infrastructure with vLLM and TensorRT-LLM on NVIDIA H100 clusters, reducing time-to-first-token by 48%.

Machine Learning Engineer — Search & Recommendation (2020 – 2022)
- Trained multi-modal embedding models for semantic product search using PyTorch and HuggingFace.
- Built automated continuous evaluation pipelines evaluating precision@k, recall@k, and hallucination rates with synthetic benchmarking.

SKILLS
ML/AI: PyTorch, Hugging Face, vLLM, DeepSpeed, LangChain, LlamaIndex, Ray, Triton Inference Server
Vector DBs: Qdrant, Pinecone, Milvus, pgvector
DevOps: Docker, Kubernetes, Ray Clusters, AWS SageMaker, GCP Vertex AI`
  }
];
