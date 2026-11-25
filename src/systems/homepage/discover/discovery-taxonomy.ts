import type { MoodboardItem } from './KineticMoodboard';

const image = (id: string) => `https://images.unsplash.com/${id}?w=900&q=85`;

export const DISCOVERY_MARKETS: MoodboardItem[] = [
  { id: 'fashion', image: image('photo-1564518160120-94178fcdf5d4'), alt: 'Fashion collection', category: 'Fashion', title: 'Wear your point of view' },
  { id: 'spaces', image: image('photo-1576344671262-e7d3697ac226'), alt: 'Interior spaces', category: 'Spaces', title: 'Shape your surroundings' },
  { id: 'technology', image: image('photo-1550751827-4bd374c3f58b'), alt: 'Technology and gadgets', category: 'Technology', title: 'Things that move us forward' },
  { id: 'culture', image: image('photo-1616235891569-a69fa8558037'), alt: 'Culture and creative heritage', category: 'Culture', title: 'Rooted in expression' },
  { id: 'living', image: image('photo-1544210163-257effe9399e'), alt: 'Everyday living', category: 'Living', title: 'Make everyday yours' },
  { id: 'beauty', image: image('photo-1600634999623-864991678406'), alt: 'Beauty and personal care', category: 'Beauty', title: 'Care in every detail' },
  { id: 'sports', image: image('photo-1755877956621-5fac2eae4ebb'), alt: 'Sports and outdoors', category: 'Sports', title: 'Move with purpose' },
  { id: 'food', image: image('photo-1564697364818-0c8250b15012'), alt: 'Food and specialty goods', category: 'Food', title: 'Good things, gathered' },
  { id: 'automotive', image: image('photo-1628999740821-cbec21f7f592'), alt: 'Automotive culture', category: 'Automotive', title: 'Driven by detail' },
  { id: 'pets', image: image('photo-1623387641168-d9803ddd3f35'), alt: 'Pet products and animal care', category: 'Pets', title: 'For every companion' },
  { id: 'kids', image: image('photo-1627750419700-c22969574c73'), alt: 'Children and family products', category: 'Kids & Family', title: 'Little things, big moments' },
  { id: 'creative', image: image('photo-1732141965904-a477c7a8e5c8'), alt: 'Art and creative supplies', category: 'Art & Creativity', title: 'Make something yours' },
  { id: 'events', image: image('photo-1589754251947-18e0ed7b4e35'), alt: 'Celebrations and events', category: 'Events', title: 'Gather and celebrate' },
  { id: 'hobbies', image: image('photo-1795159209556-f3543f22d229'), alt: 'Hobbies and collectibles', category: 'Hobbies', title: 'Follow your curiosity' },
  { id: 'services', image: image('photo-1515040242872-08257d6d08c2'), alt: 'Independent services', category: 'Services', title: 'Find the right people' },
  { id: 'travel', image: image('photo-1504542982118-59308b40fe0c'), alt: 'Travel and experiences', category: 'Travel & Experiences', title: 'Go somewhere new' },
  { id: 'business', image: image('photo-1791131993456-035beec081ca'), alt: 'Business and professional services', category: 'Business', title: 'Built for what is next' },
  { id: 'digital', image: image('photo-1571149828506-c48f1610314b'), alt: 'Digital products and software', category: 'Digital', title: 'Ideas you can use' },
];

export type DiscoverySubcategory = { id: string; title: string; image: string; alt: string; description: string; terms: string[] };

const tile = (id: string, title: string, photo: string, description: string, terms: string[] = [title.toLowerCase()]) => ({ id, title, image: image(photo), alt: title, description, terms });

export const DISCOVERY_SUBCATEGORIES: Record<string, DiscoverySubcategory[]> = {
  fashion: [
    tile('clothing', 'Clothing', 'photo-1792232017889-72eded6ebb8b', 'Independent labels, everyday wear and statement pieces', ['clothing','apparel','wear']),
    tile('streetwear', 'Streetwear', 'photo-1606964212916-4d23bf4044cb', 'Streetwear, drops and urban labels', ['streetwear','hoodie','sneaker']),
    tile('footwear', 'Footwear', 'photo-1793741158371-8ba3504f20a2', 'Shoes, sneakers and sandals', ['shoe','footwear','sneaker']),
    tile('bags', 'Bags', 'photo-1588609021245-df09ceb07de7', 'Bags, backpacks and carry goods', ['bag','backpack']),
    tile('modest-fashion', 'Modest Fashion', 'photo-1512117245022-861aeca0d689', 'Modest and covered fashion', ['modest']),
    tile('vintage', 'Vintage & Resale', 'photo-1793655915835-a6322663f6c3', 'Pre-loved and vintage fashion', ['vintage','resale','second hand']),
  ],
  spaces: [
    tile('furniture', 'Furniture', 'photo-1646987916641-1f3c8992daa2', 'Furniture for homes and workspaces', ['furniture','sofa','chair','table']),
    tile('lighting', 'Lighting', 'photo-1761477105144-177d9d58b953', 'Lighting and fixtures', ['lighting','lamp']),
    tile('decor', 'Decor', 'photo-1784651859170-96195c410495', 'Decorative pieces and accents', ['decor','decoration']),
    tile('rugs-textiles', 'Rugs & Textiles', 'photo-1783933259328-7605b5ebb53e', 'Soft furnishings and textiles', ['rug','textile','curtain']),
    tile('interior-services', 'Interior Services', 'photo-1742541656775-5fc717774c02', 'Interior design, styling and furnishing', ['interior','design','styling']),
    tile('storage', 'Storage & Organisation', 'photo-1678108429557-546cf9a84c35', 'Storage solutions and organisers', ['storage','organ']),
  ],
  technology: [
    tile('phones', 'Phones', 'photo-1672413514634-4781b15fd89e', 'Phones and accessories', ['phone','mobile']),
    tile('computing', 'Computing', 'photo-1563604921937-aafba027ad0b', 'Computers, laptops and peripherals', ['computer','laptop']),
    tile('audio', 'Audio', 'photo-1546435770-a3e426bf472b', 'Headphones, speakers and audio gear', ['audio','headphone','speaker']),
    tile('gaming', 'Gaming & Devices', 'photo-1542751371-adc38448a05e', 'Gaming gear, accessories and titles', ['gaming','game']),
    tile('smart-devices', 'Smart Devices', 'photo-1752262167753-37a0ec83f614', 'Wearables, smart home and connected devices', ['smart','watch','wearable']),
    tile('tech-services', 'Tech Repair & Support', 'photo-1746005718012-480a91f6bf76', 'Repairs, support and installations', ['repair','support','install']),
  ],
  culture: [
    tile('heritage-fashion', 'Heritage Wear', 'photo-1550828536-34a5e748afa5', 'Traditional and culturally rooted attire', ['traditional','heritage','cultural']),
    tile('beadwork', 'Beadwork', 'photo-1792071718826-818d32e55a15', 'Beaded craft, adornment and art', ['bead']),
    tile('crafts', 'Cultural Crafts', 'photo-1791137612351-c4d8612f8c36', 'Handcrafted cultural goods', ['craft','handmade']),
    tile('art', 'Art & Heritage', 'photo-1623492962519-ac982cffae56', 'Artwork, heritage and creative expression', ['art','heritage']),
    tile('ceremonial', 'Ceremonial Goods', 'photo-1776000602712-a814e856b6fd', 'Goods for ceremonies and traditions', ['ceremon','traditional']),
  ],
  living: [
    tile('kitchen', 'Kitchen & Dining', 'photo-1654064756910-974764816931', 'Cookware, tableware and kitchen goods', ['kitchen','cook','dining']),
    tile('bedding', 'Bedding & Bath', 'photo-1766727923864-730fd98dcce2', 'Bedding, towels and bath essentials', ['bedding','bath','towel']),
    tile('home-essentials', 'Home Essentials', 'photo-1716625300723-ac2f22574f73', 'Everyday household products', ['home','household','essential']),
    tile('plants', 'Plants & Gardening', 'photo-1776151243153-7c50dd432304', 'Plants, gardening and growing supplies', ['plant','garden']),
    tile('cleaning', 'Cleaning', 'photo-1740657254989-42fe9c3b8cce', 'Cleaning products and equipment', ['clean']),
    tile('home-organisation', 'Organisation', 'photo-1594481939376-2e0a86488a42', 'Home organisation and utility', ['organ','storage']),
  ],
  beauty: [
    tile('skincare', 'Skincare', 'photo-1739980155900-36562bcb7857', 'Skin care and beauty essentials', ['skin']),
    tile('makeup', 'Makeup', 'photo-1723150512429-bfa92988d845', 'Cosmetics and makeup products', ['makeup','cosmetic']),
    tile('hair', 'Hair', 'photo-1570464678671-953f859952c4', 'Haircare, wigs and hair products', ['hair']),
    tile('fragrance', 'Fragrance', 'photo-1514348871858-1d3c20902571', 'Perfumes and scents', ['fragrance','perfume']),
    tile('nails', 'Nails', 'photo-1632345031435-8727f6897d53', 'Nail products and nail services', ['nail']),
    tile('beauty-services', 'Beauty Treatments', 'photo-1626379501846-0df4067b8bb9', 'Beauty appointments and treatments', ['beauty','lash','brow']),
  ],
  sports: [
    tile('fitness', 'Fitness & Gym', 'photo-1623874514711-0f321325f318', 'Fitness equipment and training gear', ['fitness','gym','training']),
    tile('sportswear', 'Sportswear', 'photo-1637666639858-e914177a9146', 'Sports clothing and shoes', ['sportswear','activewear']),
    tile('outdoor', 'Outdoor & Camping', 'photo-1625834509314-3b12c6153624', 'Outdoor, camping and hiking equipment', ['outdoor','camp','hiking']),
    tile('cycling', 'Cycling', 'photo-1541625602330-2277a4c46182', 'Cycling gear and accessories', ['cycling','bike']),
    tile('sports-equipment', 'Sports Equipment', 'photo-1779449607606-e5edcdab979e', 'Sport-specific equipment', ['sport','equipment']),
    tile('sports-services', 'Sports Coaching', 'photo-1604651685068-8223d8790770', 'Training, coaching and classes', ['coach','class']),
  ],
  food: [
    tile('bakery', 'Bakery & Treats', 'photo-1743745303454-e273139a0363', 'Baked goods, cakes and confectionery', ['bakery','cake','bake','treat']),
    tile('specialty-food', 'Specialty Food', 'photo-1762926627917-278e7151ba9b', 'Specialty, artisan and packaged food', ['food','snack','sauce']),
    tile('coffee-drinks', 'Coffee & Drinks', 'photo-1497515114629-f71d768fd07c', 'Coffee, beverages and drink products', ['coffee','drink','beverage']),
    tile('catering', 'Catering & Meal Prep', 'photo-1690299564210-ff855826b278', 'Catering, meal preparation and food service', ['cater','meal','food service']),
    tile('restaurants', 'Food Experiences', 'photo-1706586348467-5c1593cd0aad', 'Dining and food experiences', ['restaurant','dining']),
  ],
  automotive: [
    tile('mobile-detailing', 'Mobile Detailing', 'photo-1520340356584-f9917d1eea6f', 'Detailing services brought to you', ['detail','detailing']),
    tile('car-wash', 'Car Wash', 'photo-1505761283622-7fe50142c97f', 'Vehicle wash and cleaning packages', ['wash']),
    tile('care-products', 'Car Care Products', 'photo-1607860108358-47c0441e7adb', 'Cleaning, polishing and care products', ['car care','automotive']),
    tile('accessories', 'Vehicle Accessories', 'photo-1584126997295-f9327e5ee374', 'Vehicle accessories and add-ons', ['accessory']),
    tile('repairs', 'Repairs & Mechanics', 'photo-1727893119356-1702fe921cf9', 'Diagnostics, servicing and mechanical work', ['mechanic','repair','service']),
    tile('tyres', 'Wheels & Tyres', 'photo-1601411101851-ea0e07766235', 'Tyres, wheels and fitting', ['tyre','wheel']),
    tile('customisation', 'Customisation', 'photo-1556448851-9359658faa54', 'Wraps, tinting, audio and modifications', ['wrap','tint','modification','custom']),
    tile('auto-electrical', 'Auto Electrical', 'photo-1597766325363-f5576d851d6a', 'Auto electrical work and installations', ['electrical']),
  ],
  pets: [
    tile('pet-food', 'Food & Treats', 'photo-1714068691210-073dc52c6c1d', 'Pet food, treats and nutrition', ['pet food','treat']),
    tile('pet-accessories', 'Pet Accessories', 'photo-1705351738451-5c8998e63941', 'Collars, leads and pet accessories', ['pet','collar','lead']),
    tile('pet-toys', 'Toys', 'photo-1672393808326-fcdf7d82de1c', 'Toys and enrichment products', ['toy']),
    tile('pet-care', 'Grooming & Care', 'photo-1625279138876-8910c2af9a30', 'Grooming, care and services', ['groom','care']),
    tile('pet-services', 'Pet Services', 'photo-1548199973-03cce0bbc87b', 'Pet sitting, walking and training', ['pet service','walking','training']),
  ],
  kids: [
    tile('baby', 'Baby & Maternity', 'photo-1601512310580-da458161fcab', 'Baby, maternity and feeding products', ['baby','maternity']),
    tile('kids-clothing', 'Kids Clothing', 'photo-1787713321914-7ad3a8555417', 'Clothing and footwear for children', ['kids','child']),
    tile('toys', 'Toys & Games', 'photo-1558060370-d644479cb6f7', 'Toys, games and play', ['toy','game']),
    tile('learning', 'Learning & School', 'photo-1787978941837-f1f55ff29ac8', 'Learning materials and school supplies', ['school','learning','education']),
    tile('nursery', 'Nursery', 'photo-1774578342155-8d7e44a18bfd', 'Nursery furniture and essentials', ['nursery']),
  ],
  creative: [
    tile('art-supplies', 'Art Supplies', 'photo-1759323709671-2dc795784bb3', 'Materials for artists and makers', ['art','paint']),
    tile('craft-supplies', 'Craft Supplies', 'photo-1771440048325-3a83da7490a3', 'Crafting and handmade supplies', ['craft']),
    tile('stationery', 'Stationery', 'photo-1779684998928-2d824ee831cf', 'Paper goods, pens and journals', ['stationery','journal','pen']),
    tile('music', 'Music & Instruments', 'photo-1445375011782-2384686778a0', 'Instruments, music equipment and accessories', ['music','instrument']),
    tile('creative-services', 'Creative Services', 'photo-1707219627285-8cda4b927805', 'Design, photography and creative work', ['creative','design','photography']),
  ],
  events: [
    tile('party-supplies', 'Party Supplies', 'photo-1744524488020-0361d6c803f8', 'Decorations and celebration supplies', ['party']),
    tile('weddings', 'Weddings', 'photo-1469371670807-013ccf25f16a', 'Wedding goods, styling and services', ['wedding']),
    tile('event-decor', 'Event Decor', 'photo-1750277128108-9de704ae8225', 'Decor, props and event styling', ['event','decor']),
    tile('venues', 'Venues', 'photo-1653821355736-0c2598d0a63e', 'Spaces to host events and gatherings', ['venue']),
    tile('event-services', 'Event Services', 'photo-1753030768124-dba306907bba', 'Planning, catering and entertainment', ['event','service','dj']),
  ],
  hobbies: [
    tile('collectibles', 'Collectibles', 'photo-1767338718657-9006d701ce6a', 'Collectible items and limited finds', ['collect']),
    tile('gaming-hobby', 'Tabletop & Collectible Gaming', 'photo-1785123059144-9e944a8b6bdf', 'Games, gaming gear and accessories', ['gaming']),
    tile('books', 'Books', 'photo-1630343710506-89f8b9f21d31', 'Books and reading', ['book']),
    tile('models', 'Models & Kits', 'photo-1755804924832-bf581508eeae', 'Model kits, miniatures and building sets', ['model','kit','miniature']),
    tile('hobby-supplies', 'Hobby Supplies', 'photo-1785061384163-5047331060fd', 'Specialist supplies for niche interests', ['hobby']),
  ],
  services: [
    tile('home-services', 'Home Services', 'photo-1758273238715-2b6c250167c4', 'Cleaning, repairs and home maintenance', ['home','clean','repair']),
    tile('beauty-services', 'Beauty Services', 'photo-1746723378067-83a345ff3160', 'Hair, nails, grooming and beauty appointments', ['beauty','hair','nail']),
    tile('professional', 'Professional Services', 'photo-1793690374446-6c498f03e52d', 'Business, consulting and professional expertise', ['professional','consult','business']),
    tile('photography', 'Photography & Video', 'photo-1553166272-e69910ab5ae1', 'Photography, video and content services', ['photo','video']),
    tile('education-services', 'Tutoring & Education', 'photo-1623287073837-5b07d79739a3', 'Tutoring, lessons, training and coaching', ['tutor','education','coach']),
    tile('fitness-services', 'Fitness & Wellness', 'photo-1584735935682-2f2b69dff9d2', 'Fitness, wellness and personal training', ['fitness','wellness','trainer']),
    tile('tech-services', 'Technology Services', 'photo-1620300510892-c380a64e2067', 'IT, development, installations and repairs', ['technology','tech','it']),
  ],
  travel: [
    tile('stays', 'Accommodation', 'photo-1673515335086-c762bbd7a7cf', 'Places to stay and accommodation bookings', ['stay','hotel','accommodation']),
    tile('tours', 'Tours & Activities', 'photo-1530612315809-b94dc1b6ef1e', 'Guided tours and activities', ['tour','activity']),
    tile('experiences', 'Experiences', 'photo-1530789253388-582c481c54b0', 'Local experiences and things to do', ['experience']),
    tile('travel-products', 'Travel Goods', 'photo-1581553680321-4fffae59fccd', 'Luggage and travel accessories', ['travel','luggage']),
  ],
  business: [
    tile('business-support', 'Business Support', 'photo-1758520144587-3ac9072573c5', 'Operational support and business services', ['business']),
    tile('marketing', 'Marketing & Media', 'photo-1676282827533-d6058df56a69', 'Marketing, content and media services', ['marketing','media','content']),
    tile('finance', 'Finance & Accounting', 'photo-1707157284454-553ef0a4ed0d', 'Accounting and financial services', ['account','finance']),
    tile('legal', 'Legal Services', 'photo-1444653614773-995cb1ef9efa', 'Legal services and professional support', ['legal']),
    tile('property', 'Property Services', 'photo-1724304406928-c43b01912fa1', 'Property, rentals and management services', ['property','real estate']),
  ],
  digital: [
    tile('digital-downloads', 'Digital Downloads', 'photo-1625177500521-8dd9af0f2364', 'Templates, planners and downloadable assets', ['digital','download','template']),
    tile('software', 'Software & Apps', 'photo-1787834564572-a0b0e8c6ab55', 'Software, apps and subscriptions', ['software','app']),
    tile('courses', 'Courses & Learning', '3/doctype-hi-res.jpg', 'Digital courses, guides and learning content', ['course','ebook','guide']),
    tile('design-assets', 'Design Assets', 'photo-1626785774625-ddcddc3445e9', 'Fonts, presets, graphics and creative assets', ['design','preset','asset']),
  ],
};

export const getMarketById = (id: string) => DISCOVERY_MARKETS.find((market) => market.id === id || market.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
export const getSubcategories = (marketId: string) => DISCOVERY_SUBCATEGORIES[marketId] || [];
