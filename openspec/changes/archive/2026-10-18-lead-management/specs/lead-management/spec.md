# Spec Delta

## Purpose
Defines the password-protected admin panel the roaster uses to work captured leads: authorization, the ordered lead list, processing status and filtering, deletion, comments, and readable attribution display.

## ADDED Requirements

### Requirement: Password authentication
The login page SHALL accept a single password field and submit it to a server action that compares the value against the `ADMIN_PASSWORD` environment variable with a constant-time comparison. On success the server SHALL set an expiring HttpOnly session cookie and the visitor SHALL be taken to the admin lead list; on mismatch the visitor SHALL see a Russian error message and no cookie SHALL be issued.

#### Scenario: Successful login
- **WHEN** the visitor submits the correct password
- **THEN** the server sets a valid session cookie and opens the admin lead list

#### Scenario: Wrong password
- **WHEN** the visitor submits a wrong password
- **THEN** no cookie is issued and a Russian error is shown

### Requirement: Login rate limiting
The login action SHALL reject more than 5 attempts from the same client IP within 10 minutes with a distinct Russian error before any password comparison happens.

#### Scenario: Too many attempts
- **WHEN** a client submits a 6th login attempt within 10 minutes
- **THEN** the attempt is refused with a rate-limit error and the password is not checked

### Requirement: Protected admin access
Every admin data action SHALL verify the session cookie server-side, checking both the signature and the expiry. Without a valid cookie the action SHALL return an unauthorized outcome, and the admin page SHALL redirect the visitor to the login page.

#### Scenario: Anonymous visit
- **WHEN** a visitor without a session cookie opens the admin page
- **THEN** they are redirected to the login page and no lead data is returned

#### Scenario: Tampered or expired cookie
- **WHEN** a request carries a modified or expired session cookie
- **THEN** the session is rejected as unauthorized and the visitor is sent to the login page

### Requirement: Logout
The admin panel SHALL provide a logout control that clears the session cookie and returns the visitor to the login page.

#### Scenario: Logout
- **WHEN** the roaster activates the logout control
- **THEN** the session cookie is cleared and the login page opens

### Requirement: Lead list with ordering
The admin page SHALL list every stored lead ordered unprocessed first, then by creation time newest first within each group, showing creation date and time, name, phone as a `tel:` link, interest, full comment text, processing status, and an attribution summary. The list SHALL load fresh data on every page load.

#### Scenario: Ordering
- **WHEN** the roaster opens the admin page with leads of mixed status and age
- **THEN** unprocessed leads appear above processed ones and newer leads appear first inside each group

#### Scenario: Fresh data on load
- **WHEN** the admin page is reloaded
- **THEN** the list reflects the current database state

### Requirement: Manual list refresh
A «Обновить» control SHALL re-fetch the lead list without a full page reload and display changes made since the page was loaded.

#### Scenario: Refresh button
- **WHEN** the roaster activates «Обновить» after a lead was changed elsewhere
- **THEN** the visible list updates to the current database state

### Requirement: Processing status toggle
Each lead SHALL expose a toggle between «Обработана» and «Не обработана» that persists the new value server-side; new leads default to «Не обработана». If persistence fails, the toggle SHALL revert to its previous value with a visible error.

#### Scenario: Marking a lead processed
- **WHEN** the roaster switches the toggle to «Обработана»
- **THEN** the status is saved and stays «Обработана» after a reload

#### Scenario: Failed update
- **WHEN** saving the status fails
- **THEN** the toggle reverts to its previous value and an error message is shown

### Requirement: Status filter
The panel SHALL filter the list by status with three options: Все, Необработанные, Обработанные. Changing the filter applies immediately without a page reload.

#### Scenario: Filtering unprocessed leads
- **WHEN** the roaster selects «Необработанные»
- **THEN** only unprocessed leads are listed

### Requirement: Lead deletion with confirmation
Deleting a lead SHALL require an explicit confirmation step; confirming removes the row permanently, cancelling keeps the lead and closes the dialog.

#### Scenario: Confirmed deletion
- **WHEN** the roaster confirms «Удалить заявку»
- **THEN** the lead is removed from the database and disappears from the list

#### Scenario: Cancelled deletion
- **WHEN** the roaster cancels the deletion dialog
- **THEN** the lead remains in the list

### Requirement: Comment viewing and editing
The full comment text SHALL be visible on the lead card. Editing SHALL open a modal with a textarea and three controls: «Принять» saves the text, «Отмена» closes without changes, and «Удалить комментарий» clears the stored comment.

#### Scenario: Saving a comment
- **WHEN** the roaster edits the text and presses «Принять»
- **THEN** the comment is saved and shown in full on the card

#### Scenario: Clearing a comment
- **WHEN** the roaster presses «Удалить комментарий»
- **THEN** the stored comment is cleared while the lead remains

#### Scenario: Cancelled edit
- **WHEN** the roaster presses «Отмена»
- **THEN** the modal closes and the stored comment is unchanged

### Requirement: Attribution display
For every lead the panel SHALL render first-touch and last-touch as chip summaries derived from the attribution JSON (utm parameters, click id, referrer hostname, landing), show «нет данных» for empty touches, list the submission page, and expose the complete raw JSON in an expandable view.

#### Scenario: Campaign lead
- **WHEN** a lead has utm parameters in its touches
- **THEN** each populated value appears as a chip grouped under «Первый визит»/«Последний визит» and the raw JSON is available on expand

#### Scenario: Empty attribution
- **WHEN** a lead's attribution touches are empty objects
- **THEN** the summary shows «нет данных» instead of chips and the raw JSON still renders

