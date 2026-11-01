// Verified from Putri's supplied résumé and public GitHub on 29 October 2026.
// Employer work is summarized from the supplied résumé.
export const sections = [
  {
    id: "about",
    label: "About me",
    path: "/about",
    note: "Software engineering, with people in mind",
  },
  {
    id: "experience",
    label: "Experience",
    path: "/experience",
    note: "Building SaaS products, solving backend challenges, and growing across the stack. A look at the work and experience behind it.",
  },
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    note: "Professional contributions, personal projects, and hands-on learning. Explore what I’ve built and contributed to.",
  },
  {
    id: "skills",
    label: "Skills",
    path: "/skills",
    note: "The technologies behind my work and projects. From backend services and databases to frontend interfaces.",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
    note: "Let’s talk about software, systems, and ideas. Get in touch about a role, a project, or something you’re curious about.",
  },
] as const;
export type SectionId = (typeof sections)[number]["id"];

export const profile = {
  name: "Putri Indah Tresnawati",
  shortName: "Putri",
  role: "Software Engineer",
  focus: "Backend-first SaaS systems",
  location: "Tangerang, Indonesia",
  engineeringSince: 2023,
  introduction:
    "I build backend-first SaaS systems, from real-time messaging and APIs to billing and analytics, with frontend contributions in Next.js and React.",
  background:
    "Before becoming a software engineer, I worked in treasury, banking, social media, and customer-facing roles. Those experiences gave me a firsthand understanding of everyday business challenges and customer needs. Today, I bring that perspective to building software that makes people’s work easier.",
  interests: ["Event-driven systems", "Real-time APIs", "Product workflows"],
};

export const contact = {
  email: "putriindaht@gmail.com",
  github: "https://github.com/putriindaht",
  linkedin: "https://www.linkedin.com/in/putriindaht/",
  location: profile.location,
};

export const experience = [
  {
    role: "Software Engineer",
    company: "PT Teknologi Cekat Indonesia (Cekat AI)",
    location: "Jakarta, Indonesia",
    period: "October 2023 — Present",
    description:
      "Building SaaS products for omnichannel customer engagement, with backend and frontend development across messaging, billing, analytics, and agent management.",
    highlights: [
      "Integrated WhatsApp Business, Instagram, and Facebook Messenger for real-time messaging, webhooks, and contact synchronization.",
      "Built event-driven workflows for campaigns, follow-ups, and background jobs using Node.js, TypeScript, RabbitMQ, BullMQ, and Redis.",
      "Built Go gRPC services and TypeScript clients with shared Protobuf contracts for WhatsApp billing, balance reservations, and message authorization.",
      "Developed WhatsApp calling features across backend services and frontend interfaces, including call events, permissions, history, and balance checks.",
      "Contributed Next.js/React interfaces for chat, billing, agent management, and connected platforms, alongside backend work on public APIs, SLA tracking, and agent analytics.",
      "Improved production reliability and performance across APIs, queues, and databases through safer retries, error handling, and query optimization.",
    ],
  },
  {
    role: "Lending Treasury Officer",
    company: "PT LinkAja Modalin Indonesia (iGrow)",
    location: "Jakarta, Indonesia",
    period: "October 2021 — May 2023",
    description:
      "Managed financial reporting and reconciliation for lending operations.",
    highlights: [
      "Handled OJK reporting and financial reconciliations to support compliance and accurate records.",
      "Oversaw fund transfers, loan disbursements, and repayments.",
    ],
  },
  {
    role: "Customer Service Representative & Junior Funding Assistant",
    company: "PT Bank Syariah Indonesia (BNI Syariah)",
    location: "Bogor, Indonesia",
    period: "June 2019 — September 2021",
    description:
      "Supported banking customers and helped connect their needs with suitable financial services.",
    highlights: [
      "Resolved customer inquiries and concerns across banking services.",
      "Promoted banking products through customer meetings and personalized consultations.",
    ],
  },
  {
    role: "Social Media Officer",
    company: "MNC Media",
    location: "Jakarta, Indonesia",
    period: "February 2019 — May 2019",
    description:
      "Managed and monitored Twitter and Instagram channels, tracking engagement and emerging topics.",
    highlights: [
      "Produced monthly reports on social media performance and audience trends.",
    ],
  },
  {
    role: "Study Advisor",
    company: "Cakap",
    location: "Jakarta, Indonesia",
    period: "December 2018 — February 2019",
    description:
      "Presented learning programs and guided prospective customers through available packages.",
    highlights: [
      "Supported trial classes as an English translator between instructors and participants.",
    ],
  },
];

export const projects = [
  {
    name: "Cekat AI Chat",
    type: "WEB APPLICATION",
    period: "October 2023 — Present",
    featured: true,
    description:
      "Contributed to an omnichannel customer engagement platform spanning messaging, real-time agent workflows, campaigns, billing, analytics, and AI-powered knowledge.",
    stack: [
      "Node.js",
      "TypeScript",
      "Next.js",
      "React",
      "Go",
      "PostgreSQL",
      "MongoDB",
      "ClickHouse",
      "Redis",
      "RabbitMQ",
      "BullMQ",
      "Socket.IO",
    ],
    url: "https://chat.cekat.ai/",
    linkLabel: "Product website",
    visual: "messaging",
  },
  {
    name: "Sicantik Idaman",
    type: "BACKEND API",
    period: "June 2025",
    featured: true,
    description:
      "A Go backend for employee leave management, with JWT authentication, role-based approvals, and leave balance tracking.",
    stack: ["Go", "Gin", "GORM", "PostgreSQL", "JWT"],
    url: "https://github.com/putriindaht/sicantik-idaman",
    linkLabel: "Source code",
    visual: "web",
  },
  {
    name: "Golist",
    type: "CLI APPLICATION",
    period: "April 2024",
    featured: false,
    description:
      "A Go learning project: a lightweight command-line to-do app for adding, managing, and tracking tasks directly from the terminal.",
    stack: ["Go"],
    url: "https://github.com/putriindaht/golist",
    linkLabel: "Source code",
    visual: "terminal",
  },
  {
    name: "Serenify",
    type: "MOBILE APPLICATION",
    period: "August 2023",
    featured: false,
    description:
      "A mobile app designed to connect users with consultants, psychologists, and psychiatrists.",
    stack: [
      "React Native",
      "React",
      "Express.js",
      "PostgreSQL",
      "Firebase",
      "Expo",
      "AWS",
      "Daily",
      "Jest",
      "Supertest",
    ],
    url: "https://github.com/serenify-project",
    linkLabel: "Project organization",
    visual: "mobile",
  },
  {
    name: "Japanese Shelter",
    type: "WEB & MOBILE APPLICATION",
    period: "August 2023",
    featured: false,
    description:
      "A web and mobile news portal focused on Japan-related information for Indonesian readers.",
    stack: [
      "React Native",
      "Redux",
      "React",
      "Express.js",
      "Apollo Server",
      "PostgreSQL",
      "Apollo Client",
      "MongoDB",
      "Redis",
      "Expo",
      "AWS",
    ],
    url: "https://github.com/putriindaht/Japanese-shelter",
    linkLabel: "Source code",
    visual: "web",
  },
  {
    name: "Pinter Parkir",
    type: "WEB APPLICATION",
    period: "August 2023",
    featured: false,
    description:
      "A parking subscription application with QR-code entry and exit workflows and payment integration.",
    stack: [
      "Vue",
      "Pinia",
      "Express.js",
      "PostgreSQL",
      "Sequelize",
      "AWS",
      "Midtrans",
    ],
    url: "https://github.com/putriindaht/Pinter-parkir",
    linkLabel: "Source code",
    visual: "web",
  },
  {
    name: "Moflix",
    type: "WEB APPLICATION",
    period: "July 2023",
    featured: false,
    description:
      "A web application that helps users explore movies and decide what to watch next.",
    stack: ["Vue", "Pinia", "Express.js", "PostgreSQL", "Sequelize", "AWS"],
    url: "https://github.com/putriindaht/movlix",
    linkLabel: "Source code",
    visual: "web",
  },
];

export const skills = {
  "Backend & APIs": [
    "Node.js",
    "TypeScript",
    "JavaScript",
    "Go",
    "Express",
    "Echo",
    "REST APIs",
    "Webhooks",
  ],
  "Data & messaging": [
    "PostgreSQL",
    "MongoDB",
    "ClickHouse",
    "Redis",
    "RabbitMQ",
    "BullMQ",
    "Socket.IO",
  ],
  "Frontend & mobile": [
    "Next.js",
    "React",
    "React Native",
    "Redux",
    "Vue",
    "Pinia",
    "Expo",
  ],
  "Integrations & platforms": [
    "WhatsApp Business",
    "Instagram",
    "Facebook Messenger",
    "Supabase",
    "AWS S3",
    "Firebase",
    "Stripe",
    "Midtrans",
    "OpenAI / LangChain",
  ],
  "Testing & delivery": [
    "Jest",
    "Supertest",
    "Git",
    "GitHub Actions",
    "Supabase CLI",
  ],
  "AI tools": ["Codex", "OpenCode"],
};

export const education = [
  {
    school: "Hacktiv8",
    program: "Full Stack JavaScript Immersive Program",
    period: "May 2023 — September 2023",
    location: "Jakarta, Indonesia",
    detail: "",
  },
  {
    school: "Bogor Agricultural University (IPB)",
    program: "Bachelor of Sharia Economy",
    period: "2014 — 2018",
    location: "Bogor, Indonesia",
    detail: "GPA 3.70 / 4.00",
  },
];

export function getPortfolioResponse(section: SectionId) {
  const content = {
    about: { ...profile, education },
    experience,
    projects,
    skills,
    contact,
  };
  return { status: "200 OK", data: content[section] };
}
