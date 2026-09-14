# Decisions

The maps of globalgrid2050 architecture development hold facts with permanent keys: every block has a symbol and a
number, every function family has a number, every constant has a symbol. This folder holds the judgements attached
to those keys, one small file each, numbered `d001`, `d002`, … and never renumbered. Together they are the record of
experience the maps cannot compute for themselves, and the material a future assistant is built from.

## Recording a decision, by clicks

1. Open **[New decision](https://github.com/Ventusltd/stars/issues/new?template=decision.yml)** (it works on a phone).
2. Choose **Record**: a decision, or an open question to come back to.
3. Choose the **subject type** and pick the **subject key** from the list (constants first, then the named blocks).
   A family number or a pair of blocks goes in the box below the list, for example `family:511` or `Ek+Gc`.
4. Type the **question** in one sentence, the **decision** in one or two, and the **rationale** in plain words.
   The rationale is the valuable part: it is the experience behind the choice.
5. Paste **evidence** links, one per line, and say **what agents may now do** on this key.
6. Submit. Nothing else to do.

## What happens next

- Within a minute the `Decisions` workflow gives the record the next free number, writes `decisions/dNNN.json`,
  commits it, and closes the issue with a comment linking to the record.
- At the next Modular star run (hourly) the record appears on the **Decisions** map of the dashboard, wired to the
  block, constant or family it concerns. Open records are amber, decided ones green, superseded ones grey.
- If the record could not be written (an empty question, or a decision with no decision text) the workflow says so
  in a comment. Edit the issue and add the `decision` label again to retry.

To change a decision, record a new one and put the old id in **Supersedes**. The old record stays, marked
superseded. Nothing is deleted.

## How agents use the records

- **A decided record is permission.** An agent working on a key reads its records; where a `decided` record says
  what agents may do, the agent may do it without asking.
- **An open record is a question.** The agent may gather evidence and propose, but may not change the key.
- **No record is no permission** on the twelve unsettled constants and anything else marked as a decision.

## The seed records

Sixteen records were written on 14 September 2026, all open: `d001` to `d012` are the twelve unsettled constants
(one record each, with the values in use as candidates); `d013` the dashboard drill-in question; `d014` whether the
engine's named radii settle the earth-radius question (with `d002`); `d015` the three remaining evidence packs;
`d016` the private repositories. The first decision to take is `d014`: it settles `d002` with it.

The record format is in `SCHEMA.md`; `example.json` is a filled-in example.
