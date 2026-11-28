# Simatu Marketplace Taxonomy Governance

**Status:** Initial taxonomy contract  
**Applies to:** Marketplace categories, subcategories, product types, attributes, discovery synonyms, and restricted-audience classification.

## Core principle

Classify listings by their **primary purpose and customer intent**, not by a generic descriptor, physical form, marketing synonym, or keyword alone.

A word such as “gadget” is not a category. It can describe many unrelated products. A phone and a Bluetooth speaker are consumer technology; an intimate device is a sexual-wellness product. They must not share a discovery category merely because all can be described colloquially as gadgets or electronic devices.

## Classification layers

1. **Marketplace category:** broad, stable discovery destination.
2. **Subcategory:** product/service family within a category.
3. **Product/service type:** precise type used for catalogue structure and relevant filtering.
4. **Attributes:** specifications, materials, size, compatibility, features, brand, and other typed facts.

Audience, age, visibility, safety, and restricted-content policies are separate listing/category metadata. They must not be encoded as ordinary category names or rely on keyword filtering alone.

## Top-level category rules

- Categories are platform-owned, curated, and intentionally limited.
- Businesses may be assigned to multiple relevant categories. Their identity is not duplicated.
- Listings have a primary classification. Secondary discovery placements may be allowed only through explicit taxonomy relationships and policy checks.
- A new top-level category requires evidence that its customer intent is distinct, broad enough to warrant a destination, and not already represented by an existing category.
- Synonyms, alternate spellings, marketing terms, and generic descriptors belong in search synonyms, not new categories.
- If a proposed concept fits the definition of an existing subcategory or product type, reuse it.
- Category naming must be consistent, concise, and customer-facing. Avoid category pairs that differ only in wording.

## Examples: technology vs. sexual wellness

| Listing | Primary classification | Additional discoverability |
|---|---|---|
| Mobile phone | Technology → Phones & Accessories | Brand, OS, storage, network, condition |
| Bluetooth speaker | Technology → Audio | Connectivity, wattage, portable, brand |
| Headphones | Technology → Audio | Type, connection, noise cancellation |
| Smart watch | Technology → Smart Technology / Wearables | Compatibility, features, size |
| Adult intimate device / sex toy | Restricted Sexual Wellness | Material, device type, care/usage attributes where permitted; age and visibility policy apply |

“Gadget”, “device”, and “electronic” may be search terms or attributes where appropriate, but must never override the primary purpose-based classification.

Restricted Sexual Wellness listings must not appear in general Technology browsing, Kids & Family, unrestricted recommendations, or general-purpose search suggestions. Restricted audience classification is not itself sufficient to make a listing compliant: visibility, age assurance, merchant eligibility, content moderation, applicable law, and purchase policies must be enforced by the relevant backend and presentation surfaces before activation. The seeded restricted category is not a public UI feature and must remain unavailable to client access until those controls are implemented.

## Consolidation decisions

- **Home & Spaces + Everyday Living → Home & Living.** Merge household essentials, kitchen, cleaning, bedding, gardening, organisation, decor, furniture, textiles, and home-related services into one discovery destination, using subcategories and product/service types to distinguish them.
- **Technology** remains the destination for consumer electronics, computing, audio, gaming devices, wearables, connected devices, and tech support/repair. Purpose-based restricted categories take precedence where applicable.
- **African Culture & Heritage** is for culturally rooted heritage, traditional expression, and cultural goods. Art and craft products may be classified under Art & Creativity when the primary intent is general creative/artistic practice; cultural context may be a secondary attribute or explicit cross-discovery placement.
- **Art & Creativity** is for general art, craft materials, creative tools, and creative work. Do not duplicate cultural-art subcategories merely by rewording.
- **Hobbies & Collecting** is for recreational participation and collecting (e.g., books, models, specialist hobby equipment, collectibles). Creative supplies belong under Art & Creativity when their primary use is making art/crafts.
- **Local & Personal Services** targets consumers/households; **Business Services** targets organizations and professional business needs. General services are further typed by service function.
- **Events & Celebrations** covers event-specific planning, supplies, venues, and coordination; **Travel & Experiences** covers destination travel, accommodation, tours, and experiences. Cross-placement is allowed only when the offering genuinely serves both intents, not because keywords overlap.

## Category review gate

Before creating or renaming a taxonomy node, review:

1. Existing top-level categories and their definitions.
2. Existing subcategories and product/service types.
3. Synonyms and search terms that could be mistaken for duplicate nodes.
4. Primary customer intent and expected discovery destination.
5. Whether it is broad and distinct enough for a top-level category.
6. Product vs. service semantics and required attributes.
7. Audience/restriction requirements and backend policy enforcement.
8. Impact on existing category IDs, routes, search, analytics, and assignments.

The review must document the existing node to reuse, the proposed node, why reuse is insufficient, and any migration/alias plan.

## Compatibility

The existing discovery route identifier `living` remains an alias for the consolidated `spaces` destination. The canonical visible label is Home & Living. Existing store-specific category/subcategory data is not rewritten by this marketplace taxonomy consolidation.

## Implementation status and caution

The marketplace discovery display taxonomy currently contains 17 general top-level tiles, with Home & Living consolidated. The database taxonomy migration includes a separate restricted Sexual Wellness classification with minimum age 18. This restricted database entry is intentionally not exposed in the general discovery tile list. The migration has not been applied; the restricted listing/access controls are not implemented or verified, so the category is not ready for public use.


## Automated taxonomy guardrails

`tests/unit/discovery-taxonomy.test.ts` now checks top-level ID/name uniqueness, subcategory ID/title uniqueness across the full taxonomy, Home & Living consolidation and legacy `living` alias behavior, and that restricted Sexual Wellness is not exposed as a general discovery tile. These tests are committed but have not yet been run in a local environment.


## Age-Restricted destination rollout

- Added a dedicated `Age-Restricted` discovery tile (`age-restricted`) outside ordinary category/subcategory taxonomy.
- The category database seed now uses `Age-Restricted` as the restricted parent destination, rather than exposing `Sexual Wellness` as a top-level marketplace category.
- Added a frontend age-confirmation screen on the destination route. The checkbox is only a UI acknowledgement; it is **not secure age verification** and does not grant access to restricted listings. The restricted catalogue remains intentionally unavailable until server-side age verification, listing moderation, authorization checks across search/direct routes/recommendations, and policy/legal checks are implemented.
- Taxonomy test expectation updated to 18 total discovery tiles, with one dedicated restricted destination.


## Platform assignment workflow

Marketplace taxonomy is the authoritative classification system for store products. In platform Admin Settings, super administrators can review stores, search by store name or slug, filter stores by an existing general marketplace category, and assign or remove category memberships. A store can belong to multiple marketplace categories, with one primary placement; these assignments describe the store's marketplace presence and do not duplicate its identity or listings.

Every newly created or reclassified store product must belong to a published marketplace subcategory whose parent category is assigned to that store. Product category and subcategory labels are derived from the shared taxonomy; store admins do not create or select a private category tree for marketplace products. The former store-owned `categories` and `subcategories` tables (including legacy His, Hers, Spaces, and Lounge records) are retained for compatibility with existing catalogue records and are not the classification source for new product saves.

Assignments are limited to active general-audience marketplace categories. The restricted category is excluded from the public taxonomy and from this assignment interface. Public business discovery only returns active stores that have an explicit category assignment and at least one active, marketplace-visible, non-age-restricted listing.

## Discovery page integration

Public category pages use the platform category slug to request businesses from the marketplace business discovery endpoint. The page then scopes its marketplace product results to the assigned business slugs before applying its existing subcategory term filtering. The category route ID `spaces` maps to the seeded platform category slug `home-living`. The existing category page presentation and subcategory carousel remain unchanged.


## Structured product subcategory foundation

- Added platform-owned `marketplace_subcategories`, linked to a marketplace category with stable UUIDs and unique slugs scoped to the parent category.
- Added nullable `products.marketplace_subcategory_id`. Existing products were not automatically classified during the initial rollout.
- Seeded the curated discovery subcategory set (87 current nodes) from the existing taxonomy, scoped to its parent marketplace category. The platform categories Technology and African Culture & Heritage currently have no curated subcategory tiles in the source taxonomy and are intentionally left empty.
- Store product administration selects a marketplace category assigned to the store and one of that category's published subcategories. The API validates this relationship, and database triggers enforce it independently.
- New product saves derive their category/subcategory labels from the shared marketplace taxonomy. Legacy store-owned category IDs are nullable for new rows; existing category/subcategory tables and references remain intact.
- New store products require marketplace classification. Changing marketplace visibility cannot bypass the classification or store/category assignment checks. Existing legacy products remain intact and must be assigned a valid shared subcategory when edited or made marketplace-visible.
- Discovery uses the shared marketplace category/subcategory identifiers. Store-specific His/Hers/Spaces/Lounge labels are not a parallel marketplace taxonomy.
- Migrations `20261126150000_create_marketplace_subcategories.sql` and `20261126160000_seed_marketplace_subcategories.sql` establish the shared taxonomy; the follow-on product alignment migration is `20261128120000_align_store_products_to_shared_marketplace_taxonomy.sql`.