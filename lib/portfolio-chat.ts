import Fuse from "fuse.js";
import type {
  profile,
  projects,
  experience,
  skills,
  education,
  contact,
  SectionId,
} from "./portfolio-data";

type Portfolio = {
  profile: typeof profile;
  projects: typeof projects;
  experience: typeof experience;
  skills: typeof skills;
  education: typeof education;
  contact: typeof contact;
};
export type PortfolioAnswer = {
  text: string;
  section?: SectionId;
  topic?: string;
  suggestions?: string[];
};
export type ChatMessage = PortfolioAnswer & {
  id: number;
  role: "user" | "assistant";
  engine?: "guide" | "webllm";
};
type Topic = {
  id: string;
  title: string;
  aliases: string[];
  section: SectionId;
  reply: (detail: boolean, stack: boolean) => string;
  suggestions: string[];
};
type SearchTopic = Topic & { searchAliases: string; content: string };
type Knowledge = {
  topics: Topic[];
  search: Fuse<SearchTopic>;
  words: Set<string>;
  vocabulary: Fuse<string>;
};
const indexes = new WeakMap<Portfolio, Knowledge>();
const stopWords = new Set(
  "a an the is are was were be been being do does did can could would should will please tell me about more some any of on in at for to from with and or but also she her hers he him his you your yours i im ive we they their them putri indah tresnawati whats what who how which when where why it its that this there these those has have had uses used use know knows using want like just really bit little explain walk through understand detail details much many then else another other built build builds worked working done doing contribute contributed handle handles brief briefly sentence sentences keep short version work get got show all full elaborate abot abt pls plz gimme hey hi hello thanks thank you ok okay yes sure".split(
    " ",
  ),
);
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/next\.js/g, "nextjs")
    .replace(/node\.js/g, "nodejs");
function terms(text: string): string {
  return (normalize(text).match(/[\p{L}\p{N}+#.-]+/gu) ?? [])
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .join(" ");
}
function thirdPerson(text: string): string {
  return text
    .replace(/^I build\b/, "She builds")
    .replace(/^I’m\b/, "She’s")
    .replace(/\bI worked\b/g, "she worked")
    .replace(/\bI bring\b/g, "she brings")
    .replace(/\bmy\b/g, "her");
}
function knowledgeFor(data: Portfolio): Knowledge {
  const cached = indexes.get(data);
  if (cached) return cached;
  const { profile, projects, experience, skills, education, contact } = data;
  const job = experience[0];
  const topics: Topic[] = [
    {
      id: "about",
      title: "About Putri",
      aliases: [
        "work",
        "software engineer",
        "backend",
        "fullstack",
        "full stack",
        "introduction",
        "specialty",
        "focus",
        "who is putri",
        "what does putri work on",
      ],
      section: "about",
      reply: () =>
        `${profile.shortName} is a ${profile.role.toLowerCase()} based in ${profile.location}.\n\n${thirdPerson(profile.introduction)}`,
      suggestions: ["What does she do at Cekat?", "Tell me about her projects"],
    },
    {
      id: "background",
      title: "Career journey",
      aliases: [
        "background",
        "journey",
        "career switch",
        "career change",
        "transition",
        "banking",
        "treasury",
        "customer service",
        "before software engineering",
        "become engineer",
        "into software",
        "social media",
      ],
      section: "about",
      reply: (detail) =>
        `${thirdPerson(profile.background).replace("Before becoming a software engineer, she", "Before becoming a software engineer, Putri")}${
          detail
            ? `\n\nHer earlier roles:\n${experience
                .slice(1)
                .map((e) => `${e.role} · ${e.company} (${e.period})`)
                .join("\n\n")}`
            : ""
        }`,
      suggestions: ["What does she work on now?", "Where did she study?"],
    },
    {
      id: "experience",
      title: "Work experience",
      aliases: [
        "experience",
        "employment",
        "job",
        "roles",
        "work history",
        "cekat",
        "cekat work",
        "current role",
        "now",
        "today",
      ],
      section: "experience",
      reply: (detail) =>
        detail
          ? experience
              .map(
                (e) =>
                  `${e.role} · ${e.company}\n${e.period}\n${e.description}`,
              )
              .join("\n\n")
          : `She’s a ${job.role} at ${job.company} (${job.period}).\n\n${job.description}`,
      suggestions: [
        "Tell me about her gRPC work",
        "What about WhatsApp calling?",
        "Tell me about her career journey",
      ],
    },
    {
      id: "projects",
      title: "Projects",
      aliases: [
        "projects",
        "portfolio",
        "side projects",
        "personal projects",
        "applications",
        "application",
        "apps",
        "app",
        "examples",
        "showcase",
      ],
      section: "projects",
      reply: (detail) => {
        const selected = detail ? projects : projects.filter((p) => p.featured);
        return `${detail ? "Here’s the full project list" : "A couple of good places to start"}:\n\n${selected.map((p) => `${p.name} — ${p.description}`).join("\n\n")}`;
      },
      suggestions: [
        "Tell me about Sicantik Idaman",
        "Tell me about Golist",
        "Show me all projects",
      ],
    },
    {
      id: "skills",
      title: "Skills and tools",
      aliases: [
        "skills",
        "tools",
        "technologies",
        "tech",
        "stack",
        "languages",
        "programming",
        "frameworks",
        "databases",
      ],
      section: "skills",
      reply: (detail) => {
        const entries = detail
          ? Object.entries(skills)
          : Object.entries(skills).slice(0, 3);
        return `Her toolkit spans backend, data, and frontend development:\n\n${entries.map(([category, tools]) => `${category}: ${tools.join(", ")}`).join("\n\n")}`;
      },
      suggestions: [
        "What frontend work has she done?",
        "Tell me about her gRPC work",
      ],
    },
    {
      id: "education",
      title: "Education",
      aliases: [
        "education",
        "studied",
        "study",
        "university",
        "college",
        "bootcamp",
        "hacktiv8",
        "degree",
        "learn",
        "training",
        "ipb",
      ],
      section: "about",
      reply: () =>
        education
          .map(
            (e) =>
              `${e.school} · ${e.period}\n${e.program}${e.detail ? ` · ${e.detail}` : ""}`,
          )
          .join("\n\n"),
      suggestions: [
        "Tell me about her career journey",
        "What does she work on now?",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      aliases: [
        "contact",
        "email",
        "reach",
        "hire",
        "hiring",
        "linkedin",
        "github",
        "connect",
        "get in touch",
        "collaborate",
      ],
      section: "contact",
      reply: () =>
        `You can email Putri at ${contact.email}.\n\nYou’ll also find her LinkedIn and GitHub links in the Contact section.`,
      suggestions: ["What does Putri work on?", "Show me her projects"],
    },
    {
      id: "location",
      title: "Location",
      aliases: [
        "location",
        "based",
        "live",
        "lives",
        "city",
        "country",
        "located",
      ],
      section: "contact",
      reply: () => `She’s based in ${profile.location}.`,
      suggestions: ["How can I contact her?"],
    },
  ];
  const features: {
    id: string;
    title: string;
    aliases: string[];
    highlight: RegExp;
  }[] = [
    {
      id: "grpc",
      title: "gRPC services",
      aliases: [
        "grpc",
        "protobuf",
        "rpc",
        "go services",
        "golang services",
        "service communication",
      ],
      highlight: /gRPC/,
    },
    {
      id: "calling",
      title: "WhatsApp calling",
      aliases: [
        "whatsapp calling",
        "calls",
        "call events",
        "call permissions",
        "call history",
        "voice",
        "calling",
        "real time calling",
      ],
      highlight: /calling features/,
    },
    {
      id: "async",
      title: "Background processing",
      aliases: [
        "rabbitmq",
        "bullmq",
        "queue",
        "queues",
        "event driven",
        "background processing",
        "background jobs",
        "campaigns",
        "followups",
        "follow-ups",
        "workers",
        "asynchronous",
      ],
      highlight: /event-driven/,
    },
    {
      id: "frontend",
      title: "Frontend development",
      aliases: [
        "frontend",
        "front end",
        "react",
        "nextjs",
        "interfaces",
        "agent management",
        "connected platforms",
        "ui",
        "user interface",
      ],
      highlight: /Next.js/,
    },
    {
      id: "messaging",
      title: "Messaging integrations",
      aliases: [
        "messaging",
        "messages",
        "message processing",
        "whatsapp",
        "instagram",
        "messenger",
        "webhooks",
        "contacts",
        "contact synchronization",
        "omnichannel",
        "chat",
      ],
      highlight: /Integrated/,
    },
    {
      id: "analytics",
      title: "SLA and agent analytics",
      aliases: [
        "sla",
        "analytics",
        "analysis",
        "response time",
        "resolution",
        "agent analytics",
        "tracking",
        "reporting",
      ],
      highlight: /SLA tracking/,
    },
    {
      id: "billing",
      title: "WhatsApp billing",
      aliases: [
        "billing",
        "balance",
        "reservations",
        "message authorization",
        "credit",
        "payment",
        "payments",
      ],
      highlight: /WhatsApp billing/,
    },
    {
      id: "reliability",
      title: "Production reliability",
      aliases: [
        "reliability",
        "performance",
        "retries",
        "retry",
        "production",
        "caching",
        "optimization",
        "optimisation",
        "query optimization",
        "errors",
        "database performance",
      ],
      highlight: /reliability/,
    },
    {
      id: "apis",
      title: "Public APIs",
      aliases: [
        "api",
        "apis",
        "public api",
        "open api",
        "endpoints",
        "rest api",
      ],
      highlight: /public APIs/,
    },
  ];
  for (const feature of features)
    topics.push({
      id: `work:${feature.id}`,
      title: feature.title,
      aliases: [
        ...feature.aliases,
        "experience",
        "cekat",
        "stack",
        "tools",
        "technologies",
        "job",
        "role",
      ],
      section: "experience",
      reply: () => {
        const highlights = job.highlights.filter((h) =>
          feature.highlight.test(h),
        );
        return `At Cekat AI, ${highlights.map((h) => `she ${h.charAt(0).toLowerCase()}${h.slice(1)}`).join("\n\n")}`;
      },
      suggestions: ["What does she do at Cekat?", "What tools does she use?"],
    });
  for (const project of projects)
    topics.push({
      id: `project:${project.name}`,
      title: project.name,
      aliases: [
        project.name,
        project.name.split(" ")[0],
        `${project.name} project`,
        `${project.name} stack`,
        `${project.name} technologies`,
        `${project.name} tools`,
        `${project.name} detail`,
        ...(project.name === "Cekat AI Chat"
          ? ["cekat ai", "cekat project", "cekat chat"]
          : []),
      ],
      section: "projects",
      reply: (detail, stack) => {
        if (stack)
          return `${project.name} uses ${new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(project.stack)}.`;
        const opening = project.description.startsWith("A ")
          ? `${project.name} is a ${project.description.slice(2)}`
          : `${project.name}\n${project.description}`;
        return `${opening}${detail ? `\n\nStack: ${project.stack.join(", ")}.\n${project.period ? `Project period: ${project.period}.\n` : ""}Explore the source or product through the Projects section.` : ""}`;
      },
      suggestions: [
        `What stack does ${project.name} use?`,
        "Show me other projects",
      ],
    });
  const records = topics.map((topic) => {
    const project = projects.find(
      (project) => topic.id === `project:${project.name}`,
    );
    const feature = features.find(
      (feature) => topic.id === `work:${feature.id}`,
    );
    const content = project
      ? `${project.description} ${project.stack.join(" ")}`
      : feature
        ? job.highlights
            .filter((highlight) => feature.highlight.test(highlight))
            .join(" ")
        : topic.id === "skills"
          ? Object.values(skills).flat().join(" ")
          : topic.id === "education"
            ? education
                .map((item) => `${item.school} ${item.program}`)
                .join(" ")
            : "";
    return {
      ...topic,
      searchAliases: [...new Set(topic.aliases)].join(" "),
      content,
    };
  });
  const search = new Fuse(records, {
    keys: [
      { name: "title", weight: 0.4 },
      { name: "searchAliases", weight: 0.55 },
      { name: "content", weight: 0.05 },
    ],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.28,
    useTokenSearch: true,
    tokenMatch: "all",
    minMatchCharLength: 2,
  });
  const words = new Set(
    records.flatMap(
      (record) =>
        normalize(
          `${record.title} ${record.searchAliases} ${record.content}`,
        ).match(/[\p{L}\p{N}+#.-]+/gu) ?? [],
    ),
  );
  const vocabulary = new Fuse([...words], {
    includeScore: true,
    threshold: 0.28,
    ignoreLocation: true,
  });
  const knowledge = { topics, search, words, vocabulary };
  indexes.set(data, knowledge);
  return knowledge;
}

export function getPortfolioAnswer(
  question: string,
  data: Portfolio,
  history: ChatMessage[] = [],
): PortfolioAnswer {
  const q = normalize(question)
    .trim()
    .replace(/[?!.,]+$/, "");
  const previous = [...history]
    .reverse()
    .find((message) => message.role === "assistant");
  const knowledge = knowledgeFor(data);
  const lastTopic = knowledge.topics.find(
    (topic) => topic.id === previous?.topic,
  );
  const reply = (
    topic: Topic,
    detail = false,
    stack = false,
  ): PortfolioAnswer => ({
    text: topic.reply(detail, stack),
    topic: topic.id,
    section: topic.section,
    suggestions:
      stack && topic.id.startsWith("project:")
        ? [`Tell me more about ${topic.title}`, "Show me other projects"]
        : detail && topic.id === "projects"
          ? topic.suggestions.slice(0, 2)
          : topic.suggestions,
  });
  if (
    /\b(salary|available|availability|notice period|visa|married|age|birthday)\b/.test(
      q,
    )
  ) {
    return {
      text: "That information isn’t listed in Putri’s portfolio. You can contact her directly to ask.",
      section: "contact",
      suggestions: ["How can I contact Putri?"],
    };
  }
  if (
    /^(who are you|who is pia|whats your name|what is your name|are you (pia|putri)|introduce yourself)$/.test(
      q,
    )
  ) {
    return {
      text: "I’m Pia, the guide to Putri’s portfolio. I can help you explore her work, projects, and career journey.",
      suggestions: ["What does Putri work on?", "Tell me about her projects"],
    };
  }
  if (
    /^(hi|hey|hello|halo|hai|good morning|good afternoon|good evening)( there| putri| pia)?$/.test(
      q,
    )
  ) {
    return {
      text: "Hi! I’m Pia. I can help you explore Putri’s work, projects, and career journey. What would you like to know?",
      suggestions: [
        "What does Putri work on?",
        "Tell me about her projects",
        "How did she get into software?",
      ],
    };
  }
  if (
    /^(thanks|thank you|thankyou|thank you so much|thanks a lot|makasih|terima kasih|ok|okay|great|cool|nice)( for (that|the help))?$/.test(
      q,
    )
  ) {
    return {
      text: "You’re welcome! If you’d like to explore more, you can ask about another project or part of her experience.",
      topic: previous?.topic,
      suggestions: ["Tell me about her projects", "How can I contact Putri?"],
    };
  }
  const query = terms(question);
  const detail = /\b(more|detail|details|all|full|everything)\b/.test(q);
  const stack = /\b(stack|technolog\w*|tools|built with|made with)\b/.test(q);
  const relative = /\b(it|its|that|this|there)\b/.test(q);
  if (
    lastTopic &&
    ((relative && !query) ||
      /^(tell me more|more|go on|what else|and then|yes please|more details|can you elaborate|tell me more about (it|that))$/.test(
        q,
      ))
  )
    return reply(lastTopic, true, stack);
  if (
    lastTopic?.id.startsWith("project:") &&
    stack &&
    (relative || /^(stack|tech|technologies|tools)$/.test(query))
  )
    return reply(lastTopic, detail, true);
  if (!query) {
    if (/who|what.*(do|work)|introduc|about putri/.test(q))
      return reply(knowledge.topics[0]);
    return {
      text: "Which project or part of Putri’s experience would you like to explore?",
      suggestions: [
        "What does Putri work on?",
        "Tell me about Sicantik Idaman",
        "Tell me about her career journey",
      ],
    };
  }
  // Match whole vocabulary words before searching topics. This keeps partial-word
  // matches such as "price" → "processing" from inventing an unrelated answer.
  const canonical = query.split(" ").map((word) => {
    if (knowledge.words.has(word)) return word;
    if (word.length <= 4) {
      const swapped = [...knowledge.words].filter(
        (candidate) =>
          candidate.length === word.length &&
          [...candidate].sort().join("") === [...word].sort().join(""),
      );
      return swapped.length === 1 ? swapped[0] : undefined;
    }
    const candidates = knowledge.vocabulary.search(word).filter((result) => {
      const candidate = result.item;
      return (
        Math.abs(candidate.length - word.length) <=
        Math.min(2, Math.floor(word.length * 0.2))
      );
    });
    return candidates[0]?.item;
  });
  const results = canonical.some((word) => !word)
    ? []
    : knowledge.search.search(canonical.join(" "), { limit: 3 });
  if (results.length) return reply(results[0].item, detail, stack);
  return {
    text: "I don’t have a specific answer to that in Putri’s portfolio. Could you name a project, a technology, or a part of her experience you’d like to explore?",
    suggestions: [
      "Tell me about her gRPC work",
      "Tell me about Sicantik Idaman",
      "How can I contact Putri?",
    ],
  };
}
