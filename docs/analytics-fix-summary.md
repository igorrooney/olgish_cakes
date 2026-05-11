# Consent-Gated Analytics Setup

Date: May 11, 2026

## Current Implementation

Olgish Cakes uses Google Tag Manager as the only public analytics loader.
Google Analytics 4 must be configured inside GTM, not with a direct `gtag.js`
snippet in the Next.js app.

The app sets Google Consent Mode defaults to denied on initial page load, then
loads GTM only after the visitor accepts optional cookies or has a saved
accepted consent choice.

## Required Environment Variable

Production must define:

```env
NEXT_PUBLIC_GTM_ID=GTM-5JZDTM8N
```

Do not configure these legacy variables:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTAG_ID=
```

## Regression Checks

The initial HTML must not contain:

- `googletagmanager.com/gtag/js`
- `googletagmanager.com/ns.html`
- `GTM-XXXXXXX`
- `G-QGQC58H2LD`

Before consent, `window.gtag` drops `event` and `config` calls so client
components cannot queue analytics events for later replay. After analytics
consent is granted, event calls are allowed and GTM can load the GA4 tag from
the configured container.

## Deployment Checklist

1. Set `NEXT_PUBLIC_GTM_ID=GTM-5JZDTM8N` in Vercel Production.
2. Redeploy the latest commit.
3. In GTM, confirm the GA4 tag uses the correct measurement ID.
4. In a clean browser session, confirm no Google Analytics or GTM network
   requests happen before consent.
5. Click "Accept optional cookies" and confirm GTM loads with `GTM-5JZDTM8N`.
