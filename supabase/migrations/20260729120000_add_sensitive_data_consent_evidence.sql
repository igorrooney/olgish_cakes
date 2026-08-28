alter table public.contact_enquiries
  add column if not exists dietary_health_information text,
  add column if not exists dietary_health_consent boolean not null default false,
  add column if not exists dietary_health_consent_version text,
  add column if not exists dietary_health_consented_at timestamptz;

alter table public.custom_cake_enquiries
  add column if not exists dietary_health_information text,
  add column if not exists dietary_health_consent boolean not null default false,
  add column if not exists dietary_health_consent_version text,
  add column if not exists dietary_health_consented_at timestamptz;

alter table public.workshop_enquiries
  add column if not exists dietary_health_information text,
  add column if not exists dietary_health_consent boolean not null default false,
  add column if not exists dietary_health_consent_version text,
  add column if not exists dietary_health_consented_at timestamptz;

alter table public.contact_enquiries
  drop constraint if exists contact_enquiries_sensitive_data_consent_check,
  add constraint contact_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(trim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
    )
  );

alter table public.custom_cake_enquiries
  drop constraint if exists custom_cake_enquiries_sensitive_data_consent_check,
  add constraint custom_cake_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(trim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
    )
  );

alter table public.workshop_enquiries
  drop constraint if exists workshop_enquiries_sensitive_data_consent_check,
  add constraint workshop_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(trim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
    )
  );
