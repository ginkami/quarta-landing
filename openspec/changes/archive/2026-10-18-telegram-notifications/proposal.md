# Proposal

## Why
Leads currently land only in Neon, so the roaster learns about a new request by manually opening the admin panel. For a callback business the first minutes matter — an instant notification in the team's Telegram group turns every submission into an immediate call-back opportunity.

## What Changes
- After a successful lead INSERT in the `submitLead` Server Action, send a formatted Telegram message (name, phone, interest, optional comment, Minsk-local timestamp) to the configured group chat via the Telegram Bot API.
- Add optional `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` server environment variables; when absent (or partially set) the notification is skipped with a server-side warning and lead submission is unaffected.
- The notification is best-effort: awaited with a ~5 s timeout, failures are logged server-side and never change the visitor's success outcome; the persisted row remains the source of truth.
- No message is sent for honeypot/rate-limit/validation rejections (no row exists), for duplicate-window resubmissions (no new row), or for the reserved automated-test phone numbers (keeps smoke runs from spamming the group).
- Document both variables and the deployment step in the README.

## Capabilities

### Modified Capabilities
- `lead-capture`: adds the requirement that an accepted lead creation triggers a formatted Telegram notification with explicit failure, dedup and test-data scenarios.

## Impact
- **Server**: new `src/lib/telegram.ts` (HTML message formatter + Bot API client with timeout), one await hook in `src/actions/lead.ts` after the insert commit.
- **Env**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` added to the lazy `getServerEnv()` schema as optional strings; must be set in Vercel (Production/Preview) for notifications to go live.
- **Docs**: README environment/deployment sections.
- **Tests**: unit tests for the formatter (structure, HTML escaping, optional comment, truncation, Minsk time) and the client (success, HTTP error, timeout, missing config, test-phone suppression); existing gates and the Playwright smoke keep passing.
- **Ops**: one real manual submission on dev verifies delivery to the group; no migration or schema change.
