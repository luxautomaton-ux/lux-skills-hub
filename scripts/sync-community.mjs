import { writeFile } from "node:fs/promises";

const BASE = "https://clawhub.ai/api/v1";
const MAX_PAGES = 4;
const LIMIT = 200;

function categoryFor(item) {
  const text = [item.displayName, item.summary, ...(item.topics || [])].join(" ").toLowerCase();
  if (/real estate|property|realtor|home buyer|landlord/.test(text)) return "Real Estate";
  if (/crm|sales|lead|outreach|prospect/.test(text)) return "Sales & CRM";
  if (/market|research|competitor|analysis/.test(text)) return "Research";
  if (/social|marketing|content|seo|campaign/.test(text)) return "Marketing";
  if (/calendar|meeting|schedule|productivity|task/.test(text)) return "Productivity";
  if (/pdf|document|docx|ocr|form/.test(text)) return "Documents";
  if (/bookkeep|invoice|accounting|finance|expense/.test(text)) return "Finance";
  if (/docker|git|github|devops|code|developer|api|cloud/.test(text)) return "Developer";
  if (/email|slack|message|communication/.test(text)) return "Communication";
  if (/project|operations|workflow|automation/.test(text)) return "Operations";
  return "Community";
}

function iconFor(category) {
  return {
    "Real Estate": "⌂",
    "Sales & CRM": "◎",
    Research: "⌕",
    Marketing: "◈",
    Productivity: "◷",
    Documents: "▤",
    Finance: "$",
    Developer: "⌘",
    Communication: "✉",
    Operations: "✓",
    Community: "✦",
  }[category] || "✦";
}

function normalize(item) {
  const category = categoryFor(item);
  return {
    id: `clawhub:${item.ownerHandle || "community"}:${item.slug}`,
    identifier: `clawhub/${item.slug}`,
    name: item.displayName || item.slug,
    description: item.summary || item.description || "Community skill",
    author: item.ownerHandle || "community",
    category,
    tags: Array.from(new Set([...(item.topics || []), category])).slice(0, 6),
    source: "ClawHub",
    sourceUrl: `https://clawhub.ai/${item.ownerHandle}/skills/${item.slug}`,
    trust: "community",
    icon: iconFor(category),
    license: item.latestVersion?.license || null,
    downloads: item.stats?.downloads || 0,
    stars: item.stats?.stars || 0,
    updatedAt: item.updatedAt || null,
  };
}

async function fetchPage(sort, cursor) {
  const url = new URL(`${BASE}/skills`);
  url.searchParams.set("limit", String(LIMIT));
  url.searchParams.set("sort", sort);
  url.searchParams.set("nonSuspiciousOnly", "true");
  if (cursor) url.searchParams.set("cursor", cursor);
  const response = await fetch(url, { headers: { "User-Agent": "Lux-Skills-Hub/1.0" } });
  if (!response.ok) throw new Error(`ClawHub ${sort} sync failed: ${response.status}`);
  return response.json();
}

async function collect(sort, pages = MAX_PAGES) {
  const items = [];
  let cursor = null;
  for (let page = 0; page < pages; page += 1) {
    const payload = await fetchPage(sort, cursor);
    items.push(...(payload.items || []));
    cursor = payload.nextCursor || null;
    if (!cursor) break;
  }
  return items;
}

const [popular, updated, trending] = await Promise.all([
  collect("downloads", 4),
  collect("updated", 2),
  collect("trending", 1),
]);

const deduped = new Map();
for (const item of [...popular, ...updated, ...trending]) {
  const key = `${item.ownerHandle || ""}/${item.slug}`;
  if (!deduped.has(key)) deduped.set(key, normalize(item));
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: "ClawHub public read API",
  count: deduped.size,
  skills: [...deduped.values()],
};

await writeFile(new URL("../data/community-snapshot.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Wrote ${snapshot.count} community skills`);
