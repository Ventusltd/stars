# Links and composition evidence

Changes prepared against Stars 9f0d405632a515030509556535af949bdb7cef51.

Compatibility, Classification and Sampling now carry gh/ext links. Explicit family identities open code.html?family=N; historical electron/soul numbers remain report links because they are a different numbering system. Elements open their table block, repositories open GitHub, and decay examples use actual star filenames.

Both chemistry and block reactions judge the observations containing each pair: at least three observations and at least 90% actually red. Amber is not red. Mixed observations have a distinct mixed-evidence relationship through the Assessment and card annotation builders. Missing or malformed composition evidence fails the build. The Classification proof link uses reports/CLASSIFICATION.md.

## Local evidence, 14 September 2026

These are isolated builds, not measurements of published bytes. Source observations: star-maker c5bf5f6518feba594bb057988e8e99ca81044952, 4,228 records. Initial corrected Compatibility build had 125 nodes and 129 edges, but retained an older filter excluding pairs with independently unstable elements. Removing that filter yields 125 nodes and 135 distinct edges, including six qualifying unstable pairs. Each is 66 red out of 66 observations: Si(202609051525), Si(202609051526) and Si(202609051529), each paired with Sp and Ug. This replaces the earlier zero-unstable finding. It does not establish which element caused a failure.

Classification: 305 nodes / 300 edges; Sampling: 163 / 150. Every node in all three graphs has gh and ext. Block-level reactions aggregate versions: 194 pairs, comprising 188 app-co-occurrence pairs and six mixed-evidence pairs. Their roughly 77% green observations do not qualify as unstable. Version-specific and aggregate pairs are different populations.

Validation: node --test builders/links-and-evidence.test.mjs; isolated chemistry, vedic and random builds; isolated reactions build; duplicate-edge and link coverage checks; independent red/total recalculation of all six unstable edges. The regression fixture explicitly includes an independently unstable element so the previous exclusion cannot recur unnoticed.

No main branch, generated public graph or published page is changed here. The publisher should rebuild from its selected current inputs and review the mixed-evidence display in the served dashboard.
