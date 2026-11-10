# ASCEND — Atlas-guided journey (9 November 2026)

This update replaces the Projects rollout. The user’s direction is the centre of Home. The original dark dashboard style, Compass and other established app areas are retained. Projects pages, catalogue, admin, APIs, recommendations and sharing routes are removed. Previous share links no longer open after the new application is deployed. Existing database records and XP are preserved. Progress shows recent personal check-ins and the user's own latest 20 completed-work evidence records. No rewards, payouts or new XP are introduced.

## 1. Install locally

Stop this project's local server. Put `ascend-atlas-guidance-update.zip` in the ASCEND repository root and run in Windows CMD, one line at a time:

```
tar -xf ascend-atlas-guidance-update.zip -C .
node ascend-atlas-update/apply.cjs --check
node ascend-atlas-update/apply.cjs
npm run test:engines
npm run lint
npx tsc --noEmit
npm run build
git --no-pager diff --check
```

The installer checks known before/after versions (allowing LF/CRLF differences). It supports the November 4 Projects working tree and the earlier uploaded source. It stops before writing if it finds an unexpected edit in a target file. It does not touch .env.local, unrelated source, credentials, migrations already applied, or database rows. It backs up changed files under `ascend-atlas-update/local-backup`. Do not commit that folder. It removes only named, unchanged retired files; it never recursively deletes a source directory. Empty directories may remain on Windows. If an editor or sync process locks a file, close it, then rerun the installer.

## 2. Apply the database migration before testing accounts

Use your intended Supabase project. Localhost may still point at the live database. The previous migration `20261104000100_project_first_onboarding.sql` must remain in source and in remote history. In the previously confirmed linked environment only the following new migration should be pending:

`20261109000100_atlas_journey.sql`

```
npx --yes supabase@2.117.0 db push --dry-run
```

If only the expected migration is listed and the linked project is correct, run separately:

```
npx --yes supabase@2.117.0 db push
npx --yes supabase@2.117.0 db lint --linked
npx --yes supabase@2.117.0 migration list
```

Respond to the push confirmation before entering the next command. New onboarding uses the additive `save_atlas_direction` function. The migration also adds an owner-scoped progress ledger and a server-only function for confirmed updates; it does not remove old tables or RPCs or change previous evidence. Optional transaction-only test on a test database: `supabase/tests/atlas_journey.sql`.

## 3. Enable web research

Use the existing Groq configuration for Atlas. For web search, set `TAVILY_API_KEY` as a **server-only** environment variable in `.env.local` and in the intended Vercel environment. Rebuild/restart or redeploy after changing environment settings. Do not prefix it with `NEXT_PUBLIC_`, paste it into chat, or commit it.

Atlas can search a short public topic typed in the research field. For natural-language requests such as “search the web for fashion training in Nigeria,” it can derive only public subject words, rather than sending the user's whole message, private profile, notes or history to search. Sources carry retrieval dates and publication dates when supplied. These are search excerpts, not independent verification of eligibility or an open deadline. With no key, no results or a provider error, Atlas reports that research could not substantiate the answer. Existing opportunity matching remains independent of the new search key. Default search allowance is six requests per account per day and 100 per day globally using ASCEND's rate-limit service. Suggestions also use Groq and are rate limited. Provider-level costs depend on your account/plan.

## 4. Walk through the experience before deployment

```
npm run start
```

Use a new test account on localhost. State an ambition (for example, building a fashion business). Confirm onboarding leads to Home rather than a catalogue. Ask Atlas for one step; edit it before accepting. Reload: the same step should appear. Save “I tried it” or “I’m stuck” with an observation. Ask Atlas for an alternative and confirm it uses that update. Finish a step; mark the overall goal achieved only when you explicitly choose to and explain why. Change direction through onboarding if needed.

The opportunities card loads independently, shows up to three relevant undecided listings, explains the overlap with the saved profile, shows a requirement to check and links to Atlas Decision and the original listing. Missing dates are labelled. Use “Not relevant” to hide a listing from future Atlas recommendations without changing your application history. A credible empty state is expected for goals with no good matches; it does not fill the space with unrelated listings. Explore remains optional. This version checks when the dashboard is opened or when Atlas receives a relevant request; it does **not** run background monitoring, send notifications or apply for users.

Try Atlas research with a public topic and open a source link. Verify unavailable-key behaviour in a test environment. On a returning account, open Progress: prior XP should still be there, and historical evidence is read-only. Old `/projects` and `/api/projects/...` routes should be absent. Test mobile wrapping and navigation.

## 5. Review and stage only after testing

```
node ascend-atlas-update/apply.cjs --stage-list
git --literal-pathspecs add --pathspec-from-file=ascend-atlas-update/stage-paths.txt
git --no-pager diff --cached --check
git --no-pager diff --cached --stat
```

This list includes relevant earlier uncommitted baseline files and the already-applied onboarding migration. Review the staged diff; it should contain no credentials, old ZIPs, installer backups or Supabase CLI cache. Commit and deploy only after the signed-in walkthrough succeeds. To undo this local code installation before committing: `node ascend-atlas-update/apply.cjs --undo`. Undo refuses to overwrite later edits. It does not undo database migrations.
