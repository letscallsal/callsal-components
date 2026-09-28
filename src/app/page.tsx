import Marketplace from "@/components/Marketplace";
import {
  getFeaturedComponents,
  getLibraryMetas,
  getLiveComponents,
} from "@/lib/catalog";

export default function HomePage() {
  const components = getLiveComponents();
  const libraries = getLibraryMetas().map((m) => ({
    id: m.id,
    name: m.name,
    liveCount: m.liveCount,
  }));
  const featured = getFeaturedComponents();

  // Strip heavy fields before shipping to client
  const slim = components.map((c) => ({
    id: c.id,
    libraryId: c.libraryId,
    libraryName: c.libraryName,
    slug: c.slug,
    name: c.name,
    summary: c.summary,
    aliases: c.aliases,
    uiCategory: c.uiCategory,
    effectType: c.effectType,
    frameworks: c.frameworks,
    href: c.href,
    iframeSrc: c.iframeSrc,
  }));

  const featuredSlim = featured.map((c) => ({
    id: c.id,
    libraryId: c.libraryId,
    libraryName: c.libraryName,
    slug: c.slug,
    name: c.name,
    summary: c.summary,
    aliases: c.aliases,
    uiCategory: c.uiCategory,
    effectType: c.effectType,
    frameworks: c.frameworks,
    href: c.href,
    iframeSrc: c.iframeSrc,
  }));

  return (
    <Marketplace
      components={slim as typeof components}
      libraries={libraries}
      featured={featuredSlim as typeof featured}
    />
  );
}
