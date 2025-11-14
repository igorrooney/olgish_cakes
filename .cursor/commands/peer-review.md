# peer-review

Goal
Perform a full, professional PR review for a commercial Next.js app. Enforce best practices across code, tests, security, performance, accessibility, and SEO. Use Next.js MCP and Context7 to pull best practices for every library in package.json. Work from the diff and the repo. Propose concrete fixes. Apply safe autofixes.

Project facts
Next 16 with App Router. React 19. TypeScript 5.3.
Node 20.9+. pnpm 10.8.0.
Testing with Jest 29 and Testing Library.
Styling via Tailwind and MUI 6. Emotion present. styled-components present.
CMS via Sanity 3.88 with next-sanity 7.1.
Key libs: dayjs, framer-motion 11, next-themes, nuqs, zod, jose, schema-dts, web-vitals, resend.
Build flags: next build with webpack flag set.
CI script runs type-check, lint, test:ci, validate:schemas.
Performance, SEO, a11y, Lighthouse, and bundle analyzer scripts exist.
Backups and schedulers present with node-cron and cloud SDKs.

What to do

1. Set context
   Load Next.js MCP. Load Context7.
   Ingest package.json, tsconfig, next.config, eslint, jest config, tailwind config, postcss config, sanity config, and all repo scripts under scripts/.
   Pull current best practices for:
   Next 16 App Router, React 19, TypeScript 5.3, ESLint 9, Testing Library 14, Jest 29, Tailwind 3.4, MUI 6, Emotion 11, styled-components 6, Sanity 3.88, next-sanity 7.1, zod 3.22, jose 6, web-vitals 5, lighthouse 11.
   Prioritize RSC, server actions, and route handlers.

2. Run local checks
   Run in this order:
   pnpm install
   pnpm run type-check
   pnpm run lint
   pnpm run test
   pnpm run validate:schemas
   If any step fails, report file paths and exact errors. Propose minimal diffs to pass.

3. Diff-driven review
   Scan the diff. For each changed file:
   Flag correctness risks and hidden bugs.
   Compare against Next 16 and React 19 guidance.
   Propose targeted edits with short code blocks.
   Explain why each change improves safety, performance, or readability.

4. TypeScript quality
   No any without a clear reason and a narrowing path.
   Use unknown with runtime guards only.
   Add explicit types on public functions and API handlers.
   Validate external inputs at the edge with zod. Narrow types early.
   Respect strict null checks. Avoid non-null assertions.
   Avoid implicit any in generics and inference holes.
   Surface widening casts with as. Offer safer typing.

5. Lint and hygiene
   Remove unused imports and variables.
   Delete commented or dead code paths.
   Keep module aliases and boundaries consistent.
   No console logs in production paths.
   Access env vars in server code only where needed.
   Confirm ESLint 9 config aligns with TypeScript ESLint 8. Report any parser or plugin drift.

6. Tests
   All new logic must be covered.
   For UI, add Testing Library tests focused on behavior and roles.
   For utilities, add focused Jest unit tests.
   Mock network and time with stable helpers.
   Check coverage for changed lines and branches.
   If coverage is missing, write tests and co-locate with the module.
   Verify test and test:coverage both pass.

7. Next.js specifics
   Prefer RSC where possible.
   Use client components only when state, effects, or browser APIs exist.
   Use async server functions for data access.
   Audit route handlers. Check headers, cookies, caching, and status codes.
   Set revalidate or cache per route with a clear reason.
   Use dynamic import for heavy client-only modules.
   Use next/image for images. Verify sizes and priority usage.
   Verify metadata, Open Graph, and JSON-LD where pages changed.

8. React 19 readiness
   Check use of use client. Remove where not needed.
   Audit effects for double-invoke issues. Ensure idempotent logic.
   Confirm strict mode expectations.
   Flag any legacy patterns that break with React 19 types.

9. Performance
   Run pnpm run analyze or bundle-analyzer when size increases.
   Run pnpm run perf:check and pnpm run performance if relevant.
   Identify render blocking and hydration cost on changed pages.
   Defer noncritical JS. Hydrate smaller trees.
   Recommend memoization only with evidence. Include rationale.
   Report web-vitals impact if routes changed.

10. Accessibility
    Run pnpm run accessibility:check.
    Verify ARIA roles, labels, keyboard traps, tab order, and focus styles.
    Check color contrast for changed components.
    Add tests for key a11y behaviors.

11. SEO
    Use Next metadata. Verify title, description, canonical, robots, and Open Graph.
    Use schema-dts on key pages. Validate JSON-LD.
    Run pnpm run seo:check or seo:report. Summarize results and diffs.

12. Security
    Audit auth and tokens with jose.
    Verify algorithm, audience, issuer, expiry, and clock skew.
    Do not expose secrets in the client bundle.
    Sanitize inputs from Sanity and users.
    Validate request payloads in API routes with zod.
    Restrict allowed methods. Enforce CSRF where relevant.
    For uploads, verify bucket policies and signed URL scopes across AWS, Azure, and GCP SDKs.

13. Sanity and schemas
    If schemas changed, run pnpm run validate:schemas and test:schemas.
    Verify GROQ queries for stability and type safety.
    Handle nullability in UI and types.
    Add tests for key queries or transforms.

14. Styling systems
    Do not mix Emotion and styled-components within the same component tree.
    Prefer a single styling approach per tree.
    Keep Tailwind classes minimal and consistent.
    Remove unused MUI variants and styles.
    Verify MUI 6 and Emotion SSR setup with Next 16. Confirm cache provider placement.

15. DX and CI
    Keep the repo green on pnpm run ci.
    Respect engines. Node >= 20.9. pnpm >= 8.
    Explain any resolutions and overrides. Confirm no version drift.
    Recommend pre-commit hooks for lint, type-check, and tests on changed files.
    Validate next build with webpack flag is intentional. Explain tradeoffs.

16. Operational scripts
    Run and report on:
    lighthouse, lighthouse:test
    accessibility:audit
    seo:optimize, seo:full-analysis
    bundle-analyzer and analyze
    perf:check
    backup scripts where code paths changed
    Summarize findings. Attach generated reports paths.

Output format
Start with a one paragraph summary of scope and risk.
Provide a checklist with pass or fail for each area above.
Under each failed item, include code suggestions or exact commands to fix.
Include any new or updated test files in full.
End with a short PR comment draft ready to post.

Reviewer comment template to post on the PR

Summary
What changed, risk areas, and user impact.

Status
Type check
Lint
Tests
Schema validation
Accessibility
Performance
SEO

Notes
Key code suggestions
Follow ups before merge
Follow ups after merge

