# Lux Skills Hub

Lux Skills Hub is the shared capability catalog for the Lux Automaton agent ecosystem.

It gives customers a Lux-branded way to discover skills by **role, outcome, and industry** instead of dropping them into a raw community marketplace. LANA is the guide. Role Packs group sensible starting capabilities for jobs such as real estate agent, electrician/contractor, church director, small-business owner, sales agent, executive assistant, marketing lead, and developer/ops.

## Architecture

- **Public website:** GitHub Pages from this repository.
- **Curated catalog:** `data/catalog.json` contains Lux-selected metadata and Lux-written role explanations.
- **Role Packs:** `data/packs.json` describes job-oriented capability stacks.
- **Full community index:** generated during Pages deployment from the aggregated public skill index; 97,928 records at initial Lux launch.
- **Fast loading:** the full metadata index is lazy-loaded only when a visitor begins searching or filtering.
- **Desktop bridge:** embedded mode uses `postMessage` events `lux-skill-pick` and `lux-skill-pack-pick`.
- **Install boundary:** skill code is fetched from the canonical registry only when selected; the public Lux repo does not mirror bulk third-party SKILL.md source.
- **Source-of-truth rule:** Lux branding applies to discovery, curation, Role Packs, and integration—not ownership claims over third-party skills.

## Embed

```
https://luxautomaton-ux.github.io/lux-skills-hub/?embed=picker
```

A Lux desktop host validates the GitHub Pages origin and routes approved installs through its local skill pipeline.

## Trust labels

- **Lux Verified** — reserved for items that pass the Lux verification workflow.
- **Lux Curated** — selected by Lux for a useful role/outcome; not a claim that Lux authored the skill.
- **Community** — indexed from an external registry; canonical source should be reviewed before installation.

## Automated catalog refresh

The GitHub Pages workflow runs on pushes, manual dispatch, and a daily schedule. It executes `scripts/sync-community.mjs`, creates the generated 97K+ metadata index inside the Pages artifact, and deploys it without committing that large generated file into Git history.

## Ownership

Website design, Lux role taxonomy, Role Pack structure, curation, and integration code are © Lux Automaton. Third-party skills remain subject to their original authors' licenses and terms.
