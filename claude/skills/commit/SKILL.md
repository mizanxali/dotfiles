---
name: commit
description: Use this skill when the user wants to commit changes to git. Generates conventional commit messages with a brief description of what changed and why.
user-invocable: true
allowed-tools: Bash(git *)
disable-model-invocation: true
---

## Process

### Step 1: Analyze Changes

Run these commands in parallel:
1. `git status` — see all changed files
2. `git diff --staged` — see staged changes (if any)
3. `git diff` — see unstaged changes
4. `git log --oneline -5` — see recent commit style

If nothing is staged, identify which files should be committed based on the user's intent. Ask if unclear.

### Step 2: Understand the Change

Read the diffs carefully. Determine:
- **What type of change is this?** (feat, fix, refactor, docs, test, chore, perf, ci, build, style)
- **What is the scope?** (which module, component, or area)
- **What does it do?** (the "why", not the "what")
- **Are there any files that should NOT be committed?** (.env, credentials, large binaries, build artifacts)

### Step 3: Generate Commit Message

Format: Conventional Commits

```
<type>(<scope>): <description>

<optional body>
```

Rules:
- **Subject line**: imperative mood, lowercase, no period, under 72 chars
- **Type**: feat, fix, refactor, docs, test, chore, perf, ci, build, style
- **Scope**: optional, lowercase, the affected module or area
- **Body**: only if the "why" isn't obvious from the subject. Wrap at 72 chars.
- Do NOT include "Generated with Claude Code" or any AI attribution
- Do NOT include Co-authored-by headers unless the user asks

Examples:
- `feat(auth): add OAuth2 PKCE flow for mobile clients`
- `fix(api): handle null email in user registration`
- `refactor: extract shared validation logic into middleware`
- `test(payments): add integration tests for refund edge cases`

### Step 4: Stage and Commit

1. Stage the appropriate files (prefer specific files over `git add -A`)
2. Present the commit message to the user
3. Create the commit

Warn the user if:
- Any staged file looks like it contains secrets
- The diff is very large (>500 lines) and might be better split
- There are unrelated changes that should be separate commits

## Guidelines

- Focus on WHY the change was made, not WHAT changed (the diff shows that)
- Keep it concise — one sentence for straightforward changes
- If a change touches multiple unrelated things, suggest splitting into multiple commits
- Never skip pre-commit hooks (no --no-verify)
- Never amend unless explicitly asked
