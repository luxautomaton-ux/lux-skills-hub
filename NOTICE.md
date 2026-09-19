# Provenance & Third-Party Notice

Lux Skills Hub is a Lux Automaton discovery and curation surface. It does not erase or replace third-party authorship.

The deployment pipeline builds a compact public metadata index from the aggregated skills catalog used by the installed skill engine. At the time of the initial Lux build, that upstream catalog contained 97,928 records across ClawHub, skills.sh, GitHub, LobeHub, browse.sh, and official skills.

The generated Lux index mirrors catalog metadata needed for discovery: skill name, install identifier, registry/source, tags, repository or author when available, and upstream trust metadata. It does **not** mirror third-party SKILL.md bodies or bulk-copy third-party skill source code. Community descriptions shown by Lux are generic unless Lux has separately curated that item.

A **Lux Curated** badge means Lux selected an item for a role or outcome; it does not mean Lux created the underlying skill or that the source registry endorses Lux. **Lux Verified** is reserved for items that have actually completed the Lux verification workflow.

Lux-owned private skill logic should remain in private Lux repositories or bundled application resources. Do not publish proprietary Lux DNA, customer data, credentials, or internal verification evidence here.

Before installing a third-party skill, review its permissions, scripts, network behavior, license, and provenance. Lux desktop integrations inspect the canonical registry item before installation and do not use a force-install flag.
