# Project Rules

## Purpose & Goals
- Commercial project focused on ranking #1 on Google
- SEO-first approach
- We sell only across the UK
- Natural English tone (Ukrainian living in England)
- Never use `any` in TypeScript
- Always use Context7 MCP when working with libraries/APIs
- Context7 MCP may be used for any project task where current external documentation improves accuracy, including implementation, debugging, refactoring, review, and verification

## Tech Stack
- Next.js 16.2.3 (App Router)
- React 19.2.5
- TypeScript 5.9.3
- Tailwind CSS 4.1.17 with DaisyUI 5.5.8
- Sanity 5.23.0 with next-sanity 12.3.2
- DaisyUI for all UI components
- pnpm for package management
- Node 20.9+

## Code Style
- Standard.js style guide
- 2 space indentation
- Single quotes (except when escaping)
- No semicolons unless required
- Strict equality (===)
- camelCase for variables/functions
- PascalCase for React components
- Never use `any` in TypeScript

## UI & Styling
- DaisyUI for all new UI components
- Do not use MUI or Emotion
- Use design tokens (no hardcoded colors/fonts)
- All colors, fonts, spacing from design system
- Tailwind for layout and utilities
- Do not duplicate styles; extract shared class strings or utilities and reuse
- Do not change visible design or page text without explicit user permission
- Do not remove homepage SVG assets; they are part of the approved design
- Use the homepage enquiry form success message styling for all new or updated success messages: `alert alert-success w-full items-start text-sm` with the same check-circle icon and compact text layout, unless the user explicitly asks for a different design
- Cookie consent UI must appear immediately on initial page load; do not defer or delay the banner for performance optimization

## React Best Practices
- Function components
- Hooks at top level
- React.memo, useCallback, useMemo when appropriate
- Prefer Server Components
- Limit `use client` to real client needs

## SEO Requirements
- Follow current Google Search Central guidance as the source of truth for SEO decisions
- Page titles:
  - Use unique, descriptive, human-readable `<title>` text
  - Do not enforce hard character limits (Google truncates snippets by device width)
  - Use length ranges only as editorial guidance, never as a hard SEO pass/fail gate
- Meta descriptions:
  - Write unique, page-specific summaries that help users decide to click
  - Do not enforce hard character limits (Google may rewrite snippets)
  - Treat meta description quality as CTR optimization, not a direct ranking lever
- Headings:
  - Use semantic heading hierarchy to structure content clearly
  - Require one clear primary page heading, but do not enforce H1 character limits
  - Do not use heading count/length as a hard SEO gate
- Content quality:
  - Remove minimum word-count mandates
  - Require content to satisfy user intent with useful, original, non-thin information
  - Use depth/coverage as contextual quality criteria, not fixed word targets
- Open Graph:
  - Keep Open Graph tags for social sharing quality
  - Do not treat Open Graph presence/length as a direct Google ranking requirement
- Structured data (JSON-LD):
  - Use only schema types supported by Google Search Central documentation
  - Structured data must match visible page content and avoid misleading markup
  - Validate using Rich Results Test / Schema validation in CI where applicable
  - Missing optional schema types should be informational unless a strategy explicitly depends on them
- `FAQPage` audit policy (Google-focused):
  - For this site category (commercial, non-government, non-health), missing `FAQPage` JSON-LD is informational only
  - If FAQ markup is implemented, it must reflect visible on-page FAQ content exactly
  - Re-evaluate policy if Google FAQ rich-result eligibility guidance changes
- Images:
  - Use descriptive, context-relevant `alt` text for meaningful images
  - Avoid keyword stuffing in alt text
- Core Web Vitals targets:
  - LCP <=2.5s for release readiness
  - Aim for mobile LCP <=2.0s to keep a safety margin for real-user variance
  - If LCP cannot be improved further without visible design changes, explain the tradeoff and ask permission before editing
  - Release exception: a release may proceed with mobile lab LCP above 2.5s only when non-visible optimizations have already been applied, SEO is 100, CLS is <0.1, functional/security checks pass, and the remaining LCP work would require visible design changes or delaying the required cookie consent UI. Document the affected pages, Lighthouse report date, and treat this as a known performance risk to monitor after release.
  - CLS <0.1
  - INP <200ms

## Testing
- Jest + React Testing Library
- CI coverage gate:
  - Statements >=85%
  - Branches >=70%
  - Functions >=80%
  - Lines >=85%
- High-risk code should target 90-100% meaningful coverage: payments, auth, order handling, validation, email sending, schema generation, security checks, API routes, and user-submitted data flows
- New or changed high-risk code must include tests for success paths, validation failures, authorization failures, and important error handling
- Config files, generated files, static metadata, visual-only wrappers, and framework glue may be excluded from coverage when they contain little or no business logic
- Do not lower coverage thresholds without explicit user permission

## Internal Tools
- `/studio` is an internal Sanity Studio tool, not a public customer-facing page
- Exclude `/studio` from public release readiness audits, public page/device sweeps, SEO scoring, Core Web Vitals scoring, and customer-facing feature review
- Do not treat `/studio` issues as release blockers unless the user explicitly asks to audit or release the internal Studio
- Still keep `/studio` internal-safe: noindex/nofollow, not promoted in public sitemap/navigation, and protected by appropriate Sanity project/origin/access controls

## Security Requirements
- Commercial-grade security is mandatory for all features and changes
- Apply defense-in-depth and secure-by-default design
- Protect against OWASP Top 10 risks (including XSS, CSRF, SSRF, SQL/NoSQL injection, auth/session abuse, and insecure deserialization)
- Validate and sanitize all untrusted input on both client and server
- Enforce authentication, authorization, least privilege, and secure secret handling
- Use HTTPS, secure cookies, strict security headers, and safe CORS policies
- During code review, include an explicit security check and document risks plus mitigations

## Other Key Rules
- Use nuqs for URL state
- Keep GROQ queries in lib/queries
- Sanitize user inputs
- Use semantic HTML
- Follow Next.js App Router conventions
- Follow official Next.js best practices for architecture, rendering, data fetching, caching, and performance
- Use Context7 MCP for library integration
- Use Context7 MCP everywhere it is helpful, including code reviews and debugging, while keeping the local codebase as the source of truth for project-specific behavior
- Use React Query for all data requests
- For all `fetch` requests, always pass an `AbortSignal` via the `signal` option and support cancellation
- Keep non-essential cookies/scripts blocked until consent, but keep the consent banner visible immediately on first load
- During every code review, explicitly check and report compliance with all project rules in this file

## Application
- Apply these rules to each request
