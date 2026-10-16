# landing-seo Specification

## Purpose
Defines how the landing presents itself to search engines and ad crawlers: document metadata, social preview, crawl directives and structured data about the business.

## Requirements

### Requirement: Document metadata
The landing SHALL serve a Russian-language document (`lang="ru"`) with a unique title and meta description describing the roastery and its offer, generated through the framework's metadata API.

#### Scenario: Search result snippet
- **WHEN** a search engine crawler fetches the page
- **THEN** it finds a Russian title and meta description referencing the roastery, fresh coffee and Minsk

### Requirement: Social preview
The landing SHALL expose Open Graph metadata including title, description and an image representative of the landing, so shared links render a rich preview.

#### Scenario: Shared link
- **WHEN** the landing URL is shared or crawled as a social preview
- **THEN** Open Graph tags supply a title, description and image for the preview card

### Requirement: Sitemap
The project SHALL expose a sitemap at `/sitemap.xml` that includes the landing URL.

#### Scenario: Sitemap fetch
- **WHEN** a crawler requests `/sitemap.xml`
- **THEN** the response lists the landing URL

### Requirement: Robots directives
The project SHALL expose `robots.ts` that allows crawling of the landing and points to the sitemap.

#### Scenario: Robots fetch
- **WHEN** a crawler requests `/robots.txt`
- **THEN** crawling of the landing is allowed and the sitemap URL is referenced

### Requirement: Business structured data
The page SHALL include JSON-LD structured data for the local business with at minimum: name «КВАРТА», street address «ул. Короля, 9», city Минск, and the published opening hours.

#### Scenario: Structured data parsing
- **WHEN** a crawler parses the JSON-LD block in the page
- **THEN** it finds a valid object with the business name, address and opening hours
