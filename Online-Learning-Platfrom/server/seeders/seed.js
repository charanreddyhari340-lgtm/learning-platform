const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');

dotenv.config();

const seedData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Review.deleteMany({});

    console.log('Creating demo users...');

    const instructor1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'instructor@skillforge.com',
      password: 'password123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      headline: 'Principal AI Researcher & Ex-Google Staff Engineer',
      bio: 'Over 12 years of industry experience teaching more than 150,000 students worldwide in modern web architecture, AI, and distributed systems.',
      skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'System Design'],
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
      },
    });

    const instructor2 = await User.create({
      name: 'David Chen',
      email: 'david@skillforge.com',
      password: 'password123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      headline: 'Lead Cloud Architect & Certified AWS/Kubernetes Professional',
      bio: 'DevOps enthusiast helping software engineers master Docker, Kubernetes, and automated CI/CD cloud infrastructure at scale.',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Go', 'Terraform', 'CI/CD'],
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
    });

    const instructor3 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@skillforge.com',
      password: 'password123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      headline: 'Lead Product Designer & Design System Consultant',
      bio: 'Specializing in Figma design systems, UX psychology, accessibility, and high-fidelity micro-interactions.',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'],
      socialLinks: {
        website: 'https://dribbble.com',
      },
    });

    const studentUser = await User.create({
      name: 'Alex Morgan',
      email: 'student@skillforge.com',
      password: 'password123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      headline: 'Aspiring Full-Stack Software Engineer',
      bio: 'Enthusiastic student building modern React & Node.js applications and sharpening algorithmic problem solving.',
      skills: ['JavaScript', 'HTML5', 'CSS3', 'React'],
    });

    const adminUser = await User.create({
      name: 'Platform Admin',
      email: 'admin@skillforge.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      headline: 'SkillForge System Administrator',
      bio: 'Overseeing platform operations, course quality assurance, and community standards.',
    });

    console.log('Seeding rich multi-module courses catalog with comprehensive learning data...');

    const coursesData = [
      /* =========================================================================
         COURSE 1: WEB DEVELOPMENT BOOTCAMP
         ========================================================================= */
      {
        title: 'The Complete 2026 Full-Stack Web Development Bootcamp',
        slug: 'complete-fullstack-web-development-bootcamp',
        subtitle: 'Build real-world applications like SaaS dashboards, marketplaces, and production APIs with modern full-stack tools.',
        description: 'This bootcamp is built around shipping real-world products, not just memorizing syntax. You will learn how to build full-stack applications used by real users, including a dashboard, a multi-page ecommerce app, and a production-ready API layer with auth, payments, and deployment workflows.',
        category: 'Web Development',
        level: 'All Levels',
        language: 'English',
        price: 2999,
        originalPrice: 7999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor1._id,
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 328,
        studentsCount: 1420,
        tags: ['Web Development', 'MERN Stack', 'React', 'Node.js', 'MongoDB', 'JavaScript', 'Real-World Projects'],
        whatYouWillLearn: [
          'Build real-world full-stack web applications using React, Node.js, Express, and MongoDB',
          'Create a SaaS dashboard with authentication, authorization, analytics, and CRUD workflows',
          'Architect production-ready APIs for ecommerce, user management, and admin panels',
          'Deploy complete applications to cloud platforms with CI/CD and Docker',
          'Write maintainable frontend and backend code following industry patterns used in startups and product teams',
        ],
        requirements: [
          'No prior programming experience required. We start from the very basics!',
          'A computer (Mac, Windows, or Linux) with internet access',
        ],
        targetAudience: [
          'Beginners who want to land their first web development job',
          'Junior developers wanting to transition to full-stack engineering',
          'Students who want to learn by building production-style apps for real use cases',
        ],
        modules: [
          {
            title: 'Module 1: Foundations of Modern Web & JavaScript',
            description: 'Core concepts of the web, modern JS features, closures, asynchronous programming, and project setup workflows.',
            order: 1,
            lessons: [
              {
                title: 'Introduction & Development Environment Setup',
                type: 'video',
                duration: '09:30',
                durationSeconds: 570,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Set up your coding environment with VS Code, Node.js runtime, Git version control, and essential extensions for full-stack velocity.',
                isFreePreview: true,
                resources: [{ title: 'Developer Setup Guide (PDF)', url: 'https://example.com/guide.pdf', type: 'pdf' }],
              },
              {
                title: 'Modern JavaScript: ES6+, Arrow Functions & Destructuring',
                type: 'video',
                duration: '14:45',
                durationSeconds: 885,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Master ES6+ syntax including object destructuring, rest/spread operators, arrow function scoping, template literals, and optional chaining.',
                isFreePreview: true,
                resources: [{ title: 'ES6+ Cheatsheet (PDF)', url: 'https://example.com/es6.pdf', type: 'pdf' }],
              },
              {
                title: 'Async/Await, Promises & Network Fetching',
                type: 'video',
                duration: '16:20',
                durationSeconds: 980,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Understand asynchronous JavaScript event loop, promise states, async/await error handling with try/catch, and making HTTP requests with Fetch and Axios.',
                isFreePreview: false,
              },
              {
                title: 'Module 1 Assessment: JavaScript Fundamentals Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Module 1 Assessment: JavaScript Fundamentals Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which keyword creates a block-scoped variable that cannot be reassigned?',
                      options: ['var', 'let', 'const', 'static'],
                      correctAnswer: 2,
                      explanation: 'const declares block-scoped variables whose identifier cannot be reassigned once initialized.',
                    },
                    {
                      question: 'What is the return type of an async function in JavaScript?',
                      options: ['A callback', 'A Promise', 'An Iterator', 'A Generator'],
                      correctAnswer: 1,
                      explanation: 'Every async function in JavaScript implicitly returns a Promise resolved with the returned value.',
                    },
                    {
                      question: 'Which method transforms elements of an array and returns a new array of the same length?',
                      options: ['forEach()', 'filter()', 'map()', 'reduce()'],
                      correctAnswer: 2,
                      explanation: 'Array.prototype.map() calls a provided callback function once for each element and constructs a new array from the results.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Build Real-World Frontend Apps with React',
            description: 'Create production-style UI flows for dashboards, ecommerce storefronts, and user management systems.',
            order: 2,
            lessons: [
              {
                title: 'Component Architecture & JSX Best Practices',
                type: 'video',
                duration: '18:10',
                durationSeconds: 1090,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                content: 'Design reusable, maintainable React components. Learn props validation, children composition, and separation of container vs presentational logic.',
                isFreePreview: false,
              },
              {
                title: 'React Hooks: useState, useEffect & Custom Hooks',
                type: 'video',
                duration: '22:40',
                durationSeconds: 1360,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                content: 'Deep dive into React hook rules, dependency arrays in useEffect, cleanups on unmount, and abstracting business logic into custom hooks.',
                isFreePreview: false,
              },
              {
                title: 'Project Lab: Build an Interactive Analytics Dashboard',
                type: 'video',
                duration: '25:15',
                durationSeconds: 1515,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Assemble a complete analytics dashboard with dynamic KPI cards, filtering mechanisms, and live reactive charts.',
                isFreePreview: false,
                resources: [{ title: 'Dashboard Starter Code (ZIP)', url: 'https://github.com', type: 'code' }],
              },
              {
                title: 'Module 2 Assessment: React & Component State Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'React Architecture Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What happens when you call a state updater function with the same state value?',
                      options: ['React bails out and avoids re-rendering', 'React crashes with an infinite loop', 'The component unmounts', 'A warning is logged'],
                      correctAnswer: 0,
                      explanation: 'React uses Object.is comparison algorithm and skips re-rendering if the new state is identical to the current state.',
                    },
                    {
                      question: 'When does the cleanup function in useEffect run?',
                      options: ['Only on page refresh', 'Before running the effect on the next render and on unmount', 'Immediately after mounting', 'Never'],
                      correctAnswer: 1,
                      explanation: 'React executes the returned cleanup function before re-running the effect and when the component unmounts.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 3: Full-Stack APIs with Node.js, Express & MongoDB',
            description: 'Build backend services, database models, validation middlewares, and authentication flows.',
            order: 3,
            lessons: [
              {
                title: 'Setting up Express Server & Middleware Pipeline',
                type: 'video',
                duration: '16:30',
                durationSeconds: 990,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
                content: 'Configure Express routing, CORS policies, centralized error handlers, JSON body parsing, and request logging with Morgan.',
                isFreePreview: false,
              },
              {
                title: 'Mongoose Schemas, Relationships & Aggregation Pipelines',
                type: 'video',
                duration: '21:15',
                durationSeconds: 1275,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Model complex relational patterns in MongoDB using ObjectId references, virtual population, indexes for query speed, and multi-stage aggregation pipelines.',
                isFreePreview: false,
              },
              {
                title: 'JWT Authentication & Role-Based Access Control (RBAC)',
                type: 'video',
                duration: '19:40',
                durationSeconds: 1180,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                content: 'Implement industry-standard JWT token issuance, password hashing with bcrypt, auth middleware verification, and role guards for admin and instructor endpoints.',
                isFreePreview: false,
              },
              {
                title: 'Module 3 Assessment: Backend & Database Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Backend API & MongoDB Mastery Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which HTTP method should be used for idempotent updates where the entire resource is replaced?',
                      options: ['POST', 'PATCH', 'PUT', 'DELETE'],
                      correctAnswer: 2,
                      explanation: 'PUT replaces the entire entity idempotently, whereas PATCH is typically used for partial updates.',
                    },
                    {
                      question: 'What is the primary benefit of adding indexes to MongoDB fields?',
                      options: ['Compresses collection size', 'Significantly speeds up search and sort queries', 'Encrypts user passwords', 'Enforces strict types'],
                      correctAnswer: 1,
                      explanation: 'Indexes provide an ordered data structure allowing MongoDB to find matching documents with logarithmic complexity rather than scanning every document.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 4: Shipping Production Full-Stack Applications',
            description: 'Docker containerization, cloud deployment, automated testing, and capstone project delivery.',
            order: 4,
            lessons: [
              {
                title: 'Dockerizing Full-Stack MERN Applications',
                type: 'video',
                duration: '17:20',
                durationSeconds: 1040,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Write multi-stage Dockerfiles for React frontend and Node.js backend. Configure Docker Compose for local development orchestration.',
                isFreePreview: false,
              },
              {
                title: 'Production Deployment & Cloud CI/CD Automation',
                type: 'video',
                duration: '20:50',
                durationSeconds: 1250,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Deploy frontend assets to high-speed CDNs, backend to containerized cloud servers, and configure environment variables, SSL certificates, and automated health checks.',
                isFreePreview: false,
              },
              {
                title: 'Capstone Certification Exam: Full-Stack Engineering',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'Full-Stack Bootcamp Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'Why should sensitive secrets like JWT_SECRET never be committed to Git?',
                      options: ['It slows down Git commits', 'Anyone with repo access can forge authentication tokens', 'Docker cannot build images', 'MongoDB will reject connections'],
                      correctAnswer: 1,
                      explanation: 'Exposing JWT secrets allows attackers to forge valid signatures and impersonate any user on the platform.',
                    },
                    {
                      question: 'What is the purpose of multi-stage Docker builds?',
                      options: ['Produce lean, minimal production image artifacts without build tools', 'Run multiple servers on one port', 'Replace Node.js runtime', 'Allow live hot-reloading'],
                      correctAnswer: 0,
                      explanation: 'Multi-stage builds allow compiling in an environment with all developer dependencies and copying only the compiled artifacts into a lightweight production container.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 2: AI & LARGE LANGUAGE MODELS
         ========================================================================= */
      {
        title: 'Mastering AI & Large Language Models: From Prompting to Fine-Tuning',
        slug: 'mastering-ai-and-large-language-models',
        subtitle: 'Build intelligent applications using OpenAI, LangChain, Vector Databases (Pinecone/Chroma), and RAG pipelines.',
        description: 'Harness the explosive power of Generative AI and LLMs. Learn to build Retrieval-Augmented Generation (RAG) applications, agentic workflows, embeddings, and fine-tune open-weight models like Llama 3 for enterprise solutions.',
        category: 'AI & Machine Learning',
        level: 'Intermediate',
        language: 'English',
        price: 4499,
        originalPrice: 9999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor1._id,
        isFeatured: true,
        rating: 5.0,
        reviewsCount: 184,
        studentsCount: 950,
        tags: ['Artificial Intelligence', 'LLMs', 'Python', 'LangChain', 'RAG', 'Vector DB'],
        whatYouWillLearn: [
          'Architect enterprise Retrieval-Augmented Generation (RAG) pipelines',
          'Integrate LangChain and LlamaIndex for autonomous AI agents',
          'Understand vector embeddings, semantic search, and hybrid vector querying',
          'Fine-tune open-source models using LoRA and QLoRA techniques',
        ],
        requirements: [
          'Basic understanding of Python and REST APIs',
          'Comfortable with command line basics',
        ],
        targetAudience: [
          'Software engineers wanting to transition into AI Application Engineering',
          'Data scientists seeking to build production-grade LLM applications',
        ],
        modules: [
          {
            title: 'Module 1: Foundations of LLMs & Prompt Engineering',
            description: 'Architecture of Transformer models, attention mechanisms, and zero-shot/few-shot prompting.',
            order: 1,
            lessons: [
              {
                title: 'How Transformer Models Work Under the Hood',
                type: 'video',
                duration: '16:40',
                durationSeconds: 1000,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Understand tokenization, positional encodings, multi-head self-attention mechanisms, and how modern LLMs predict next-token probabilities.',
                isFreePreview: true,
                resources: [{ title: 'Attention Is All You Need Paper Summary (PDF)', url: 'https://example.com/transformer.pdf', type: 'pdf' }],
              },
              {
                title: 'Advanced Prompt Engineering & Chain-of-Thought Techniques',
                type: 'video',
                duration: '19:20',
                durationSeconds: 1160,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Master structured outputs, few-shot prompting, chain-of-thought reasoning, system framing, temperature tuning, and preventing hallucinations.',
                isFreePreview: true,
                resources: [{ title: 'Prompt Engineering Cookbook', url: 'https://example.com/prompts.pdf', type: 'pdf' }],
              },
              {
                title: 'Module 1 Quiz: LLM Architecture & Prompting',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Generative AI & LLM Fundamentals Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What does RAG stand for in modern AI engineering?',
                      options: [
                        'Rapid Algorithmic Generation',
                        'Retrieval-Augmented Generation',
                        'Recursive Attention Gradient',
                        'Randomized Auto-encoder Gate',
                      ],
                      correctAnswer: 1,
                      explanation: 'Retrieval-Augmented Generation fetches relevant documents from a knowledge store to ground model responses in real factual data.',
                    },
                    {
                      question: 'Which mechanism enables Transformers to weigh the relevance of different words in a sequence regardless of distance?',
                      options: ['Convolution', 'Recurrent Backpropagation', 'Self-Attention', 'Gradient Clipping'],
                      correctAnswer: 2,
                      explanation: 'Self-Attention calculates attention scores between all pairs of tokens in a sequence simultaneously.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Vector Databases, Embeddings & Semantic Search',
            description: 'Convert text to vectors, implement cosine similarity search, and connect Pinecone and ChromaDB.',
            order: 2,
            lessons: [
              {
                title: 'Vector Embeddings & High-Dimensional Semantic Spaces',
                type: 'video',
                duration: '15:10',
                durationSeconds: 910,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Explore text embedding models (OpenAI text-embedding-3, BGE), vector dimensionality, cosine similarity, Euclidean distance, and dot products.',
                isFreePreview: false,
              },
              {
                title: 'Building a Knowledge Store with Pinecone & ChromaDB',
                type: 'video',
                duration: '22:30',
                durationSeconds: 1350,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                content: 'Set up vector indices, implement metadata filtering, semantic partitioning, and perform sub-10ms similarity queries on enterprise documents.',
                isFreePreview: false,
              },
              {
                title: 'Module 2 Assessment: Vector Search & Embeddings Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Vector Databases Mastery Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which metric measures the cosine of the angle between two multi-dimensional vectors?',
                      options: ['Manhattan Distance', 'Cosine Similarity', 'Hamming Distance', 'Jaccard Index'],
                      correctAnswer: 1,
                      explanation: 'Cosine similarity measures directional orientation between two vectors regardless of magnitude.',
                    },
                    {
                      question: 'What is the role of chunk overlap when splitting documents for RAG?',
                      options: ['Reduces vector storage size', 'Preserves contextual continuity across chunk boundaries', 'Encrypts document tokens', 'Accelerates tokenization'],
                      correctAnswer: 1,
                      explanation: 'Chunk overlap ensures critical phrases and context spanning across split boundaries are not lost.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 3: Production RAG Pipelines & Autonomous Agents',
            description: 'Build complete document Q&A systems and multi-step agentic workflows with LangChain.',
            order: 3,
            lessons: [
              {
                title: 'Orchestrating RAG Workflows with LangChain & LCEL',
                type: 'video',
                duration: '24:45',
                durationSeconds: 1485,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                content: 'Connect document loaders, text splitters, vector stores, and generative chat models using LangChain Expression Language (LCEL).',
                isFreePreview: false,
              },
              {
                title: 'Building Autonomous AI Agents with Tool Calling & ReAct Loops',
                type: 'video',
                duration: '28:10',
                durationSeconds: 1690,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Implement autonomous agents capable of web searching, SQL database querying, API execution, and iterative reasoning using the ReAct (Reason + Act) pattern.',
                isFreePreview: false,
              },
              {
                title: 'Module 3 Assessment: AI Agents & Pipeline Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'AI Agent Architecture Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What does the ReAct framework stand for in AI agent systems?',
                      options: ['Reactive Action', 'Reasoning and Acting', 'Recursive Activation', 'Response Automation'],
                      correctAnswer: 1,
                      explanation: 'ReAct pairs internal reasoning traces with dynamic action calls to make robust autonomous decisions.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 4: Open-Source LLMs, Fine-Tuning & Deployment',
            description: 'Fine-tune Llama 3 with LoRA/QLoRA and deploy high-throughput inference servers.',
            order: 4,
            lessons: [
              {
                title: 'Parameter-Efficient Fine-Tuning with LoRA & QLoRA',
                type: 'video',
                duration: '26:00',
                durationSeconds: 1560,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Prepare instruction datasets, freeze base weights, train low-rank adapter matrices using Hugging Face PEFT and bitsandbytes 4-bit quantization.',
                isFreePreview: false,
              },
              {
                title: 'High-Throughput Model Serving with vLLM & FastAPI',
                type: 'video',
                duration: '21:30',
                durationSeconds: 1290,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                content: 'Deploy quantized models with vLLM PagedAttention engine, continuous batching, streaming SSE responses, and GPU memory management.',
                isFreePreview: false,
              },
              {
                title: 'AI & LLM Masterclass Certification Exam',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'AI & LLM Masterclass Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'Why is QLoRA significantly more memory-efficient than full fine-tuning?',
                      options: [
                        'It removes all weights from memory',
                        'It quantizes the base model to 4-bit precision and trains small low-rank adapter matrices',
                        'It requires no GPU',
                        'It reduces the vocabulary size to zero',
                      ],
                      correctAnswer: 1,
                      explanation: 'QLoRA quantizes pretrained weights to 4-bit NormalFloat while training full-precision adapter layers, enabling fine-tuning on consumer GPUs.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 3: MODERN UI/UX DESIGN MASTERCLASS
         ========================================================================= */
      {
        title: 'Modern UI/UX Design Masterclass: Figma to Interactive Prototypes',
        slug: 'modern-ui-ux-design-masterclass-figma',
        subtitle: 'Learn UX research, color theory, typography, Figma auto-layout, components, and design systems.',
        description: 'Step into the shoes of a lead product designer. Master Figma from ground zero to advanced auto-layouts, interactive variables, micro-animations, and complete design tokens.',
        category: 'UI/UX Design',
        level: 'Beginner',
        language: 'English',
        price: 0,
        originalPrice: 3499,
        isFree: true,
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        instructor: instructor3._id,
        isFeatured: true,
        rating: 4.8,
        reviewsCount: 412,
        studentsCount: 3100,
        tags: ['UI/UX', 'Figma', 'Product Design', 'User Experience', 'Prototyping'],
        whatYouWillLearn: [
          'Design pixel-perfect user interfaces in Figma',
          'Create complex dynamic auto-layouts and reusable design components',
          'Build interactive prototypes with smart animations and component variants',
          'Conduct user research, wireframing, and usability testing',
        ],
        requirements: ['No prior design experience needed. Figma is free to use in your browser.'],
        targetAudience: ['Anyone who wants to learn UI/UX design from scratch', 'Developers looking to level up their design eye'],
        modules: [
          {
            title: 'Module 1: Figma Essentials & Typography Systems',
            description: 'Workspace layout, vector tools, grid systems, and typography pairings.',
            order: 1,
            lessons: [
              {
                title: 'Mastering Figma Workspace & Vector Tools',
                type: 'video',
                duration: '11:20',
                durationSeconds: 680,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Explore frames vs groups, shapes, pen tool, vector networks, boolean operations, and canvas shortcut navigation.',
                isFreePreview: true,
                resources: [{ title: 'Figma Keyboard Shortcuts Cheatsheet (PDF)', url: 'https://example.com/figma.pdf', type: 'pdf' }],
              },
              {
                title: 'Typography Hierarchy, Scale & Color Harmonization',
                type: 'video',
                duration: '14:50',
                durationSeconds: 890,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                content: 'Establish 8pt modular scales, line-height ratios, contrast ratios for WCAG AA compliance, and building dynamic HSL color palettes.',
                isFreePreview: true,
              },
              {
                title: 'Module 1 Assessment: UI Design Principles Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'UI Design Foundations Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What is the recommended base grid unit in modern responsive UI design?',
                      options: ['3px or 7px', '8px or 4px', '15px', '25px'],
                      correctAnswer: 1,
                      explanation: 'The 8pt grid system simplifies spacing, scaling, and aligns seamlessly with standard screen resolutions.',
                    },
                    {
                      question: 'What minimum contrast ratio is required for normal text under WCAG 2.1 AA standards?',
                      options: ['2:1', '3:1', '4.5:1', '7:1'],
                      correctAnswer: 2,
                      explanation: 'WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for regular body text.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Auto Layout & Reusable Design Systems',
            description: 'Build responsive components, component variants, and design token architectures.',
            order: 2,
            lessons: [
              {
                title: 'Auto Layout 5.0: Hug, Fill & Min/Max Constraints',
                type: 'video',
                duration: '19:40',
                durationSeconds: 1180,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                content: 'Master flex wrapping, absolute positioning inside auto-layout, negative spacing, and responsive padding.',
                isFreePreview: false,
              },
              {
                title: 'Component Sets, Component Properties & Variant Matrix',
                type: 'video',
                duration: '22:15',
                durationSeconds: 1335,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Create robust button and input components with boolean, text, and instance-swap properties across hover, active, and disabled states.',
                isFreePreview: false,
              },
              {
                title: 'Module 2 Assessment: Auto-Layout & Component Sets Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Figma Auto-Layout & Components Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which resizing option makes a child element stretch to occupy available container width?',
                      options: ['Fixed Width', 'Hug Contents', 'Fill Container', 'Absolute Width'],
                      correctAnswer: 2,
                      explanation: 'Fill Container allows child components to expand and fill available auto-layout space dynamically.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 3: High-Fidelity Interactive Prototyping',
            description: 'Smart animate transitions, interactive variables, and micro-animations.',
            order: 3,
            lessons: [
              {
                title: 'Smart Animate, Micro-Interactions & Spring Physics',
                type: 'video',
                duration: '18:30',
                durationSeconds: 1110,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
                content: 'Connect frames with Smart Animate matching layer names, customize cubic bezier easing curves, and simulate native iOS/Android feel.',
                isFreePreview: false,
              },
              {
                title: 'Figma Variables & Conditional Logic Prototyping',
                type: 'video',
                duration: '21:00',
                durationSeconds: 1260,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Use string, number, and boolean variables to create realistic cart counters, theme toggling, and multi-step form validations.',
                isFreePreview: false,
              },
              {
                title: 'UI/UX Design Masterclass Final Certification Exam',
                type: 'quiz',
                duration: '12:00',
                durationSeconds: 720,
                quiz: {
                  title: 'UI/UX Design Masterclass Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'What requirement must be met for Figma Smart Animate to smoothly morph an element between frames?',
                      options: ['Same color must be used', 'Layer names and hierarchy must match exactly across both frames', 'Element must be a bitmap image', 'Must be a 3D layer'],
                      correctAnswer: 1,
                      explanation: 'Smart Animate matches layers with identical names and hierarchies to calculate smooth position, size, and rotation transitions.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 4: CLOUD ARCHITECTURE & KUBERNETES ON AWS
         ========================================================================= */
      {
        title: 'Cloud Architecture & Kubernetes on AWS: Zero to Production',
        slug: 'cloud-architecture-kubernetes-aws',
        subtitle: 'Deploy highly scalable microservices with Docker, Kubernetes (EKS), Terraform, and AWS CI/CD pipelines.',
        description: 'Prepare for enterprise DevOps and Cloud Engineering roles. Learn Infrastructure as Code (IaC) with Terraform, container orchestration with Kubernetes, Helm charts, and AWS cloud architectures.',
        category: 'Cloud & DevOps',
        level: 'Advanced',
        language: 'English',
        price: 4999,
        originalPrice: 10999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor2._id,
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 145,
        studentsCount: 780,
        tags: ['DevOps', 'Cloud', 'AWS', 'Kubernetes', 'Docker', 'Terraform'],
        whatYouWillLearn: [
          'Architect multi-tier cloud applications on Amazon Web Services',
          'Deploy and manage production Kubernetes clusters with AWS EKS',
          'Automate cloud infrastructure provisioning using Terraform',
          'Implement monitoring, metrics, and alerts with Prometheus & Grafana',
        ],
        requirements: ['Basic Linux command line knowledge and familiarity with backend web servers.'],
        targetAudience: ['Backend developers, DevOps engineers, and cloud architects.'],
        modules: [
          {
            title: 'Module 1: Docker Containers & Microservice Packaging',
            description: 'Container fundamentals, multi-stage Dockerfiles, networking, and volumes.',
            order: 1,
            lessons: [
              {
                title: 'Multi-Stage Docker Builds & Image Optimization',
                type: 'video',
                duration: '15:30',
                durationSeconds: 930,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                content: 'Build lean, hardened container images, reduce vulnerability attack surfaces, and leverage layer caching.',
                isFreePreview: true,
                resources: [{ title: 'Docker Security & Dockerfile Best Practices (PDF)', url: 'https://example.com/docker.pdf', type: 'pdf' }],
              },
              {
                title: 'Docker Networking, Persistent Volumes & Compose Orchestration',
                type: 'video',
                duration: '18:10',
                durationSeconds: 1090,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Link microservices, manage named volumes, configure environment secrets, and orchestrate multi-container apps.',
                isFreePreview: false,
              },
              {
                title: 'Module 1 Assessment: Docker & Containerization Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Docker & Containers Assessment',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What is the advantage of using distroless or alpine base images?',
                      options: ['Larger file size', 'Significantly fewer OS packages and reduced CVE vulnerabilities', 'Automatic database configuration', 'Built-in compiler'],
                      correctAnswer: 1,
                      explanation: 'Minimal base images contain only the application and runtime dependencies, stripping unnecessary utilities to minimize attack vectors.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: AWS Cloud Infrastructure & Networking',
            description: 'VPC design, subnets, internet gateways, NAT, IAM roles, and security groups.',
            order: 2,
            lessons: [
              {
                title: 'Architecting High-Availability VPCs, Subnets & Routing',
                type: 'video',
                duration: '22:40',
                durationSeconds: 1360,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Design public and private subnets across multiple availability zones, route tables, NAT Gateways, and Bastion hosts.',
                isFreePreview: false,
              },
              {
                title: 'AWS IAM Security, Principle of Least Privilege & KMS',
                type: 'video',
                duration: '19:20',
                durationSeconds: 1160,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Create granular IAM policies, assume role workflows for microservices, and encrypt data at rest with AWS KMS.',
                isFreePreview: false,
              },
            ],
          },
          {
            title: 'Module 3: Kubernetes in Action with Amazon EKS',
            description: 'Deploy pods, services, ingress controllers, Helm charts, and cluster autoscalers.',
            order: 3,
            lessons: [
              {
                title: 'Kubernetes Core Primitives: Pods, Deployments & Services',
                type: 'video',
                duration: '24:15',
                durationSeconds: 1455,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Write declarative YAML manifests, configure readiness/liveness probes, rolling update strategies, and ClusterIP/NodePort/LoadBalancer services.',
                isFreePreview: false,
              },
              {
                title: 'Ingress Controllers, TLS Certificates & Helm Deployments',
                type: 'video',
                duration: '23:50',
                durationSeconds: 1430,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Deploy NGINX Ingress Controller, configure cert-manager with Let\'s Encrypt for automated SSL, and package services into Helm charts.',
                isFreePreview: false,
              },
              {
                title: 'Module 3 Assessment: Kubernetes Architecture Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Kubernetes Mastery Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'What is the purpose of a Liveness Probe in a Kubernetes pod specification?',
                      options: ['Determines when pod is ready to accept HTTP traffic', 'Detects and restarts deadlocked or crashed containers', 'Scales the cluster nodes', 'Generates SSL certificates'],
                      correctAnswer: 1,
                      explanation: 'Liveness probes check container health and trigger kubelet to restart the container if the health check fails.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 4: Infrastructure as Code (IaC) with Terraform & GitOps',
            description: 'Automate cluster provisioning and CI/CD pipelines.',
            order: 4,
            lessons: [
              {
                title: 'Terraform State, Modules & AWS EKS Provisioning',
                type: 'video',
                duration: '27:10',
                durationSeconds: 1630,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                content: 'Structure reusable Terraform modules, store remote state in S3 with DynamoDB locking, and provision an entire AWS EKS cluster with code.',
                isFreePreview: false,
              },
              {
                title: 'Cloud & Kubernetes Final Certification Exam',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'Cloud Architecture & DevOps Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'Why is state locking with DynamoDB critical when using Terraform in collaborative teams?',
                      options: ['Compiles HCL code faster', 'Prevents concurrent terraform apply executions from corrupting the remote state file', 'Reduces AWS billing', 'Creates auto-backups'],
                      correctAnswer: 1,
                      explanation: 'DynamoDB state locking ensures only one team member or CI pipeline can modify infrastructure state at any given moment.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 5: PYTHON DATA SCIENCE & MACHINE LEARNING
         ========================================================================= */
      {
        title: 'Python for Data Science & Machine Learning Bootcamp',
        slug: 'python-data-science-machine-learning',
        subtitle: 'NumPy, Pandas, Matplotlib, Scikit-Learn, and Deep Learning with PyTorch on real data sets.',
        description: 'Turn raw data into actionable insights and predictive models. Cover exploratory data analysis, statistics, supervised and unsupervised machine learning algorithms.',
        category: 'Data Science',
        level: 'Beginner',
        language: 'English',
        price: 1999,
        originalPrice: 4999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor1._id,
        isFeatured: false,
        rating: 4.8,
        reviewsCount: 220,
        studentsCount: 1100,
        tags: ['Python', 'Data Science', 'Pandas', 'Machine Learning', 'PyTorch'],
        whatYouWillLearn: [
          'Master Python for data cleaning and manipulation with Pandas',
          'Visualize complex trends with Seaborn and Plotly',
          'Build predictive regression and classification models with Scikit-Learn',
        ],
        requirements: ['Basic math understanding (high school algebra).'],
        targetAudience: ['Aspiring data analysts and machine learning practitioners.'],
        modules: [
          {
            title: 'Module 1: Data Wrangling with Pandas & NumPy',
            description: 'Vectorized operations, data cleaning, grouping, and aggregations.',
            order: 1,
            lessons: [
              {
                title: 'NumPy Arrays & Fast Vectorized Math',
                type: 'video',
                duration: '14:10',
                durationSeconds: 850,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Learn multi-dimensional arrays, slicing, broadcasting rules, boolean masking, and vectorized mathematical transformations.',
                isFreePreview: true,
                resources: [{ title: 'Pandas & NumPy Quick Reference (PDF)', url: 'https://example.com/pandas.pdf', type: 'pdf' }],
              },
              {
                title: 'Pandas DataFrames: Cleaning, Merging & Handling Missing Data',
                type: 'video',
                duration: '21:30',
                durationSeconds: 1290,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Read CSV/JSON datasets, handle NaN values with imputation, groupby aggregations, pivot tables, and multi-index joins.',
                isFreePreview: true,
              },
              {
                title: 'Module 1 Assessment: Data Manipulation Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Data Wrangling Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which Pandas method is used to remove missing rows containing NaN values?',
                      options: ['df.fillna()', 'df.dropna()', 'df.replace()', 'df.filter()'],
                      correctAnswer: 1,
                      explanation: 'dropna() removes rows or columns with null or NaN values.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Data Visualization & Exploratory Analysis (EDA)',
            description: 'Visual storytelling with Matplotlib, Seaborn, and interactive Plotly graphs.',
            order: 2,
            lessons: [
              {
                title: 'Statistical Visualizations with Seaborn & Matplotlib',
                type: 'video',
                duration: '18:40',
                durationSeconds: 1120,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Generate correlation heatmaps, distribution plots, pairplots, boxplots for outlier detection, and customize chart aesthetics.',
                isFreePreview: false,
              },
              {
                title: 'Interactive Dashboards with Plotly & Streamlit',
                type: 'video',
                duration: '20:15',
                durationSeconds: 1215,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Build responsive web apps to present exploratory insights to business stakeholders with interactive filters.',
                isFreePreview: false,
              },
            ],
          },
          {
            title: 'Module 3: Supervised & Unsupervised Machine Learning',
            description: 'Build regression, classification, and clustering models with Scikit-Learn.',
            order: 3,
            lessons: [
              {
                title: 'Linear & Logistic Regression, Decision Trees & Random Forests',
                type: 'video',
                duration: '24:50',
                durationSeconds: 1490,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                content: 'Understand gradient descent, cost functions, train/test splitting, cross-validation, hyperparameter tuning with GridSearchCV, and confusion matrices.',
                isFreePreview: false,
              },
              {
                title: 'Unsupervised Learning: K-Means Clustering & PCA',
                type: 'video',
                duration: '19:40',
                durationSeconds: 1180,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                content: 'Segment customer behaviors using K-Means and reduce feature dimensionality with Principal Component Analysis (PCA).',
                isFreePreview: false,
              },
              {
                title: 'Data Science & ML Final Certification Exam',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'Data Science & Machine Learning Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'What metric evaluates classification performance in imbalanced datasets better than simple accuracy?',
                      options: ['R-Squared', 'F1-Score and ROC-AUC', 'Mean Absolute Error', 'Silhouette Score'],
                      correctAnswer: 1,
                      explanation: 'F1-Score (harmonic mean of Precision and Recall) provides an accurate metric when class distributions are highly skewed.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 6: CYBERSECURITY & ETHICAL HACKING
         ========================================================================= */
      {
        title: 'Practical Cybersecurity & Ethical Hacking Essentials',
        slug: 'cybersecurity-ethical-hacking-essentials',
        subtitle: 'Learn network penetration testing, web application security (OWASP Top 10), and vulnerability assessment.',
        description: 'Understand how hackers exploit vulnerabilities and how security engineers protect critical systems. Master Kali Linux, Wireshark, Burp Suite, and defensive countermeasures.',
        category: 'Cybersecurity',
        level: 'Intermediate',
        language: 'English',
        price: 3499,
        originalPrice: 7999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor2._id,
        isFeatured: false,
        rating: 4.9,
        reviewsCount: 98,
        studentsCount: 620,
        tags: ['Cybersecurity', 'Ethical Hacking', 'OWASP', 'Penetration Testing', 'Network Security'],
        whatYouWillLearn: [
          'Understand attack vectors: SQL Injection, XSS, CSRF, and SSRF',
          'Conduct network traffic analysis and reconnaissance with Wireshark and Nmap',
          'Implement defense-in-depth security best practices in web apps',
        ],
        requirements: ['Basic computer networking knowledge (IP addresses, ports, protocols).'],
        targetAudience: ['Developers and IT professionals wanting to secure their infrastructure.'],
        modules: [
          {
            title: 'Module 1: Network Reconnaissance & Traffic Analysis',
            description: 'Port scanning, service enumeration, and packet inspection.',
            order: 1,
            lessons: [
              {
                title: 'Nmap Scanning Techniques & Firewall Evasion',
                type: 'video',
                duration: '17:40',
                durationSeconds: 1060,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
                content: 'TCP SYN stealth scans, OS detection, service version scanning, and executing NSE (Nmap Scripting Engine) vulnerability scripts.',
                isFreePreview: true,
                resources: [{ title: 'Nmap Reconnaissance Cheatsheet (PDF)', url: 'https://example.com/nmap.pdf', type: 'pdf' }],
              },
              {
                title: 'Packet Sniffing & Protocol Analysis with Wireshark',
                type: 'video',
                duration: '19:15',
                durationSeconds: 1155,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Capture and inspect live packet streams, filter by protocol (DNS, HTTP, TLS), detect cleartext credential transmission, and analyze TCP handshakes.',
                isFreePreview: false,
              },
              {
                title: 'Module 1 Assessment: Network Reconnaissance Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Network Security Fundamentals Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Which Nmap scan type sends a SYN packet and resets the connection immediately upon receiving SYN-ACK to avoid completing the handshake?',
                      options: ['TCP Connect Scan (-sT)', 'SYN Stealth Scan (-sS)', 'UDP Scan (-sU)', 'FIN Scan (-sF)'],
                      correctAnswer: 1,
                      explanation: 'SYN Stealth Scan (-sS) never completes the 3-way handshake, making it faster and less likely to be logged by basic connection loggers.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Web Application Penetration Testing (OWASP Top 10)',
            description: 'Exploiting and remediating SQL Injection, XSS, CSRF, and Broken Access Control.',
            order: 2,
            lessons: [
              {
                title: 'SQL Injection (SQLi) & Defense with Parameterized Queries',
                type: 'video',
                duration: '22:10',
                durationSeconds: 1330,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                content: 'Explore in-band, error-based, and blind SQL injections. Learn how parameterized statements and ORMs guarantee input isolation.',
                isFreePreview: false,
              },
              {
                title: 'Cross-Site Scripting (XSS) & Content Security Policy (CSP)',
                type: 'video',
                duration: '20:45',
                durationSeconds: 1245,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Examine Stored, Reflected, and DOM-based XSS attacks. Implement strict CSP headers, input sanitization, and output encoding.',
                isFreePreview: false,
              },
              {
                title: 'Cybersecurity & Ethical Hacking Final Certification Exam',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'Cybersecurity Specialist Final Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'What is the most definitive prevention strategy against SQL Injection?',
                      options: ['Client-side regex validation', 'Parameterized queries and prepared statements', 'Blacklisting quote characters', 'Base64 encoding inputs'],
                      correctAnswer: 1,
                      explanation: 'Parameterized queries separate user input from SQL code execution, rendering injection impossible.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 7: CROSS-PLATFORM MOBILE APP DEV (REACT NATIVE & EXPO)
         ========================================================================= */
      {
        title: 'Cross-Platform Mobile App Engineering with React Native & Expo',
        slug: 'cross-platform-mobile-app-react-native',
        subtitle: 'Build native iOS and Android apps using React Native, Expo Router, Reanimated, and device sensors.',
        description: 'Take your web development knowledge to mobile! Learn how to ship high-performance native apps for both iOS and Android with single codebase velocity using Expo and React Native.',
        category: 'Mobile Development',
        level: 'Intermediate',
        language: 'English',
        price: 2499,
        originalPrice: 6999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        instructor: instructor1._id,
        isFeatured: true,
        rating: 4.9,
        reviewsCount: 162,
        studentsCount: 840,
        tags: ['React Native', 'Mobile Development', 'Expo', 'iOS', 'Android', 'JavaScript'],
        whatYouWillLearn: [
          'Build native iOS and Android apps from a single React codebase',
          'Implement file-based routing with Expo Router 3',
          'Create 60FPS fluid animations with React Native Reanimated',
          'Access camera, push notifications, and biometric authentication APIs',
        ],
        requirements: ['Comfortable with modern JavaScript and React fundamentals.'],
        targetAudience: ['Web developers wanting to build native mobile apps', 'Mobile engineering aspirants'],
        modules: [
          {
            title: 'Module 1: React Native Core & Expo Architecture',
            description: 'Native layout primitives, Flexbox on mobile, and Expo development client.',
            order: 1,
            lessons: [
              {
                title: 'Native Primitives: View, Text, Image & FlatList Optimization',
                type: 'video',
                duration: '16:20',
                durationSeconds: 980,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Understand the difference between DOM and Native view hierarchies. Master high-performance FlatList virtualization on mobile devices.',
                isFreePreview: true,
                resources: [{ title: 'React Native Mobile Cheatsheet (PDF)', url: 'https://example.com/rn.pdf', type: 'pdf' }],
              },
              {
                title: 'File-Based Navigation with Expo Router & Tabs',
                type: 'video',
                duration: '19:40',
                durationSeconds: 1180,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                content: 'Create stack navigation, bottom tabs, dynamic modal screens, and deep-linking routing patterns.',
                isFreePreview: true,
              },
              {
                title: 'Module 1 Assessment: React Native Fundamentals Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'React Native Core Architecture Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Why is FlatList preferred over ScrollView for rendering long lists on mobile?',
                      options: [
                        'ScrollView has higher resolution',
                        'FlatList virtualizes offscreen items to preserve mobile memory and CPU',
                        'ScrollView cannot be styled with flexbox',
                        'FlatList is only supported on iOS',
                      ],
                      correctAnswer: 1,
                      explanation: 'FlatList renders only visible elements in the viewport, reusing items and preventing memory exhaustion.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Device APIs, Animations & App Store Publishing',
            description: 'Camera, secure storage, smooth gestures, and EAS build automation.',
            order: 2,
            lessons: [
              {
                title: '60FPS Gestures & Animations with React Native Reanimated',
                type: 'video',
                duration: '23:15',
                durationSeconds: 1395,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                content: 'Execute shared element transitions and gesture handling directly on the native UI thread without JS bridge lag.',
                isFreePreview: false,
              },
              {
                title: 'Deploying with Expo Application Services (EAS Build & Submit)',
                type: 'video',
                duration: '21:00',
                durationSeconds: 1260,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                content: 'Generate signed Android AABs and iOS IPAs in the cloud, configure OTA (Over-The-Air) updates, and submit to stores.',
                isFreePreview: false,
              },
              {
                title: 'Mobile App Engineering Final Certification Exam',
                type: 'quiz',
                duration: '12:00',
                durationSeconds: 720,
                quiz: {
                  title: 'React Native & Mobile Engineering Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'What is the primary advantage of Over-The-Air (OTA) updates in Expo?',
                      options: [
                        'Allows deploying JS/asset updates directly to users without waiting for App Store review cycles',
                        'Compiles native C++ code remotely',
                        'Bypasses all user permissions',
                        'Removes all native dependencies',
                      ],
                      correctAnswer: 0,
                      explanation: 'OTA updates allow fixing bugs and updating JavaScript bundles instantly without requiring users to download a new binary from app stores.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      /* =========================================================================
         COURSE 8: ENTERPRISE SOFTWARE ENGINEERING & SYSTEM DESIGN
         ========================================================================= */
      {
        title: 'Scalable Software Architecture & High-Performance System Design',
        slug: 'scalable-software-architecture-system-design',
        subtitle: 'Master distributed caching, event-driven architectures (Kafka), database sharding, and high-availability patterns.',
        description: 'Level up from senior developer to software architect. Learn how global tech leaders design fault-tolerant systems handling millions of requests per second.',
        category: 'Software Engineering',
        level: 'Advanced',
        language: 'English',
        price: 3999,
        originalPrice: 8999,
        isFree: false,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
        previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: instructor1._id,
        isFeatured: true,
        rating: 5.0,
        reviewsCount: 195,
        studentsCount: 910,
        tags: ['System Design', 'Software Engineering', 'Microservices', 'Redis', 'Kafka', 'Scalability'],
        whatYouWillLearn: [
          'Design distributed systems capable of scaling to millions of concurrent users',
          'Implement caching strategies (Cache-Aside, Write-Through) with Redis',
          'Architect event-driven systems using Apache Kafka and message queues',
          'Master database partitioning, replication topologies, and CAP theorem tradeoffs',
        ],
        requirements: ['2+ years experience building backend applications.'],
        targetAudience: ['Senior software engineers preparing for Architect or Staff Engineer roles'],
        modules: [
          {
            title: 'Module 1: Scalability Fundamentals & Caching Strategies',
            description: 'Vertical vs horizontal scaling, Load balancers, and Redis caching topologies.',
            order: 1,
            lessons: [
              {
                title: 'High-Throughput Load Balancing & Caching Patterns',
                type: 'video',
                duration: '18:50',
                durationSeconds: 1130,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                content: 'Compare Layer 4 vs Layer 7 load balancers, Consistent Hashing algorithms, Cache-Aside vs Write-Through strategies, and cache stampede mitigations.',
                isFreePreview: true,
                resources: [{ title: 'System Design Interview Cheatsheet (PDF)', url: 'https://example.com/sysdesign.pdf', type: 'pdf' }],
              },
              {
                title: 'Database Sharding, Replication & CAP Theorem Tradeoffs',
                type: 'video',
                duration: '24:10',
                durationSeconds: 1450,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                content: 'Master Leader-Follower replication, Multi-Leader architectures, database horizontal sharding keys, and consistency vs availability tradeoffs.',
                isFreePreview: true,
              },
              {
                title: 'Module 1 Assessment: Scalability & Caching Quiz',
                type: 'quiz',
                duration: '10:00',
                durationSeconds: 600,
                quiz: {
                  title: 'Distributed Systems & Caching Quiz',
                  passingScore: 75,
                  questions: [
                    {
                      question: 'Under the CAP Theorem, in the presence of a network partition (P), what trade-off must a distributed system make?',
                      options: [
                        'Speed vs Security',
                        'Consistency (C) vs Availability (A)',
                        'Throughput vs Latency',
                        'CPU vs Memory',
                      ],
                      correctAnswer: 1,
                      explanation: 'When network partitions occur, distributed systems must choose between returning consistent data or remaining available to accept writes.',
                    },
                  ],
                },
              },
            ],
          },
          {
            title: 'Module 2: Event-Driven Microservices & Message Brokers',
            description: 'Apache Kafka event streams, saga distributed transactions, and idempotency.',
            order: 2,
            lessons: [
              {
                title: 'Event-Driven Architectures with Apache Kafka & RabbitMQ',
                type: 'video',
                duration: '26:30',
                durationSeconds: 1590,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                content: 'Explore pub-sub message queues vs partitioned commit logs, consumer groups, backpressure handling, and exactly-once processing semantics.',
                isFreePreview: false,
              },
              {
                title: 'Distributed Transactions with the Saga Pattern',
                type: 'video',
                duration: '22:15',
                durationSeconds: 1335,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                content: 'Implement Choreography and Orchestration Saga workflows with compensating transactions to avoid two-phase commit bottlenecks.',
                isFreePreview: false,
              },
              {
                title: 'System Design & Distributed Architecture Final Exam',
                type: 'quiz',
                duration: '15:00',
                durationSeconds: 900,
                quiz: {
                  title: 'System Design Architect Certification Exam',
                  passingScore: 80,
                  questions: [
                    {
                      question: 'What is the primary purpose of compensating transactions in a Saga workflow?',
                      options: [
                        'Encrypt database rows',
                        'Undo previous successful local transactions if a subsequent step in the distributed workflow fails',
                        'Speed up Kafka consumer offsets',
                        'Compress message payloads',
                      ],
                      correctAnswer: 1,
                      explanation: 'Compensating transactions reverse partial changes when an end-to-end distributed business process fails partway through.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ];

    const createdCourses = await Course.create(coursesData);
    console.log(`Successfully created ${createdCourses.length} comprehensive courses with complete curricula.`);

    console.log('Seeding student enrollments with active learning progress, notes, and certificates...');
    const webDevCourse = createdCourses[0];
    const aiCourse = createdCourses[1];
    const designCourse = createdCourses[2];

    // Enrollment 1: In-progress Web Dev Course
    const lesson1Id = String(webDevCourse.modules[0].lessons[0]._id);
    const lesson2Id = String(webDevCourse.modules[0].lessons[1]._id);
    const lesson4QuizId = String(webDevCourse.modules[0].lessons[3]._id);

    await Enrollment.create({
      student: studentUser._id,
      course: webDevCourse._id,
      progress: 60,
      completedLessons: [
        { lessonId: lesson1Id, completedAt: new Date(Date.now() - 86400000 * 2) },
        { lessonId: lesson2Id, completedAt: new Date(Date.now() - 86400000) },
        { lessonId: lesson4QuizId, completedAt: new Date() },
      ],
      lastAccessedLesson: {
        moduleId: String(webDevCourse.modules[0]._id),
        lessonId: lesson2Id,
      },
      quizScores: [
        {
          lessonId: lesson4QuizId,
          lessonTitle: 'Module 1 Assessment: JavaScript Fundamentals Quiz',
          score: 100,
          totalQuestions: 3,
          passed: true,
          attemptedAt: new Date(),
        },
      ],
      notes: [
        {
          lessonId: lesson1Id,
          lessonTitle: 'Introduction & Development Environment Setup',
          timestamp: 120,
          text: 'Remember to install ESLint, Prettier, and Tailwind CSS IntelliSense for clean coding speed.',
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          lessonId: lesson2Id,
          lessonTitle: 'Modern JavaScript: ES6+, Arrow Functions & Destructuring',
          timestamp: 340,
          text: 'Arrow functions do not bind their own this context. Crucial for callbacks and event listeners.',
          createdAt: new Date(),
        },
      ],
      isCompleted: false,
    });

    // Enrollment 2: 100% Completed UI/UX Design Course with Certificate
    const designLesson1 = String(designCourse.modules[0].lessons[0]._id);
    const designLesson2 = String(designCourse.modules[0].lessons[1]._id);
    const designQuiz1 = String(designCourse.modules[0].lessons[2]._id);
    const designLesson3 = String(designCourse.modules[1].lessons[0]._id);
    const designLesson4 = String(designCourse.modules[1].lessons[1]._id);
    const designQuiz2 = String(designCourse.modules[1].lessons[2]._id);
    const designLesson5 = String(designCourse.modules[2].lessons[0]._id);
    const designLesson6 = String(designCourse.modules[2].lessons[1]._id);
    const designFinalQuiz = String(designCourse.modules[2].lessons[2]._id);

    await Enrollment.create({
      student: studentUser._id,
      course: designCourse._id,
      progress: 100,
      completedLessons: [
        { lessonId: designLesson1, completedAt: new Date(Date.now() - 86400000 * 5) },
        { lessonId: designLesson2, completedAt: new Date(Date.now() - 86400000 * 4) },
        { lessonId: designQuiz1, completedAt: new Date(Date.now() - 86400000 * 4) },
        { lessonId: designLesson3, completedAt: new Date(Date.now() - 86400000 * 3) },
        { lessonId: designLesson4, completedAt: new Date(Date.now() - 86400000 * 3) },
        { lessonId: designQuiz2, completedAt: new Date(Date.now() - 86400000 * 2) },
        { lessonId: designLesson5, completedAt: new Date(Date.now() - 86400000 * 2) },
        { lessonId: designLesson6, completedAt: new Date(Date.now() - 86400000) },
        { lessonId: designFinalQuiz, completedAt: new Date() },
      ],
      isCompleted: true,
      completedAt: new Date(Date.now() - 86400000),
      certificateId: 'CERT-SKILLFORGE-2026-UX99',
    });

    console.log('Seeding student reviews...');
    await Review.create([
      {
        course: webDevCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: 'Hands down the best web development course I have ever taken. Dr. Sarah explains complex React concepts with crystal clarity!',
      },
      {
        course: designCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: 'Incredible Figma course! The auto-layout section transformed how I structure UI components and design systems.',
      },
      {
        course: aiCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: 'The RAG pipeline and agentic workflow lectures are gold! Built my first production AI chatbot in days.',
      },
    ]);

    // Recalculate review averages
    await Review.calcAverageRating(webDevCourse._id);
    await Review.calcAverageRating(designCourse._id);
    await Review.calcAverageRating(aiCourse._id);

    console.log('=== Database Seeding Completed Successfully! ===');
    console.log('Total Courses Seeded:', createdCourses.length);
    console.log('Demo Credentials:');
    console.log('  Student:    student@skillforge.com / password123');
    console.log('  Instructor: instructor@skillforge.com / password123');
    console.log('  Admin:      admin@skillforge.com / password123');

    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seed process exited.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = seedData;
