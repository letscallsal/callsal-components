import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getComponentByKey,
  getLiveComponents,
  routeKey,
} from "@/lib/catalog";
import CopyButton from "@/components/CopyButton";

type Props = { params: Promise<{ libComp: string }> };

export async function generateStaticParams() {
  return getLiveComponents().map((c) => ({
    libComp: routeKey(c.libraryId, c.slug),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { libComp } = await params;
  const c = getComponentByKey(libComp);
  if (!c) return { title: "Component not found" };
  return {
    title: `${c.name} · ${c.libraryName} · CALL SAL`,
    description: c.summary || `Live preview of ${c.name} from ${c.libraryName}`,
  };
}

export default async function ComponentPreviewPage({ params }: Props) {
  const { libComp } = await params;
  const c = getComponentByKey(libComp);
  if (!c) notFound();

  const installCmd =
    c.installOverride?.command ||
    c.libraryInstall?.command ||
    "";
  const docsUrl = c.libraryDocsUrl || c.libraryHomeUrl || c.iframeSrc;
  const snippet = c.copyCode || installCmd || "";

  return (
    <div className="preview-layout">
      <section className="preview-stage">
        <div className="preview-toolbar">
          <a href="/">← Marketplace</a>
          <span>·</span>
          <span>
            Live preview ·{" "}
            <a href={c.iframeSrc} target="_blank" rel="noreferrer">
              open source tab
            </a>
          </span>
        </div>
        <iframe
          className="live-iframe"
          src={c.iframeSrc}
          title={`${c.name} live preview`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          referrerPolicy="no-referrer-when-downgrade"
          loading="eager"
          allow="fullscreen; clipboard-write"
        />
      </section>

      <aside className="preview-side">
        <div className="preview-lib">{c.libraryName}</div>
        <h1>{c.name}</h1>
        {c.summary ? <p className="preview-summary">{c.summary}</p> : null}

        <div className="side-actions">
          <a className="btn btn-primary" href={docsUrl} target="_blank" rel="noreferrer">
            Docs
          </a>
          <a className="btn" href={c.iframeSrc} target="_blank" rel="noreferrer">
            Source iframe
          </a>
          {snippet ? <CopyButton text={snippet} label="Copy snippet" /> : null}
          {installCmd ? <CopyButton text={installCmd} label="Copy install" /> : null}
        </div>

        {installCmd ? (
          <div>
            <div className="muted-label">Install</div>
            <pre className="code-block">{installCmd}</pre>
          </div>
        ) : null}

        {c.copyCode ? (
          <div>
            <div className="muted-label">Snippet</div>
            <pre className="code-block">{c.copyCode}</pre>
          </div>
        ) : null}

        <div>
          <div className="muted-label">Deep link</div>
          <pre className="code-block">{`https://components.callsal.app${c.href}`}</pre>
        </div>

        <div className="result-tags">
          <span className="tag">{c.libraryId}</span>
          <span className="tag">{c.slug}</span>
          {(c.frameworks || []).map((f) => (
            <span key={f} className="tag">
              {f}
            </span>
          ))}
        </div>
      </aside>
    </div>
  );
}
