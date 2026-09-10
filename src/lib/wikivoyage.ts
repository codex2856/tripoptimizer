export interface SuggestedCity {
  name: string;
  blurb: string;
}

/**
 * Pulls the human-curated "Cities" list that (almost) every Wikivoyage country
 * article has, so we can auto-suggest destinations for any country without
 * needing our own hand-curated database or a live AI call.
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

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const heading = [...doc.querySelectorAll('h2, h3')].find((h) => {
      const id = h.querySelector('[id]')?.id ?? h.id;
      return /^cities$/i.test((id || '').trim()) || /^cities$/i.test((h.textContent || '').trim());
    });
    if (!heading) return [];

    const items: SuggestedCity[] = [];
    let node: Element | null = heading.parentElement === doc.body ? heading : heading;
    // walk forward through siblings collecting <li> until the next section heading
    let el = heading.nextElementSibling;
    while (el && !/^H[1-4]$/.test(el.tagName)) {
      el.querySelectorAll('li').forEach((li) => {
        const link = li.querySelector('a');
        const name = (link?.textContent || li.textContent || '').trim().split(' – ')[0].split(' — ')[0];
        const full = (li.textContent || '').trim();
        const blurb = full.startsWith(name) ? full.slice(name.length).replace(/^[\s–—-]+/, '') : full;
        if (name && name.length < 60) items.push({ name, blurb });
      });
      el = el.nextElementSibling;
    }
    void node;

    // de-duplicate, cap at 9 (Wikivoyage's own convention for a country's top cities)
    const seen = new Set<string>();
    return items.filter((c) => (seen.has(c.name.toLowerCase()) ? false : (seen.add(c.name.toLowerCase()), true))).slice(0, 9);
  } catch {
    return [];
  }
}
