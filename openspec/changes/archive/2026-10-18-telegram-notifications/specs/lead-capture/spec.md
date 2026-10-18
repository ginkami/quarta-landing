# Spec Delta

## ADDED Requirements

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
