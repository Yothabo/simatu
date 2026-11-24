import type { MoodboardItem } from './KineticMoodboard';

const image = (id: string) => `https://images.unsplash.com/${id}?w=900&q=85`;

export const DISCOVERY_MARKETS: MoodboardItem[] = [
  { id: 'fashion', image: image('photo-1490481651871-ab68de25d43d'), alt: 'Fashion collection', category: 'Fashion', title: 'Wear your point of view' },
  { id: 'spaces', image: image('photo-1531058020387-3be344556be6'), alt: 'Interior spaces', category: 'Spaces', title: 'Shape your surroundings' },
  { id: 'technology', image: image('photo-1523275335684-37898b6baf30'), alt: 'Technology and gadgets', category: 'Technology', title: 'Things that move us forward' },
  { id: 'culture', image: image('photo-1500530855697-b586d89ba3ee'), alt: 'Culture and creative heritage', category: 'Culture', title: 'Rooted in expression' },
  { id: 'living', image: image('photo-1494438639946-1ebd1d20bf85'), alt: 'Everyday living', category: 'Living', title: 'Make everyday yours' },
  { id: 'beauty', image: image('photo-1515886657613-9f3515b0c78f'), alt: 'Beauty and personal care', category: 'Beauty', title: 'Care in every detail' },
  { id: 'sports', image: image('photo-1519710164239-da123dc03ef4'), alt: 'Sports and outdoors', category: 'Sports', title: 'Move with purpose' },
  { id: 'food', image: image('photo-1490645935967-10de6ba17061'), alt: 'Food and specialty goods', category: 'Food', title: 'Good things, gathered' },
  { id: 'automotive', image: image('photo-1500534623283-312aade485b7'), alt: 'Automotive culture', category: 'Automotive', title: 'Driven by detail' },
  { id: 'pets', image: image('photo-1497366754035-f200968a6e72'), alt: 'Pet products and animal care', category: 'Pets', title: 'For every companion' },
  { id: 'kids', image: image('photo-1503454537195-1dc4e4d6a4b3'), alt: 'Children and family products', category: 'Kids & Family', title: 'Little things, big moments' },
  { id: 'creative', image: image('photo-1497366216548-37526070297c'), alt: 'Art and creative supplies', category: 'Art & Creativity', title: 'Make something yours' },
  { id: 'events', image: image('photo-1529139574466-a303027c1d8b'), alt: 'Celebrations and events', category: 'Events', title: 'Gather and celebrate' },
  { id: 'hobbies', image: image('photo-1553062407-98eeb64c6a62'), alt: 'Hobbies and collectibles', category: 'Hobbies', title: 'Follow your curiosity' },
  { id: 'services', image: image('photo-1517841905240-472988babdf9'), alt: 'Independent services', category: 'Services', title: 'Find the right people' },
  { id: 'travel', image: image('photo-1524504388940-b1c1722653e1'), alt: 'Travel and experiences', category: 'Travel & Experiences', title: 'Go somewhere new' },
  { id: 'business', image: image('photo-1497366811353-6870744d04b2'), alt: 'Business and professional services', category: 'Business', title: 'Built for what is next' },
  { id: 'digital', image: image('photo-1498050108023-c5249f4df085'), alt: 'Digital products and software', category: 'Digital', title: 'Ideas you can use' },
];

export type DiscoverySubcategory = { id: string; title: string; image: string; alt: string; description: string; terms: string[] };

const tile = (id: string, title: string, photo: string, description: string, terms: string[] = [title.toLowerCase()]) => ({ id, title, image: image(photo), alt: title, description, terms });

export const DISCOVERY_SUBCATEGORIES: Record<string, DiscoverySubcategory[]> = {
  fashion: [
    tile('clothing', 'Clothing', 'photo-1490481651871-ab68de25d43d', 'Independent labels, everyday wear and statement pieces', ['clothing','apparel','wear']),
    tile('streetwear', 'Streetwear', 'photo-1529139574466-a303027c1d8b', 'Streetwear, drops and urban labels', ['streetwear','hoodie','sneaker']),
    tile('footwear', 'Footwear', 'photo-1542291026-7eec264c27ff', 'Shoes, sneakers and sandals', ['shoe','footwear','sneaker']),
    tile('bags', 'Bags', 'photo-1553062407-98eeb64c6a62', 'Bags, backpacks and carry goods', ['bag','backpack']),
    tile('modest-fashion', 'Modest Fashion', 'photo-1515886657613-9f3515b0c78f', 'Modest and covered fashion', ['modest']),
    tile('vintage', 'Vintage & Resale', 'photo-1529139574466-a303027c1d8b', 'Pre-loved and vintage fashion', ['vintage','resale','second hand']),
  ],
  spaces: [
    tile('furniture', 'Furniture', 'photo-1531058020387-3be344556be6', 'Furniture for homes and workspaces', ['furniture','sofa','chair','table']),
    tile('lighting', 'Lighting', 'photo-1494438639946-1ebd1d20bf85', 'Lighting and fixtures', ['lighting','lamp']),
    tile('decor', 'Decor', 'photo-1494438639946-1ebd1d20bf85', 'Decorative pieces and accents', ['decor','decoration']),
    tile('rugs-textiles', 'Rugs & Textiles', 'photo-1494438639946-1ebd1d20bf85', 'Soft furnishings and textiles', ['rug','textile','curtain']),
    tile('interior-services', 'Interior Services', 'photo-1497366216548-37526070297c', 'Interior design, styling and furnishing', ['interior','design','styling']),
    tile('storage', 'Storage & Organisation', 'photo-1494438639946-1ebd1d20bf85', 'Storage solutions and organisers', ['storage','organ']),
  ],
  technology: [
    tile('phones', 'Phones', 'photo-1523275335684-37898b6baf30', 'Phones and accessories', ['phone','mobile']),
    tile('computing', 'Computing', 'photo-1497366216548-37526070297c', 'Computers, laptops and peripherals', ['computer','laptop']),
    tile('audio', 'Audio', 'photo-1523275335684-37898b6baf30', 'Headphones, speakers and audio gear', ['audio','headphone','speaker']),
    tile('gaming', 'Gaming', 'photo-1529139574466-a303027c1d8b', 'Gaming gear, accessories and titles', ['gaming','game']),
    tile('smart-devices', 'Smart Devices', 'photo-1523275335684-37898b6baf30', 'Wearables, smart home and connected devices', ['smart','watch','wearable']),
    tile('tech-services', 'Repairs & Services', 'photo-1497366216548-37526070297c', 'Repairs, support and installations', ['repair','support','install']),
  ],
  culture: [
    tile('heritage-fashion', 'Heritage Wear', 'photo-1515886657613-9f3515b0c78f', 'Traditional and culturally rooted attire', ['traditional','heritage','cultural']),
    tile('beadwork', 'Beadwork', 'photo-1529139574466-a303027c1d8b', 'Beaded craft, adornment and art', ['bead']),
    tile('crafts', 'Cultural Crafts', 'photo-1500530855697-b586d89ba3ee', 'Handcrafted cultural goods', ['craft','handmade']),
    tile('art', 'Art & Heritage', 'photo-1500530855697-b586d89ba3ee', 'Artwork, heritage and creative expression', ['art','heritage']),
    tile('ceremonial', 'Ceremonial Goods', 'photo-1494438639946-1ebd1d20bf85', 'Goods for ceremonies and traditions', ['ceremon','traditional']),
  ],
  living: [
    tile('kitchen', 'Kitchen & Dining', 'photo-1494438639946-1ebd1d20bf85', 'Cookware, tableware and kitchen goods', ['kitchen','cook','dining']),
    tile('bedding', 'Bedding & Bath', 'photo-1531058020387-3be344556be6', 'Bedding, towels and bath essentials', ['bedding','bath','towel']),
    tile('home-essentials', 'Home Essentials', 'photo-1494438639946-1ebd1d20bf85', 'Everyday household products', ['home','household','essential']),
    tile('plants', 'Plants & Gardening', 'photo-1500530855697-b586d89ba3ee', 'Plants, gardening and growing supplies', ['plant','garden']),
    tile('cleaning', 'Cleaning', 'photo-1494438639946-1ebd1d20bf85', 'Cleaning products and equipment', ['clean']),
    tile('home-organisation', 'Organisation', 'photo-1494438639946-1ebd1d20bf85', 'Home organisation and utility', ['organ','storage']),
  ],
  beauty: [
    tile('skincare', 'Skincare', 'photo-1515886657613-9f3515b0c78f', 'Skin care and beauty essentials', ['skin']),
    tile('makeup', 'Makeup', 'photo-1515886657613-9f3515b0c78f', 'Cosmetics and makeup products', ['makeup','cosmetic']),
    tile('hair', 'Hair', 'photo-1515886657613-9f3515b0c78f', 'Haircare, wigs and hair products', ['hair']),
    tile('fragrance', 'Fragrance', 'photo-1523275335684-37898b6baf30', 'Perfumes and scents', ['fragrance','perfume']),
    tile('nails', 'Nails', 'photo-1515886657613-9f3515b0c78f', 'Nail products and nail services', ['nail']),
    tile('beauty-services', 'Beauty Services', 'photo-1515886657613-9f3515b0c78f', 'Beauty appointments and treatments', ['beauty','lash','brow']),
  ],
  sports: [
    tile('fitness', 'Fitness & Gym', 'photo-1519710164239-da123dc03ef4', 'Fitness equipment and training gear', ['fitness','gym','training']),
    tile('sportswear', 'Sportswear', 'photo-1490481651871-ab68de25d43d', 'Sports clothing and shoes', ['sportswear','activewear']),
    tile('outdoor', 'Outdoor & Camping', 'photo-1500534623283-312aade485b7', 'Outdoor, camping and hiking equipment', ['outdoor','camp','hiking']),
    tile('cycling', 'Cycling', 'photo-1519710164239-da123dc03ef4', 'Cycling gear and accessories', ['cycling','bike']),
    tile('sports-equipment', 'Sports Equipment', 'photo-1519710164239-da123dc03ef4', 'Sport-specific equipment', ['sport','equipment']),
    tile('sports-services', 'Coaching & Classes', 'photo-1497366216548-37526070297c', 'Training, coaching and classes', ['coach','class']),
  ],
  food: [
    tile('bakery', 'Bakery & Treats', 'photo-1490645935967-10de6ba17061', 'Baked goods, cakes and confectionery', ['bakery','cake','bake','treat']),
    tile('specialty-food', 'Specialty Food', 'photo-1490645935967-10de6ba17061', 'Specialty, artisan and packaged food', ['food','snack','sauce']),
    tile('coffee-drinks', 'Coffee & Drinks', 'photo-1490645935967-10de6ba17061', 'Coffee, beverages and drink products', ['coffee','drink','beverage']),
    tile('catering', 'Catering & Meal Prep', 'photo-1490645935967-10de6ba17061', 'Catering, meal preparation and food service', ['cater','meal','food service']),
    tile('restaurants', 'Food Experiences', 'photo-1490645935967-10de6ba17061', 'Dining and food experiences', ['restaurant','dining']),
  ],
  automotive: [
    tile('mobile-detailing', 'Mobile Detailing', 'photo-1500534623283-312aade485b7', 'Detailing services brought to you', ['detail','detailing']),
    tile('car-wash', 'Car Wash', 'photo-1500534623283-312aade485b7', 'Vehicle wash and cleaning packages', ['wash']),
    tile('care-products', 'Car Care Products', 'photo-1500534623283-312aade485b7', 'Cleaning, polishing and care products', ['car care','automotive']),
    tile('accessories', 'Accessories', 'photo-1523275335684-37898b6baf30', 'Vehicle accessories and add-ons', ['accessory']),
    tile('repairs', 'Repairs & Mechanics', 'photo-1497366216548-37526070297c', 'Diagnostics, servicing and mechanical work', ['mechanic','repair','service']),
    tile('tyres', 'Wheels & Tyres', 'photo-1500534623283-312aade485b7', 'Tyres, wheels and fitting', ['tyre','wheel']),
    tile('customisation', 'Customisation', 'photo-1500534623283-312aade485b7', 'Wraps, tinting, audio and modifications', ['wrap','tint','modification','custom']),
    tile('auto-electrical', 'Auto Electrical', 'photo-1523275335684-37898b6baf30', 'Auto electrical work and installations', ['electrical']),
  ],
  pets: [
    tile('pet-food', 'Food & Treats', 'photo-1497366754035-f200968a6e72', 'Pet food, treats and nutrition', ['pet food','treat']),
    tile('pet-accessories', 'Accessories', 'photo-1497366754035-f200968a6e72', 'Collars, leads and pet accessories', ['pet','collar','lead']),
    tile('pet-toys', 'Toys', 'photo-1497366754035-f200968a6e72', 'Toys and enrichment products', ['toy']),
    tile('pet-care', 'Grooming & Care', 'photo-1497366754035-f200968a6e72', 'Grooming, care and services', ['groom','care']),
    tile('pet-services', 'Pet Services', 'photo-1497366754035-f200968a6e72', 'Pet sitting, walking and training', ['pet service','walking','training']),
  ],
  kids: [
    tile('baby', 'Baby & Maternity', 'photo-1519710164239-da123dc03ef4', 'Baby, maternity and feeding products', ['baby','maternity']),
    tile('kids-clothing', 'Kids Clothing', 'photo-1515886657613-9f3515b0c78f', 'Clothing and footwear for children', ['kids','child']),
    tile('toys', 'Toys & Games', 'photo-1529139574466-a303027c1d8b', 'Toys, games and play', ['toy','game']),
    tile('learning', 'Learning & School', 'photo-1497366216548-37526070297c', 'Learning materials and school supplies', ['school','learning','education']),
    tile('nursery', 'Nursery', 'photo-1531058020387-3be344556be6', 'Nursery furniture and essentials', ['nursery']),
  ],
  creative: [
    tile('art-supplies', 'Art Supplies', 'photo-1500530855697-b586d89ba3ee', 'Materials for artists and makers', ['art','paint']),
    tile('craft-supplies', 'Craft Supplies', 'photo-1529139574466-a303027c1d8b', 'Crafting and handmade supplies', ['craft']),
    tile('stationery', 'Stationery', 'photo-1497366216548-37526070297c', 'Paper goods, pens and journals', ['stationery','journal','pen']),
    tile('music', 'Music & Instruments', 'photo-1523275335684-37898b6baf30', 'Instruments, music equipment and accessories', ['music','instrument']),
    tile('creative-services', 'Creative Services', 'photo-1497366216548-37526070297c', 'Design, photography and creative work', ['creative','design','photography']),
  ],
  events: [
    tile('party-supplies', 'Party Supplies', 'photo-1494438639946-1ebd1d20bf85', 'Decorations and celebration supplies', ['party']),
    tile('weddings', 'Weddings', 'photo-1494438639946-1ebd1d20bf85', 'Wedding goods, styling and services', ['wedding']),
    tile('event-decor', 'Event Decor', 'photo-1494438639946-1ebd1d20bf85', 'Decor, props and event styling', ['event','decor']),
    tile('venues', 'Venues', 'photo-1531058020387-3be344556be6', 'Spaces to host events and gatherings', ['venue']),
    tile('event-services', 'Event Services', 'photo-1497366216548-37526070297c', 'Planning, catering and entertainment', ['event','service','dj']),
  ],
  hobbies: [
    tile('collectibles', 'Collectibles', 'photo-1529139574466-a303027c1d8b', 'Collectible items and limited finds', ['collect']),
    tile('gaming-hobby', 'Gaming', 'photo-1529139574466-a303027c1d8b', 'Games, gaming gear and accessories', ['gaming']),
    tile('books', 'Books', 'photo-1497366216548-37526070297c', 'Books and reading', ['book']),
    tile('models', 'Models & Kits', 'photo-1523275335684-37898b6baf30', 'Model kits, miniatures and building sets', ['model','kit','miniature']),
    tile('hobby-supplies', 'Hobby Supplies', 'photo-1500530855697-b586d89ba3ee', 'Specialist supplies for niche interests', ['hobby']),
  ],
  services: [
    tile('home-services', 'Home Services', 'photo-1497366216548-37526070297c', 'Cleaning, repairs and home maintenance', ['home','clean','repair']),
    tile('beauty-services', 'Beauty Services', 'photo-1515886657613-9f3515b0c78f', 'Hair, nails, grooming and beauty appointments', ['beauty','hair','nail']),
    tile('professional', 'Professional Services', 'photo-1497366216548-37526070297c', 'Business, consulting and professional expertise', ['professional','consult','business']),
    tile('photography', 'Photography & Video', 'photo-1529139574466-a303027c1d8b', 'Photography, video and content services', ['photo','video']),
    tile('education-services', 'Education & Coaching', 'photo-1497366216548-37526070297c', 'Tutoring, lessons, training and coaching', ['tutor','education','coach']),
    tile('fitness-services', 'Fitness & Wellness', 'photo-1519710164239-da123dc03ef4', 'Fitness, wellness and personal training', ['fitness','wellness','trainer']),
    tile('tech-services', 'Technology Services', 'photo-1523275335684-37898b6baf30', 'IT, development, installations and repairs', ['technology','tech','it']),
  ],
  travel: [
    tile('stays', 'Accommodation', 'photo-1531058020387-3be344556be6', 'Places to stay and accommodation bookings', ['stay','hotel','accommodation']),
    tile('tours', 'Tours & Activities', 'photo-1500534623283-312aade485b7', 'Guided tours and activities', ['tour','activity']),
    tile('experiences', 'Experiences', 'photo-1500530855697-b586d89ba3ee', 'Local experiences and things to do', ['experience']),
    tile('travel-products', 'Travel Goods', 'photo-1523275335684-37898b6baf30', 'Luggage and travel accessories', ['travel','luggage']),
  ],
  business: [
    tile('business-support', 'Business Support', 'photo-1497366216548-37526070297c', 'Operational support and business services', ['business']),
    tile('marketing', 'Marketing & Media', 'photo-1529139574466-a303027c1d8b', 'Marketing, content and media services', ['marketing','media','content']),
    tile('finance', 'Finance & Accounting', 'photo-1497366216548-37526070297c', 'Accounting and financial services', ['account','finance']),
    tile('legal', 'Legal Services', 'photo-1497366216548-37526070297c', 'Legal services and professional support', ['legal']),
    tile('property', 'Property Services', 'photo-1531058020387-3be344556be6', 'Property, rentals and management services', ['property','real estate']),
  ],
  digital: [
    tile('digital-downloads', 'Digital Downloads', 'photo-1523275335684-37898b6baf30', 'Templates, planners and downloadable assets', ['digital','download','template']),
    tile('software', 'Software & Apps', 'photo-1523275335684-37898b6baf30', 'Software, apps and subscriptions', ['software','app']),
    tile('courses', 'Courses & Learning', 'photo-1497366216548-37526070297c', 'Digital courses, guides and learning content', ['course','ebook','guide']),
    tile('design-assets', 'Design Assets', 'photo-1529139574466-a303027c1d8b', 'Fonts, presets, graphics and creative assets', ['design','preset','asset']),
  ],
};

export const getMarketById = (id: string) => DISCOVERY_MARKETS.find((market) => market.id === id || market.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
export const getSubcategories = (marketId: string) => DISCOVERY_SUBCATEGORIES[marketId] || [];
