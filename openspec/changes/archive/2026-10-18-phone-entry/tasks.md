# Tasks

## 1. Validation
- [x] 1.1 Relax `PHONE_PATTERN` in `src/lib/schemas/lead.ts` to `/^\+375\d{9}$/` and rework the phone acceptance tests (any nine-digit number accepted, explicitly including `+375165120497`; foreign prefixes and wrong-length rejects kept); verify `npx vitest run src/lib/schemas/lead.test.ts` passes
- [x] 1.2 Update the «Phone acceptance» section of `docs/lead-capture.md` to the `+375` + nine digits criterion (drop the operator-code whitelist); verify the documented rule matches the pattern in code

## 2. Input behavior
- [x] 2.1 Rewrite `formatPhoneInput` as format-on-blur: a complete valid number renders as `+375 (XX) XXX-XX-XX`, anything else passes through untouched, with unit tests for valid/partial/invalid inputs; verify `npx vitest run src/lib/schemas/lead.test.ts` passes
- [x] 2.2 Wire `RequestForm` so `onChange` passes the raw value through and `onBlur` applies the formatter (ensure the phone input keeps a `+375 (29) 123-45-67` placeholder); verify `npm run typecheck` and `npx vitest run src/components/sections/RequestForm.test.tsx` pass

## 3. Integration checks
- [x] 3.1 Run the full gate suite — `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — and verify every command exits clean
- [x] 3.2 Run `openspec validate --specs`, `openspec validate --changes` and `openspec status --change phone-entry`; verify validations pass and every task above is checked
- [x] 3.3 Verify the observable behavior in a browser on `npm run dev`: typing `+3` leaves `+3`, editing inside `()` keeps the caret in place, `+375165120497` passes validation, and blur formats a complete valid number; record the observations together with the user's visual pass
