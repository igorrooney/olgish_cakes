# Privacy Retention Operations

## Accountable owner and frequency

The accountable owner is configured with `PRIVACY_RETENTION_OWNER_NAME` and is
Olga, the data controller, unless that environment variable names a replacement.
The owner must review the schedule at least every three months.

Vercel calls `/api/cron/privacy-retention` at 08:00 UTC on 1 March, 1 June,
1 September and 1 December. The scheduled job discovers due records and records
non-sensitive counts only. It never selects records, queues a deletion action or
deletes data automatically. Deletion always requires a separate authenticated
administrator review and an explicit manual selection.

## What is and is not removed

Do not delete all orders every quarter. The admin retention centre lists only
records whose individual documented deadline has passed:

- closed, unsuccessful enquiries: 24 months after closure or last contact;
- customer reference uploads: 24 months after enquiry closure or order completion;
- completed order and accounting records: after the end of the applicable UK
  financial year plus six years;
- active dietary-health content: 30 days after a genuine terminal lifecycle
  transition has been recorded by the operational workflow;
- rate-limit and admin login-attempt records: after 90 days.

Consent withdrawal is separate from scheduled retention: the authenticated
withdrawal action erases the health content immediately and retains only the
minimum consent and withdrawal evidence described in the Privacy Policy.

The retention centre has six selectable categories. Nothing is preselected. For
each candidate, expand **View exact data effect** and check the displayed
**Removes** and **Retains** lists before ticking its checkbox:

| Selectable category | Selecting the candidate removes | It retains |
| --- | --- | --- |
| Expired enquiries | The enquiry, its customer information and any remaining uploads | Only the non-sensitive deletion audit entry |
| Expired enquiry uploads | The stored customer upload and its file metadata | The enquiry or converted order until that record's own deadline |
| Expired order uploads | Customer reference uploads, staff note images and their file metadata | The core order, payment and accounting record until its own deadline |
| Expired order records | The core order/customer/delivery/payment/accounting fields, linked order items, messages, notes, attachment metadata and remaining application-managed uploads, including linked converted enquiries | Only the non-sensitive deletion audit entry |
| Expired dietary-health information | The dietary-health wording supplied with the enquiry or order | Consent and erasure evidence without the dietary-health wording |
| Expired security records | Only the displayed expired rate-limit or abuse-prevention batch | Newer security records and aggregate deletion counts |

The on-screen **View exact data effect** disclosure is authoritative for the
individual candidate. Do not rely on this table alone because a candidate's
linked records and item count can differ.

Candidate discovery is paginated. The summary and category totals cover every
due candidate, while each category also states how many candidates are visible
on the current page. **Select all** means all eligible candidates on that page,
not every candidate globally, and changing page clears the selection and any
open destructive confirmation. A single run can contain at most 100 explicitly
selected candidates. Continue through the pages until every relevant candidate
has been reviewed; candidate 51 and later candidates are not included silently.

Active records, records without a reliable lifecycle date, and records under a
legal hold are not eligible for deletion. For an old terminal record that still
contains active health information but has no health-retention deadline, use the
authenticated scheduling action on that record's admin detail page. It schedules
the deadline from the server's current time plus 30 days. It does not accept or
infer a historical completion date, and it must never be used to guess one.

## Quarterly procedure

1. Open `/admin/privacy-retention` while signed in as an administrator.
2. Review the owner, next-review date, due counts, lifecycle warnings, the complete
   active legal-hold register and previous runs.
3. Resolve records that need lifecycle review from their authenticated enquiry or
   order detail. Never invent a closure or completion date.
4. Review every entry in the active legal-hold register, including non-due records
   and overdue hold-review dates. Each underlying record is shown once even when
   its hold protects several candidate categories. Extend or release a hold only
   after checking the authenticated record and the reason for preservation.
5. Open **View exact data effect** for every candidate under consideration. Read
   the exact **Removes**, **Retains**, item count, deadline and hold state.
6. Check or uncheck individual records. Category and global checkboxes are
   conveniences only; nothing is preselected. Re-check the selected-record count
   after using a category or global checkbox.
7. Place a legal hold instead of deleting when a record is needed for an active
   complaint, anticipated legal claim, regulatory request or fraud investigation.
   Give every hold a future review date.
8. Review the final selected list. Enter the admin password and the exact generated
   confirmation phrase. The server rechecks deadlines and holds before each action.
9. Review the persisted run details and investigate every failed or skipped item.
   Never assume a failed item was deleted. A pending, busy or **resume required**
   action may represent an ambiguous or irreversible operation: resume that exact
   persisted run from its run details after investigating the safe error, and do
   not start a replacement. A definitively failed action is terminal only when the
   database has atomically released its pre-irreversible claim and recorded the
   safe failure. After investigating that terminal failure, use a fresh preview
   and a new run if the candidate is still due. Never blindly repeat a deletion.
10. Check the external-systems list below, then record the owner review in the
   retention centre even when no database record is due.

The audit history contains references, categories, timestamps, result codes and
counts only. It must not contain customer free text, health content, filenames or
deleted payloads.

## External systems and backups

The application cannot prove deletion from independent processor accounts. During
each owner review, check:

- Resend delivery logs and the configured mailbox retention rules;
- Telegram chat and bot-message retention;
- Sanity documents and asset retention where personal data was deliberately stored;
- Google and Microsoft account, analytics and mailbox retention settings;
- Supabase backups and point-in-time recovery expiry;
- local exports, downloaded attachments and staff devices.

Deleted live data may remain in a protected backup until that backup expires. It
must not be restored into normal use. If a disaster restore is necessary, repeat
all deletion actions recorded after the restored backup was created.

## Deployment and incident rules

Apply the retention migrations in this order before deploying the application
code:

1. `20260825120000_add_privacy_retention_lifecycle.sql`;
2. `20260825122500_atomic_enquiry_retention_lifecycle.sql`;
3. `20260825130000_add_health_information_retention.sql`;
4. `20260825140000_add_privacy_retention_candidate_pagination.sql`;
5. `20260825150000_add_privacy_hold_claim_recovery.sql`;
6. `20260825160000_bound_event_photo_cleanup.sql`.

The migrations intentionally do not invent deadlines for old records. Existing
records stay protected until their real closure/completion state is reviewed. A
legacy health deadline must be created only through the authenticated detail-page
action described above.

Before production use, apply the migrations to a staging database and verify the
functions, grants, RLS, consistency constraints, lifecycle transitions, legal
holds, run resumption and irreversible storage/database finalisation against real
PostgreSQL. Application unit tests and static migration tests do not prove that a
deployment has succeeded.

The retention storage policy now accepts only the canonical buckets
`custom-cake-enquiries` and `event-photo-temp-uploads`. Before deploying the app,
run the service-role-only `list_noncanonical_retention_storage_records()` inventory
in staging and production. It returns safe record references only. For every
legacy result, verify the exact source object in the processor console, copy it to
the matching canonical bucket without changing its path, verify the copy, then
change only that record's stored bucket value to the canonical bucket. Never
delete the source until the canonical copy and database reference are verified.
Re-run the inventory and require zero results. A configured custom bucket is a
deployment error and application upload/retention paths fail closed.

Staging verification must include more than 250 mixed held, non-held and no-file
records, reach candidate 251 through the page controls, confirm the final-page
clamp after deletion, and prove the visible count, global totals and affected-item
counts remain consistent. Also race two manual runs selecting the same candidate:
only one pending action may be created and the other request must direct staff to
the persisted run rather than create a second unresolved deletion.

If a run remains pending or reports that resumption is required, stop, keep the
persisted item visible and resume that exact run after investigating the safe
error code. Do not manually delete rows or objects, create a replacement run or
repeatedly press deletion controls. If the persisted action is terminally failed,
confirm that no irreversible step began, investigate it, and use a fresh preview
only if the candidate remains due. Never put customer content, filenames or
storage paths into logs or support tickets.
