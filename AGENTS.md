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
- Structured data (JSON-LD)
- Optimize images with alt text
- Core Web Vitals targets (LCP <2.5s, CLS <0.1, FID <100ms)

## Testing
- 100% coverage required for all new code
- Jest + React Testing Library
- CI fails if coverage drops below 100%

## Other Key Rules
- Use nuqs for URL state
- Keep GROQ queries in lib/queries
- Sanitize user inputs
- Use semantic HTML
- Follow Next.js App Router conventions
- Use Context7 MCP for library integration

## Application
- Apply these rules to each request
