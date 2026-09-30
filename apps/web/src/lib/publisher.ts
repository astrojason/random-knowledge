// Second-level labels that sit under a country code (bbc.co.uk, abc.net.au), so the publisher is one label further left.
const COUNTRY_SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "edu", "ac"]);

/**
 * The registrable domain a URL belongs to, used as a stand-in for "publisher" when checking that
 * sources are independent: subdomains (en./simple.wikipedia.org, ncbi.nlm.nih.gov) are one publisher.
 * A heuristic, not the full public-suffix list.
 */
export function publisherOf(url: string): string {
  const labels = new URL(url).hostname.toLowerCase().split(".");
  if (labels.length <= 2) return labels.join(".").replace(/^www\./, "");
  const tld = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  const keep = tld.length === 2 && COUNTRY_SECOND_LEVEL.has(second) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

export function distinctPublishers(urls: string[]): Set<string> {
  return new Set(urls.map(publisherOf));
}
