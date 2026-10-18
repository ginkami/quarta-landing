# Spec Delta

## MODIFIED Requirements

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
