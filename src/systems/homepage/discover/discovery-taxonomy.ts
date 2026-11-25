import type { MoodboardItem } from './KineticMoodboard';

const image = (id: string) => `https://images.unsplash.com/${id}?w=900&q=85`;

export const DISCOVERY_MARKETS: MoodboardItem[] = [
  { id: 'fashion', image: image('photo-1595175131427-97f688d9000a'), alt: 'Fashion collection', category: 'Fashion', title: 'Express your style, your way' },
  { id: 'spaces', image: image('photo-1576344671262-e7d3697ac226'), alt: 'Home and interior spaces', category: 'Home & Spaces', title: 'Make the spaces around you feel like yours' },
  { id: 'technology', image: image('photo-1550751827-4bd374c3f58b'), alt: 'Technology and electronics', category: 'Technology', title: 'Discover technology for life and work' },
  { id: 'culture', image: image('photo-1616235891569-a69fa8558037'), alt: 'African culture and heritage', category: 'African Culture & Heritage', title: 'Explore stories, identity and cultural expression' },
  { id: 'living', image: image('photo-1544210163-257effe9399e'), alt: 'Everyday living essentials', category: 'Everyday Living', title: 'Find what makes everyday life easier' },
  { id: 'beauty', image: image('photo-1600634999623-864991678406'), alt: 'Beauty and personal care', category: 'Beauty & Care', title: 'Explore your own approach to beauty and care' },
  { id: 'sports', image: image('photo-1755877956621-5fac2eae4ebb'), alt: 'Sport and fitness', category: 'Sport & Fitness', title: 'Find your way to an active lifestyle' },
  { id: 'food', image: image('photo-1564697364818-0c8250b15012'), alt: 'Food and drink', category: 'Food & Drink', title: 'Discover tastes, traditions and everyday enjoyment' },
  { id: 'automotive', image: image('photo-1628999740821-cbec21f7f592'), alt: 'Automotive', category: 'Automotive', title: 'Everything for life on the road' },
  { id: 'pets', image: image('photo-1623387641168-d9803ddd3f35'), alt: 'Pets and animals', category: 'Pets & Animals', title: 'Discover ways to care for and enjoy animal companions' },
  { id: 'kids', image: image('photo-1627750419700-c22969574c73'), alt: 'Kids and family', category: 'Kids & Family', title: 'Support every stage of growing up' },
  { id: 'creative', image: image('photo-1732141965904-a477c7a8e5c8'), alt: 'Art and creativity', category: 'Art & Creativity', title: 'Bring ideas to life and express yourself' },
  { id: 'events', image: image('photo-1589754251947-18e0ed7b4e35'), alt: 'Events and celebrations', category: 'Events & Celebrations', title: 'Make moments worth gathering for' },
  { id: 'hobbies', image: image('photo-1795159209556-f3543f22d229'), alt: 'Hobbies and collectibles', category: 'Hobbies & Collecting', title: 'Explore what you love, at your own pace' },
  { id: 'services', image: image('photo-1515040242872-08257d6d08c2'), alt: 'Local and personal services', category: 'Local & Personal Services', title: 'Find help, expertise and trusted local people' },
  { id: 'travel', image: image('photo-1504542982118-59308b40fe0c'), alt: 'Travel and experiences', category: 'Travel & Experiences', title: 'Discover places, journeys and new experiences' },
  { id: 'business', image: image('photo-1791131993456-035beec081ca'), alt: 'Business services', category: 'Business Services', title: 'Find solutions to help your business thrive' },
  { id: 'digital', image: image('photo-1571149828506-c48f1610314b'), alt: 'Digital products', category: 'Digital Products', title: 'Discover useful digital resources for every need' },
];

export type DiscoverySubcategory = { id: string; title: string; image: string; alt: string; description: string; terms: string[] };

const tile = (id: string, title: string, photo: string, description: string, terms: string[] = [title.toLowerCase()]) => ({ id, title, image: image(photo), alt: title, description, terms });

export const DISCOVERY_SUBCATEGORIES: Record<string, DiscoverySubcategory[]> = {
  fashion: [
    tile('clothing', 'Clothing', 'photo-1792232017889-72eded6ebb8b', 'Everyday wear, outfits and clothing collections', ['clothing','apparel','wear']),
    tile('streetwear', 'Streetwear', 'photo-1606964212916-4d23bf4044cb', 'Street style, sneaker culture and urban labels', ['streetwear','hoodie','sneaker']),
    tile('footwear', 'Footwear', 'photo-1793741158371-8ba3504f20a2', 'Shoes, sneakers, boots and sandals', ['shoe','footwear','sneaker']),
    tile('bags', 'Bags', 'photo-1588609021245-df09ceb07de7', 'Handbags, backpacks and everyday carry', ['bag','backpack']),
    tile('modest-fashion', 'Modest Fashion', 'photo-1512117245022-861aeca0d689', 'Modest clothing and covered styles', ['modest']),
    tile('vintage', 'Vintage & Resale', 'photo-1793655915835-a6322663f6c3', 'Pre-loved fashion and second-hand finds', ['vintage','resale','second hand']),
  ],
  spaces: [
    tile('furniture', 'Furniture', 'photo-1646987916641-1f3c8992daa2', 'Furniture for homes and workspaces', ['furniture','sofa','chair','table']),
    tile('lighting', 'Lighting', 'photo-1761477105144-177d9d58b953', 'Lamps, fixtures and lighting solutions', ['lighting','lamp']),
    tile('decor', 'Home Decor', 'photo-1784651859170-96195c410495', 'Decorative accents and finishing touches', ['decor','decoration']),
    tile('rugs-textiles', 'Textiles', 'photo-1783933259328-7605b5ebb53e', 'Rugs, curtains and soft furnishings', ['rug','textile','curtain']),
    tile('interior-services', 'Interior Design', 'photo-1742541656775-5fc717774c02', 'Interior styling, design and furnishing', ['interior','design','styling']),
    tile('storage', 'Storage & Organisation', 'photo-1678108429557-546cf9a84c35', 'Storage solutions and organised spaces', ['storage','organ']),
  ],
  technology: [
    tile('phones', 'Phones & Accessories', 'photo-1672413514634-4781b15fd89e', 'Mobile phones, accessories and essentials', ['phone','mobile']),
    tile('computing', 'Computers & Laptops', 'photo-1563604921937-aafba027ad0b', 'Computers, laptops and peripherals', ['computer','laptop']),
    tile('audio', 'Audio', 'photo-1546435770-a3e426bf472b', 'Headphones, speakers and sound equipment', ['audio','headphone','speaker']),
    tile('gaming', 'Gaming', 'photo-1542751371-adc38448a05e', 'Gaming consoles, equipment and accessories', ['gaming','game']),
    tile('smart-devices', 'Smart Technology', 'photo-1752262167753-37a0ec83f614', 'Connected devices, wearables and smart home tech', ['smart','watch','wearable']),
    tile('tech-repair-support', 'Tech Repair & Support', 'photo-1746005718012-480a91f6bf76', 'Device repairs, installations and technical assistance', ['repair','support','install']),
  ],
  culture: [
    tile('heritage-fashion', 'Traditional & Heritage Wear', 'photo-1550828536-34a5e748afa5', 'Traditional attire and culturally rooted fashion', ['traditional','heritage','cultural']),
    tile('beadwork', 'Beadwork', 'photo-1792071718826-818d32e55a15', 'Beaded accessories, ornaments and craftsmanship', ['bead']),
    tile('crafts', 'Cultural Crafts', 'photo-1791137612351-c4d8612f8c36', 'Handmade crafts and culturally inspired creations', ['craft','handmade']),
    tile('art', 'Art & Heritage', 'photo-1623492962519-ac982cffae56', 'African art, heritage and artistic expression', ['art','heritage']),
    tile('ceremonial', 'Ceremonial Goods', 'photo-1776000602712-a814e856b6fd', 'Products for cultural ceremonies and traditions', ['ceremon','traditional']),
  ],
  living: [
    tile('kitchen', 'Kitchen & Dining', 'photo-1654064756910-974764816931', 'Cookware, utensils and dining essentials', ['kitchen','cook','dining']),
    tile('bedding', 'Bedding & Bath', 'photo-1766727923864-730fd98dcce2', 'Bedding, towels and bathroom essentials', ['bedding','bath','towel']),
    tile('home-essentials', 'Household Essentials', 'photo-1716625300723-ac2f22574f73', 'Everyday household products and necessities', ['home','household','essential']),
    tile('plants', 'Plants & Gardening', 'photo-1776151243153-7c50dd432304', 'Plants, garden supplies and growing essentials', ['plant','garden']),
    tile('cleaning', 'Cleaning', 'photo-1740657254989-42fe9c3b8cce', 'Cleaning products, tools and supplies', ['clean']),
    tile('home-organisation', 'Home Organisation', 'photo-1594481939376-2e0a86488a42', 'Everyday organisers and practical storage', ['organ','storage']),
  ],
  beauty: [
    tile('skincare', 'Skincare', 'photo-1739980155900-36562bcb7857', 'Skincare products and skin essentials', ['skin']),
    tile('makeup', 'Makeup', 'photo-1723150512429-bfa92988d845', 'Cosmetics, makeup and beauty looks', ['makeup','cosmetic']),
    tile('hair', 'Haircare', 'photo-1570464678671-953f859952c4', 'Hair products, wigs and hair essentials', ['hair']),
    tile('fragrance', 'Fragrance', 'photo-1514348871858-1d3c20902571', 'Perfumes, scents and fragrance collections', ['fragrance','perfume']),
    tile('nails', 'Nails', 'photo-1632345031435-8727f6897d53', 'Nail products, tools and nail artistry', ['nail']),
    tile('beauty-treatments', 'Beauty Treatments', 'photo-1626379501846-0df4067b8bb9', 'Beauty appointments, lashes, brows and treatments', ['beauty','lash','brow']),
  ],
  sports: [
    tile('fitness', 'Gym & Fitness', 'photo-1623874514711-0f321325f318', 'Gym equipment, fitness gear and training essentials', ['fitness','gym','training']),
    tile('sportswear', 'Sportswear', 'photo-1637666639858-e914177a9146', 'Activewear, sports clothing and performance footwear', ['sportswear','activewear']),
    tile('outdoor', 'Outdoor & Adventure', 'photo-1625834509314-3b12c6153624', 'Hiking, camping and outdoor equipment', ['outdoor','camp','hiking']),
    tile('cycling', 'Cycling', 'photo-1541625602330-2277a4c46182', 'Bikes, cycling gear and accessories', ['cycling','bike']),
    tile('sports-equipment', 'Sports Equipment', 'photo-1779449607606-e5edcdab979e', 'Equipment for sports and recreational activities', ['sport','equipment']),
    tile('sports-services', 'Coaching & Training', 'photo-1604651685068-8223d8790770', 'Sports coaching, lessons and training programmes', ['coach','class']),
  ],
  food: [
    tile('bakery', 'Bakery & Treats', 'photo-1743745303454-e273139a0363', 'Baked goods, cakes and sweet treats', ['bakery','cake','bake','treat']),
    tile('specialty-food', 'Specialty Food', 'photo-1762926627917-278e7151ba9b', 'Local flavours, speciality products and food finds', ['food','snack','sauce']),
    tile('coffee-drinks', 'Coffee & Drinks', 'photo-1497515114629-f71d768fd07c', 'Coffee, beverages and drink selections', ['coffee','drink','beverage']),
    tile('catering', 'Catering & Meal Preparation', 'photo-1690299564210-ff855826b278', 'Catering, prepared meals and meal services', ['cater','meal','food service']),
    tile('restaurants', 'Dining & Food Experiences', 'photo-1706586348467-5c1593cd0aad', 'Restaurants, dining and food experiences', ['restaurant','dining']),
  ],
  automotive: [
    tile('mobile-detailing', 'Mobile Detailing', 'photo-1520340356584-f9917d1eea6f', 'Vehicle detailing brought to your location', ['detail','detailing']),
    tile('car-wash', 'Car Wash', 'photo-1505761283622-7fe50142c97f', 'Car washes and vehicle cleaning', ['wash']),
    tile('care-products', 'Car Care Products', 'photo-1607860108358-47c0441e7adb', 'Cleaning, polishing and vehicle care products', ['car care','automotive']),
    tile('accessories', 'Vehicle Accessories', 'photo-1584126997295-f9327e5ee374', 'Accessories, upgrades and vehicle add-ons', ['accessory']),
    tile('repairs', 'Repairs & Mechanics', 'photo-1727893119356-1702fe921cf9', 'Mechanical repairs, diagnostics and servicing', ['mechanic','repair','service']),
    tile('tyres', 'Wheels & Tyres', 'photo-1601411101851-ea0e07766235', 'Tyres, rims, wheels and fitting', ['tyre','wheel']),
    tile('customisation', 'Vehicle Customisation', 'photo-1556448851-9359658faa54', 'Wraps, tinting, styling and modifications', ['wrap','tint','modification','custom']),
    tile('auto-electrical', 'Auto Electrical', 'photo-1597766325363-f5576d851d6a', 'Vehicle electrical systems and installations', ['electrical']),
  ],
  pets: [
    tile('pet-food', 'Pet Food & Treats', 'photo-1714068691210-073dc52c6c1d', 'Food, treats and pet nutrition', ['pet food','treat']),
    tile('pet-accessories', 'Pet Accessories', 'photo-1705351738451-5c8998e63941', 'Collars, leads and everyday pet essentials', ['pet','collar','lead']),
    tile('pet-toys', 'Pet Toys', 'photo-1672393808326-fcdf7d82de1c', 'Toys, play and enrichment', ['toy']),
    tile('pet-care', 'Pet Grooming & Care', 'photo-1625279138876-8910c2af9a30', 'Grooming, hygiene and pet care', ['groom','care']),
    tile('pet-services', 'Pet Services', 'photo-1548199973-03cce0bbc87b', 'Walking, sitting, boarding and training', ['pet service','walking','training']),
  ],
  kids: [
    tile('baby', 'Baby & Maternity', 'photo-1601512310580-da458161fcab', 'Baby essentials, maternity and feeding', ['baby','maternity']),
    tile('kids-clothing', 'Kids Clothing', 'photo-1787713321914-7ad3a8555417', "Children's clothing, shoes and accessories", ['kids','child']),
    tile('toys', 'Toys & Games', 'photo-1558060370-d644479cb6f7', 'Play, toys and games for all ages', ['toy','game']),
    tile('learning', 'School & Learning', 'photo-1787978941837-f1f55ff29ac8', 'School supplies, learning materials and educational tools', ['school','learning','education']),
    tile('nursery', 'Nursery & Baby Room', 'photo-1774578342155-8d7e44a18bfd', 'Nursery furniture, room decor and baby-room essentials', ['nursery']),
  ],
  creative: [
    tile('art-supplies', 'Art Supplies', 'photo-1759323709671-2dc795784bb3', 'Paints, drawing materials and artist tools', ['art','paint']),
    tile('craft-supplies', 'Craft Supplies', 'photo-1771440048325-3a83da7490a3', 'Materials for handmade projects and crafts', ['craft']),
    tile('stationery', 'Stationery', 'photo-1779684998928-2d824ee831cf', 'Pens, paper, journals and desk stationery', ['stationery','journal','pen']),
    tile('music', 'Music & Instruments', 'photo-1445375011782-2384686778a0', 'Musical instruments, equipment and accessories', ['music','instrument']),
    tile('creative-services', 'Creative Services', 'photo-1707219627285-8cda4b927805', 'Design, photography and commissioned creative work', ['creative','design','photography']),
  ],
  events: [
    tile('party-supplies', 'Party Supplies', 'photo-1744524488020-0361d6c803f8', 'Party essentials, decorations and celebration supplies', ['party']),
    tile('weddings', 'Weddings', 'photo-1469371670807-013ccf25f16a', 'Wedding products, planning and wedding services', ['wedding']),
    tile('event-decor', 'Event Decor & Styling', 'photo-1750277128108-9de704ae8225', 'Event decoration, styling and visual setups', ['event','decor']),
    tile('venues', 'Venues', 'photo-1653821355736-0c2598d0a63e', 'Venues for events and celebrations', ['venue']),
    tile('event-services', 'Event Services', 'photo-1753030768124-dba306907bba', 'Event planning, coordination and entertainment', ['event','service','dj']),
  ],
  hobbies: [
    tile('collectibles', 'Collectibles', 'photo-1767338718657-9006d701ce6a', 'Collectibles, rare finds and treasured items', ['collect']),
    tile('gaming-hobby', 'Tabletop & Collectible Games', 'photo-1785123059144-9e944a8b6bdf', 'Board games, tabletop games and collectible gaming', ['gaming']),
    tile('books', 'Books & Reading', 'photo-1630343710506-89f8b9f21d31', 'Books, reading and literary finds', ['book']),
    tile('models', 'Models & Building Kits', 'photo-1755804924832-bf581508eeae', 'Models, miniatures and building kits', ['model','kit','miniature']),
    tile('hobby-supplies', 'Hobby Supplies', 'photo-1785061384163-5047331060fd', 'Tools and supplies for specialist hobbies', ['hobby']),
  ],
  services: [
    tile('home-services', 'Home Services', 'photo-1758273238715-2b6c250167c4', 'Household maintenance, cleaning and repairs', ['home','clean','repair']),
    tile('personal-beauty-services', 'Beauty Treatments', 'photo-1746723378067-83a345ff3160', 'Beauty appointments, lashes, brows and treatments', ['beauty','hair','nail']),
    tile('professional', 'Professional Services', 'photo-1793690374446-6c498f03e52d', 'Independent professional expertise and consultation', ['professional','consult','business']),
    tile('photography', 'Photography & Video', 'photo-1553166272-e69910ab5ae1', 'Photography, videography and content capture', ['photo','video']),
    tile('education-services', 'Lessons & Education', 'photo-1623287073837-5b07d79739a3', 'Tutoring, lessons and private instruction', ['tutor','education','coach']),
    tile('fitness-services', 'Wellness & Personal Training', 'photo-1584735935682-2f2b69dff9d2', 'Personal wellness, trainers and fitness appointments', ['fitness','wellness','trainer']),
    tile('it-technical-services', 'Tech Repair & Support', 'photo-1620300510892-c380a64e2067', 'Device repairs, installations and technical assistance', ['technology','tech','it']),
  ],
  travel: [
    tile('stays', 'Accommodation', 'photo-1673515335086-c762bbd7a7cf', 'Hotels, lodges, stays and places to book', ['stay','hotel','accommodation']),
    tile('tours', 'Tours & Activities', 'photo-1530612315809-b94dc1b6ef1e', 'Guided tours, excursions and activities', ['tour','activity']),
    tile('experiences', 'Local Experiences', 'photo-1530789253388-582c481c54b0', 'Unique experiences and local adventures', ['experience']),
    tile('travel-products', 'Travel Essentials', 'photo-1581553680321-4fffae59fccd', 'Luggage, travel gear and accessories', ['travel','luggage']),
  ],
  business: [
    tile('business-support', 'Business Support', 'photo-1758520144587-3ac9072573c5', 'Operational support and business assistance', ['business']),
    tile('marketing', 'Marketing & Media', 'photo-1676282827533-d6058df56a69', 'Marketing, advertising, content and media', ['marketing','media','content']),
    tile('finance', 'Finance & Accounting', 'photo-1707157284454-553ef0a4ed0d', 'Accounting, bookkeeping and financial administration', ['account','finance']),
    tile('legal', 'Legal Services', 'photo-1444653614773-995cb1ef9efa', 'Legal advice and professional legal assistance', ['legal']),
    tile('property', 'Property Services', 'photo-1724304406928-c43b01912fa1', 'Property management, rentals and real-estate assistance', ['property','real estate']),
  ],
  digital: [
    tile('digital-downloads', 'Digital Downloads', 'photo-1625177500521-8dd9af0f2364', 'Templates, planners and downloadable resources', ['digital','download','template']),
    tile('software', 'Software & Apps', 'photo-1787834564572-a0b0e8c6ab55', 'Software, applications and digital subscriptions', ['software','app']),
    tile('courses', 'Courses & Learning', '3/doctype-hi-res.jpg', 'Online courses, guides and digital education', ['course','ebook','guide']),
    tile('design-assets', 'Design Assets', 'photo-1626785774625-ddcddc3445e9', 'Graphics, fonts, presets and creative assets', ['design','preset','asset']),
  ],
};

export const getMarketById = (id: string) => DISCOVERY_MARKETS.find((market) => market.id === id || market.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
export const getSubcategories = (marketId: string) => DISCOVERY_SUBCATEGORIES[marketId] || [];
