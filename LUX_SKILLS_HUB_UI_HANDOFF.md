# Lux Skills Hub — UI Handoff

**Status:** LIVE shared capability catalog for Lux Agent Desktop, Lux Codex v3.0, and Lux Hermes Desktop  
**Owner:** Lux Automaton  
**Date:** 2026-09-19

## Product goal

Lux Skills Hub is the shared capability marketplace for the Lux ecosystem. Customers can use optional LANA-curated Role Packs or browse and install individual skills à la carte. Packs must never be required to access the underlying catalog.

## Live catalog

Current deployed snapshot: **98,196 public skill records**.

Source mix:
- ClawHub: 76,051
- skills.sh: 20,000
- GitHub: 1,021
- LobeHub: 505
- browse.sh: 469
- Official Hermes skills: 150

The catalog is refreshed automatically from the aggregated upstream skills index. The full metadata index lazy-loads only when discovery begins.

## Shared architecture

Public source of truth:
- Repository: `luxautomaton-ux/lux-skills-hub`
- Embed surface: `https://luxautomaton-ux.github.io/lux-skills-hub/?embed=picker`

All Lux desktop apps use this same shared Hub. Do not fork the visual catalog into separate app-specific inventories unless there is an explicit product reason.

### Desktop bridge contract — do not break

Single-skill selection posts:
- `type: "lux-skill-pick"`
- `identifier`
- `name`
- `source`
- `installCmd`
- Lux metadata including catalog id, trust and category

Role Pack selection posts:
- `type: "lux-skill-pack-pick"`
- pack id/name/audience/capabilities
- selected skills with identifiers and provenance

Host applications validate the Lux GitHub Pages origin and then route installs through their existing local/profile-scoped skill pipeline.

## Current Lux surfaces

### Lux Agent Desktop
Canonical customer Skills page embeds the shared Hub and installs through the local skills API.

### Lux Codex v3.0
The Skills surface uses `EmbeddedHubPicker`, the same Lux Hub URL, origin validation, profile-scoped installs, and Role Pack handling.

### Lux Hermes Desktop
The Skills screen embeds the same Lux Hub and preserves Hermes' installed/marketplace workflows.

## Discovery model

Every skill remains individually searchable and installable.

Current discovery dimensions:
1. Search / outcome
2. Category
3. Agent Fit
4. Trust / provenance
5. Optional Role Packs

### Agent Fit taxonomy

The generated community catalog can assign up to four roles:
- Executive & Chief of Staff
- Engineering & Builder
- Operations & Systems
- Research & Intelligence
- Sales & CRM
- Marketing & Content
- Finance & Money
- Customer Support
- Field Service & Trades
- Creative & Media
- Security & Compliance
- Data & Analytics

Agent Fit is discovery metadata, not an access restriction. A skill may still be installed for any agent.

## Trust and install boundary

Do **not** bulk-copy or preinstall ~98K third-party skill bodies.

Lux indexes discovery metadata and provenance. Actual third-party skill code is fetched from its canonical registry/source only when the user selects it. This keeps the apps lighter and preserves the original author/source/license boundary.

Trust labels:
- **Lux Verified:** reserved for skills that complete the Lux verification workflow.
- **Lux Curated:** selected by Lux for a role/outcome; not a claim of Lux authorship.
- **Community:** indexed third-party capability with original source identity retained.

## UI polish brief for GPT-6 Ultra

The next pass should focus on visual quality without changing the data/install architecture.

Desired direction:
- Premium Lux navy / electric cyan / violet / proof-mint visual language.
- Make the 98K-scale catalog feel organized instead of overwhelming.
- Strong hero with live catalog count and clear "Role Packs" vs "Browse all skills" choice.
- Agent Fit filter should be highly visible and easy to scan.
- Skill cards should emphasize: name, outcome, Agent Fit, source/provenance, trust, and one clear Add action.
- Add tasteful motion, hover states, loading/skeleton states, and micro-interactions.
- Keep embedded mode compact enough for desktop-app panes.
- Preserve responsive behavior and keyboard/accessibility basics.
- Consider featured collections, trending/useful categories, recently added, and "Recommended for this agent" as presentation layers only.
- Never hide the full à-la-carte catalog behind Role Packs, membership tiers, or agent-role restrictions unless product policy changes later.

## Performance constraints

- Keep full community metadata lazy-loaded.
- Render bounded result sets rather than tens of thousands of cards at once.
- Do not preload skill source bodies.
- Keep source identifiers stable.
- Keep postMessage event names stable.
- Keep the embed origin stable unless all three desktop hosts are migrated together.

## Verification checkpoint

- Shared Hub deployment workflow: PASS
- Live refreshed catalog: 98,196 records
- Shared Hub JavaScript syntax check: PASS
- Agent Fit generator/filter wiring: PASS
- Lux Hermes Desktop production build: PASS
- Lux Codex Hub integration: present; targeted test run is part of the closeout evidence
