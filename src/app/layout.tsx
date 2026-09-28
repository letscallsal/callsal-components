import type { Metadata } from "next";
import "./globals.css";
import { getStats } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "CALL SAL Components",
  description:
    "Framer Marketplace-style live UI component previews for agents and humans.",
  metadataBase: new URL("https://components.callsal.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stats = getStats();
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <a href="/" className="brand">
                <span className="brand-mark">CALL SAL</span>
                <span className="brand-sub">Components</span>
              </a>
              <div className="header-meta">
                {stats.libraries} libs · {stats.components} live previews
              </div>
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">© 2026 CALLSAL.</footer>
        </div>
      </body>
    </html>
  );
}
