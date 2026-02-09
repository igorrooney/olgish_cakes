# peer-review

You are reviewing a commercial Next.js app for Olgish Cakes. Pull the target PR via GitHub MCP and review the diff and repo. Use Next.js MCP and Context7 to load best practices for every dependency in package.json. Work from the PR diff, CI outputs, and local runs. Propose precise fixes. Apply safe autofixes where low risk. Follow the project scripts.

Inputs
OWNER: igorrooney
REPO: olgish_cakes
PR_NUMBER: <number>

MCP tasks

1. GitHub MCP

   * Get PR metadata by owner, repo, and PR number
   * Download the full diff
   * List changed files
   * Fetch file blobs for changed files
   * Get PR reviews and review comments
   * Get workflow runs and logs for this PR
   * Get check runs and artifacts
2. Repo context

   * Read package.json, tsconfig, next.config.*, eslint config, jest config, tailwind config, postcss config, sanity config, env examples, scripts under scripts
   * Infer Next.js version, React version, TypeScript version, ESLint version, Jest and Testing Library versions
   * Load best practices for these versions using Next.js MCP and Context7
3. Local checks

   * pnpm install
   * pnpm run type-check
   * pnpm run lint
   * pnpm run test
   * pnpm run validate:schemas
   * If any step fails, record exact errors and files
4. Operational checks

   * pnpm run analyze or bundle-analyzer if client bundles changed
   * pnpm run perf:check
   * pnpm run accessibility:check
   * pnpm run lighthouse:test
   * pnpm run seo:check
   * Summarize key findings and report paths for any generated reports

Standards to enforce
TypeScript

* No any unless a clear narrowing path is present
* unknown only with runtime guards
* Explicit types on public functions and API handlers
* Validate external inputs with zod in API routes and server actions
* Respect strict null checks
* Avoid non null assertions
* Surface every as cast and propose safer typing

Lint and hygiene

* Remove unused imports and variables
* Remove commented or dead code
* Keep module aliases consistent
* No console logs in production paths
* Env var access only on the server when needed
* ESLint 9 and typescript-eslint 8 must be in sync

Tests

* Cover all new logic introduced by the PR
* UI tests with Testing Library focus on roles, labels, and visible behavior
* Utility tests with focused Jest units
* Mock network and time with stable helpers
* Check coverage on changed lines and branches
* If coverage is missing, write tests next to the module
* Ensure test and test:coverage both pass

Next.js and React

* Follows App Router guidance for Next 16
* Prefer React Server Components where possible
* Use client components only for state, effects, or browser APIs
* Use async server functions for data access
* Route handlers use correct status, headers, cookies, and caching
* Set revalidate or cache per route with a reason
* Use next/image for images with correct sizes and priority
* Ensure metadata, Open Graph, and JSON-LD where pages changed
* React 19 types must pass and effects must be idempotent

Performance

* Identify render blocking on changed pages
* Defer noncritical JS and hydrate smaller trees
* Only add memoization with evidence
* Report any bundle size increases and a plan to recover

Accessibility

* Roles, names, labels, focus order, and contrast verified on changed components
* No keyboard traps
* Add a11y tests where risk exists

SEO

* Use Next metadata for title, description, canonical, robots, and Open Graph
* JSON-LD via schema-dts on key pages must validate

Security

* Audit auth and token logic with jose
* Validate algorithm, audience, issuer, expiry, and clock skew
* Never expose secrets in the client bundle
* Sanitize Sanity and user inputs
* Validate API request payloads with zod
* Restrict allowed methods and apply CSRF where needed
* For uploads using S3, Azure, or GCS, verify signed URL scopes and bucket rules

Sanity and schemas

* Run validate:schemas and test:schemas if schemas changed
* Verify GROQ queries and handle nullability in UI and types
* Add tests for query transforms

Styling systems

* Do not mix Emotion and styled-components in one component tree
* Keep Tailwind usage minimal and consistent
* Remove unused MUI variants and styles
* Verify MUI 6 and Emotion SSR setup for Next 16 and React 19

Scripts present in package.json to use

* type-check
* lint, lint:fix, lint:quiet
* test, test:watch, test:coverage, test:ci
* validate:schemas, validate:schemas:real, test:schemas
* analyze, bundle-analyzer
* perf:check, performance
* accessibility:check, accessibility:audit
* lighthouse, lighthouse:test
* seo:check, seo:report, seo:optimize, seo:full-analysis
* optimize:render-blocking, optimize:checklist
* backup scripts where code paths changed

Deliverables

1. Summary

   * Scope of changes and risk level
2. Checklist with pass or fail

   * Type check
   * Lint
   * Tests
   * Schema validation
   * Accessibility
   * Performance
   * SEO
   * Security
3. For each failed item

   * Exact error output or evidence
   * Minimal diffs to fix
   * Commands to rerun
4. Test additions

   * Include full contents of any new or updated test files
5. Targeted code suggestions

   * Small code blocks only where changes are required
6. PR comment text

   * Ready to paste in GitHub

Autofix policy

* Apply autofixes for unused imports, variables, and simple lint errors
* Do not commit changes that alter behavior without a clear test

GitHub MCP steps to execute

* github.getPullRequest { owner: OWNER, repo: REPO, pull_number: PR_NUMBER }
* github.getPullRequestFiles { owner, repo, pull_number }
* github.getPullRequestDiff { owner, repo, pull_number }
* github.listReviews { owner, repo, pull_number }
* github.listReviewComments { owner, repo, pull_number }
* github.listWorkflowRuns { owner, repo, event: pull_request, branch: from PR }
* github.getWorkflowRunLogs for the latest PR run
* github.listCheckRunsForRef for the PR head SHA
* Download artifacts if present and attach findings

Output format

* One paragraph summary
* Checklist with pass or fail
* Fixes with minimal diffs and commands
* New or updated tests in full
* Final PR comment draft ready to post
