# Spec Delta

## Purpose

Defines the visual foundation of the landing — color palette, typography roles bound to self-hosted fonts, and accessibility constraints that every section and component of the page must follow.

## ADDED Requirements

### Requirement: Color palette
The page SHALL use this palette as its single source of truth: background `#FAF6EE`, primary text `#2C2623`, secondary block background `#D5C2AD`, primary accent `#4A5D4E` (buttons, icons, accents), promo accent `#D08A4B` (promotional badges).

#### Scenario: Default rendering
- **WHEN** the landing renders in its default state
- **THEN** the page background is `#FAF6EE`, body text is `#2C2623`, and secondary blocks are filled with `#D5C2AD`

#### Scenario: Primary and promo accents
- **WHEN** a primary action element (CTA button, icon accent) and a promotional badge (e.g. the subscription offer) are rendered
- **THEN** the primary action uses `#4A5D4E` and the promotional badge uses `#D08A4B`

### Requirement: Typography roles
The design SHALL assign typography roles as follows: headings — Yanone Kaffeesatz; body text — PT Serif; captions and product characteristics — PT Sans; prices — PT Mono. Roles SHALL be applied consistently across all sections.

#### Scenario: Prices
- **WHEN** any price is displayed (product cards, subscription)
- **THEN** it is rendered in PT Mono

#### Scenario: Headings and captions
- **WHEN** a section heading or a small caption/characteristic label renders
- **THEN** the heading uses Yanone Kaffeesatz and the caption uses PT Sans, while body copy uses PT Serif

### Requirement: Self-hosted font delivery
The four brand fonts SHALL be delivered as local font files from the project's own origin; the page SHALL NOT request fonts from external providers at runtime.

#### Scenario: External network independence
- **WHEN** the page loads while external font CDNs are unreachable
- **THEN** all brand fonts still render because they are served locally

### Requirement: Contrast and focus accessibility
Text SHALL meet WCAG 2.1 AA contrast (at least 4.5:1 for normal text), including text rendered over the hero photograph, and every focusable element SHALL show a visible keyboard focus indicator.

#### Scenario: Text over the hero image
- **WHEN** the hero renders light-colored text over the background photograph
- **THEN** a scrim/overlay guarantees at least 4.5:1 effective contrast between the text and the rendered background

#### Scenario: Keyboard navigation
- **WHEN** a keyboard user tabs through links, buttons, carousel and accordion controls
- **THEN** each element in sequence displays a clearly visible focus state
