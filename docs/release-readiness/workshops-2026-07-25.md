# Workshop page production release check — 25 July 2026

## Scope

- Route: `/learn/workshops`
- Environment: local Next.js 16.2.3 production build served with `next start`
- Lighthouse profile: default mobile emulation
- Deployment: not performed

## Release outcome

The route is eligible for the documented mobile LCP release exception in `AGENTS.md`.

- The optimized production build completed successfully.
- Accessibility, SEO and Best Practices scored 100 in all three final runs.
- CLS remained below 0.1.
- Functional, security, lint, TypeScript, Jest coverage and structured-data checks passed.
- The required cookie consent UI remains visible immediately.
- The enquiry form remains in the initial HTML without deferred visibility or a skeleton.

## Final Lighthouse results

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 84 | 100 | 100 | 100 | 1,534 ms | 4,343 ms | 0.0001 | 101 ms |
| 2 | 85 | 100 | 100 | 100 | 1,667 ms | 4,281 ms | 0.0001 | 80 ms |
| 3 | 85 | 100 | 100 | 100 | 1,521 ms | 4,237 ms | 0.0001 | 97 ms |
| Median | 85 | 100 | 100 | 100 | 1,534 ms | 4,281 ms | 0.0001 | 97 ms |

Reports:

- `output/playwright/workshops-production-final-run-1.json`
- `output/playwright/workshops-production-final-run-2.json`
- `output/playwright/workshops-production-final-run-3.json`

## Known performance risk

The mobile lab LCP is above the 2.5-second release target. The LCP element is the primary red portfolio cake. It is the only preloaded image, uses an accurate `sizes` value, transfers about 11.7 KB as AVIF and now has explicit high fetch priority.

The image finishes loading well before the simulated LCP timestamp. The remaining delay is dominated by page-wide style and layout work while preserving the complete server-rendered enquiry form and immediate consent UI. Further material reduction would require a visible hero/layout change, restoring deferred visibility for the form, or delaying the consent UI. Those changes were not made because they conflict with the approved page requirements.

Monitor real-user mobile LCP after deployment using field data. Revisit the hero layout or form-rendering constraint if field LCP remains above 2.5 seconds.
