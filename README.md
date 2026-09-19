# Lux Skills Hub

Lux Skills Hub is the shared capability catalog for the Lux Automaton agent ecosystem.

It gives customers a Lux-branded way to discover skills by **role, outcome, and industry** instead of dropping them into a raw community marketplace. LANA is the guide. Role Packs group sensible starting capabilities for jobs such as real estate agent, electrician/contractor, church director, small-business owner, sales agent, executive assistant, marketing lead, and developer/ops.

## Architecture

- **Public website:** GitHub Pages from this repository.
- **Curated catalog:** `data/catalog.json` contains Lux-selected metadata.
- **Role Packs:** `data/packs.json` describes the job-oriented capability stacks.
- **Community snapshot:** `data/community-snapshot.json` is refreshed from public read APIs and cached for fast browsing.
- **Desktop bridge:** embedded mode uses `postMessage` events `lux-skill-pick` and `lux-skill-pack-pick`.
- **Source-of-truth rule:** third-party author, source, and license data are preserved. Lux branding applies to the discovery/curation experience, not ownership claims over third-party work.

## Embed

```
https://luxautomaton-ux.github.io/lux-skills-hub/?embed=picker
```

A Lux desktop host validates the GitHub Pages origin and then routes approved installs through its existing skill installation pipeline.

## Trust labels

- **Lux Verified** — reserved for items that pass the Lux verification workflow.
- **Lux Curated** — selected by Lux for a useful role/outcome; not a claim that Lux authored the skill.
- **Community** — surfaced from an external registry with original provenance.

## Ownership

Website design, Lux role taxonomy, pack structure, and integration code are © Lux Automaton. Third-party skills and metadata remain subject to their original authors' licenses and terms.
