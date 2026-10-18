# Proposal

## Why
The phone field fights the visitor: the aggressive mask rewrites the value on every keystroke (typing `+3` becomes `+375(3`, and editing inside `()` jumps the caret to the end), which risks losing valid submissions on a conversion-critical form. Separately, validation whitelists five operator codes and rejects a real Belarusian number `+375165120497` that matches the promised criterion — the input hint promises "starts with +375, 12 digits", but the pattern disagrees.

## What Changes
- Relax phone validation to the stated criterion: `+375` followed by exactly nine digits of any value; presentation separators (spaces, parentheses, dashes) remain allowed and stored phones stay normalized to `+375XXXXXXXXX`.
- Remove per-keystroke masking: the field passes typed text through untouched (the caret never moves, `+3` stays `+3`); formatting to `+375 (29) 123-45-67` happens only on blur and only when the whole value is a valid number — partial or invalid input is left exactly as typed.
- Update schema tests (any nine-digit number accepted, including `+375165120497`; format-on-blur cases) and the `docs/lead-capture.md` phone-acceptance section.

## Capabilities

### Modified Capabilities
- `lead-capture`: the «Phone acceptance rules» requirement is relaxed from an operator-code whitelist to the `+375` + nine digits criterion, with an added acceptance scenario.

## Impact
- **Validation**: `PHONE_PATTERN` in `src/lib/schemas/lead.ts`; `normalizePhone` and the Russian error message already match the new criterion and stay as-is.
- **Input**: `formatPhoneInput` becomes format-on-blur; `RequestForm` passes raw values on change and formats on blur.
- **Tests**: `src/lib/schemas/lead.test.ts` (acceptance cases + formatter behavior).
- **Docs**: `docs/lead-capture.md` phone acceptance section.
- **Unaffected**: server-side validation uses the same shared schema (single source), stored data shape, Playwright smokes (their numbers satisfy both criteria), admin display, dedup.
