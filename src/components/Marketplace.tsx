"use client";

import { useMemo, useState } from "react";
import type { LiveComponent } from "@/lib/catalog";

type LibMeta = { id: string; name: string; liveCount: number };

export default function Marketplace({
  components,
  libraries,
  featured,
}: {
  components: LiveComponent[];
  libraries: LibMeta[];
  featured: LiveComponent[];
}) {
  const [q, setQ] = useState("");
  const [library, setLibrary] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let items = components;
    if (library) items = items.filter((c) => c.libraryId === library);
    if (query) {
      const toks = query.split(/\s+/);
      items = items.filter((c) => {
        const hay = [
          c.name,
          c.slug,
          c.id,
          c.summary || "",
          c.libraryName,
          c.libraryId,
          ...(c.aliases || []),
          ...(c.uiCategory || []),
          ...(c.effectType || []),
        ]
          .join(" ")
          .toLowerCase();
        return toks.every((t) => hay.includes(t));
      });
    }
    return items;
  }, [components, q, library]);

  const showing =
    !q && !library ? featured.concat(
      filtered.filter((c) => !featured.find((f) => f.id === c.id)).slice(0, 40)
    ) : filtered.slice(0, 80);

  const modeLabel =
    !q && !library
      ? `Featured + recent · showing ${showing.length} of ${components.length}`
      : `${filtered.length} match${filtered.length === 1 ? "" : "es"}`;

  return (
    <div className="marketplace">
      <aside className="sidebar">
        <div className="panel">
          <h2>Libraries</h2>
          <div className="lib-list">
            <button
              type="button"
              className={`lib-btn ${library === "" ? "active" : ""}`}
              onClick={() => setLibrary("")}
            >
              <span>All libraries</span>
              <span className="lib-count">{components.length}</span>
            </button>
            {libraries.map((lib) => (
              <button
                key={lib.id}
                type="button"
                className={`lib-btn ${library === lib.id ? "active" : ""}`}
                onClick={() => setLibrary(lib.id)}
              >
                <span>{lib.name}</span>
                <span className="lib-count">{lib.liveCount}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="stage">
        <div className="hero">
          <h1>Live component marketplace</h1>
          <p>
            Search UI components across libraries, then open a full interactive
            preview. Built for agents and humans — deep-link any component.
          </p>
          <div className="search-row">
            <input
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search marquee, button, beams, accordion…"
              aria-label="Search components"
              autoFocus
            />
            <span className="stats-chip">
              {libraries.length} libs · {components.length} live
            </span>
          </div>
        </div>

        <div className="results-head">
          <h2>{modeLabel}</h2>
          <a href="/api/search?q=" style={{ color: "var(--text-dim)", fontSize: 12 }}>
            Agent API →
          </a>
        </div>

        {showing.length === 0 ? (
          <div className="empty">No live previews match that search.</div>
        ) : (
          <div className="results-list">
            {showing.map((c) => (
              <a key={c.id} href={c.href} className="result-card">
                <div>
                  <div className="result-title">{c.name}</div>
                  <div className="result-meta">
                    {c.libraryName}
                    {c.summary ? ` — ${c.summary}` : ""}
                  </div>
                  <div className="result-tags">
                    <span className="tag">{c.libraryId}</span>
                    {(c.uiCategory || []).slice(0, 3).map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="open-live">OPEN LIVE →</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
