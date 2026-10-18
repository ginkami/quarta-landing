# Spec Delta

## MODIFIED Requirements

### Requirement: Robots directives
The project SHALL expose `robots.ts` that allows crawling of the landing, points to the sitemap, and disallows crawling of the admin routes. Admin pages SHALL additionally serve `noindex` directives so the panel is never surfaced in search results.

#### Scenario: Robots fetch
- **WHEN** a crawler requests `/robots.txt`
- **THEN** crawling of the landing is allowed, the sitemap URL is referenced, and admin routes are disallowed

#### Scenario: Admin excluded from indexing
- **WHEN** a crawler evaluates an admin page
- **THEN** robots metadata instructs it not to index or follow the page
