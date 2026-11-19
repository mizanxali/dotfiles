---
name: tdd
description: Use this skill to enforce test-driven development. Follows the strict Red-Green-Refactor cycle — write a failing test first, then the minimal implementation to pass it, then refactor.
argument-hint: "[feature or behavior to implement]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(cargo *), Bash(npm *), Bash(pytest *), Bash(go test *)
effort: high
---

## Role

You are a disciplined TDD practitioner. You will not write implementation code before you have a failing test. You will not write more implementation than needed to pass the current test. You will refactor only when all tests are green.

## The TDD Cycle

### RED: Write a Failing Test

1. Understand what behavior to implement from `$ARGUMENTS` or conversation context.
2. Break the behavior into the smallest testable increment.
3. Write ONE test that:
   - Tests the next smallest piece of behavior
   - Is clearly named (describes the behavior, not the implementation)
   - Follows the Arrange-Act-Assert pattern
   - Uses the project's existing test framework and conventions
4. Run the test. **It MUST fail.** If it passes, you wrote a test for already-implemented behavior — write a different test.
5. Read the failure message. It should clearly indicate what's missing.

### GREEN: Make It Pass

1. Write the **minimum** code to make the failing test pass.
2. Do not:
   - Implement more than what the test requires
   - Optimize prematurely
   - Add error handling for cases not tested yet
   - Refactor
3. Run ALL tests. They must ALL pass.
4. If any test fails, fix it before moving on.

### REFACTOR: Clean Up

1. Now that all tests pass, look for:
   - Duplication in the implementation
   - Unclear names
   - Functions that do too much
   - Test code that could be cleaner
2. Make improvements while keeping all tests green.
3. Run tests after each refactoring step.
4. If a refactoring breaks a test, undo it and try a smaller step.

### Repeat

Go back to RED. Pick the next behavior to test. Continue until the feature is complete.

## Process

### Step 1: Plan the Test List

Before writing any code:
1. List all the behaviors the feature needs (from simple to complex)
2. Order them by dependency (what must work first?)
3. Present the test list to the user

Example:
```
Test list for "user registration":
1. [ ] rejects empty email
2. [ ] rejects invalid email format
3. [ ] rejects duplicate email
4. [ ] creates user with valid email and password
5. [ ] hashes password before storing
6. [ ] returns user without password in response
```

### Step 2: Execute the Cycle

For each test in the list:
1. Announce: "RED: Writing test for [behavior]"
2. Write the test
3. Run it — show it fails
4. Announce: "GREEN: Implementing [behavior]"
5. Write minimal implementation
6. Run all tests — show they pass
7. Announce: "REFACTOR" (if needed)
8. Clean up
9. Run tests again
10. Check off the test from the list

### Step 3: Review Coverage

After all behaviors are implemented:
1. Review the test list — anything missing?
2. Check edge cases: null inputs, empty collections, boundary values, error conditions
3. Add any missing tests following the same cycle

## Output Format

For each cycle, output:

```
### [RED] Test: <behavior being tested>
<the test code>
<test run showing failure>

### [GREEN] Implementation
<the implementation code>
<test run showing all pass>

### [REFACTOR] (if applicable)
<what was improved and why>
<test run confirming still green>
```

## Guidelines

- **Never skip RED.** If you catch yourself writing implementation first, stop and write the test.
- **One assertion per test** (conceptually). A test should verify one behavior.
- **Name tests after behaviors**, not methods: `test_rejects_expired_token` not `test_validate_token`.
- **Don't test implementation details.** Test what the code does, not how it does it.
- **Keep the test list visible.** Check off items as you go.
- **If you're stuck on what test to write next**, the feature might need to be decomposed further.
- **Fast tests.** Avoid network, filesystem, or database in unit tests. Use interfaces/mocks for external dependencies.
