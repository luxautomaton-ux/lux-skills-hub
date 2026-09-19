import { writeFile } from "node:fs/promises";

const INDEX_URL = "https://hermes-agent.nousresearch.com/docs/api/skills-index.json";

function clean(value, max = 180) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function categoryFor(item) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const text = [item.name, ...tags, item.repo, item.path].filter(Boolean).join(" ").toLowerCase();
  if (/real[ -]?estate|realtor|property|mortgage|landlord/.test(text)) return "Real Estate";
  if (/church|ministry|pastor|faith|nonprofit|volunteer/.test(text)) return "Community & Nonprofit";
  if (/electric|contractor|construction|field[ -]?service|trade/.test(text)) return "Trades & Field Service";
  if (/crm|sales|lead|outreach|prospect|pipeline/.test(text)) return "Sales & CRM";
  if (/marketing|social|content|seo|campaign|brand/.test(text)) return "Marketing";
  if (/finance|account|bookkeep|invoice|tax|budget|payment/.test(text)) return "Finance";
  if (/calendar|meeting|schedule|productiv|task|note/.test(text)) return "Productivity";
  if (/pdf|document|docx|ocr|spreadsheet|excel|form/.test(text)) return "Documents & Data";
  if (/research|search|competitor|market[ -]?analysis|web[ -]?research/.test(text)) return "Research";
  if (/github|git\b|docker|devops|code|coding|developer|api|cloud|kubernetes|database|sql/.test(text)) return "Developer";
  if (/email|slack|message|communication|discord|telegram/.test(text)) return "Communication";
  if (/image|video|audio|design|creative|media/.test(text)) return "Creative & Media";
  if (/security|audit|compliance|privacy|credential|secret/.test(text)) return "Security";
  if (/project|operations|workflow|automation|business/.test(text)) return "Operations";
  return "General";
}

function iconFor(category) {
  return {
    "Real Estate": "⌂",
    "Community & Nonprofit": "✦",
    "Trades & Field Service": "ϟ",
    "Sales & CRM": "◎",
    Marketing: "◈",
    Finance: "$",
    Productivity: "◷",
    "Documents & Data": "▤",
    Research: "⌕",
    Developer: "⌘",
    Communication: "✉",
    "Creative & Media": "◇",
    Security: "◆",
    Operations: "✓",
    General: "•",
  }[category] || "•";
}

function sourceUrlFor(item) {
  const source = clean(item.source, 40);
  const identifier = clean(item.identifier, 260);
  const extra = item.extra && typeof item.extra === "object" ? item.extra : {};
  if (typeof extra.detail_url === "string" && /^https:\/\//.test(extra.detail_url)) return extra.detail_url;
  if (typeof extra.source_url === "string" && /^https:\/\//.test(extra.source_url)) return extra.source_url;
  if (source === "github" && item.repo) {
    const suffix = item.path ? `/tree/main/${String(item.path).replace(/^\/+/, "")}` : "";
    return `https://github.com/${item.repo}${suffix}`;
  }
  if (source === "official" && item.path) {
    return `https://github.com/NousResearch/hermes-agent/tree/main/${String(item.path).replace(/^\/+/, "")}`;
  }
  if (source === "skills.sh") return `https://skills.sh/${identifier.replace(/^skills-sh\//, "")}`;
  return "";
}

function normalize(item) {
  const category = categoryFor(item);
  const repo = clean(item.repo, 180);
  const source = clean(item.source, 40) || "community";
  const rawIdentifier = clean(item.identifier, 260);
  const identifier =
    source === "clawhub" && !rawIdentifier.startsWith("clawhub/")
      ? `clawhub/${rawIdentifier}`
      : source === "github" && !rawIdentifier.startsWith("github/")
        ? `github/${rawIdentifier}`
        : rawIdentifier;
  const author =
    repo.includes("/") ? repo.split("/")[0] :
    source === "official" ? "NousResearch" :
    "Community";

  return {
    id: `${source}:${identifier}`,
    identifier,
    name: clean(item.name, 180) || identifier,
    category,
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag) => clean(String(tag), 56)).filter(Boolean).slice(0, 8)
      : [],
    source,
    sourceUrl: sourceUrlFor(item),
    author,
    trust: "community",
    upstreamTrust: clean(item.trust_level, 24) || "community",
    icon: iconFor(category),
  };
}

const response = await fetch(INDEX_URL, {
  headers: {
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": "Lux-Skills-Hub/1.0",
  },
});

if (!response.ok) {
  throw new Error(`Skills index sync failed: HTTP ${response.status}`);
}

const upstream = await response.json();
if (!upstream || !Array.isArray(upstream.skills)) {
  throw new Error("Skills index response did not contain a skills array.");
}

const skills = upstream.skills
  .map(normalize)
  .filter((skill) => skill.identifier && skill.name);

const sourceCounts = {};
for (const skill of skills) {
  sourceCounts[skill.source] = (sourceCounts[skill.source] || 0) + 1;
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  upstreamGeneratedAt: upstream.generated_at || null,
  source: "Aggregated public skill catalog metadata",
  count: skills.length,
  sourceCounts,
  skills,
};

const meta = {
  generatedAt: snapshot.generatedAt,
  upstreamGeneratedAt: snapshot.upstreamGeneratedAt,
  count: snapshot.count,
  sourceCounts,
};

await writeFile(
  new URL("../data/community-index.json", import.meta.url),
  JSON.stringify(snapshot) + "\n",
);
await writeFile(
  new URL("../data/community-index-meta.json", import.meta.url),
  JSON.stringify(meta, null, 2) + "\n",
);

console.log(`Wrote ${snapshot.count.toLocaleString()} indexed skills`);
console.log(JSON.stringify(sourceCounts));
