"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import linkedinLogoBlack from "./assets/linkedin-logo-black.png";
import linkedinLogoWhite from "./assets/linkedin-logo-white.png";
import githubLogoBlack from "./assets/github-logo-black.svg";
import githubLogoWhite from "./assets/github-logo-white.svg";
import { JsonResponse } from "./components/json-response";
import { ChatView } from "./components/chat-view";
import { usePortfolioChat } from "./components/use-portfolio-chat";
import { useTheme } from "./components/theme-provider";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileText,
  Folder,
  Github,
  Globe2,
  Layers3,
  MessageSquare,
  Moon,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  Search,
  Send,
  Sun,
  Terminal,
} from "lucide-react";
import {
  contact,
  education,
  experience,
  getPortfolioResponse,
  profile,
  projects,
  sections,
  skills,
  type SectionId,
} from "../lib/portfolio-data";

function ContactDetails() {
  const { resolvedMode } = useTheme();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="contact-details">
      <section
        className="contact-email-lead"
        aria-labelledby="contact-email-title"
      >
        <h2
          className="contact-method-title"
          id="contact-email-title"
        >
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill={resolvedMode === "dark" ? "#fff" : "#000"}
            aria-hidden="true"
            focusable="false"
          >
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
          </svg>
          Email
        </h2>
        <div className="contact-method-actions">
          <button
            onClick={copyEmail}
            aria-label="Copy email address"
          >
            {copyStatus === "copied" ? (
              <CheckCheck
                size={15}
                aria-hidden="true"
              />
            ) : (
              <Copy
                size={15}
                aria-hidden="true"
              />
            )}
            {copyStatus === "copied" ? "Copied" : "Copy email"}
          </button>
          <a href={`mailto:${contact.email}`}>
            Send email
            <ArrowUpRight
              size={15}
              aria-hidden="true"
            />
          </a>
        </div>
        <span
          className={copyStatus === "error" ? "contact-copy-error" : "sr-only"}
          role="status"
        >
          {copyStatus === "copied"
            ? "Email address copied."
            : copyStatus === "error"
              ? "Couldn’t copy. Use Send email to contact me."
              : ""}
        </span>
      </section>
      <div className="contact-socials">
        <section aria-labelledby="contact-linkedin-title">
          <h2
            className="contact-method-title"
            id="contact-linkedin-title"
          >
            <Image
              src={
                resolvedMode === "dark" ? linkedinLogoWhite : linkedinLogoBlack
              }
              alt=""
              width={24}
              height={22}
              unoptimized
              className="contact-brand-logo"
            />
            LinkedIn
          </h2>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="View LinkedIn profile"
          >
            View profile
            <ArrowUpRight
              size={15}
              aria-hidden="true"
            />
          </a>
        </section>
        <section aria-labelledby="contact-github-title">
          <h2
            className="contact-method-title"
            id="contact-github-title"
          >
            <Image
              src={resolvedMode === "dark" ? githubLogoWhite : githubLogoBlack}
              alt=""
              width={22}
              height={22}
              unoptimized
              className="contact-brand-logo"
            />
            GitHub
          </h2>
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Explore GitHub code"
          >
            Explore code
            <ArrowUpRight
              size={15}
              aria-hidden="true"
            />
          </a>
        </section>
      </div>
    </div>
  );
}

export default function Workspace() {
  const [section, setSection] = useState<SectionId>("about");
  const [view, setView] = useState<"preview" | "json">("preview");
  const { resolvedMode: theme, setAppearance } = useTheme();
  const [mode, setMode] = useState<"explore" | "resume" | "chat">("explore");
  const resume = mode === "resume";
  const exploring = mode === "explore";
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [compact, setCompact] = useState(false);
  const [panelTop, setPanelTop] = useState(114);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLElement>(null);
  const responsePanelRef = useRef<HTMLDivElement>(null);
  const resumePanelRef = useRef<HTMLDivElement>(null);
  const collectionsToggleRef = useRef<HTMLButtonElement>(null);
  const detailsToggleRef = useRef<HTMLButtonElement>(null);
  const showCollections = exploring && collectionsOpen;
  const showDetails = exploring && detailsOpen;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const syncLayout = () => {
      setCompact(media.matches);
      if (media.matches) {
        setCollectionsOpen(false);
        setDetailsOpen(false);
      }
    };
    syncLayout();
    media.addEventListener("change", syncLayout);
    return () => media.removeEventListener("change", syncLayout);
  }, []);

  useEffect(() => {
    const updateTop = () =>
      setPanelTop(
        Math.max(0, toolbarRef.current?.getBoundingClientRect().bottom ?? 114),
      );
    updateTop();
    const observer = new ResizeObserver(updateTop);
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    window.addEventListener("resize", updateTop);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateTop);
    };
  }, []);

  useEffect(() => {
    for (const panel of [
      mainPanelRef.current,
      responsePanelRef.current,
      resumePanelRef.current,
    ]) {
      if (panel) {
        panel.scrollTop = 0;
        panel.scrollLeft = 0;
      }
    }
  }, [section, view, mode]);

  function focusContent() {
    requestAnimationFrame(() =>
      (
        responsePanelRef.current ??
        resumePanelRef.current ??
        mainPanelRef.current
      )?.focus({ preventScroll: true }),
    );
  }
  function selectExplore() {
    setMode("explore");
    if (compact) {
      setCollectionsOpen(false);
      setDetailsOpen(false);
    }
    focusContent();
  }
  function selectResume() {
    setMode("resume");
    focusContent();
  }
  function selectChat() {
    setMode("chat");
    focusContent();
  }
  function focusPanel(id: string) {
    requestAnimationFrame(() =>
      document.getElementById(id)?.focus({ preventScroll: true }),
    );
  }
  function toggleCollections() {
    const open = !showCollections;
    setMode("explore");
    setCollectionsOpen(open);
    if (compact && open) setDetailsOpen(false);
    if (open) focusPanel("collections-panel");
    else collectionsToggleRef.current?.focus();
  }
  function toggleDetails() {
    const open = !showDetails;
    setMode("explore");
    setDetailsOpen(open);
    if (compact && open) setCollectionsOpen(false);
    if (open) focusPanel("chat-panel");
    else detailsToggleRef.current?.focus();
  }
  function hideCollections() {
    setCollectionsOpen(false);
    collectionsToggleRef.current?.focus();
  }
  function hideDetails() {
    setDetailsOpen(false);
    detailsToggleRef.current?.focus();
  }
  function dismissPanels() {
    setCollectionsOpen(false);
    setDetailsOpen(false);
    (showDetails ? detailsToggleRef : collectionsToggleRef).current?.focus();
  }
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const chat = usePortfolioChat();
  const chatProps = { ...chat, onExplore: selectExplore, onNavigate: navigate };
  const current = sections.find((item) => item.id === section)!;

  function navigate(id: SectionId) {
    setSection(id);
    setView("preview");
    setMode("explore");
    setCopied(false);
    if (compact) {
      setCollectionsOpen(false);
      setDetailsOpen(false);
    }
    focusContent();
  }
  async function copyResponse() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(getPortfolioResponse(section), null, 2),
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function ProjectCards({ featured = false }: { featured?: boolean } = {}) {
    const visible = featured
      ? projects.filter((project) => project.featured)
      : projects;
    return (
      <div className="project-grid">
        {visible.map((project) => (
          <article
            className="project-card"
            key={project.name}
          >
            <div
              className={`project-art project-visual ${project.visual}`}
              aria-hidden="true"
            >
              <span className="project-visual-kind">{project.type}</span>
              <span className="project-visual-icon">
                {project.visual === "terminal" ? (
                  <Terminal size={36} />
                ) : project.visual === "messaging" ? (
                  <MessageSquare size={36} />
                ) : project.visual === "automation" ? (
                  <Layers3 size={36} />
                ) : (
                  <Code2 size={36} />
                )}
              </span>
              <span className="project-visual-name">{project.name}</span>
              <span className="project-visual-stack">
                {project.stack.slice(0, 3).join(" / ")}
              </span>
            </div>
            <div className="project-details">
              <span className="eyebrow">{project.type}</span>
              <h3>{project.name}</h3>
              {project.period && (
                <div className="project-period">{project.period}</div>
              )}
              <p>{project.description}</p>
              <div className="tags">
                {project.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <a
                className="text-button project-link"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.linkLabel}: ${project.name}`}
              >
                {project.linkLabel}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
    );
  }

  function ExperienceList() {
    return (
      <div className="timeline">
        {experience.map((job) => (
          <article key={job.company}>
            <div className="timeline-dot" />
            <span className="eyebrow">{job.period}</span>
            <h3>{job.role}</h3>
            <div className="company">{job.company}</div>
            <div className="experience-location">{job.location}</div>
            <p>{job.description}</p>
            <ul className="experience-highlights">
              {job.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    );
  }

  function EducationList() {
    return (
      <div className="education-list">
        {education.map((item) => (
          <article key={item.school}>
            <span className="eyebrow">{item.period}</span>
            <h3>{item.school}</h3>
            <p>{item.program}</p>
            <span className="education-detail">
              {item.location}
              {item.detail && ` · ${item.detail}`}
            </span>
          </article>
        ))}
      </div>
    );
  }

  function SkillsList() {
    return (
      <div className="skills-list">
        {Object.entries(skills).map(([category, values]) => (
          <article key={category}>
            <h3>{category}</h3>
            <div className="tags">
              {values.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    );
  }

  function Introduction() {
    return (
      <>
        <div className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">
              <span /> SOFTWARE ENGINEER · BACKEND FIRST
            </span>
            <h1>
              Backend at heart.
              <br />
              Fullstack in <em>practice.</em>
            </h1>
            <p>
              Hi, I’m {profile.name} <span className="wave">↗</span>
              <br />
              {profile.introduction}
            </p>
            <button
              className="primary"
              onClick={() => navigate("projects")}
            >
              Explore my work <ArrowUpRight size={16} />
            </button>
          </div>
          <div
            className="hero-illustration"
            aria-hidden="true"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="floating-spark">✳</span>
            <div className="profile-code">
              <div className="code-window">
                <span />
                <span />
                <span />
                <small>profile.ts</small>
              </div>
              <div className="code-lines">
                <span className="code-comment">
                  // backend-first, since 2023
                </span>
                <div>
                  <b>const</b> putri = {"{"}
                </div>
                <div>
                  &nbsp; role: <i>"Software Engineer"</i>,
                </div>
                <div>
                  &nbsp; focus: <i>"Backend Systems"</i>,
                </div>
                <div>
                  &nbsp; since: <i>2023</i>
                </div>
                <div>{"}"};</div>
                <div className="code-last">
                  let’s build something
                  <span className="cursor" />
                </div>
              </div>
            </div>
            <span className="little-note">
              made of code & curiosity <ArrowDownLeft size={15} />
            </span>
          </div>
        </div>
        <div className="about-strip">
          <div>
            <Globe2 size={15} />
            <span>Based in {profile.location}</span>
          </div>
          <span className="strip-divider" />
          {profile.interests.map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECTED WORK & CONTRIBUTIONS</span>
            <h2>
              Selected work<span>.</span>
            </h2>
          </div>
          <button
            className="text-button"
            onClick={() => navigate("projects")}
          >
            All projects <ArrowRight size={15} />
          </button>
        </div>
        <ProjectCards featured />
        <div className="section-heading">
          <div>
            <h2>
              A little background<span>.</span>
            </h2>
          </div>
        </div>
        <p className="about-background">{profile.background}</p>
        <EducationList />
        <div className="bottom-note">
          <span>Good things start with a little curiosity.</span>
          <button
            className="text-button"
            onClick={() => navigate("contact")}
          >
            Let’s connect <ArrowUpRight size={15} />
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      className="workspace"
      style={{ "--panel-top": `${panelTop}px` } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if ((event.target as Element).closest("#collections-panel"))
          hideCollections();
        else if ((event.target as Element).closest("#chat-panel"))
          hideDetails();
        else if (compact && (showCollections || showDetails)) dismissPanels();
      }}
    >
      <a
        className="skip-link"
        href="#portfolio-content"
      >
        Skip to portfolio
      </a>
      <header className="topbar">
        <div className="brand">
          <div className="brand-symbol">
            <Layers3 size={21} />
          </div>
          <span>
            putri<span className="brand-light"> / workspace</span>
          </span>
          <span className="version">v.01</span>
        </div>
        <div className="top-actions">
          <div className="workspace-actions">
            <button
              className="resume-button"
              onClick={exploring ? selectResume : selectExplore}
              aria-label={exploring ? "View résumé" : "Explore portfolio"}
              title={exploring ? "Read the résumé" : "Explore portfolio"}
            >
              {exploring ? <FileText size={15} /> : <Layers3 size={15} />}
              <span>{exploring ? "Résumé" : "Explore"}</span>
            </button>
          </div>
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            aria-label="View Putri’s GitHub profile"
            title="GitHub profile"
          >
            <Github size={18} />
          </a>
          <button
            className="icon-button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => setAppearance(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <span className="avatar">P</span>
        </div>
      </header>
      <div
        className="workspace-body"
        data-view={mode}
        data-collections={showCollections ? "open" : "closed"}
        data-details={showDetails ? "open" : "closed"}
        data-compact={compact}
      >
        {compact && (showCollections || showDetails) && (
          <button
            className="panel-dismiss"
            tabIndex={-1}
            aria-label="Close side panels"
            onClick={dismissPanels}
          />
        )}
        <nav
          className="icon-rail"
          aria-label="Portfolio navigation"
        >
          <button
            className={`rail-button ${exploring ? "active" : ""}`}
            onClick={selectExplore}
            aria-current={exploring ? "page" : undefined}
            title="Explore the portfolio"
          >
            <Layers3 size={20} />
            <span>Explore</span>
          </button>
          <button
            className={`rail-button ${resume ? "active" : ""}`}
            onClick={selectResume}
            aria-current={resume ? "page" : undefined}
            title="Read the résumé"
          >
            <FileText size={20} />
            <span>Résumé</span>
          </button>
          <button
            className={`rail-button ${mode === "chat" ? "active" : ""}`}
            onClick={selectChat}
            aria-current={mode === "chat" ? "page" : undefined}
            title="Open the dedicated chat view"
          >
            <MessageSquare size={20} />
            <span>Chat</span>
          </button>
        </nav>
        {showCollections && (
          <aside
            className="sidebar"
            id="collections-panel"
            aria-label="Collections"
            tabIndex={-1}
          >
            <div className="sidebar-title">
              <span>
                <Folder
                  size={16}
                  aria-hidden="true"
                />
                Collections
              </span>
              <button
                className="icon-button"
                onClick={hideCollections}
                aria-label="Collapse Collections"
                title="Collapse left sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
            <button
              type="button"
              className="sidebar-note recruiter-entry"
              onClick={selectResume}
            >
              <span className="recruiter-heading">
                <FileText size={18} />
                <strong>Not a developer?</strong>
              </span>
              <span className="recruiter-copy">
                Read my experience and projects in a simple résumé.
              </span>
              <span className="recruiter-action">
                View résumé <ArrowRight size={16} />
              </span>
            </button>
            <label className="search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSectionsExpanded(true);
                }}
                placeholder="Find a section…"
                aria-label="Find a section"
              />
            </label>
            <button
              type="button"
              className="collection-name"
              aria-label="Meet Putri"
              aria-expanded={sectionsExpanded}
              aria-controls="portfolio-sections"
              onClick={() => setSectionsExpanded((open) => !open)}
            >
              <ChevronDown
                className="collection-chevron"
                size={14}
                aria-hidden="true"
              />
              <Folder
                size={16}
                aria-hidden="true"
              />
              <strong>Meet Putri</strong>
            </button>
            <div
              className="nav-items"
              id="portfolio-sections"
              hidden={!sectionsExpanded}
            >
              {sections
                .filter((item) =>
                  item.label.toLowerCase().includes(query.toLowerCase()),
                )
                .map((item) => (
                  <button
                    key={item.id}
                    className={section === item.id ? "active" : ""}
                    onClick={() => navigate(item.id)}
                  >
                    <span className="method">GET</span>
                    <span>{item.label}</span>
                    {section === item.id && <span className="active-dot" />}
                  </button>
                ))}
              {!sections.some((item) =>
                item.label.toLowerCase().includes(query.toLowerCase()),
              ) && <p className="no-results">No matching sections.</p>}
            </div>
            <div className="sidebar-footer">
              <span className="status-dot" /> A little different. Still me.
            </div>
          </aside>
        )}
        <main
          ref={mainPanelRef}
          className="main-panel"
          id="portfolio-content"
          tabIndex={-1}
        >
          {mode === "chat" ? (
            <ChatView {...chatProps} />
          ) : resume ? (
            <>
              <div className="document-top">
                <FileText size={16} /> résumé / preview{" "}
                <button
                  className="text-button"
                  onClick={selectExplore}
                >
                  <ArrowLeft size={15} />
                  Back to workspace
                </button>
              </div>
              <div
                ref={resumePanelRef}
                className="resume-content"
                tabIndex={0}
                role="region"
                aria-label="Simple résumé"
              >
                <span className="eyebrow">PUTRI INDAH TRESNAWATI · RÉSUMÉ</span>
                <h1>
                  {profile.name}
                  <span>.</span>
                </h1>
                <h2>{profile.role}</h2>
                <p>{profile.introduction}</p>
                <h2 className="resume-heading">Experience</h2>
                <ExperienceList />
                <h2 className="resume-heading">Selected projects</h2>
                <ProjectCards />
                <h2 className="resume-heading">Skills</h2>
                <SkillsList />
                <h2 className="resume-heading">Education</h2>
                <EducationList />
                <div className="resume-contact">
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                    <ArrowUpRight size={14} />
                  </a>
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="request-tabs">
                <span className="request-tab">
                  <span className="method">GET</span>
                  {current.label}
                  <span className="tab-dot" />
                </span>
                <span className="tab-hint">
                  Your next discovery starts here
                </span>
              </div>
              <div className="request-area">
                <div className="breadcrumb">
                  Meet Putri <ChevronRight size={12} />
                  <span>{current.label}</span>
                </div>
                <div className="request-bar">
                  <span className="request-method">
                    GET <ChevronDown size={12} />
                  </span>
                  <span className="request-url">
                    <span>putri.workspace</span>
                    <strong>{current.path}</strong>
                  </span>
                  <button
                    className="send-button"
                    onClick={() => {
                      setView("json");
                      setCopied(false);
                    }}
                    title="Show this section as JSON"
                  >
                    Send <ArrowRight size={16} />
                  </button>
                </div>
                <div className="request-meta">
                  <span>
                    <span className="status-dot" /> Ready to explore
                  </span>
                  <span>Read the preview or explore the JSON.</span>
                </div>
              </div>
              <div className="response-toolbar">
                <div className="response-views">
                  <button
                    className={view === "preview" ? "active" : ""}
                    onClick={() => setView("preview")}
                  >
                    <Layers3 size={14} />
                    Preview
                  </button>
                  <button
                    className={view === "json" ? "active" : ""}
                    onClick={() => setView("json")}
                  >
                    <Braces size={14} />
                    JSON
                  </button>
                </div>
                <div className="response-status">
                  <span>
                    <Check size={12} />
                    200 OK
                  </span>
                  <span>local data</span>
                </div>
              </div>
              <div
                ref={responsePanelRef}
                className="response-content"
                key={`${section}-${view}`}
                tabIndex={0}
                role="region"
                aria-label={`${current.label} ${view === "json" ? "JSON response" : "content"}`}
              >
                {view === "json" ? (
                  <div className="json-panel">
                    <div className="json-heading">
                      <span>
                        <Code2 size={15} /> {current.path} · portfolio.json
                      </span>
                      <button
                        className="text-button"
                        onClick={copyResponse}
                      >
                        {copied ? <CheckCheck size={15} /> : <Copy size={15} />}{" "}
                        {copied ? "Copied" : "Copy JSON"}
                      </button>
                    </div>
                    <JsonResponse value={getPortfolioResponse(section)} />
                    <div className="json-note">
                      This response uses the same portfolio information as the
                      readable preview.{" "}
                      <button onClick={() => setView("preview")}>
                        Return to the readable preview <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ) : section === "about" ? (
                  <Introduction />
                ) : (
                  <>
                    <div
                      className={`page-intro${section === "contact" ? " contact-intro" : ""}`}
                    >
                      <span className="eyebrow">
                        MEET PUTRI / {current.label.toUpperCase()}
                      </span>
                      <h1>
                        {section === "projects" ? (
                          <>
                            Ideas, made <em>real.</em>
                          </>
                        ) : section === "experience" ? (
                          <>
                            A journey in <em>progress.</em>
                          </>
                        ) : section === "skills" ? (
                          <>
                            A curious mind’s <em>toolkit.</em>
                          </>
                        ) : (
                          <>
                            Good things start with <em>hello.</em>
                          </>
                        )}
                      </h1>
                      <p>{current.note}</p>
                    </div>
                    {section === "projects" ? (
                      <ProjectCards />
                    ) : section === "experience" ? (
                      <ExperienceList />
                    ) : section === "skills" ? (
                      <SkillsList />
                    ) : (
                      <ContactDetails />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>
        {showDetails && (
          <aside
            className="context-panel chat-panel"
            id="chat-panel"
            aria-label="Chat sidebar"
            tabIndex={-1}
          >
            <ChatView
              {...chatProps}
              sidebar
              onExpand={selectChat}
              onClose={hideDetails}
            />
          </aside>
        )}
      </div>
      <footer
        className="workspace-footer"
        aria-label="Workspace status and sidebar controls"
      >
        <button
          ref={collectionsToggleRef}
          type="button"
          className={`footer-panel-toggle ${showCollections ? "is-open" : ""}`}
          onClick={toggleCollections}
          aria-label={showCollections ? "Hide Collections" : "Show Collections"}
          aria-expanded={showCollections}
          aria-controls={showCollections ? "collections-panel" : undefined}
          title="Toggle left sidebar"
        >
          <PanelLeft size={12} />
          <span>Collections</span>
        </button>
        <div className="workspace-footer-status">
          <span className="footer-built">
            <Terminal size={12} />
            Built with curiosity
          </span>
          <span className="footer-location">Software Engineer · Tangerang</span>
          <span className="footer-credit">Made by Putri</span>
        </div>
        <button
          ref={detailsToggleRef}
          type="button"
          className={`footer-panel-toggle ${showDetails ? "is-open" : ""}`}
          onClick={toggleDetails}
          aria-label={showDetails ? "Hide chat sidebar" : "Show chat sidebar"}
          aria-expanded={showDetails}
          aria-controls={showDetails ? "chat-panel" : undefined}
          title="Toggle right sidebar"
        >
          <span>Chat</span>
          <PanelRight size={12} />
        </button>
      </footer>
    </div>
  );
}
