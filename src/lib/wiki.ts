export interface WikiSummary {
  thumbnail?: string;
  extract?: string;
  pageUrl?: string;
}

const cache = new Map<string, WikiSummary>();

/** Wikimedia Commons image search — a second, independent source of real photos
 * for places whose Wikipedia summary has no picture (e.g. thin articles). */
async function fetchCommonsThumbnail(title: string): Promise<string | undefined> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        title,
      )}&gsrlimit=1&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return undefined;
    const first = Object.values(pages)[0] as { imageinfo?: { thumburl?: string; url?: string }[] } | undefined;
    return first?.imageinfo?.[0]?.thumburl ?? first?.imageinfo?.[0]?.url;
  } catch {
    return undefined;
  }
}

export async function fetchWikiSummary(title: string): Promise<WikiSummary> {
  if (cache.has(title)) return cache.get(title)!;
  const summary: WikiSummary = {};
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (res.ok) {
      const data = await res.json();
      summary.thumbnail = data.thumbnail?.source ?? data.originalimage?.source;
      summary.extract = data.extract;
      summary.pageUrl = data.content_urls?.desktop?.page;
    }
  } catch {
    // fall through to the Commons fallback below
  }

  if (!summary.thumbnail) {
    summary.thumbnail = await fetchCommonsThumbnail(title);
  }

  cache.set(title, summary);
  return summary;
}
