# ASCEND Projects — Explore, Build, Keep Your Work

Release: 2 October 2026. This is a non-monetary learning product.
Promise: Turn your interests into work you can show.

## What changed

- Removed payout accounts, bank lookups, Flutterwave clients/webhooks, payout admin, reward creation/funding and reward-award actions.
- Retained Projects, joining, drafts, submission versions, human reviews and revisions.
- Added Explore / Build categories, milestone draft progress, a next milestone, optional Atlas feedback, reflection and self-completion.
- Added private portfolio entries and explicit, revocable sharing. Sharing exposes title, reflection, practised skills and deliverable text to anyone with the link. No name, user ID, email or financial information is added by the shared-page code. Participants must remove private information from their own text before sharing. Copies/screenshots already made cannot be revoked.
- Added six original starter drafts: career exploration, a campus app, a fictional business, a fictional budget, a music release and a fashion concept.
- North Star suggestions use shared topic words. They are not AI-generated readiness scores. If nothing matches, no recommendation is fabricated.
- Atlas chat recognises Projects as non-monetary learning. It preserves the one-active-personal-mission rule; milestone coaching does not create or replace a personal mission.

## Student journey

1. Open Projects and choose Explore or Build. Read the brief, milestones, rights and rubric.
2. Join and open the workspace. Work on one milestone at a time. Draft counters show text added, not assessed quality.
3. Save. Optionally ask Atlas for feedback on the saved version. Unsaved edits hide the previous feedback; the server fingerprints brief, rubric, AI policy, responses and reflection to avoid returning stale coaching.
4. Revise and reflect: what did you learn, what would you change, and what will you try next?
5. Choose one finish route:
   - **Finish and save to portfolio:** records self-completion, labelled Completed. Requires all deliverables and reflection. No skill verification, certificate, reward or XP is granted. This version is locked after completion.
   - **Request human review:** locks the submission. An admin can complete, decline or request a revision. A requested revision cannot be bypassed through self-completion. The participant can resubmit within the revision window.
6. Open My Portfolio. Review the full content, then optionally create a share link. Stop sharing revokes that link; a later share creates a new link.

A completed entry is not automatically human reviewed. This release does not offer requesting a new review or editing after final self-completion; choose human review before finishing if that is wanted.

## Atlas's scope

Atlas coaches the written draft against its brief and rubric, connects a next step to the saved North Star when useful and suggests improvements. It does not open links, inspect files, verify originality, certify skills or make publication/review decisions. Long milestone text is capped for the AI context; the original saved work is not shortened. Instructions embedded in project text are treated as untrusted data. Rendered feedback is plain text.

Feedback uses the existing Groq SDK, key and configured model; no provider switch is introduced. A database-backed limit allows eight generation requests per user per day. Cached feedback for an unchanged draft does not consume a request. Failed generations can consume a request. In production, a missing rate-limit function fails closed. Students can still save drafts, use the rubric and finish without Atlas.

## Admin operation

The existing Projects admin allowlist remains in force. Go to `/projects/admin`.

Review each starter draft before publishing: Draft → Review → Publish. Confirm scope, deadline, student ownership and the absence of confidential or commissioned work. Seeded deadlines are one year from migration execution. These are independent simulations, not partner projects. No seed is auto-published.

Create additional Explore / Build briefs with distinct milestone titles of 3–120 characters. Define a realistic outcome achievable with available tools. Use fictional or public information. Do not turn a commercial client's unpaid task into a learning brief. The standard criteria cover quality, reasoning and presentation; the starter collection uses clarity, reasoning and reflection.

Review submissions from the admin queue. Use specific feedback and request revisions when needed. Only an explicit completed human review produces the Human reviewed label. Historical labels are not proof of broad professional ability.

## Database and historical records

Apply both new migrations, in order:

- `20261002000100_projects_learning_redesign.sql`
- `20261002000200_projects_starter_collection.sql`

Historical migrations and tables remain. No historical bank profile, payment attempt, entitlement, submission or audit record is deleted. Application access to historical payment profiles and sandbox records is revoked. Reward tables retain read-only service access for audit compatibility. Payment RPC execution is revoked, new reward project creation/reopening is blocked, and review no longer creates an award.

The retirement migration refuses to run if it finds an active reward project, active reward participation or unresolved reward delivery. Run `supabase/tests/projects_retirement_preflight.sql` in the Supabase SQL editor first. If it returns rows, investigate them with the founder/admin before deploying. A sandbox test does not prove a real obligation was paid. Do not mark records delivered, cancel commitments or delete rows merely to pass the guard. Retain evidence of any legitimate resolution.

Old reward participation history is retained. Its former workspace is read-only/unavailable in the new product; support/admin can retrieve historical records from the database. This release does not build a new payment or entitlement settlement interface.

## Rollout

Use a preview/test database first when available. Keep the uploaded-source Git checkpoint and a database backup. Apply migrations before running the new UI against that database. The old payment code cannot operate after privileges are revoked.

Remove the old Flutterwave webhook subscription in the provider dashboard. Remove unused `FLW_CLIENT_ID`, `FLW_CLIENT_SECRET`, `FLW_SECRET_HASH`, `PROJECTS_PAYMENTS_MODE` and `PROJECTS_PAYMENTS_ENABLED` variables from Vercel and local configuration after checking their names in your current deployment. Keep Clerk, Supabase, Groq and Projects admin settings. Do not paste credentials into chat or commit `.env.local`.

The patch does not deploy, contact students, alter the provider account or run production migrations. After local checks, apply migrations, check linked database lint/migration list, deploy, and run the smoke test below. If preflight blocks, leave production unchanged and investigate. Never roll back by deleting historical migrations. An application rollback still needs compatible database privileges; do not re-enable payments as a casual rollback step.

## Checks performed on the uploaded source

- Engine regression suite: 31 tests, including feedback parsing/cache changes, conservative evidence labels and direction matching.
- ESLint, TypeScript and optimized Next.js build.
- All six prior Projects/payment migrations plus both new migrations executed in an isolated PGlite PostgreSQL runtime.
- Database workflow assertions: repeat join/completion, ownership, incomplete submissions, locked completion, human review, revision/resubmission, no reward delivery, and role permissions.
- Separate migration guard test confirmed an active reward project blocks retirement without modifying its history.

Build verification uses placeholder environment values only. It does not prove real Clerk sign-in, production database grants, live Groq responses or browser visual quality. No production credentials or database contents were available in the upload. Run linked Supabase lint and the signed-in smoke test on your environment.

## Signed-in smoke test

1. As an admin, publish one starter draft; as a normal student, confirm the admin API/page is inaccessible.
2. Join it, save one milestone, reload, and verify persistence. Try Atlas, then edit and save: old feedback must disappear until a new review is generated. If Atlas is unavailable, saving must still work.
3. Fill all milestones and reflection, finish, and verify the label is Completed and the entry is private. Repeat completion must not create a second entry.
4. Preview, share, open the link signed out, then stop sharing and verify the old link no longer works. Confirm no profile identity or private reviewer notes appear.
5. With another participation, request human review, request a revision as admin, resubmit and complete review. Verify the Human reviewed label.
6. Check `/projects/payment`, `/projects/admin/payouts` and payment APIs no longer exist. Confirm navbar/dashboard/Progress lead to Projects/portfolio normally.
7. Confirm the existing personal mission remains unchanged. Inspect mobile layouts before inviting users.

For repeatable database assertions, run `supabase/tests/projects_learning_redesign.sql` only on a disposable database with all migrations applied. It wraps test writes in a rollback. The preflight SQL is read-only and suitable for inspecting production.

## Deliberately deferred

Public feeds, leaderboards, peer moderation, employer endorsements, certificates, automatic hiring/readiness claims and further gamification. Learn from a small cohort completing the starter projects before expanding.
