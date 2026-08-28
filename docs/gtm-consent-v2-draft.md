# GTM consent v2 draft

Status: implemented and verified on 29 July 2026. The complete container import was applied to a dedicated GTM workspace, checked in Preview/Tag Assistant, and saved as **container version 5**. Version 5 is **Latest** and remains unpublished; version 4 is still **Live**. No application deployment was performed.

Target workspace and version name:

`Consent v2 – awaiting site deployment`

## Prepared container import

Remote GTM result:

- Container: `GTM-5JZDTM8N`
- Saved version: `5`
- Published/live version: `4`
- Version status: unpublished
- Imported changes: 14 added, 4 deleted, 0 modified
- Version contents: 3 tags, 8 custom-event triggers, 3 user-defined consent variables, and the existing Clarity custom template

Import:

`docs/gtm/GTM-5JZDTM8N-consent-v2-import.json`

The import is based on the 29 July 2026 export of `GTM-5JZDTM8N`. That export contains:

- one Google tag for GA4 measurement ID `G-QGQC58H2LD`;
- one Microsoft Clarity tag for project `vcraoykbas`;
- no Google Ads conversion, remarketing or linker tag and no Google Ads destination ID.

The import therefore gates and updates the two existing tags, prepares the Google Ads choice variable and triggers, and does not invent an advertising destination. Add the three required Ads consent checks when a real Google Ads tag and destination ID are available.

Import only into a brand-new dedicated workspace and select **Overwrite**. This file contains the complete exported container plus the consent changes, so Overwrite replaces the legacy Klaro entities instead of leaving duplicate tags or triggers. Do not overwrite an existing workspace that contains unrelated pending changes.

Before confirming, review the detailed import preview. The resulting workspace must contain exactly three tags, eight triggers, three user-defined variables and the existing Microsoft Clarity custom template. Stop if the preview shows any other existing entity being removed.

## Canonical data-layer contract

The application pushes both events below before or immediately after loading GTM:

- `olgish_consent_ready`
- `olgish_consent_update`

Each event contains:

```js
{
  event: 'olgish_consent_ready',
  olgishConsent: {
    googleAnalytics: false,
    microsoftClarity: false,
    googleAds: false
  }
}
```

Create these Version 2 Data Layer Variables:

| Variable name | Data layer variable name |
| --- | --- |
| DLV - Consent - Google Analytics | `olgishConsent.googleAnalytics` |
| DLV - Consent - Microsoft Clarity | `olgishConsent.microsoftClarity` |
| DLV - Consent - Google Ads | `olgishConsent.googleAds` |

Create two Custom Event triggers for each selected-service filter:

| Trigger | Event name | Filter |
| --- | --- | --- |
| CE - Consent Ready - GA | `olgish_consent_ready` | GA DLV equals `true` |
| CE - Consent Update - GA | `olgish_consent_update` | GA DLV equals `true` |
| CE - Consent Ready - Clarity | `olgish_consent_ready` | Clarity DLV equals `true` |
| CE - Consent Update - Clarity | `olgish_consent_update` | Clarity DLV equals `true` |
| CE - Consent Ready - Ads | `olgish_consent_ready` | Ads DLV equals `true` |
| CE - Consent Update - Ads | `olgish_consent_update` | Ads DLV equals `true` |

Do not use an All Pages trigger for any optional service.

## Google Analytics

For every Google Analytics tag:

- Replace All Pages with both GA custom-event triggers.
- Keep the tag template's built-in `analytics_storage` consent check.
- In Additional Consent Checks, require `analytics_storage`.
- Do not add an exception that can bypass the canonical GA variable.

The application sets `analytics_storage` to granted only when `googleAnalytics` is true.

## Google Ads

For every Google Ads conversion, remarketing and linker tag:

- Replace All Pages with both Ads custom-event triggers.
- Require the built-in advertising checks used by the tag.
- In Additional Consent Checks, require `ad_storage`, `ad_user_data` and `ad_personalization`.
- Do not fire from a Google Analytics choice.

The application grants all three advertising signals only when `googleAds` is true.

## Microsoft Clarity

Change the Clarity base tag from All Pages to both Clarity custom-event triggers. Set it to fire once per page.

Add a separate Custom HTML consent bridge triggered by both canonical events without a choice filter. It must not load the Clarity script:

```html
<script>
  (function () {
    if (typeof window.clarity !== 'function') return

    var consent = {{DLV - Consent - Microsoft Clarity}} === true
    var ads = {{DLV - Consent - Google Ads}} === true

    window.clarity('consentv2', {
      source: 'olgish-cakes',
      ad_Storage: ads ? 'granted' : 'denied',
      analytics_Storage: consent ? 'granted' : 'denied'
    })

    if (!consent) {
      window.clarity('consent', false)
    }
  })()
</script>
```

Keep the V2 property names case-sensitive: `ad_Storage` and `analytics_Storage`.

## Preview verification

Preview/Tag Assistant was run against the local production build on 29 July 2026. All eight canonical choice combinations produced the expected GA/Clarity isolation, consent events, consent state, cookies and network traffic. The all-denied case loaded no GTM or vendor requests.

The container currently has no Google Ads destination or Ads tag. Consequently, Ads-enabled combinations load GTM and expose the Ads consent choice to future Ads tags, but correctly send no Google Ads request today. A real Ads destination/tag must be added and previewed before Ads measurement can operate.

Use Preview/Tag Assistant with a clean browser for all eight combinations:

| GA | Clarity | Ads | Expected optional tags |
| --- | --- | --- | --- |
| Off | Off | Off | None; GTM is not loaded |
| On | Off | Off | GA only |
| Off | On | Off | Clarity only |
| Off | Off | On | Ads only |
| On | On | Off | GA and Clarity |
| On | Off | On | GA and Ads |
| Off | On | On | Clarity and Ads |
| On | On | On | GA, Clarity and Ads |

For each combination, verify the Consent tab and network panel. Then withdraw each enabled service without reloading and confirm that no new requests are sent by that service. Confirm the first-party cookies named in the cookie policy are deleted on withdrawal.

Do not publish the workspace during draft verification.

## Coordinated release order

1. Publish the reviewed GTM version.
2. Immediately deploy the matching application commit.
3. From a clean live browser, verify pre-consent, each service choice, withdrawal, cookies and network requests.
4. Record the GTM version, application commit, verification time and any monitored risk.

Revert the GTM version if the application deployment cannot follow immediately.
