export interface WikiSummary {
  thumbnail?: string;
  extract?: string;
  pageUrl?: string;
}

const cache = new Map<string, WikiSummary>();

export async function fetchWikiSummary(title: string): Promise<WikiSummary> {
  if (cache.has(title)) return cache.get(title)!;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    );
    if (!res.ok) throw new Error('not ok');
    const data = await res.json();
    const summary: WikiSummary = {
      thumbnail: data.thumbnail?.source ?? data.originalimage?.source,
      extract: data.extract,
      pageUrl: data.content_urls?.desktop?.page,
    };
    cache.set(title, summary);
    return summary;
  } catch {
    const empty: WikiSummary = {};
    cache.set(title, empty);
    return empty;
  }
}
