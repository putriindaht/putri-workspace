import test from "node:test";
import assert from "node:assert/strict";
import { getPortfolioAnswer } from "../lib/portfolio-chat.ts";
import {
  profile,
  projects,
  experience,
  skills,
  education,
  contact,
} from "../lib/portfolio-data.ts";

const data = { profile, projects, experience, skills, education, contact };
const ask = (question) => getPortfolioAnswer(question, data);

test("suggested questions return the relevant portfolio content", () => {
  assert.match(ask("What does Putri work on?").text, /software engineer/);
  assert.match(ask("Tell me about Sicantik Idaman").text, /leave management/);
  assert.equal(ask("How did she get into software?").section, "about");
  assert.match(ask("How did she get into software?").text, /treasury/);
});

test("technical questions select relevant authored experience", () => {
  assert.match(
    ask("What gRPC work did she do at Cekat?").text,
    /Go gRPC services/,
  );
  assert.match(ask("What about WhatsApp calling?").text, /call events/);
  assert.match(
    ask("Tell me about her SLA analytics work").text,
    /SLA tracking/,
  );
  assert.match(
    ask("Has she worked with RabbitMQ?").text,
    /event-driven workflows/,
  );
});

test("answers use current portfolio data and do not invent unlisted facts", () => {
  assert.match(
    ask("How can I contact Putri?").text,
    new RegExp(contact.email.replaceAll(".", "\\.")),
  );
  assert.match(ask("What is her salary?").text, /isn’t listed/);
  assert.match(
    ask("Who is her favorite author?").text,
    /don’t have a specific answer/,
  );
  const changed = {
    ...data,
    profile: { ...profile, introduction: "Updated introduction." },
  };
  assert.match(
    getPortfolioAnswer("What does Putri work on?", changed).text,
    /Updated introduction/,
  );
});

test("message questions are not mistaken for unlisted age information", () => {
  assert.match(
    ask("What WhatsApp message processing has she worked on?").text,
    /Integrated/i,
  );
});

for (const [question, topic] of [
  ["tell me about sicantk", "project:Sicantik Idaman"],
  ["what frontend experence does she have?", "work:frontend"],
  ["has she worked with rabitmq?", "work:async"],
  ["what abot whatsapp caling?", "work:calling"],
  ["whats her gprc experence", "work:grpc"],
  ["What is her frontend stack?", "work:frontend"],
  ["Where is Putri based?", "location"],
])
  test(`natural or misspelled question: ${question}`, () => {
    assert.equal(ask(question).topic, topic);
  });

test("follow-ups stay with the project under discussion and can change topics", () => {
  const first = ask("tell me about sicantk");
  const history = [
    { id: 0, role: "user", text: "tell me about sicantk" },
    { id: 1, role: "assistant", engine: "guide", ...first },
  ];
  const stack = getPortfolioAnswer("What stack does it use?", data, history);
  assert.equal(stack.topic, "project:Sicantik Idaman");
  for (const tool of ["Go", "Gin", "GORM", "PostgreSQL", "JWT"])
    assert.ok(stack.text.includes(tool));
  assert.ok(!stack.suggestions.some((question) => question.includes("stack")));
  assert.doesNotMatch(stack.text, /Next.js/);
  const more = getPortfolioAnswer("Tell me more", data, history);
  assert.match(more.text, /June 2025/);
  assert.equal(
    getPortfolioAnswer("What about her calling work?", data, history).topic,
    "work:calling",
  );
  assert.equal(
    getPortfolioAnswer("What is its price?", data, history).topic,
    undefined,
  );
});

test("unlisted skills and unrelated questions do not become fuzzy factual claims", () => {
  for (const question of [
    "Does she know Rust?",
    "What Python experience does she have?",
    "Does she know Scala?",
    "What is the weather?",
    "Who is her favorite author?",
  ]) {
    assert.equal(ask(question).topic, undefined, question);
    assert.match(ask(question).text, /don’t have a specific answer/);
  }
});

test("greetings, thanks and vague questions receive conversational next steps", () => {
  assert.match(ask("Hello!").text, /^Hi!/);
  assert.match(ask("Thanks!").text, /You’re welcome/);
  assert.match(ask("Tell me more").text, /Which project/);
  assert.ok(ask("Hello!").suggestions.length > 0);
});

test("Pia introduces herself as the guide and keeps Putri’s identity separate", () => {
  for (const question of [
    "Who are you?",
    "What is your name?",
    "Are you Putri?",
  ]) {
    assert.match(ask(question).text, /I’m Pia, the guide to Putri’s portfolio/);
  }
  assert.match(ask("Hi Pia").text, /I’m Pia/);
  assert.equal(ask("Who is Putri?").topic, "about");
});

test("project overviews are compact and offer a route to the full list", () => {
  assert.doesNotMatch(ask("Tell me about her projects").text, /Moflix/);
  assert.match(ask("Show me all projects").text, /Moflix/);
  assert.ok(
    ask("Tell me about Golist").suggestions.some((q) => q.includes("stack")),
  );
});

test("project features are searchable without knowing the project name", () => {
  assert.equal(
    ask("Which project handles leave management?").topic,
    "project:Sicantik Idaman",
  );
});
