# Project Rules

## Purpose & Goals
- Commercial project focused on ranking #1 on Google
- SEO-first approach
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
- Title tags: 50-60 characters
- Meta descriptions: 150-160 characters
- One <h1> per page (50-70 chars)
- Minimum 300 words per page (prefer 800-1200)
- Open Graph tags
- Structured data (JSON-LD) using page-appropriate schema types
- `FAQPage` audit policy (Google-focused): on commercial/transactional pages (category, product, landing pages), missing `FAQPage` JSON-LD is not an SEO error and must be reported as informational only
- For informational/help pages where FAQ rich-result strategy is explicitly used, missing `FAQPage` JSON-LD should still be flagged as an SEO issue
- If Google eligibility guidance changes, re-evaluate this rule and update audit severity accordingly
- Optimize images with alt text
- Core Web Vitals targets (LCP <2.5s, CLS <0.1, FID <100ms)

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
