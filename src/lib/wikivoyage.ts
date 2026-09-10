export interface SuggestedCity {
  name: string;
  blurb: string;
}

/**
 * Pulls the human-curated "Cities" list that (almost) every Wikivoyage country
 * article has, so we can auto-suggest destinations for any country without
 * needing our own hand-curated database or a live AI call.
 *
 * MediaWiki has shipped a couple of different HTML shapes for section
 * headings over the years (a `<span id="Cities">` inside the `<h2>`, vs. a
 * newer `<h2 id="Cities">` wrapped in a `<div class="mw-heading">`), and the
 * city list itself can be a plain `<ul>`, a numbered `<ol>`, or paragraphs
 * with a bold linked name. Rather than depend on one exact DOM shape (which
 * broke silently — this file's earlier version returned zero cities on real
 * pages), this locates the section by the reliable `id="Cities"` anchor in
 * the raw HTML string, slices out everything up to the next heading, and
 * pulls city names from whatever markup is in that slice.
 */
export async function fetchWikivoyageCities(countryName: string): Promise<SuggestedCity[]> {
  try {
    const url = `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(
      countryName,
    )}&prop=text&format=json&formatversion=2&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const html: string | undefined = data?.parse?.text;
    if (!html) return [];

    const sectionHtml = extractSection(html, 'Cities') ?? extractSection(html, 'Destinations');
    if (!sectionHtml) return [];

    const doc = new DOMParser().parseFromString(sectionHtml, 'text/html');
    const items: SuggestedCity[] = [];

    const listNodes = [...doc.querySelectorAll('li')];
    const blockNodes = listNodes.length > 0 ? listNodes : [...doc.querySelectorAll('p')];

    const extractFrom = (node: Element) => {
      const link = node.querySelector('a[href]:not([href*=":"])');
      const full = (node.textContent || '').replace(/\[\d+\]/g, '').trim();
      if (!full) return null;
      const rawName = (link?.textContent || full.split(/[–—-]/)[0]).trim();
      const name = rawName.replace(/^\d+\s*/, '').trim(); // strip leading "1 " map-marker numbers
      if (!name || name.length > 60 || !/[a-zA-ZÀ-ÿ]/.test(name)) return null;
      const blurb = full.startsWith(rawName) ? full.slice(rawName.length).replace(/^[\s–—-]+/, '') : full;
      return { name, blurb };
    };

    for (const node of blockNodes) {
      const item = extractFrom(node);
      if (item) items.push(item);
    }

    // last-resort fallback: no li/p structure matched, just take the links themselves
    if (items.length === 0) {
      for (const a of [...doc.querySelectorAll('a[href]:not([href*=":"])')]) {
        const name = (a.textContent || '').trim();
        if (name && name.length <= 40 && /^[A-ZÀ-Ý]/.test(name)) items.push({ name, blurb: '' });
      }
    }

    const seen = new Set<string>();
    return items.filter((c) => (seen.has(c.name.toLowerCase()) ? false : (seen.add(c.name.toLowerCase()), true))).slice(0, 9);
  } catch {
    return [];
  }
}

/** Slices the raw parsed HTML from a heading's `id="<name>"` anchor to the next heading. */
function extractSection(html: string, sectionId: string): string | null {
  const idMatch = html.match(new RegExp(`id=["']${sectionId}["']`, 'i'));
  if (!idMatch || idMatch.index === undefined) return null;

  const afterId = idMatch.index + idMatch[0].length;
  const headingCloseMatch = html.slice(afterId).match(/<\/h[1-4]>/i);
  const contentStart = headingCloseMatch
    ? afterId + (headingCloseMatch.index ?? 0) + headingCloseMatch[0].length
    : afterId;

  const rest = html.slice(contentStart);
  const nextHeadingMatch = rest.match(/<h[1-4][ >]|class=["'][^"']*mw-heading/i);
  const contentEnd = nextHeadingMatch && nextHeadingMatch.index !== undefined ? nextHeadingMatch.index : rest.length;

  return rest.slice(0, contentEnd);
}
