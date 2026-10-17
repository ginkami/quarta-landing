# landing-content Specification

## Purpose
Defines the content, structure and interactive behavior of the single-page marketing landing for the roastery: which sections exist, what contract their content fulfills, and how visitors navigate them on any device.

## Requirements

### Requirement: Section composition
The landing SHALL render, in order: header, hero, assortment, subscription, delivery & pickup, process steps, FAQ, request form, footer. The header SHALL provide in-page navigation to the main sections — including the request form — and a primary CTA that leads to the request form section.

#### Scenario: First visit
- **WHEN** a visitor opens the landing page
- **THEN** all listed sections are present in order and the header offers navigation to them plus a CTA that scrolls to the request form section

#### Scenario: In-page navigation
- **WHEN** a visitor activates a header navigation link
- **THEN** the page scrolls to the corresponding section without a full page reload

### Requirement: Hero section
The hero SHALL use `public/images/hero.webp` as its full-section background and communicate the core value proposition with an H1 title and a lead narrative: the roastery is run by former baristas, they roast in small batches on Thursdays, Friday is the delivery day, and beans arrive while still fresh, plus a primary CTA that leads to the request form section.

#### Scenario: Value proposition
- **WHEN** the hero renders
- **THEN** it visibly states who the roastery is and why freshness matters (small Thursday roasts, next-day Friday delivery) with a CTA leading to the request form section

### Requirement: Assortment carousel
The assortment section SHALL present product cards as a navigable carousel. Each card SHALL contain an image with 2:3 proportions, a title, a short description and a price, for exactly these products: Эфиопия Иргачеффе — 32 BYN; Колумбия Уила — 29 BYN; Бразилия Серрадо — 26 BYN; Дрип-пакеты, ассорти — 18 BYN.

#### Scenario: Browse products
- **WHEN** a visitor views the assortment section
- **THEN** four cards are shown with correct titles, descriptions, prices and product images, and navigation controls reveal the remaining cards

#### Scenario: Accessible navigation
- **WHEN** a visitor navigates the carousel using swipe/drag, controls, or keyboard
- **THEN** the carousel moves accordingly and its controls remain keyboard-operable with accessible names

### Requirement: Subscription offer
The subscription section SHALL state the offer terms: two 250 g packs per month, free delivery, price 54 BYN per month, highlighted with a promotional badge, and a CTA leading to the request form section.

#### Scenario: Offer terms
- **WHEN** a visitor reads the subscription section
- **THEN** they see "2 packs × 250 g per month", "free delivery", and "54 BYN / month" together with a promotional badge and a CTA to the request form section

### Requirement: Delivery and pickup terms
The section SHALL state: delivery across Minsk on Fridays for 5 BYN, free from 50 BYN; self-pickup at Минск, ул. Короля, 9; working hours пн–пт 8:00–20:00, сб–вс 10:00–18:00; and the Thursday roast / Friday delivery rhythm.

#### Scenario: Delivery terms
- **WHEN** a visitor reads the section
- **THEN** the Friday delivery price, the free-delivery threshold, the pickup address, the working hours and the roast/delivery rhythm are all visible

### Requirement: Process steps
The landing SHALL show the ordered steps from request to result: (1) visitor submits a request, (2) manager calls back and confirms the order, (3) roasting on Thursday, (4) delivery on Friday or self-pickup, (5) beans arrive 1–3 days after roasting.

#### Scenario: Reading the process
- **WHEN** a visitor opens the process section
- **THEN** the five steps are displayed in the stated order, numbered, and understandable without extra context

### Requirement: FAQ accordion
The FAQ section SHALL render an accordion: each question expands or collapses its answer on user activation, and questions are operable via keyboard.

#### Scenario: Expanding an answer
- **WHEN** a visitor activates a FAQ question
- **THEN** the corresponding answer becomes visible and the control reflects its expanded state

### Requirement: Contact information
The footer SHALL display the contact information as a single vertical list with icon markers: the phone as a `tel:` link, the email as a `mailto:` link, the pickup address (Минск, ул. Короля, 9), and the working hours. The social media profiles SHALL be exposed as icon-only links on one line without a marker. On large screens the footer SHALL also show the header navigation as a vertical menu (hidden on mobile) alongside the brand identity with a copyright line.

#### Scenario: Finding contacts in the footer
- **WHEN** a visitor scrolls to the footer
- **THEN** phone, email, address and hours are listed with icon markers, the social profiles are icon-only links on one line, and the navigation menu column is visible on large screens but hidden on mobile

### Requirement: Mobile-first responsiveness
The landing SHALL be usable from a 320 px wide viewport upward with no horizontal scrolling; primary CTA tap targets SHALL be at least 44 px, and the header navigation SHALL remain reachable in a compact mobile form.

#### Scenario: Phone viewport
- **WHEN** a visitor with a 320–414 px wide screen loads the page
- **THEN** content reflows without horizontal scroll, CTAs are comfortably tappable, and the navigation is available through a compact menu

### Requirement: Analytics baseline
The landing SHALL load Vercel Analytics so page views are collected. Conversion events on form submission are out of scope for this capability.

#### Scenario: Analytics initialization
- **WHEN** the page loads in a visitor's browser
- **THEN** Vercel Analytics is initialized and page views are recorded
