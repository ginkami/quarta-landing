# Tasks

## 1. Environment & documentation
- [x] 1.1 Add optional `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (`z.string().min(1).optional()`) to `getServerEnv()` and confirm both local values load from `.env.local`; verify `npm run typecheck` passes and `npm run dev` still serves the landing (lazy validation intact, partial config warns instead of throwing)
- [x] 1.2 Document both variables and the "set them in Vercel before enabling notifications" step in the README environment/deployment sections; verify the documented instructions read correctly against the current project layout

## 2. Formatter and Bot API client
- [x] 2.1 Implement the pure `formatLeadMessage(lead)` in `src/lib/telegram.ts` (HTML-escaped user fields, bold labels, phone in `<code>`, optional comment omitted when empty, long comments truncated under the 4096 limit, timestamp via `Intl.DateTimeFormat` with `Europe/Minsk`) together with `src/lib/telegram.test.ts` covering structure, escaping of hostile comment text, missing comment and truncation; verify `npx vitest run src/lib/telegram.test.ts` passes
- [x] 2.2 Implement `sendLeadNotification(lead)` (POST `sendMessage` with `parse_mode: "HTML"`, `AbortController` timeout ≈ 5 s, warn-and-skip on missing/partial configuration, skip reserved automated-test phones before any network call, catch and log every failure without throwing) and extend `src/lib/telegram.test.ts` with mocked-fetch cases for success, HTTP error, timeout, absent config and test-phone suppression; verify `npx vitest run src/lib/telegram.test.ts` passes

## 3. Wire into submitLead
- [x] 3.1 Call `await sendLeadNotification(...)` in `src/actions/lead.ts` strictly after a successful INSERT commit (dedup/honeypot/rate-limit/validation paths must return before it), with a comment stating best-effort semantics; verify `npm run typecheck` passes and no earlier return path reaches the call

## 4. Integration checks
- [x] 4.1 Run the full gate suite — `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — and verify every command exits clean
- [x] 4.2 Run `openspec validate --specs`, `openspec validate --changes` and `openspec status --change telegram-notifications`; verify validations pass and every task above is checked
- [x] 4.3 Submit one real lead on `npm run dev` with a unique phone number and confirm the formatted message arrives in the Telegram group per the approved template; record the observed delivery, then remove the test lead from `/admin`
