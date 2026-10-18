# lead-capture Specification

## Purpose
Defines how the landing collects request leads: form fields and validation rules, acceptance of Belarusian phone numbers, submission idempotency, persistence with advertising attribution, and the success/error experience visitors get.

## Requirements

### Requirement: Form rendering and placement
The landing SHALL render a request form section with `id="request"` between the FAQ and contacts sections, containing labeled fields: name, phone, interest (subscription / one-time order / question), comment, and a submit button. Every field SHALL be reachable and operable by keyboard with a visible focus state.

#### Scenario: Form presence
- **WHEN** a visitor navigates to the request section
- **THEN** name, phone, interest, and comment fields with labels and a submit button are present and focusable

### Requirement: Client-side validation feedback
Validation SHALL run through the shared zod schema before any request is sent: name, phone, and interest are required; an invalid phone or empty required field SHALL display a Russian error message associated with that field and keep the submission blocked until corrected.

#### Scenario: Invalid phone hint
- **WHEN** a visitor enters a phone that does not match the accepted format and submits
- **THEN** a Russian error message appears under the phone field and no network request is made

### Requirement: Phone acceptance rules
The system SHALL accept only Belarusian numbers: `+375` followed by exactly nine digits of any value, allowing spaces, parentheses, and dashes between digits. Stored phones SHALL be normalized to `+375XXXXXXXXX`.

#### Scenario: Formatted input is normalized
- **WHEN** a visitor submits `+375 (29) 123-45-67`
- **THEN** the lead stores `+375291234567`

#### Scenario: Foreign or malformed numbers rejected
- **WHEN** a visitor enters `80291234567`, `+7 999 123 45 67`, or `+375 12 345`
- **THEN** validation fails with a Russian hint and no lead is created

#### Scenario: Any nine-digit subscriber number accepted
- **WHEN** a visitor submits `+375165120497`
- **THEN** validation passes and the lead stores `+375165120497`

### Requirement: Server-side validation
The Server Action SHALL re-validate every payload with the same shared schema. A payload that fails server validation SHALL be rejected without writing any row, regardless of what the client allowed through.

#### Scenario: Forged submission rejected
- **WHEN** a request reaches the Server Action with an invalid phone or interest value
- **THEN** the action returns a validation error and the database remains unchanged

### Requirement: Lead persistence
An accepted request SHALL be stored with the visitor's name, normalized phone, selected interest, optional comment, submission timestamp, and attribution data, and SHALL be visible to the manager in the Neon console. The comment field SHALL be optional.

#### Scenario: Successful lead stored
- **WHEN** a visitor submits a valid request
- **THEN** a row exists containing the name, normalized phone, interest, and creation time, with the comment present when provided

### Requirement: Idempotent submission window
The system SHALL NOT create a second lead for the same phone within 10 minutes of the previous accepted lead for that phone; such a submission SHALL receive the same success outcome as the original. The duplicate check SHALL be race-safe on the server. After the window, the same phone MAY create a new lead.

#### Scenario: Double-click submits once
- **WHEN** a visitor triggers submission twice in rapid succession with the same phone
- **THEN** exactly one lead row exists and the visitor sees a single success confirmation

#### Scenario: Retry within ten minutes
- **WHEN** the same phone is submitted again 9 minutes after an accepted lead
- **THEN** no new row is created and the success outcome is returned

#### Scenario: New lead after the window
- **WHEN** the same phone is submitted 11 minutes after an accepted lead
- **THEN** a new lead row is created

### Requirement: Anti-spam controls
The form SHALL include a hidden honeypot field; a submission that fills it SHALL be silently discarded without creating a lead row while still showing normal success. The Server Action SHALL reject more than 5 accepted submissions from the same client IP within 10 minutes with the standard error/retry UX and no row written.

#### Scenario: Bot fills the honeypot
- **WHEN** a submission arrives with the honeypot field populated
- **THEN** no lead row is created and the response mimics a normal successful submission

#### Scenario: IP rate limit reached
- **WHEN** more than 5 accepted submissions are attempted from one IP address within 10 minutes
- **THEN** the further attempts receive the error/retry message and no rows are created

### Requirement: Submission failure UX
If persistence fails, the visitor SHALL see a Russian error message explaining that the request was not accepted, with an option to retry, and previously entered values SHALL be preserved.

#### Scenario: Database unavailable
- **WHEN** the Server Action cannot write the lead
- **THEN** an error message with a retry path is shown and the form keeps the entered data

### Requirement: Success confirmation
On acceptance the form SHALL transition to a confirmation state telling the visitor the request was received and a manager will call back; the submit control SHALL no longer trigger further writes from that state.

#### Scenario: Confirmation shown
- **WHEN** a lead is accepted (first time or within an idempotent window)
- **THEN** the visitor sees a Russian success message and cannot double-submit from that state

### Requirement: Advertising attribution
Every stored lead SHALL include attribution data: utm source/medium/campaign/content/term, an advertising click id when present (yclid, gclid, or fbclid), referrer, and landing page — captured first-touch and last-touch from a first-party cookie valid for 30 days — plus the submission page and user agent captured on the server. Attribution SHALL NOT depend on third-party analytics services.

#### Scenario: Campaign parameters captured
- **WHEN** a visitor arrives via `?utm_source=instagram&utm_campaign=degustation` and later submits
- **THEN** the lead's attribution data contains first-touch and last-touch `utm_source=instagram` with `utm_campaign=degustation`

#### Scenario: Direct visit
- **WHEN** a visitor arrives without any campaign parameters and submits
- **THEN** attribution data is still present with empty campaign fields and the captured referrer/landing page

### Requirement: Conversion event
On a successful submission the client SHALL emit exactly one Vercel Analytics conversion event named `lead-submitted`.

#### Scenario: Event on success
- **WHEN** the visitor receives the success confirmation
- **THEN** a single `lead-submitted` conversion event has been sent to Vercel Analytics

### Requirement: Telegram notification on lead creation
After a request is stored as a new lead, the system SHALL send one notification to the configured Telegram group chat containing the submitted name, phone, interest, the optional comment, and the submission time formatted for Europe/Minsk. User-provided text SHALL be rendered as escaped plain text, never as markup.

#### Scenario: New lead notified
- **WHEN** a submission creates a new lead row
- **THEN** exactly one Telegram message carrying the submitted data arrives in the group chat

#### Scenario: Duplicate window creates no message
- **WHEN** a submission inside the 10-minute dedup window succeeds without creating a row
- **THEN** no Telegram message is sent

### Requirement: Notification failures never block a lead
The notification SHALL be best-effort: when the Telegram configuration is missing, the request fails, or it exceeds a short timeout, the failure SHALL be logged server-side while the submission still receives its normal success outcome; the stored row remains the source of truth.

#### Scenario: Telegram unavailable
- **WHEN** the Telegram API call fails or times out after the row is stored
- **THEN** the error is logged and the visitor still sees the normal success confirmation

#### Scenario: Configuration absent
- **WHEN** `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` is not set
- **THEN** the notification is skipped with a server-side warning and lead submission is unaffected

### Requirement: Automated test submissions stay silent
Submissions whose phone matches a reserved automated-test number SHALL NOT produce Telegram messages, so scheduled smoke runs do not spam the group chat.

#### Scenario: Smoke run
- **WHEN** the automated smoke submits a lead with a reserved test phone number
- **THEN** the lead is stored as usual but no Telegram message is sent
