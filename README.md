# Putri Workspace

A personal portfolio for Putri Indah Tresnawati, a software engineer working on backend-first SaaS products and fullstack development.

The portfolio uses an API workspace interface with collection navigation, readable previews, JSON responses, a simple résumé, and an assistant named Pia.

## Portfolio content

- **About me** — professional introduction, selected work, background, and education.
- **Experience** — current and previous roles, responsibilities, and contributions.
- **Projects** — professional contributions, backend applications, and learning projects with technology stacks and links.
- **Skills** — backend, frontend, databases, messaging, integrations, testing, delivery, and AI tools.
- **Contact** — email copying, an email shortcut, and LinkedIn and GitHub profiles.

## Features

- Collapsible **Meet Putri** collection and searchable section navigation.
- **Preview** and **JSON** views for each portfolio section.
- **Simple résumé** view for reading experience, projects, skills, education, and contact information in a familiar format.
- **Chat** in a sidebar or dedicated view, with shared conversation history and drafts.
- Fixed navigation, request controls, and footer, with independently scrolling content.
- Responsive side panels and keyboard-accessible controls.
- Midnight Indigo styling with light and dark appearances.

## Pia, the portfolio assistant

Pia answers questions about Putri’s work, projects, skills, and career. Two chat modes are available:

| Mode | Description |
| --- | --- |
| **Portfolio guide** | Uses Fuse.js to match questions against portfolio content. Supports suggested questions, follow-ups, and links to relevant sections. No model download is required. |
| **WebLLM AI** | Generates responses locally in the browser using Qwen 2.5 0.5B. Requires WebGPU and an explicit model download on first use. |

Portfolio Guide replies show a short preparation indicator before appearing. WebLLM supports loading progress, cancellation, streamed responses, and stopping a reply. Pia describes Putri’s experience in third person.

No AI API key or hosted AI service is required. WebLLM answers may be inaccurate; portfolio sections provide the reference information.

## Technology

- Next.js, React, and TypeScript
- CSS with shared theme and typography variables
- Fuse.js for portfolio question matching
- WebLLM with a Web Worker for optional browser-based AI
- Lucide icons
- Prettier for code formatting

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Generate the static site in `out/`. |
| `npm run typecheck` | Check TypeScript types. |
| `npm run test:chat` | Run portfolio guide, AI prompt, and worker runtime tests. |
| `npm run test:themes` | Run appearance and theme tests. |
| `npm run format` | Format project source and configuration files. |
| `npm run format:check` | Check formatting without changing files. |

## Project structure

```text
app/
  assets/                  Brand assets
  components/              Chat, JSON response, and theme components
  page.tsx                 Portfolio workspace and section views
  layout.tsx               Application layout
  *.css                    Workspace, content, chat, and theme styles
lib/
  portfolio-data.ts        Profile, experience, projects, skills, and contact data
  portfolio-chat.ts        Portfolio Guide answers and question matching
  webllm-prompt.ts          AI instructions and portfolio context
  webllm-runtime.ts         Worker startup and cancellation
  webllm.worker.ts          Browser AI worker
  themes.ts                Appearance configuration
  theme-bootstrap.ts       Initial appearance setup
tests/                     Chat and theme tests
```

## Update portfolio content

Edit `lib/portfolio-data.ts` to update portfolio information. The previews, JSON responses, résumé, and assistant context use this shared data.

## Static build

```sh
npm run build
```

The generated site is available in `out/`. For a GitHub Pages build under `/putri-workspace`, use:

```sh
GITHUB_PAGES=true npm run build
```
