import type { Metadata } from "next";
import "./globals.css";
import "./json-response.css";
import "./theme-tokens.css";
import "./theme-ui.css";
import "./typography.css";
import "./portfolio-content.css";
import "./workspace-layout.css";
import "./chat-view.css";
import "./impeccable.css";
import { ThemeProvider } from "./components/theme-provider";
import { DEFAULT_PALETTE, palettes, THEME_STORAGE_KEY } from "../lib/themes";
import { buildThemeBootstrap } from "../lib/theme-bootstrap";

// Apply saved preferences before paint without reading browser APIs on the server.
const themeScript = buildThemeBootstrap({
  defaultPalette: DEFAULT_PALETTE,
  paletteIds: palettes.map((item) => item.id),
  storageKey: THEME_STORAGE_KEY,
});

export const metadata: Metadata = {
  title: "Putri Indah Tresnawati — Software Engineer",
  description:
    "Putri Indah Tresnawati — Software Engineer building backend-first SaaS systems, real-time messaging, APIs, and product interfaces.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
