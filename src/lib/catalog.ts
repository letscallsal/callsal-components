import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

export type InstallInfo = {
  kind?: string;
  command?: string;
  registryUrl?: string;
  registryItem?: string;
};

export type DemoInfo = {
  kind?: string;
  adapterKind?: string;
  entry?: string;
  iframeSrc?: string;
  aspectRatio?: string;
};

export type CatalogComponent = {
  id: string;
  libraryId: string;
  slug: string;
  name: string;
  aliases?: string[];
  summary?: string;
  frameworks?: string[];
  uiCategory?: string[];
  effectType?: string[];
  demo?: DemoInfo;
  copyCode?: string;
  copyPrompt?: { text?: string };
  installOverride?: InstallInfo;
  proOnly?: boolean;
  status?: string;
};

export type CatalogLibrary = {
  id: string;
  name: string;
  aliases?: string[];
  summary?: string;
  homeUrl?: string;
  docsUrl?: string;
  repoUrl?: string;
  license?: string;
  frameworks?: string[];
  install?: InstallInfo;
  status?: string;
  featured?: boolean | string[];
  components: CatalogComponent[];
};

export type LibraryMeta = {
  id: string;
  name: string;
  status?: string;
  componentCount?: number;
  path?: string;
};

export type LiveComponent = CatalogComponent & {
  libraryName: string;
  libraryDocsUrl?: string;
  libraryHomeUrl?: string;
  libraryInstall?: InstallInfo;
  href: string;
  iframeSrc: string;
};

const CATALOG_ROOT = join(process.cwd(), "public", "catalog");

let cachedLibs: CatalogLibrary[] | null = null;
let cachedLive: LiveComponent[] | null = null;
let cachedMeta: LibraryMeta[] | null = null;

function loadIndex(): LibraryMeta[] {
  if (cachedMeta) return cachedMeta;
  const indexPath = join(CATALOG_ROOT, "index.json");
  if (!existsSync(indexPath)) {
    cachedMeta = [];
    return cachedMeta;
  }
  const raw = JSON.parse(readFileSync(indexPath, "utf8"));
  cachedMeta = (raw.libraries || []) as LibraryMeta[];
  return cachedMeta;
}

export function getLibraries(): CatalogLibrary[] {
  if (cachedLibs) return cachedLibs;
  const libsDir = join(CATALOG_ROOT, "libraries");
  if (!existsSync(libsDir)) {
    cachedLibs = [];
    return cachedLibs;
  }
  const files = readdirSync(libsDir).filter((f) => f.endsWith(".json"));
  const libs: CatalogLibrary[] = [];
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(libsDir, file), "utf8"));
      if (data?.id && Array.isArray(data.components)) {
        libs.push(data as CatalogLibrary);
      }
    } catch {
      // skip bad files
    }
  }
  libs.sort((a, b) => a.name.localeCompare(b.name));
  cachedLibs = libs;
  return libs;
}

export function routeKey(libraryId: string, slug: string): string {
  return `${libraryId}__${slug}`;
}

export function parseRouteKey(key: string): { libraryId: string; slug: string } | null {
  const idx = key.indexOf("__");
  if (idx <= 0) return null;
  return { libraryId: key.slice(0, idx), slug: key.slice(idx + 2) };
}

function iframeOf(c: CatalogComponent): string {
  const demo = c.demo || {};
  return (
    (demo.iframeSrc || "").trim() ||
    ((c as { iframeSrc?: string }).iframeSrc || "").trim()
  );
}

export function getLiveComponents(): LiveComponent[] {
  if (cachedLive) return cachedLive;
  const libs = getLibraries();
  const out: LiveComponent[] = [];
  for (const lib of libs) {
    for (const c of lib.components || []) {
      const iframeSrc = iframeOf(c);
      if (!iframeSrc) continue;
      if (!c.slug || !c.libraryId) continue;
      out.push({
        ...c,
        libraryId: c.libraryId || lib.id,
        libraryName: lib.name,
        libraryDocsUrl: lib.docsUrl,
        libraryHomeUrl: lib.homeUrl,
        libraryInstall: lib.install,
        href: `/c/${routeKey(c.libraryId || lib.id, c.slug)}`,
        iframeSrc,
      });
    }
  }
  cachedLive = out;
  return out;
}

export function getLibraryMetas(): Array<LibraryMeta & { liveCount: number }> {
  const live = getLiveComponents();
  const counts = new Map<string, number>();
  for (const c of live) {
    counts.set(c.libraryId, (counts.get(c.libraryId) || 0) + 1);
  }
  const index = loadIndex();
  const byId = new Map(index.map((m) => [m.id, m]));
  const libs = getLibraries();
  return libs
    .map((lib) => {
      const meta = byId.get(lib.id);
      return {
        id: lib.id,
        name: lib.name,
        status: lib.status || meta?.status,
        componentCount: meta?.componentCount,
        path: meta?.path,
        liveCount: counts.get(lib.id) || 0,
      };
    })
    .filter((m) => m.liveCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getComponentByKey(key: string): LiveComponent | null {
  const parsed = parseRouteKey(key);
  if (!parsed) return null;
  return (
    getLiveComponents().find(
      (c) => c.libraryId === parsed.libraryId && c.slug === parsed.slug
    ) || null
  );
}

export type SearchHit = {
  id: string;
  libraryId: string;
  libraryName: string;
  slug: string;
  name: string;
  summary?: string;
  href: string;
  iframeSrc: string;
  frameworks?: string[];
  uiCategory?: string[];
  aliases?: string[];
};

export function searchComponents(opts: {
  q?: string;
  library?: string;
  limit?: number;
}): { total: number; results: SearchHit[]; libraries: Array<{ id: string; name: string; liveCount: number }> } {
  const q = (opts.q || "").trim().toLowerCase();
  const library = (opts.library || "").trim().toLowerCase();
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  let items = getLiveComponents();
  if (library) {
    items = items.filter((c) => c.libraryId === library);
  }
  if (q) {
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
      return q.split(/\s+/).every((tok) => hay.includes(tok));
    });
  }
  const results: SearchHit[] = items.slice(0, limit).map((c) => ({
    id: c.id,
    libraryId: c.libraryId,
    libraryName: c.libraryName,
    slug: c.slug,
    name: c.name,
    summary: c.summary,
    href: c.href,
    iframeSrc: c.iframeSrc,
    frameworks: c.frameworks,
    uiCategory: c.uiCategory,
    aliases: c.aliases,
  }));
  return {
    total: items.length,
    results,
    libraries: getLibraryMetas().map((m) => ({
      id: m.id,
      name: m.name,
      liveCount: m.liveCount,
    })),
  };
}

/** Known-good featured keys for first paint */
export const FEATURED_KEYS = [
  "magic-ui__marquee",
  "magic-ui__animated-beam",
  "aceternity-ui__background-beams",
  "shadcn-ui__button",
  "react-bits__blur-text",
];

export function getFeaturedComponents(): LiveComponent[] {
  const all = getLiveComponents();
  const byKey = new Map(all.map((c) => [routeKey(c.libraryId, c.slug), c]));
  const featured: LiveComponent[] = [];
  for (const k of FEATURED_KEYS) {
    const hit = byKey.get(k);
    if (hit) featured.push(hit);
  }
  if (featured.length < 4) {
    for (const c of all) {
      if (featured.length >= 6) break;
      if (!featured.find((f) => f.id === c.id)) featured.push(c);
    }
  }
  return featured;
}

export function getStats() {
  return {
    libraries: getLibraryMetas().length,
    components: getLiveComponents().length,
  };
}
