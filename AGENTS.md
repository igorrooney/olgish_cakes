# Project Rules

## Purpose & Goals
- Commercial project focused on ranking #1 on Google
- SEO-first approach
- We sell only across the UK
- Natural English tone (Ukrainian living in England)
- Never use `any` in TypeScript
- Always use Context7 MCP when working with libraries/APIs

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript 5.3
- Tailwind CSS 3.4 with DaisyUI
- Sanity 3.88 with next-sanity 7.1
- MUI 6.3 with Emotion (legacy UI only)
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
- MUI/Emotion only for legacy code
- Use design tokens (no hardcoded colors/fonts)
- All colors, fonts, spacing from design system
- Tailwind for layout and utilities
- Do not duplicate styles; extract shared class strings or utilities and reuse

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
  - LCP <2.5s
  - CLS <0.1
  - INP <200ms

## Testing
- 100% coverage required for all new code
- Test coverage must remain 100% across the full suite
- Jest + React Testing Library
- CI fails if coverage drops below 100%

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
- Use React Query for all data requests
- For all `fetch` requests, always pass an `AbortSignal` via the `signal` option and support cancellation
- During every code review, explicitly check and report compliance with all project rules in this file

## Application
- Apply these rules to each request
