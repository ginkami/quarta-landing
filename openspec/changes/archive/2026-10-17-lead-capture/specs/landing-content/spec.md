# Spec Delta

## MODIFIED Requirements

### Requirement: Section composition
The landing SHALL render, in order: header, hero, assortment, subscription, delivery & pickup, process steps, FAQ, request form, contacts, footer. The header SHALL provide in-page navigation to the main sections — including the request form — and a primary CTA that leads to the request form section.

#### Scenario: First visit
- **WHEN** a visitor opens the landing page
- **THEN** all listed sections are present in order and the header offers navigation to them plus a CTA that scrolls to the request form section

#### Scenario: In-page navigation
- **WHEN** a visitor activates a header navigation link
- **THEN** the page scrolls to the corresponding section without a full page reload

### Requirement: Hero section
The hero SHALL use `public/images/hero.webp` as its full-section background and communicate the core value proposition: the «КВАРТА» logo rendered as text, roasting in 5 kg batches since 2019 by former baristas, roasting on Thursdays, and beans reaching the customer 1–3 day after roast, plus a primary CTA that leads to the request form section.

#### Scenario: Value proposition
- **WHEN** the hero renders
- **THEN** it visibly states who the roastery is and why freshness matters (roast days, 1–3 day freshness) with a CTA leading to the request form section

### Requirement: Subscription offer
The subscription section SHALL state the offer terms: two 250 g packs per month, free delivery, price 54 BYN per month, highlighted with a promotional badge, and a CTA leading to the request form section.

#### Scenario: Offer terms
- **WHEN** a visitor reads the subscription section
- **THEN** they see "2 packs × 250 g per month", "free delivery", and "54 BYN / month" together with a promotional badge and a CTA to the request form section
