# Proposal: keep bulk generated output off `main`

Status: proposal, 2026-09-29. Nothing in this document changes the bot
workflows. `modular-star.yml`, `refresh.yml`, `decisions.yml` and
`coherence.yml` behave exactly as before.

## The problem

`modular-star.yml` runs hourly and commits `LINES.md` (35 MB on 2026-09-29,
one row per unique numbered line) to `main` whenever anything changed.
`refresh.yml` runs hourly and commits `reports/random/graph.json` and the other
report files. Because the line database only grows, `LINES.md` changes on
nearly every run, and each change stores a new 35 MB blob in Git history. The
compressed pack stays smaller than that (Git delta-compresses successive
versions well), but every clone still downloads every version, and every
`git log`, blame and diff on `main` wades through hourly bot commits.

The repository already has the right pattern for its biggest artefact: the
SQLite database and `catalog.json.gz` are uploaded to the `modular-star`
GitHub release with `gh release upload --clobber`, never committed.

## What the file is for

- `README.md`, `code.html`, `WORKLOG.md` and `modular-star/proof.mjs` link to
  `LINES.md` as "every unique line, numbered", served from the `main` branch
  URL (`https://github.com/Ventusltd/stars/blob/main/LINES.md`) and from the
  Pages site (`./LINES.md`).
- `tools/pages-check.mjs` already warns when `LINES.md` is linked without a
  size warning, so the authors know it is heavy.
- `modular-star/coherence.mjs` and `tools/status.mjs` report its size.
- Nothing parses it. It is a human-readable dump of the database; the
  database itself is the source of truth and lives on the release.

## Options, safest first

### Option A: release asset (recommended, smallest change)

In `modular-star.yml`, after `lines.mjs` writes `LINES.md`, upload it to the
existing `modular-star` release next to the database, and drop it from the
`git add` list:

```yaml
      - name: Save the database and catalogue
        run: |
          gzip -9 -c modular.sqlite > modular.sqlite.gz
          gzip -9 -c LINES.md > LINES.md.gz
          ...
          gh release upload modular-star modular.sqlite.gz catalog.json.gz LINES.md.gz --clobber --repo "$GITHUB_REPOSITORY"

      - name: Save reports
        run: |
          python3 spider/register.py
          git add modular library spider code blocks sense proof structure decisions relationships
```

Then repoint the four links to
`https://github.com/Ventusltd/stars/releases/download/modular-star/LINES.md.gz`
and, in the same commit, `git rm LINES.md` (history keeps the old copies) and
add `LINES.md` to `.gitignore`. `modular-star/proof.mjs` should change its
`art:lines` `ext` link, and `coherence.mjs` / `tools/status.mjs` can size the
asset via `gh release view --json assets` or simply drop the entry.

Cost: the Pages site loses the `./LINES.md` link; the release URL replaces it.
Benefit: no more 35 MB blob per hour in `main`.

### Option B: workflow artifact

Upload `LINES.md` with `actions/upload-artifact` in the same job. Artifacts
expire (90 days by default) and are only reachable through the Actions UI or
API, so this suits a debugging dump but not a linked report. Not recommended
for `LINES.md` because four pages link to it.

### Option C: a `generated` branch

Have the bot commit `LINES.md` and `reports/` to an orphan branch named
`generated` instead of `main` (checkout that branch into a second path, write
there, push there). Links would point at
`https://github.com/Ventusltd/stars/blob/generated/LINES.md`. This keeps a
browsable file at a stable URL, but the branch grows at the same rate `main`
does today, and both workflows use `git pull --rebase -X theirs` retry loops
that would need reworking for a second branch. It moves the problem rather
than solving it.

### `reports/random/graph.json`

This file is 80 KB and changes only when star-maker has new results; it is
well within budget and is consumed by the Spider dashboard from `main`. Leave
it. If it ever grows past a few megabytes, apply Option A to it as well.

## Why this PR does not implement Option A

`modular-star.yml` is a 100-minute chained job that restores a database from a
release, refuses to save if any earlier number changed, and is watched by
`proof.mjs`, `coherence.mjs`, `tools/status.mjs` and `tools/pages-check.mjs`.
The change touches six files across the workflow, the link targets and three
scripts that read the file, and it cannot be tested without running the real
workflow against the real release. The instruction for this pass was not to
change the bot workflows in any way that could break them, so the change is
written up here for a run when someone can watch it.

The size guard added alongside this proposal
(`.github/workflows/pr-file-size-guard.yml`) does not touch `main` pushes and
allowlists `LINES.md`, so the bots are unaffected either way.
