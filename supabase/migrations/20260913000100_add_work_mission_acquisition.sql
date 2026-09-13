begin;

alter table public.ascend_work_partner_leads
  add column if not exists outreach_subject text,
  add column if not exists outreach_body text,
  add column if not exists outreach_prepared_at timestamptz,
  add column if not exists contact_verified boolean not null default false,
  add column if not exists scope_confirmed boolean not null default false,
  add column if not exists deliverables_confirmed boolean not null default false,
  add column if not exists deadline_confirmed boolean not null default false,
  add column if not exists funding_amount_minor bigint,
  add column if not exists funding_currency text,
  add column if not exists organization_id uuid references public.ascend_work_organizations(id) on delete restrict,
  add column if not exists project_id uuid references public.ascend_work_projects(id) on delete restrict;

alter table public.ascend_work_partner_leads
  drop constraint if exists ascend_work_partner_leads_funding_amount_check,
  add constraint ascend_work_partner_leads_funding_amount_check
    check (funding_amount_minor is null or funding_amount_minor > 0),
  drop constraint if exists ascend_work_partner_leads_funding_currency_check,
  add constraint ascend_work_partner_leads_funding_currency_check
    check (funding_currency is null or funding_currency ~ '^[A-Z]{3}$');

create unique index if not exists ascend_work_partner_leads_project_idx
  on public.ascend_work_partner_leads(project_id) where project_id is not null;

commit;
