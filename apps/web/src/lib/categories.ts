export const CATEGORIES = {
  psychology: "Mind & Behavior",
  engineering: "Engineering",
  howthings: "How Things Work",
  arthistory: "Art History",
  advanced: "Big Ideas, Simply Explained",
  general: "Everything Else",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export type Weights = Record<CategoryKey, number>;

export function defaultWeights(): Weights {
  return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 10])) as Weights;
}

export function pickCategory(
  weights: Weights,
  avoidRecent: CategoryKey[]
): CategoryKey {
  const pool = CATEGORY_KEYS.filter((k) => !avoidRecent.includes(k));
  const usable = pool.length ? pool : CATEGORY_KEYS;
  let total = 0;
  usable.forEach((k) => {
    total += Math.max(weights[k] ?? 1, 1);
  });
  let r = Math.random() * total;
  for (const k of usable) {
    r -= Math.max(weights[k] ?? 1, 1);
    if (r <= 0) return k;
  }
  return usable[0];
}
