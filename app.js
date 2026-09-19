const state = {
  skills: [],
  packs: [],
  query: "",
  category: "all",
  trust: "all",
  activePack: null,
};

const params = new URLSearchParams(window.location.search);
const embedded = params.get("embed") === "picker" || params.get("embed") === "1";
if (embedded) document.body.classList.add("embed");

const els = {
  packGrid: document.querySelector("#packGrid"),
  skillGrid: document.querySelector("#skillGrid"),
  search: document.querySelector("#skillSearch"),
  category: document.querySelector("#categoryFilter"),
  trust: document.querySelector("#trustFilter"),
  resultCount: document.querySelector("#resultCount"),
  skillCount: document.querySelector("#skillCount"),
  packCount: document.querySelector("#packCount"),
  clear: document.querySelector("#clearFilters"),
  modalBackdrop: document.querySelector("#modalBackdrop"),
  modalBody: document.querySelector("#modalBody"),
  modalClose: document.querySelector("#modalClose"),
  toast: document.querySelector("#toast"),
  about: document.querySelector("#aboutButton"),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function trustLabel(trust) {
  if (trust === "lux-verified") return "Lux Verified";
  if (trust === "curated") return "Lux Curated";
  return "Community";
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 3400);
}

function openModal(html) {
  els.modalBody.innerHTML = html;
  els.modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  els.modalBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function hostMessage(payload) {
  if (window.parent === window) return false;
  window.parent.postMessage(payload, "*");
  return true;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function skillById(id) {
  return state.skills.find((skill) => skill.id === id);
}

function renderPacks() {
  els.packGrid.innerHTML = state.packs.map((pack) => {
    const installedReady = pack.skills.filter((id) => Boolean(skillById(id))).length;
    return `
      <article class="pack-card" style="--pack-glow:${escapeHtml(pack.glow)}">
        <div class="pack-icon">${escapeHtml(pack.icon)}</div>
        <h3>${escapeHtml(pack.name)}</h3>
        <p>${escapeHtml(pack.description)}</p>
        <div class="pack-meta">
          <span>${installedReady} curated skills</span>
          <span>${escapeHtml(pack.audience)}</span>
        </div>
        <button type="button" data-pack="${escapeHtml(pack.id)}">View Pack</button>
      </article>
    `;
  }).join("");

  els.packGrid.querySelectorAll("[data-pack]").forEach((button) => {
    button.addEventListener("click", () => openPack(button.dataset.pack));
  });
}

function visibleSkills() {
  const q = state.query.trim().toLowerCase();
  return state.skills.filter((skill) => {
    const haystack = [skill.name, skill.description, skill.author, skill.category, ...(skill.tags || [])].join(" ").toLowerCase();
    const qMatch = !q || haystack.includes(q);
    const categoryMatch = state.category === "all" || skill.category === state.category;
    const trustMatch = state.trust === "all" || skill.trust === state.trust;
    return qMatch && categoryMatch && trustMatch;
  });
}

function renderSkills() {
  const skills = visibleSkills();
  els.resultCount.textContent = `${skills.length} skill${skills.length === 1 ? "" : "s"} shown`;
  if (!skills.length) {
    els.skillGrid.innerHTML = '<div class="empty-state">No skills match those filters. Try a broader outcome or category.</div>';
    return;
  }
  els.skillGrid.innerHTML = skills.map((skill) => `
    <article class="skill-card">
      <div class="skill-card-top">
        <span class="skill-icon">${escapeHtml(skill.icon || "✦")}</span>
        <span class="trust-badge ${escapeHtml(skill.trust)}">${escapeHtml(trustLabel(skill.trust))}</span>
      </div>
      <h3>${escapeHtml(skill.name)}</h3>
      <p>${escapeHtml(skill.description)}</p>
      <div class="skill-tags">${(skill.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="skill-source"><span>${escapeHtml(skill.source)}</span><span>@${escapeHtml(skill.author)}</span></div>
      <button type="button" data-skill="${escapeHtml(skill.id)}">Details & Add</button>
    </article>
  `).join("");

  els.skillGrid.querySelectorAll("[data-skill]").forEach((button) => {
    button.addEventListener("click", () => openSkill(button.dataset.skill));
  });
}
function openSkill(id) {
  const skill = skillById(id);
  if (!skill) return;
  const tags = (skill.tags || []).map((tag) => `<span class="trust-badge community">${escapeHtml(tag)}</span>`).join(" ");
  openModal(`
    <span class="eyebrow">SKILL DETAILS • ${escapeHtml(skill.source)}</span>
    <h2>${escapeHtml(skill.name)}</h2>
    <p>${escapeHtml(skill.description)}</p>
    <div class="skill-tags">${tags}</div>
    <div class="modal-list">
      <div><span>Author</span><strong>@${escapeHtml(skill.author)}</strong></div>
      <div><span>Category</span><strong>${escapeHtml(skill.category)}</strong></div>
      <div><span>Trust</span><strong>${escapeHtml(trustLabel(skill.trust))}</strong></div>
      <div><span>Identifier</span><code>${escapeHtml(skill.identifier)}</code></div>
    </div>
    <p><small>Lux curation does not replace the original author's license or provenance. Review the source before installing community code.</small></p>
    <div class="modal-actions">
      <button class="modal-primary" type="button" id="installSkillButton">Add to this Lux Agent</button>
      <button type="button" id="openSourceButton">View source</button>
    </div>
  `);

  document.querySelector("#installSkillButton")?.addEventListener("click", () => installSkill(skill));
  document.querySelector("#openSourceButton")?.addEventListener("click", () => {
    window.open(skill.sourceUrl, "_blank", "noopener,noreferrer");
  });
}

async function installSkill(skill) {
  const payload = {
    type: "lux-skill-pick",
    name: skill.name,
    identifier: skill.identifier,
    source: skill.source,
    installCmd: `hermes skills install ${skill.identifier} --yes`,
    lux: { catalogId: skill.id, trust: skill.trust, category: skill.category },
  };
  if (hostMessage(payload)) {
    closeModal();
    showToast(`${skill.name} sent to Lux for installation.`);
    return;
  }
  const copied = await copyText(payload.installCmd);
  showToast(copied
    ? `Install command copied for ${skill.name}. Open Lux Agent Desktop to install with one click.`
    : `Open this hub inside Lux Agent Desktop to install ${skill.name} with one click.`);
}

function openPack(id) {
  const pack = state.packs.find((item) => item.id === id);
  if (!pack) return;
  const included = pack.skills.map(skillById).filter(Boolean);
  const skillRows = included.map((skill) => `
    <div>
      <span>${escapeHtml(skill.icon || "✦")}</span>
      <strong>${escapeHtml(skill.name)}</strong>
      <small style="margin-left:auto;color:#7489a4">${escapeHtml(skill.category)}</small>
    </div>
  `).join("");
  const capabilityRows = pack.capabilities.map((capability) => `<div><span>✓</span><span>${escapeHtml(capability)}</span></div>`).join("");

  openModal(`
    <span class="eyebrow">LANA ROLE PACK • ${escapeHtml(pack.audience)}</span>
    <h2>${escapeHtml(pack.icon)} ${escapeHtml(pack.name)}</h2>
    <p>${escapeHtml(pack.description)}</p>
    <h3>What this pack is designed to cover</h3>
    <div class="modal-list">${capabilityRows}</div>
    <h3 style="margin-top:22px">Curated starting skills</h3>
    <div class="modal-list">${skillRows}</div>
    <div class="modal-actions">
      <button class="modal-primary" type="button" id="applyPackButton">Use This Pack in Lux</button>
      <button type="button" id="showPackSkillsButton">Show These Skills</button>
    </div>
  `);

  document.querySelector("#applyPackButton")?.addEventListener("click", () => applyPack(pack, included));
  document.querySelector("#showPackSkillsButton")?.addEventListener("click", () => {
    closeModal();
    state.query = "";
    state.category = "all";
    state.trust = "all";
    els.search.value = "";
    els.category.value = "all";
    els.trust.value = "all";
    const ids = new Set(pack.skills);
    const original = state.skills;
    state.skills = original.filter((skill) => ids.has(skill.id));
    renderSkills();
    state.skills = original;
    document.querySelector("#discover")?.scrollIntoView({ behavior: "smooth" });
  });
}

function applyPack(pack, included) {
  const payload = {
    type: "lux-skill-pack-pick",
    packId: pack.id,
    packName: pack.name,
    audience: pack.audience,
    capabilities: pack.capabilities,
    skills: included.map((skill) => ({
      id: skill.id,
      name: skill.name,
      identifier: skill.identifier,
      source: skill.source,
      trust: skill.trust,
    })),
  };

  if (hostMessage(payload)) {
    closeModal();
    showToast(`${pack.name} sent to Lux. Review the recommended skills before installation.`);
    return;
  }

  closeModal();
  showToast("Role Packs apply directly when Lux Skills Hub is opened inside a Lux app.");
}

function fillCategoryFilter() {
  const categories = [...new Set(state.skills.map((skill) => skill.category))].sort();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.category.append(option);
  }
}

function bindUi() {
  els.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderSkills();
  });
  els.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderSkills();
  });
  els.trust.addEventListener("change", (event) => {
    state.trust = event.target.value;
    renderSkills();
  });
  els.clear.addEventListener("click", () => {
    state.query = "";
    state.category = "all";
    state.trust = "all";
    els.search.value = "";
    els.category.value = "all";
    els.trust.value = "all";
    renderSkills();
  });
  els.modalClose.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.modalBackdrop) closeModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modalBackdrop.hidden) closeModal();
  });
  els.about.addEventListener("click", () => {
    openModal(`
      <span class="eyebrow">ABOUT LUX SKILLS HUB</span>
      <h2>Skills without the marketplace confusion.</h2>
      <p>Lux Skills Hub is the capability catalog for the Lux ecosystem. LANA organizes community and Lux-reviewed skills by the jobs agents actually perform.</p>
      <div class="modal-list">
        <div><span>01</span><span>Pick a role pack or search by outcome.</span></div>
        <div><span>02</span><span>Read the description, trust level, author, and source.</span></div>
        <div><span>03</span><span>When embedded in a Lux app, send the skill to the selected agent profile.</span></div>
        <div><span>04</span><span>Third-party attribution and licensing remain intact.</span></div>
      </div>
    `);
  });
}
async function loadData() {
  const [catalogResponse, packsResponse, communityResponse] = await Promise.all([
    fetch("./data/catalog.json", { cache: "no-store" }),
    fetch("./data/packs.json", { cache: "no-store" }),
    fetch("./data/community-snapshot.json", { cache: "no-store" }).catch(() => null),
  ]);
  if (!catalogResponse.ok || !packsResponse.ok) {
    throw new Error("Lux Skills Hub catalog could not be loaded.");
  }
  const catalog = await catalogResponse.json();
  const curated = Array.isArray(catalog.skills) ? catalog.skills : [];
  let community = [];
  if (communityResponse?.ok) {
    const snapshot = await communityResponse.json();
    community = Array.isArray(snapshot.skills) ? snapshot.skills : [];
  }
  const seen = new Set(curated.map((skill) => skill.identifier || skill.id));
  state.skills = [...curated, ...community.filter((skill) => !seen.has(skill.identifier || skill.id))];
  state.packs = await packsResponse.json();
  els.skillCount.textContent = state.skills.length > 999 ? `${(state.skills.length / 1000).toFixed(1)}K+` : String(state.skills.length);
  els.packCount.textContent = String(state.packs.length);
  fillCategoryFilter();
  renderPacks();
  renderSkills();

  const initialRole = params.get("role");
  if (initialRole && state.packs.some((pack) => pack.id === initialRole)) {
    window.setTimeout(() => openPack(initialRole), 350);
  }
}

bindUi();
loadData().catch((error) => {
  els.resultCount.textContent = "Catalog unavailable";
  els.skillGrid.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  showToast(error.message);
});
