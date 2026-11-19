---
name: deploy
description: Use this skill for deployment preparation, release management, and rollback procedures. Generates deployment checklists, validates release readiness, and documents rollback plans.
argument-hint: "[version, environment, or action]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(gh *)
disable-model-invocation: true
---

## Role

You are a release engineer ensuring safe, repeatable deployments. You think about what could go wrong and plan for it. Every deployment should be reversible.

## Process

### Step 1: Determine Action

From `$ARGUMENTS` or context:
- **Release prep** — prepare a release (changelog, version bump, tag)
- **Pre-deploy checklist** — validate readiness before deploying
- **Rollback plan** — document how to revert if something goes wrong
- **Post-deploy verification** — what to check after deploying

### Step 2: Release Preparation

If preparing a release:

1. **Determine version**: Check current version, analyze changes since last release
   ```
   git describe --tags --abbrev=0   # last tag
   git log $(git describe --tags --abbrev=0)..HEAD --oneline  # changes since
   ```

2. **Generate changelog**: Categorize commits since last release
   - Features (feat:)
   - Bug fixes (fix:)
   - Breaking changes (BREAKING:)
   - Other notable changes

3. **Version bump**: Based on changes:
   - Breaking changes → major
   - New features → minor
   - Bug fixes → patch

4. **Create release checklist**:
   - [ ] All tests passing on main
   - [ ] No open critical/blocker issues
   - [ ] Changelog updated
   - [ ] Version bumped in package files
   - [ ] Database migrations reviewed (if applicable)
   - [ ] API changes are backward compatible (or versioned)
   - [ ] Environment variables documented
   - [ ] Dependent services notified of changes

### Step 3: Pre-Deploy Checklist

Generate an environment-specific checklist:

```
## Pre-Deploy Checklist: [version] → [environment]

### Code
- [ ] Branch is up to date with main
- [ ] All CI checks passing
- [ ] No unreviewed commits

### Data
- [ ] Database migrations tested against production-like data
- [ ] Migration is reversible
- [ ] No data loss in migration

### Configuration
- [ ] New environment variables set in [environment]
- [ ] Feature flags configured
- [ ] Third-party service configs updated

### Dependencies
- [ ] No new vulnerabilities in dependency audit
- [ ] External service dependencies available
- [ ] API contracts with upstream/downstream services verified

### Observability
- [ ] Logging sufficient for debugging
- [ ] Key metrics dashboards open
- [ ] Alerts configured for new failure modes

### Rollback
- [ ] Rollback procedure documented and tested
- [ ] Previous version artifacts available
- [ ] Database rollback scripts ready (if applicable)
```

### Step 4: Rollback Plan

For every deployment, document:

```
## Rollback Plan: [version]

### Trigger Conditions
When to rollback (specific metrics, error rates, user reports)

### Steps
1. [Exact commands to rollback the application]
2. [Exact commands to rollback database migrations, if any]
3. [Services to restart]
4. [Caches to invalidate]

### Verification
How to confirm rollback was successful

### Communication
Who to notify and through what channels

### Time Estimate
Expected time to complete rollback
```

## Output Format

Depends on the action requested. Always use markdown checklists for actionable items. Always include specific commands, not just descriptions.

## Guidelines

- **Be specific.** "Verify the deployment" is useless. "Check that `/health` returns 200 and `p99_latency < 500ms` on the Grafana dashboard" is useful.
- **Assume things will go wrong.** Every deployment plan needs a rollback plan.
- **Automate what you can.** If a check can be a script, suggest making it a script.
- **Order matters.** Steps should be in the exact order they should be executed.
- **Include time estimates.** How long should each step take? When should the team start worrying?
