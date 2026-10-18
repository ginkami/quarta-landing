# Design

## Context
See proposal.md — Why. Relevant state:
- `src/lib/schemas/lead.ts` owns one shared zod schema used by the client (react-hook-form resolver) and the Server Action: `PHONE_PATTERN = /^\+375(17|25|29|33|44)\d{7}$/`, `normalizePhone` (strips separators), `isValidPhone`, and `formatPhoneInput` — a per-keystroke mask currently wired into `RequestForm`'s `onChange`.
- The Russian error message already states the target criterion ("Номер должен начинаться с +375 и содержать 12 цифр"), so validation and messaging currently contradict each other.
- Form validation mode is `onBlur`; stored phones feed the dedup window, the admin panel and the Telegram message — all consume `+375XXXXXXXXX`.

## Goals / Non-Goals
**Goals:**
- Typing never rewrites the value: the caret is never touched during input, so partial input like `+3` stays literal and mid-string edits behave like any plain input.
- Validation matches its own user-facing promise: `+375` + exactly nine digits, whatever they are.
- One shared rule everywhere (client, server, docs).

**Non-Goals:**
- Masked input libraries or caret-restoration machinery (deliberately rejected — see Decisions).
- International numbers outside `+375`.
- Changing the stored phone format, dedup semantics or admin/Telegram rendering.

## Decisions
1. **Format only on blur, only when the whole value is valid.** `formatPhoneInput` keeps its name but becomes pass-through: invalid/partial input returns unchanged; a complete valid number renders as `+375 (29) 123-45-67`. Rationale: the user's pain is keystroke-time rewriting; blur formatting keeps the tidy display without ever touching the caret while typing. Alternatives rejected: plain input with no formatting at all (chosen as fallback, loses the tidy display); a caret-preserving live mask (possible but the most complex option with the largest edge-case surface on a conversion-critical field).
2. **Relax `PHONE_PATTERN` to `/^\+375\d{9}$/`.** One regex, matching the existing message and docs; `normalizePhone` already strips separators before matching, so formatted and raw input share one rule. Alternatives rejected: expanding the whitelist with more codes (whitelists drift and caused this bug).
3. **Blur formatting is presentation-only.** The schema still validates whatever is in the field (formatted or raw) and normalizes on parse, so the action receives the same `+375XXXXXXXXX` regardless of how the visitor typed or whether blur fired (e.g. submit straight from typing).
4. **Tests describe user-visible behavior.** Acceptance tests cover `+375165120497`, foreign/short rejects stay; formatter tests pin "valid → pretty, partial/invalid → untouched".

## Risks / Trade-offs
- [Value visibly changes on blur] → only for complete valid numbers, matching the placeholder; visitor intent is preserved (`normalizePhone` is separator-agnostic).
- [Existing masked-input muscle memory] → simpler behavior is strictly more predictable; validation hint under the field still guides the format.
- [Some input path skips blur (direct submit)] → the schema accepts raw digits, so no submission is lost; formatting is never a precondition for acceptance.

## Migration Plan
No data or deployment steps: pure front-end/validation change over an already-compatible stored format. Rollback = revert the release.

## Open Questions
None — the validation criterion and the blur-formatting choice were settled with the user during planning.
