---
name: interrogate
description: 'Use for "interrogate", "adversarial review", "challenge this", "stress test this code", "find blind spots", or "tear this apart". Adversaries try to break a change or design, and only findings proven by a run survive.'
---

# Interrogate

Adversaries try to break a change or a design. A finding survives only when a run proves it. Report the findings. Do not apply fixes.

## Frame

The scope is what the user names. Otherwise it is `git diff main...HEAD` through the working tree. State the intent clearly in your own words from the user's message, commits, and changed files. Ask the user when intent is unclear.

## Fan out

Launch one or more independent `self` subagents via `invoke_subagent` (`TypeName: "self"`, `Workspace: "share"` when running commands that touch files, or `"research"` for read-only inspection) with the scope, the intent, and this brief:

> Break this change. Prove each finding with a run against the real code, such as a failing test, a repro script, or command output that shows the wrong behavior. For a design or plan, run a prototype or probe the current tree. Report each finding with a title, the exact command, the output it printed, and the output the intent requires. Leave out anything you did not run. That covers style, naming, structure, and risks that need a future change to matter. No findings is a valid result.

## Verify

Verify each finding by rerunning its command in the current workspace. Keep a finding when the output shows the failure and the failure breaks the intent. Drop the rest. Merge findings that share a root cause.

## Output

- **Intent**: the restatement.
- **Findings**: for each verified finding, the command, its output, and how it breaks the intent. Say "no verified findings" when none survive.
- **Dropped**: count of dropped findings and why.
