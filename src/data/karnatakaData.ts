export type TravelDuration = 'Weekend' | '3 Days' | '5 Days' | '7 Days' | '10+ Days';
export type TravelBudget = 'Budget' | 'Mid-range' | 'Premium' | 'Luxury';
export type TravelInterest =
  | 'Heritage'
  | 'Wildlife'
  | 'Trekking'
  | 'Hill Stations'
  | 'Beaches'
  | 'Adventure'
  | 'Food'
  | 'Spiritual'
  | 'Coffee Plantations'
  | 'Photography'
  | 'Road Trips'
  | 'Waterfalls'
  | 'Nature'
  | 'Culture'
  | 'Festivals';

export type TravelPartner = 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Senior Citizens';
export type TransportationMode = 'Bike' | 'Car' | 'Public Transport' | 'Taxi';
export type AccommodationStyle = 'Hostel' | 'Homestay' | 'Hotel' | 'Resort' | 'Luxury Stay';
export type RouteOptimizeMode = 'scenic' | 'time' | 'cost' | 'comfort';

export interface DestinationGuide {
  history: string;
  culture: string;
  bestVisitingTimes: string;
  localCustoms: string[];
  hiddenAttractions: { name: string; description: string }[];
  photographySpots: string[];
  morningActivity: string;
  afternoonActivity: string;
  eveningExperience: string;
  breakfastSpot: string;
  lunchSpot: string;
  dinnerSpot: string;
  shoppingHighlight: string;
  safetyNote: string;
}

export interface Destination {
  id: string;
  name: string;
  kannadaName: string;
  region: 'Southern Maidan' | 'Western Ghats & Malnad' | 'Karavali Coast' | 'Deccan Heritage';
  tagline: string;
  summary: string;
  lat: number;
  lng: number;
  mapX: number; // -10 to +10 in 3D space
  mapZ: number; // -12 to +12 in 3D space
  elevationMeters: number;
  interests: TravelInterest[];
  bestSeason: 'Winter (Oct–Feb)' | 'Monsoon (Jun–Sep)' | 'Summer (Mar–May)' | 'Year-Round';
  crowdLevel: 'Low (Serene)' | 'Moderate' | 'High (Peak Weekends)';
  trekDifficulty: 'Easy Walk' | 'Moderate Trail' | 'Challenging Summit';
  baseDailyCostINR: number;
  isHiddenGem: boolean;
  archetype: 'palace' | 'chariot' | 'mountains' | 'coast' | 'waterfall' | 'wildlife' | 'temple' | 'metropolis';
  accentHex: string;
  guide: DestinationGuide;
}

export interface KarnatakaFestival {
  id: string;
  name: string;
  month: string;
  monthIndex: number; // 1-12
  season: 'Monsoon' | 'Winter' | 'Summer';
  destinationId: string;
  locationName: string;
  interests: TravelInterest[];
  description: string;
  ritualHighlight: string;
  travelerTip: string;
}

export interface KarnatakaDish {
  id: string;
  name: string;
  region: string;
  originCity: string;
  dietary: 'Vegetarian' | 'Signature Meat' | 'Coastal Seafood' | 'Sweet & Beverage';
  flavorProfile: string;
  description: string;
  iconicVenue: string;
  bestPairedWith: string;
}

export interface SeasonalExperience {
  id: 'Monsoon' | 'Winter' | 'Summer';
  title: string;
  months: string;
  subtitle: string;
  tempRange: string;
  topDestinations: string[];
  signatureExperiences: string[];
  packingAdvice: string;
}

export const ALL_INTERESTS: TravelInterest[] = [
  'Heritage',
  'Wildlife',
  'Trekking',
  'Hill Stations',
  'Beaches',
  'Adventure',
  'Food',
  'Spiritual',
  'Coffee Plantations',
  'Photography',
  'Road Trips',
  'Waterfalls',
  'Nature',
  'Culture',
  'Festivals',
];

export const KARNATAKA_DESTINATIONS: Destination[] = [
  {
    id: 'hampi',
    name: 'Hampi',
    kannadaName: 'ಹಂಪಿ',
    region: 'Deccan Heritage',
    tagline: 'Imperial Vijayanagara Ruins & Surreal Boulder Landscapes',
    summary: 'A UNESCO World Heritage open-air museum where 14th-century Dravidian stone temples rise amidst surreal amber granite boulders along the Tungabhadra River.',
    lat: 15.3350,
    lng: 76.4600,
    mapX: 1.8,
    mapZ: -2.4,
    elevationMeters: 467,
    interests: ['Heritage', 'Photography', 'Culture', 'Spiritual', 'Trekking', 'Road Trips'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3800,
    isHiddenGem: false,
    archetype: 'chariot',
    accentHex: '#D97706',
    guide: {
      history: 'Founded in 1336 CE by Harihara I and Bukka Raya I of the Sangama dynasty, Vijayanagara at Hampi grew into one of the richest medieval cities on Earth under Emperor Krishnadevaraya, trading diamonds and horses with Portuguese and Persian merchants.',
      culture: 'Living temple rituals at Virupaksha coexist with coracle boatmen spinning across the Tungabhadra and stone-carving guilds continuing 600-year-old sculptural lineages.',
      bestVisitingTimes: 'November to February at 6:00 AM sunrise when amber boulders glow without midday heat.',
      localCustoms: [
        'Remove footwear before entering the Virupaksha and Vittala temple courtyards; carry cotton socks for sun-warmed stone.',
        'Respect active shrines inside Virupaksha while exploring archaeological ruins with quiet reverence.',
        'Support licensed local archaeological guides (ASI certified) at Vittala Temple complex.'
      ],
      hiddenAttractions: [
        { name: 'Sanapur Lake Coracle Dawn', description: 'Quiet sunrise coracle ride through boulder gorges away from the main bazaar.' },
        { name: 'Malyavanta Raghunatha Temple', description: 'Hilltop shrine with serene sunset panoramas and zero crowds compared to Matanga Hill.' }
      ],
      photographySpots: ['Matanga Hill Sunrise Ridge', 'Vittala Stone Chariot Courtyard', 'Hemakuta Hill Golden Hour Pavilions'],
      morningActivity: 'Sunrise ascent up Matanga Hill followed by guided architectural walk through Vittala Temple and its musical pillars.',
      afternoonActivity: 'Explore the Royal Enclosure, Lotus Mahal, Stepped Tank (Pushkarani), and Elephant Stables.',
      eveningExperience: 'Coracle crossing on the Tungabhadra River and sunset acoustic session on Hemakuta Hill.',
      breakfastSpot: 'Mango Tree Restaurant — Warm banana pancakes, filter coffee & river-breeze thali',
      lunchSpot: 'Gopi Roof Restaurant — Traditional North Karnataka Jolada Rotti & Yennegai meal',
      dinnerSpot: 'Evolve Back Kamalapura Palace Dining — Royal Vijayanagara-inspired degustion menu',
      shoppingHighlight: 'Lambani hand-embroidered textiles and soapstone temple miniatures at Hampi Bazaar.',
      safetyNote: 'Carry 2L electrolyte water and a flashlight for descending boulder hills after sunset.'
    }
  },
  {
    id: 'coorg',
    name: 'Coorg (Kodagu)',
    kannadaName: 'ಕೊಡಗು',
    region: 'Western Ghats & Malnad',
    tagline: 'Misty Arabica Estates, Kodava Heritage & Shola Peaks',
    summary: 'Rolling emerald hills scented with Arabica coffee blossoms, cardamom, and black pepper, steeped in distinctive Kodava warrior traditions and highland waterfalls.',
    lat: 12.4244,
    lng: 75.7382,
    mapX: -1.9,
    mapZ: 6.2,
    elevationMeters: 1150,
    interests: ['Coffee Plantations', 'Hill Stations', 'Nature', 'Trekking', 'Food', 'Waterfalls'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 5200,
    isHiddenGem: false,
    archetype: 'mountains',
    accentHex: '#10B981',
    guide: {
      history: 'Home to the indigenous Kodava community and ruled for centuries by the Haleri dynasty from Madikeri Fort and Nalknad Palace, Kodagu fiercely preserved its highland autonomy and forest-shrine (Devara Kadu) conservation ethos.',
      culture: 'Hospitality in ancestral Ainmanes (clan estates), traditional Bolak-aat dances, and reverence for River Kaveri rising at Talacauvery.',
      bestVisitingTimes: 'October to March for crisp misty mornings; March–April for white coffee blossom showers.',
      localCustoms: [
        'Sacred groves (Devara Kadu) are protected biodiversity sanctuaries—stay on marked footpaths.',
        'At Talacauvery and Bhagamandala Triveni Sangama, modest attire covering shoulders and knees is required.',
        'Greet estate hosts with a warm "Namaskara" and sample freshly roasted estate-grown Peaberry coffee.'
      ],
      hiddenAttractions: [
        { name: 'Chelavara Falls & Kabbe Hills', description: 'Tortoise-shaped rock waterfall surrounded by untouched rainforest near Virajpet.' },
        { name: 'Nalknad Aramane (1792)', description: 'Timber-and-tile royal hunting palace at the base of Tadiandamol peak.' }
      ],
      photographySpots: ['Mandalpatti Cloud Ridge at 6:30 AM', 'Raja’s Seat Valley Mist', 'Dubare Kaveri River Crossing'],
      morningActivity: '4x4 jeep ascent to Mandalpatti cloud sea followed by a bean-to-cup walking tour in a 120-year-old Arabica estate.',
      afternoonActivity: 'Trek the shola grasslands toward Tadiandamol Peak or visit Namdroling Golden Temple in Bylakuppe.',
      eveningExperience: 'Bonfire coffee cupping session and traditional Kodava hearth dinner amidst silver oaks.',
      breakfastSpot: 'Coorg Cuisine, Madikeri — Steaming Kadambuttu (rice dumplings) with Bamboo Shoot Curry',
      lunchSpot: 'Raintree Restaurant — Heritage Kodava Pandi Curry, Akki Rotti & Kachampuli glaze',
      dinnerSpot: 'Tamara Coorg Falls Deck — Candlelit plantation dining beside a natural highland stream',
      shoppingHighlight: 'Single-estate Arabica Peaberry beans, wild Coorg forest honey, and dark Kachampuli vinegar.',
      safetyNote: 'During monsoon/post-monsoon treks, wear high-ankle socks with leech guard salt rub.'
    }
  },
  {
    id: 'mysuru',
    name: 'Mysuru',
    kannadaName: 'ಮೈಸೂರು',
    region: 'Southern Maidan',
    tagline: 'Royal Wodeyar Splendor, Silk Looms & Sandalwood Craft',
    summary: 'The cultural capital of Karnataka, celebrated for the illuminated Amba Vilas Palace, Ashtanga yoga heritage, GI-tagged Mysore Silk, and vibrant Devaraja Market.',
    lat: 12.2958,
    lng: 76.6394,
    mapX: 0.7,
    mapZ: 6.8,
    elevationMeters: 763,
    interests: ['Heritage', 'Culture', 'Festivals', 'Food', 'Spiritual', 'Photography'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'High (Peak Weekends)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 4000,
    isHiddenGem: false,
    archetype: 'palace',
    accentHex: '#F59E0B',
    guide: {
      history: 'Seat of the Wodeyar Maharajas since 1399 CE (with the interlude of Hyder Ali and Tipu Sultan at nearby Srirangapatna), Mysuru pioneered civic town planning, hydro-electric lighting, and classical Carnatic patronage.',
      culture: 'A refined synthesis of royal Dasara pageantry, traditional Ganjifa miniature painting, rosewood inlay art, and morning fragrance of Mysore Mallige jasmine.',
      bestVisitingTimes: 'October for Nada Habba Dasara festivities; November–February for pleasant palace walks.',
      localCustoms: [
        'Plan Sunday or public holiday evenings at 7:00 PM to witness 97,000 incandescent bulbs illuminate Mysuru Palace.',
        'Buy Mysore Silk only from authentic KSIC showrooms with gold zari hologram certification.',
        'Climb the 1,000 ancient stone steps to Chamundi Hill at dawn alongside local devotees.'
      ],
      hiddenAttractions: [
        { name: 'Jayalakshmi Vilas Mansion Folklore Museum', description: 'Over 6,500 rare Yakshagana masks, puppets, and royal artifacts inside Kukkarahalli campus.' },
        { name: 'Venugopala Swamy Temple at KRS Backwaters', description: 'Relocated 12th-century Hoysala stone temple surrounded by serene reservoir waters.' }
      ],
      photographySpots: ['Amba Vilas Palace East Gate Illumination', 'Devaraja Market Kumkuma & Banana Aisles', 'Chamundi Hill Nandi Monolith Vista'],
      morningActivity: 'Heritage walk through Devaraja Market flower & spice lanes followed by Amba Vilas Palace Durbar Hall tour.',
      afternoonActivity: 'Visit Somnathpura Chennakesava Hoysala Temple or observe live silk weaving at the KSIC factory.',
      eveningExperience: 'Sunset stroll around Kukkarahalli Lake with pelicans, followed by Palace illumination.',
      breakfastSpot: 'Vinayaka Mylari (Est. 1938) — Iconic melt-in-mouth Mylari Dosa with white butter & green chutney',
      lunchSpot: 'Hotel RRR — Legendary banana-leaf Andhra & Mysuru royal meals',
      dinnerSpot: 'Lalitha Mahal Palace Veranda — Heritage high tea and royal chandeliers dining',
      shoppingHighlight: 'KSIC Mysore Silk sarees, Cauvery Emporium sandalwood carvings, and warm Guru Sweet Mart Mysore Pak.',
      safetyNote: 'Beware of touts selling synthetic "sandalwood oil" outside palace gates; purchase only at government emporiums.'
    }
  },
  {
    id: 'gokarna',
    name: 'Gokarna',
    kannadaName: 'ಗೋಕರ್ಣ',
    region: 'Karavali Coast',
    tagline: 'Sacred Shiva Coastline & Cliffside Beach Trails',
    summary: 'Where ancient Sanskrit temple streets meet dramatic laterite sea cliffs and crescent coves along the Arabian Sea—connecting Kudle, Om, Half Moon, and Paradise beaches.',
    lat: 14.5479,
    lng: 74.3188,
    mapX: -5.4,
    mapZ: -0.2,
    elevationMeters: 15,
    interests: ['Beaches', 'Trekking', 'Spiritual', 'Photography', 'Adventure', 'Nature'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3400,
    isHiddenGem: false,
    archetype: 'coast',
    accentHex: '#06B6D4',
    guide: {
      history: 'Revered in the Puranas as the site where Lord Shiva emerged from the ear of Mother Earth (Go-Karna) and home to the Atmalinga at Mahabaleshwar Temple, patronized by Kadamba and Vijayanagara kings.',
      culture: 'A rare duality where Vedic scholars chant in agrahara lanes just 15 minutes from coastal cliff trails and bioluminescent night surf.',
      bestVisitingTimes: 'November to February for calm turquoise waters and golden coastal hikes.',
      localCustoms: [
        'Dress modestly (traditional dhoti/salwar/covered shoulders) when visiting Mahabaleshwar Temple town center.',
        'Respect tide tables and lifeguard red flags at Om Beach rocky headlands.',
        'Join a midnight boat or beach walk at Nirvana Beach on moonless nights to spot natural marine bioluminescence.'
      ],
      hiddenAttractions: [
        { name: 'Belekan to Paradise Cliff Trail', description: 'Unspoiled coastal headland trail through casuarina groves and hidden coves.' },
        { name: 'Mirjan Fort (16th Century)', description: 'Moss-Clad laterite fortress of Pepper Queen Chennabhairadevi 22 km inland.' }
      ],
      photographySpots: ['Om Beach Viewpoint Cliff', 'Half Moon Headland Rock Arch', 'Kudle Sunset Ridge'],
      morningActivity: '5-Beach coastal cliff trek from Kudle Beach via Om Beach and Half Moon to Paradise Cove.',
      afternoonActivity: 'Explore 16th-century Mirjan Fort and Yana limestone rock monoliths in the Sahyadri foothills.',
      eveningExperience: 'Sea kayaking at sunset off Om Beach and stargazing by the Arabian Sea.',
      breakfastSpot: 'Prema Restaurant — Fresh fruit curd bowls, poori bhaji & coastal filter coffee',
      lunchSpot: 'Namaste Cafe, Om Beach — Konkani kingfish fry, prawn masala & chilled kokum soda',
      dinnerSpot: 'Mantra Cafe Cliffside — Candlelit seafood grill overlooking Kudle bay',
      shoppingHighlight: 'Handmade terracotta chimes, brass temple lamps, and organic kokum concentrate at Car Street.',
      safetyNote: 'Do not swim after dusk or near the rip currents around the central rocks of Om Beach.'
    }
  },
  {
    id: 'chikmagalur',
    name: 'Chikmagalur',
    kannadaName: 'ಚಿಕ್ಕಮಗಳೂರು',
    region: 'Western Ghats & Malnad',
    tagline: 'Birthplace of Indian Coffee & Mullayanagiri Cloud Peaks',
    summary: 'Cradled by the horseshoe-shaped Baba Budangiri range, home to Karnataka’s highest peak Mullayanagiri (1,930m) and 17th-century heritage coffee estates.',
    lat: 13.3161,
    lng: 75.7720,
    mapX: -1.8,
    mapZ: 3.4,
    elevationMeters: 1090,
    interests: ['Coffee Plantations', 'Trekking', 'Hill Stations', 'Waterfalls', 'Road Trips', 'Nature'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 4600,
    isHiddenGem: false,
    archetype: 'mountains',
    accentHex: '#059669',
    guide: {
      history: 'In 1670 CE, Sufi saint Baba Budan smuggled seven raw Mocha coffee seeds from Yemen and planted them on the slopes of Chandradrona Parvata, sparking India’s entire coffee heritage.',
      culture: 'Malnad planter hospitality, intricate Hoysala soapstone temples at nearby Belavadi and Amruthapura, and misty ridge road trips.',
      bestVisitingTimes: 'September to February for emerald hills and clear summit vistas.',
      localCustoms: [
        'Start Mullayanagiri peak drive before 6:00 AM to beat ridge traffic and catch the cloud inversion.',
        'Book forest permits in advance for Kyatanamakki and Kudremukh buffer trails.',
        'Taste traditional Malnad Akki Rotti with estate pepper chicken or jackfruit curry.'
      ],
      hiddenAttractions: [
        { name: 'Belavadi Veera Narayana Temple', description: 'Tri-kuta 1200 CE Hoysala masterpiece with 108 lathe-turned soapstone pillars and zero crowds.' },
        { name: 'Z Point Kemmanagundi & Hebbe Falls', description: '168-meter two-tiered forest waterfall accessible via estate jeep track.' }
      ],
      photographySpots: ['Mullayanagiri 1,930m Summit Steps', 'Baba Budangiri Hairpin Ridge Road', 'Hirekolale Lake Sunset Reflection'],
      morningActivity: 'Summit trek to Mullayanagiri Peak at dawn followed by scenic drive along Baba Budangiri ridge.',
      afternoonActivity: 'Jeep safari to Jhari (Buttermilk) Falls and guided coffee roasting workshop at a heritage estate.',
      eveningExperience: 'Sunset reflection photography at Hirekolale Lake against the Western Ghats.',
      breakfastSpot: 'Town Canteen, Chikmagalur — Legendary crispy butter Benne Masala Dosa',
      lunchSpot: 'Siri Nature Roost — Authentic Malnad Kayi Kadubu, Koli Saaru & estate filter coffee',
      dinnerSpot: 'The Serai Estate Dining — Private plantation pavilion dinner with pepper-crusted delicacies',
      shoppingHighlight: 'Freshly ground Chikmagalur Arabica & Robusta blends, green cardamom, and vanilla pods.',
      safetyNote: 'Use low gear on steep hairpin bends descending from Baba Budangiri in wet mist.'
    }
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    kannadaName: 'ಬೆಂಗಳೂರು',
    region: 'Southern Maidan',
    tagline: 'Garden City Canopies, Craft Culture & Kempegowda Heritage',
    summary: 'A dynamic metropolis blending 16th-century mud-fort temples and Victorian botanical gardens with India’s finest specialty coffee roasters, arts spaces, and darshinis.',
    lat: 12.9716,
    lng: 77.5946,
    mapX: 3.4,
    mapZ: 4.8,
    elevationMeters: 920,
    interests: ['Food', 'Culture', 'Heritage', 'Photography', 'Festivals'],
    bestSeason: 'Year-Round',
    crowdLevel: 'High (Peak Weekends)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 4800,
    isHiddenGem: false,
    archetype: 'metropolis',
    accentHex: '#6366F1',
    guide: {
      history: 'Founded in 1537 CE by Nada Prabhu Kempegowda I with four cardinal watchtowers, later enriched with Lalbagh Botanical Gardens under Hyder Ali and Tipu Sultan.',
      culture: 'Morning Carnatic walks under 200-year-old rain trees in Cubbon Park, historic Basavanagudi bookshops, and avant-garde museum architecture at MAP.',
      bestVisitingTimes: 'Year-round; January and August for the Lalbagh Glass House Botanical Flower Shows.',
      localCustoms: [
        'Order "By-Two Filter Coffee" at a traditional standing Darshini in Basavanagudi or Malleshwaram.',
        'Use Namma Metro Purple & Green lines to breeze past silk-board or central business traffic.',
        'Visit KR Market at 6:00 AM to witness Asia’s most vibrant wholesale marigold and jasmine auction.'
      ],
      hiddenAttractions: [
        { name: 'Gavi Gangadhareshwara Cave Temple', description: '9th-century rock-cut monolith temple engineered for winter solstice solar alignment.' },
        { name: 'Museum of Art & Photography (MAP)', description: 'Curated South Asian visual arts gallery with rooftop sculpture views over Cubbon Park.' }
      ],
      photographySpots: ['KR Market Flower Spiral from 1st Floor Balcony', 'Lalbagh 1889 Glass House at Dawn', 'Vidhana Soudha Illuminated Neo-Dravidian Facade'],
      morningActivity: 'Botanical walk at Lalbagh Peninsular Gneiss Rock (3 billion years old) and breakfast in Basavanagudi.',
      afternoonActivity: 'Explore Tipu Sultan’s Summer Palace (1791 teakwood structure) and MAP Art Museum on Kasturba Road.',
      eveningExperience: 'Craft culinary trail in Indiranagar or theatre performance at Ranga Shankara.',
      breakfastSpot: 'MTR (Mavalli Tiffin Room, Est. 1924) — Rava Idli, Masala Dosa & silver-cup Filter Coffee',
      lunchSpot: 'Nagarjuna / Halli Mane — Traditional ragi mudde, soppu saaru & holige feast',
      dinnerSpot: 'Karavalli at The Gateway — Award-winning coastal Southwest Indian cuisine under a tamarind tree',
      shoppingHighlight: 'Artisanal Channapatna lacquerware toys, Mysore crepe silk at Commercial Street, and specialty coffee beans.',
      safetyNote: 'Plan airport transfers 3 hours ahead via Airport Express Bus (KIA) or Hebbal corridor.'
    }
  },
  {
    id: 'jog-falls',
    name: 'Jog Falls',
    kannadaName: 'ಜೋಗ ಜಲಪಾತ',
    region: 'Western Ghats & Malnad',
    tagline: 'Raja, Rani, Roarer & Rocket Plunging 253m into Sharavathi Gorge',
    summary: 'One of India’s highest untiered waterfalls where the Sharavathi River thunders down a 253-meter sheer chasm framed by emerald rainforest cliffs.',
    lat: 14.2294,
    lng: 74.8125,
    mapX: -3.8,
    mapZ: 0.8,
    elevationMeters: 488,
    interests: ['Waterfalls', 'Nature', 'Photography', 'Road Trips', 'Monsoon' as unknown as TravelInterest].filter(Boolean) as TravelInterest[],
    bestSeason: 'Monsoon (Jun–Sep)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3200,
    isHiddenGem: false,
    archetype: 'waterfall',
    accentHex: '#0EA5E9',
    guide: {
      history: 'Revered historically as Gerusoppa Falls in the kingdom of Queen Chennabhairadevi, surrounded by ancient Jain basadis buried in the Sharavathi valley rainforest.',
      culture: 'Deep Malnad rain-harvesting traditions, spice orchards of betel nut and pepper, and Yakshagana night theatre.',
      bestVisitingTimes: 'July to October for thunderous monsoon volume and double rainbows across the gorge.',
      localCustoms: [
        'Check clear-sky intervals between morning showers when mist parts to reveal all four cascades simultaneously.',
        'Respect forest barriers along Watkins Platform and British Bungalow viewpoint.',
        'Combine your visit with the Honnemaradu backwaters and Ikkeri Aghoreshwara Temple.'
      ],
      hiddenAttractions: [
        { name: 'Chaturmukha Basadi, Gerusoppa', description: '16th-century four-faced granite Jain temple hidden deep inside evergreen forest.' },
        { name: 'Dabbe Falls near Hosagadde', description: 'Secluded forest plunge waterfall reachable via a scenic Malnad trail.' }
      ],
      photographySpots: ['British Bungalow Panorama Deck', 'Rani Falls Rainbow Ledge', 'Sharavathi Valley Viewpoint on NH-69'],
      morningActivity: 'Morning mist clearing watch at Watkins Platform and descent down the gorge steps when open.',
      afternoonActivity: 'Scenic drive through Sharavathi Wildlife Sanctuary to Ikkeri Aghoreshwara Temple (16th-century Keladi architecture).',
      eveningExperience: 'Kayaking and sunset coracle ride on the tranquil Honnemaradu reservoir.',
      breakfastSpot: 'KSTDC Mayura Gerusoppa Veranda — Hot Neer Dosa, chutney & Malnad Kashaya herbal brew',
      lunchSpot: 'Malnad Mane Homestay — Steamed Jackfruit Kadubu, appehuli raw mango soup & red rice',
      dinnerSpot: 'Sharavathi Adventure Camp — Fireside Malnad thali under rainforest canopy',
      shoppingHighlight: 'Malnad Toddy-palm jaggery (oni bella), wild nutmeg, and homemade mango-chili appe midi pickle.',
      safetyNote: 'Slippery mossy basalt rocks near gorge edges—wear gripped footwear and keep electronics in dry bags.'
    }
  },
  {
    id: 'kabini',
    name: 'Kabini & Nagarhole',
    kannadaName: 'ಕಬಿನಿ ಮತ್ತು ನಾಗರಹೊಳೆ',
    region: 'Western Ghats & Malnad',
    tagline: 'Black Panther Territory, Asiatic Elephant Herds & Backwater Safaris',
    summary: 'Part of the Nilgiri Biosphere Reserve where the Kabini River winds between Nagarhole and Bandipur, famous for melanistic leopards, tigers, and summer elephant congregations.',
    lat: 11.9333,
    lng: 76.2667,
    mapX: -0.6,
    mapZ: 8.1,
    elevationMeters: 780,
    interests: ['Wildlife', 'Photography', 'Nature', 'Adventure'],
    bestSeason: 'Summer (Mar–May)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 8500,
    isHiddenGem: false,
    archetype: 'wildlife',
    accentHex: '#EAB308',
    guide: {
      history: 'Formerly the private Khedda royal hunting preserve of the Mysuru Maharajas, transformed into one of Asia’s highest-density tiger and Asiatic elephant conservation corridors.',
      culture: 'Indigenous Jenu Kuruba and Kadu Kuruba forest trackers whose encyclopedic knowledge of bird alarm calls guides every safari.',
      bestVisitingTimes: 'March to May when receding backwaters draw 150+ elephants to the riverbanks; November–February for lush birding.',
      localCustoms: [
        'Wear muted earth tones (olive, khaki, brown) on jeep and boat safaris—avoid bright white or red clothing.',
        'Maintain complete silence when trackers listen for Langur or Spotted Deer alarm calls.',
        'Never use flash photography or step down from safari vehicles inside Kakanakote or Dammanakatte zones.'
      ],
      hiddenAttractions: [
        { name: 'Kabini Morning Boat Safari', description: 'Glide past submerged teak trunks crowded with Osprey, Smooth-coated Otters, and Mugger Crocodiles.' },
        { name: 'Iruppu Falls & Rameshwara Shrine', description: 'Sacred Brahmagiri mountain cascade on the eastern edge of Nagarhole.' }
      ],
      photographySpots: ['Dammanakatte Leopard Teak Zone', 'Kabini Backwater Deadwood Silhouette at Sunset', 'Taraka Reservoir Causeway'],
      morningActivity: '5:45 AM open-top jeep safari into Nagarhole Zone A/B tracking Bengal Tigers, Dholes, and the famous Black Panther.',
      afternoonActivity: 'Guided naturalist walk along the Kabini riverfront studying hornbills, crested hawk-eagles, and river terns.',
      eveningExperience: 'Golden-hour boat safari on the Kabini backwaters watching elephant families swim across the channel.',
      breakfastSpot: 'Jungle Lodges Gol Ghar — Post-safari hot filter coffee, masala omelette & Maddur vada',
      lunchSpot: 'Evolve Back Kuruba Grill — Farm-to-table organic millet & wood-fired South Indian delicacies',
      dinnerSpot: 'The Serai Kabini Waterfront — Starlit riverside deck dining with documentary wildlife screening',
      shoppingHighlight: 'Handcrafted tribal bamboo craft, wildlife photography prints, and organic forest honey.',
      safetyNote: 'Night driving through Nagarhole highway is strictly closed from 6:00 PM to 6:00 AM for wildlife protection.'
    }
  },
  {
    id: 'badami',
    name: 'Badami, Pattadakal & Aihole',
    kannadaName: 'ಬಾದಾಮಿ - ಪಟ್ಟದಕಲ್ಲು - ಐಹೊಳೆ',
    region: 'Deccan Heritage',
    tagline: 'Cradle of Indian Temple Architecture & Red Sandstone Cave Cliffs',
    summary: 'The royal triad of the Early Chalukya Empire (6th–8th century CE) where rock-cut sandstone caves overlook Agastya Lake alongside UNESCO-listed Pattadakal.',
    lat: 15.9149,
    lng: 75.6768,
    mapX: -0.4,
    mapZ: -4.8,
    elevationMeters: 560,
    interests: ['Heritage', 'Culture', 'Photography', 'Spiritual', 'Architecture' as unknown as TravelInterest].filter(Boolean) as TravelInterest[],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3100,
    isHiddenGem: true,
    archetype: 'temple',
    accentHex: '#EA580C',
    guide: {
      history: 'Capital of Pulakeshin I and II of the Chalukya dynasty (540–757 CE). Aihole served as an architectural laboratory of 125+ stone temples, culminating in the coronation complex at Pattadakal where Northern Nagara and Southern Dravida styles fuse.',
      culture: 'Authentic North Karnataka hospitality, Ilkal handloom weaving with traditional Tope Teni borders, and spice-rich Khanavali meals.',
      bestVisitingTimes: 'October to February; late afternoon (4:00 PM–5:30 PM) turns the Badami cliffside crimson.',
      localCustoms: [
        'Purchase the composite ASI ticket at Cave 1 and hold onto it for the Badami Archaeological Museum across the lake.',
        'Walk quietly along the eastern embankment of Agastya Tirtha to reach the Bhutanatha Temple group.',
        'Visit Banashankari Amma Temple nearby to experience authentic North Karnataka temple fairs.'
      ],
      hiddenAttractions: [
        { name: 'Upper Shivalaya Cliff Trail', description: 'Steep sandstone canyon climb through natural rock fissures to a 7th-century hilltop shrine.' },
        { name: 'Ravana Phadi Cave at Aihole', description: 'Intimate 6th-century rock-cut shrine featuring an exquisite ten-armed dancing Shiva.' }
      ],
      photographySpots: ['Cave 3 Vishnu Colonnade overlooking Agastya Lake', 'Bhutanatha Temple Reflection at Sunset', 'Durga Temple Apse at Aihole'],
      morningActivity: 'Explore Badami’s four rock-cut caves (Shiva Nataraja with 81 dance poses, Trivikrama Vishnu, and Jain Tirthankaras).',
      afternoonActivity: 'Drive along the Malaprabha River to UNESCO World Heritage Pattadakal (Virupaksha & Mallikarjuna temples) and Aihole.',
      eveningExperience: 'Climb the North Fort sandstone canyon to Upper Shivalaya as the setting sun ignites the red cliffs.',
      breakfastSpot: 'Shree Veerabhadreshwara — Crispy Girmit (spiced puffed rice) with Mirchi Bajji',
      lunchSpot: 'Banashankari Khanavali — Unlimited North Karnataka Jolada Rotti, Shenga (peanut) chutney, Yennegai & Curd',
      dinnerSpot: 'Heritage Resort Badami Courtyard — Traditional Sajjaka sweet and spiced jawar rotti thali',
      shoppingHighlight: 'GI-tagged Ilkal silk-cotton sarees and Guledgudda Khana handloom blouse fabrics.',
      safetyNote: 'Keep food items inside zipped backpacks—bonnet macaques near Cave 1 and 2 are agile.'
    }
  },
  {
    id: 'udupi',
    name: 'Udupi & Malpe',
    kannadaName: 'ಉಡುಪಿ',
    region: 'Karavali Coast',
    tagline: 'Basalt Column Islands, Temple Cuisine & Arabian Sea Sunsets',
    summary: 'Famed equally for the 13th-century Sri Krishna Matha culinary tradition and the volcanic hexagonal basalt columns of St. Mary’s Island off Malpe Beach.',
    lat: 13.3409,
    lng: 74.7421,
    mapX: -4.2,
    mapZ: 3.3,
    elevationMeters: 20,
    interests: ['Beaches', 'Food', 'Spiritual', 'Culture', 'Road Trips', 'Photography'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 3300,
    isHiddenGem: false,
    archetype: 'coast',
    accentHex: '#0284C7',
    guide: {
      history: 'Established as a spiritual seat of Dvaita philosophy by Saint Madhvacharya in the 13th century, while its port at Malpe traded spices across the Arabian Sea and preserves 88-million-year-old volcanic rhyolite columns formed when Madagascar split from India.',
      culture: 'Birthplace of world-renowned Udupi vegetarian temple gastronomy, Yakshagana coastal opera, and Kambala buffalo races.',
      bestVisitingTimes: 'October to March when ferries to St. Mary’s Island operate in calm seas; January of even-numbered years for Paryaya Festival.',
      localCustoms: [
        'View the deity at Udupi Sri Krishna Matha through the sacred nine-holed silver window (Navagraha Kitiki).',
        'Carry reusable water bottles onto St. Mary’s Island—single-use plastics are strictly banned on the geological monument.',
        'Drive the Maravanthe strip at sunset where NH-66 runs between the Arabian Sea and Souparnika River.'
      ],
      hiddenAttractions: [
        { name: 'Kodi Bengre Delta Point', description: 'Narrow sandspit where the Swarna River meets the Arabian Sea, home to local surfing schools and toddy tappers.' },
        { name: 'Hasta Shilpa Heritage Village, Manipal', description: '26 restored centuries-old vernacular homes, palaces, and craft galleries.' }
      ],
      photographySpots: ['St. Mary’s Island Hexagonal Basalt Columns', 'Kapu (Kaup) 1901 Lighthouse on Granite Rocks', 'Maravanthe Highway Dual-Water Panorama'],
      morningActivity: 'Morning ferry from Malpe to St. Mary’s Island to walk among 88-million-year-old hexagonal volcanic basalt formations.',
      afternoonActivity: 'Heritage walk through Car Street, Sri Krishna Matha temple kitchen, and Hasta Shilpa Heritage Village in Manipal.',
      eveningExperience: 'Climb the 1901 Kapu Lighthouse perched on wave-lashed granite boulders at sunset.',
      breakfastSpot: 'Mitra Samaj (Car Street) — Birthplace of the Masala Dosa & fluffy Goli Baje with coconut chutney',
      lunchSpot: 'Woodlands Udupi — Authentic Temple Sambar with Mattu Gulla brinjal, Pathrode & Hayagreeva sweet',
      dinnerSpot: 'Thimappa Fish Hotel — Coastal Anjal (Seer fish) tawa fry, Kane rava fry & boiled red rice',
      shoppingHighlight: 'GI-tagged Udupi handloom cotton sarees, Mattu Gulla seasonal brinjals, and jackfruit papads.',
      safetyNote: 'Swimming is prohibited along the deep volcanic drop-offs on the western side of St. Mary’s Island.'
    }
  },
  {
    id: 'agumbe',
    name: 'Agumbe',
    kannadaName: 'ಆಗುಂಬೆ',
    region: 'Western Ghats & Malnad',
    tagline: 'Cherrapunji of the South, Rainforest Research & Sunset Ghats',
    summary: 'A misty high-altitude rainforest plateau atop 14 dramatic hairpin bends, famous for its King Cobra conservation station, Barkana Falls, and Malgudi Days heritage home.',
    lat: 13.5027,
    lng: 75.0903,
    mapX: -3.2,
    mapZ: 2.8,
    elevationMeters: 826,
    interests: ['Nature', 'Waterfalls', 'Trekking', 'Photography', 'Wildlife'],
    bestSeason: 'Monsoon (Jun–Sep)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 2800,
    isHiddenGem: true,
    archetype: 'mountains',
    accentHex: '#14B8A6',
    guide: {
      history: 'Immortalized as R.K. Narayan’s fictional town of "Malgudi" in Shankar Nag’s classic television series (filmed at Doddamane, a 130-year-old heritage house) and pioneered in herpetology by Romulus Whitaker’s Agumbe Rainforest Research Station.',
      culture: 'Quiet rainforest stewardship, Myristica swamp conservation, and communal meals on hand-woven mats at Doddamane.',
      bestVisitingTimes: 'June to October for misty rainforest magic and cascading falls; November–January for clear Arabian Sea sunsets visible from the ghat crest.',
      localCustoms: [
        'Remove footwear and dine respectfully on the floor when visiting Kasturi Akka’s historic Doddamane house.',
        'Always walk rainforest trails with a certified local forest guide to respect King Cobra and pit viper habitats.',
        'Avoid loud music at Sunset Viewpoint—the ridge is an active wildlife corridor.'
      ],
      hiddenAttractions: [
        { name: 'Kundadri Hill 17th-Century Jain Temple', description: 'Monolithic stone temple perched atop a bald granite dome above a sea of clouds.' },
        { name: 'Onake Abbi & Jogi Gundi Falls', description: 'Crystal-clear rainforest pools and 120m cascades tucked beneath giant dipterocarp trees.' }
      ],
      photographySpots: ['Kundadri Peak Cloud Sea at Sunrise', 'Agumbe 14th Hairpin Sunset Over Arabian Sea', 'Kavaledurga Moss-Covered Fort Steps'],
      morningActivity: 'Sunrise drive to Kundadri Hill followed by guided rainforest ecology walk to Jogi Gundi Falls.',
      afternoonActivity: 'Explore the 9th-century three-tiered island fort of Kavaledurga and traditional lunch at Doddamane.',
      eveningExperience: 'Watch the sun sink into the distant Arabian Sea from the 826m Agumbe Ghat crest.',
      breakfastSpot: 'Doddamane Heritage Home — Hot Akki Rotti, coconut chutney & jaggery-spiced Kashaya',
      lunchSpot: 'Malgudi Cafe Agumbe — Traditional Malnad banana leaf meal with tender bamboo shoot palya',
      dinnerSpot: 'Mallya Residency Homestay — Steaming Neer Dosa, wild mushroom sukka & warm rasam',
      shoppingHighlight: 'Organic Garcinia (Uppage) rind, wild cinnamon bark, and Kokum syrup from village cooperatives.',
      safetyNote: 'BSNL and Jio have the most reliable cellular signal on the plateau; download offline maps before ascending the ghat.'
    }
  },
  {
    id: 'kudremukh',
    name: 'Kudremukh & Kalasa',
    kannadaName: 'ಕುದುರೆಮುಖ',
    region: 'Western Ghats & Malnad',
    tagline: 'Horse-Faced Shola Peak, Rolling Grasslands & Tea Estates',
    summary: 'A breathtaking national park of velvet-green shola hills and crystal streams shaped like a stallion’s face, offering Karnataka’s most cinematic high-ridge trek.',
    lat: 13.2226,
    lng: 75.2518,
    mapX: -2.8,
    mapZ: 3.7,
    elevationMeters: 1892,
    interests: ['Trekking', 'Nature', 'Hill Stations', 'Adventure', 'Waterfalls'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Challenging Summit',
    baseDailyCostINR: 3000,
    isHiddenGem: true,
    archetype: 'mountains',
    accentHex: '#22C55E',
    guide: {
      history: 'Historically a maritime landmark for Arab sailors on the Malabar coast who navigated by the "Horse-Face" peak rising 1,892m above the Western Ghats; now a protected Tiger Reserve and Lion-Tailed Macaque sanctuary.',
      culture: 'Sacred temple towns of Horanadu (Annapoorneshwari) and Kalasa nestled among organic tea and spice gardens.',
      bestVisitingTimes: 'October to February when shola hills transition from neon emerald to golden-amber.',
      localCustoms: [
        'Book the official Karnataka Forest Department online trek permit (capped at 50 trekkers/day) at least 7 days prior.',
        'Start the 20 km round-trip trek from Mullodi base village by 6:30 AM sharp.',
        'Zero litter policy: Forest guards inspect and count plastic bottles at the checkpost before and after the trek.'
      ],
      hiddenAttractions: [
        { name: 'Kyatanamakki 360° Off-Road Ridge', description: 'Unobstructed ridge panorama overlooking Kudremukh, Ballalarayana Durga, and Ettina Bhuja.' },
        { name: 'Hanuman Gundi (Soothanabbi) Falls', description: '22-meter natural rock-pool cascade inside the national park corridor.' }
      ],
      photographySpots: ['Ontimara (Lone Tree) Point on Kudremukh Trail', 'Bhadra River Hanging Bridge at Kalasa', 'Kyatanamakki Sunset Ridge'],
      morningActivity: 'Full-day guided ascent through shola forests and rolling grasslands to the 1,892m Kudremukh Peak.',
      afternoonActivity: 'Cool off in the mountain streams of Somavathihole and visit the Kelagur Organic Tea Estate.',
      eveningExperience: 'Darshan and traditional temple dinner at Horanadu Sri Annapoorneshwari Temple.',
      breakfastSpot: 'Bella Homestay, Mullodi — High-energy Poha, boiled eggs, banana & estate black coffee',
      lunchSpot: 'Kalasa Spice Garden — Malnad red-rice meal with jackfruit seed sambar & papad',
      dinnerSpot: 'Silent Valley Kalasa Cottages — Warm pepper rasam, chapati & campfire vegetable kurma',
      shoppingHighlight: 'Kelagur high-grown orthodox leaf tea and Horanadu cardamom-pepper spice packs.',
      safetyNote: 'Carry knee support and 3 liters of water; descending 10 km from the summit tests quad endurance.'
    }
  },
  {
    id: 'dandeli',
    name: 'Dandeli',
    kannadaName: 'ದಾಂಡೇಲಿ',
    region: 'Western Ghats & Malnad',
    tagline: 'Kali River White-Water Rapids, Great Hornbills & Limestone Caves',
    summary: 'Karnataka’s adventure and canopy capital where the Kali River carves Grade-III rapids through dense deciduous forests alive with Malabar Pied and Great Hornbills.',
    lat: 15.2361,
    lng: 74.6173,
    mapX: -4.4,
    mapZ: -2.1,
    elevationMeters: 473,
    interests: ['Adventure', 'Wildlife', 'Nature', 'Waterfalls', 'Trekking'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3900,
    isHiddenGem: false,
    archetype: 'wildlife',
    accentHex: '#16A34A',
    guide: {
      history: 'Part of the 2,200 sq km Kali Tiger Reserve (formerly Dandeli-Anshi), protecting ancient karst limestone caves at Kavala and Ulavi linked to 12th-century Lingayat saint Channabasavanna.',
      culture: 'A vibrant tapestry of Siddi community folk drumming (Dhamami dance), Konkani river cuisine, and bamboo forest craft.',
      bestVisitingTimes: 'October to March for optimal Kali River dam water release and hornbill nesting season.',
      localCustoms: [
        'Raft only with Karnataka Tourism certified operators at Ganeshgudi wearing buckled life jackets and helmets.',
        'At Timber Depot and Old Magazine House, keep binoculars ready at dusk for Malabar Giant Squirrels and 4 species of Hornbills.',
        'Climb the 375 steps at Kavala Caves with a headlamp.'
      ],
      hiddenAttractions: [
        { name: 'Syntheri Rocks Monolith', description: '300-foot volcanic granite canyon carved by the Kaneri River inside deep forest.' },
        { name: 'Sykes Point Sunset Over Kali Gorge', description: 'Dramatic cliff overlook at the confluence of the Kali and Nagjhuri rivers.' }
      ],
      photographySpots: ['Old Magazine House Birdbath Canopy', 'Ganeshgudi White-Water Rapid Drop', 'Supa Dam Backwater Islands'],
      morningActivity: '9 km Grade-III white-water rafting expedition on the Kali River starting from Ganeshgudi.',
      afternoonActivity: 'Explore the 300-foot volcanic monolith of Syntheri Rocks and kayak in the tranquil Moulangi Eco Park.',
      eveningExperience: 'Hornbill photography session at Timber Depot followed by coracle ride at dusk.',
      breakfastSpot: 'Old Magazine House Canteen — Sabudana Khichdi, Upma & forest-honey toast',
      lunchSpot: 'Kali Adventure Camp River Deck — Konkani fish curry, solkadhi & steamed rice',
      dinnerSpot: 'Bison River Resort — Riverside barbecue and traditional Siddi cultural performance',
      shoppingHighlight: 'Handwoven bamboo baskets, wild forest honey, and kokum butter.',
      safetyNote: 'Never enter the Kali River without a life jacket; submerged rocks and dam releases create strong undercurrents.'
    }
  },
  {
    id: 'sakleshpur',
    name: 'Sakleshpur',
    kannadaName: 'ಸಕಲೇಶಪುರ',
    region: 'Western Ghats & Malnad',
    tagline: 'Star-Shaped Manjarabad Fort, Green Route Railway & Cardamom Hills',
    summary: 'Misty spice slopes straddling the Shiradi Ghat, crowned by Tipu Sultan’s Vauban-style star fort and panoramic ridge trails overlooking the Western Ghats railway tunnels.',
    lat: 12.9442,
    lng: 75.7849,
    mapX: -1.7,
    mapZ: 4.9,
    elevationMeters: 956,
    interests: ['Hill Stations', 'Trekking', 'Heritage', 'Coffee Plantations', 'Nature', 'Road Trips'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Moderate Trail',
    baseDailyCostINR: 3500,
    isHiddenGem: true,
    archetype: 'mountains',
    accentHex: '#65A30D',
    guide: {
      history: 'Strategically fortified in 1792 CE by Tipu Sultan with French military engineers who designed Manjarabad Fort as an eight-pointed geometric star so zero blind spots existed overlooking the Mangalore coast road.',
      culture: 'Aromatic cardamom, pepper, and shade-grown coffee plantations interspersed with 1,000-year-old Hoysala shrines.',
      bestVisitingTimes: 'September to February when morning mist (Manju) fills the Hemavathi valley.',
      localCustoms: [
        'Explore the star-shaped bastions and cross-shaped water well of Manjarabad Fort at 8:30 AM before highway travelers arrive.',
        'Take the Vista-dome glass-roof train from Yesvantpur/Hassan to Subrahmanya Road through 57 tunnels and 109 bridges.',
        'Respect private plantation gates when hiking Ettina Bhuja or Jenukallu Gudda.'
      ],
      hiddenAttractions: [
        { name: 'Ettina Bhuja (Ox’s Shoulder) Peak', description: 'Short, dramatic 4 km monolith ridge hike offering 360-degree views of Charmadi Ghat.' },
        { name: 'Shettihalli Rosary Church', description: '1860 French Gothic church that partially submerges every monsoon in the Hemavathi backwaters.' }
      ],
      photographySpots: ['Manjarabad 8-Pointed Star Bastion Aerial View', 'Bisle Ghat 3-District Viewpoint', 'Shettihalli Submerged Gothic Arches'],
      morningActivity: 'Ascend the 250 stone steps into the star-shaped Manjarabad Fort and walk its geometric ramparts.',
      afternoonActivity: 'Trek the emerald ridge of Ettina Bhuja or drive to the dramatic Bisle Ghat rainforest viewpoint.',
      eveningExperience: 'Sunset coracle boat ride beside the Gothic arches of Shettihalli Rosary Church.',
      breakfastSpot: 'Surabhi Nx, Sakleshpur — Steaming Thatte Idli with spicy red chutney & filter coffee',
      lunchSpot: 'Machaan Plantation Resort — Estate cardamom-infused curry, Akki Rotti & tender jackfruit',
      dinnerSpot: 'Eka Resort Bonfire Deck — Malnad clay-pot chicken/vegetable stew with neer dosa',
      shoppingHighlight: 'Green export-grade Sakleshpur cardamom, black pepper peppercorns, and homemade passionfruit squash.',
      safetyNote: 'Walking directly on active railway tracks along the Green Route is prohibited; take the Vista-dome coach or hike Ettina Bhuja instead.'
    }
  },
  {
    id: 'bandipur',
    name: 'Bandipur Tiger Reserve',
    kannadaName: 'ಬಂಡೀಪುರ ಹುಲಿ ಸಂರಕ್ಷಿತ ಪ್ರದೇಶ',
    region: 'Southern Maidan',
    tagline: 'Nilgiri Foothill Savannas, Royal Bengal Tigers & Gopalaswamy Peak',
    summary: 'One of India’s premier Project Tiger reserves where dry deciduous teak and sandalwood forests meet the misty blue Nilgiri mountains.',
    lat: 11.6664,
    lng: 76.6292,
    mapX: 0.6,
    mapZ: 9.0,
    elevationMeters: 860,
    interests: ['Wildlife', 'Nature', 'Photography', 'Road Trips'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 5800,
    isHiddenGem: false,
    archetype: 'wildlife',
    accentHex: '#CA8A04',
    guide: {
      history: 'Established in 1931 as the Venugopala Wildlife Park by the Maharaja of Mysuru and inducted in 1973 among India’s first nine Project Tiger reserves.',
      culture: 'Coexistence of forest shrines like Himavad Gopalaswamy Betta (1,450m) wrapped in year-round cloud mist.',
      bestVisitingTimes: 'October to May for high visibility of Tigers, Indian Gaur (Bison), Sloth Bears, and Four-horned Antelopes.',
      localCustoms: [
        'Use the official KSRTC green shuttle bus from the foothill checkpost to visit Himavad Gopalaswamy Betta temple.',
        'Observe the strict 30 km/h speed limit and zero-stopping rule on the highway through the core zone.',
        'Arrive 30 minutes early at the Bandipur Reception Center for the 6:00 AM safari boarding.'
      ],
      hiddenAttractions: [
        { name: 'Himavad Gopalaswamy Betta', description: '14th-century hilltop Krishna temple at 1,450m where wild elephants often graze in the surrounding mist.' },
        { name: 'Moyar Gorge Overlook', description: '260-meter deep canyon forming the natural border between Bandipur and Mudumalai.' }
      ],
      photographySpots: ['Tavarakatte Waterhole Tiger Crossing', 'Himavad Gopalaswamy Misty Temple Gopuram', 'Nilgiri Blue Mountain Backdrop'],
      morningActivity: 'Early morning forest safari tracking Bengal Tigers, herds of Indian Gaur, and Malabar Pied Hornbills.',
      afternoonActivity: 'Shuttle ascent to the cloud-kissed summit of Himavad Gopalaswamy Betta.',
      eveningExperience: 'Dusk wildlife safari followed by stargazing at the edge of the Nilgiri Biosphere.',
      breakfastSpot: 'Bandipur Safari Lodge Veranda — Crisp Masala Vada, Pongal & Nilgiri tea',
      lunchSpot: 'The Windflower Tusker Trail — Traditional Mysuru rural thali with ragi rotti & avarekalu',
      dinnerSpot: 'Serai Bandipur Courtyard — Open-air grill under banyan trees',
      shoppingHighlight: 'Eco-development committee hand-block wildlife totes and Nilgiri eucalyptus oil.',
      safetyNote: 'The Bandipur-Ooty highway closes strictly from 9:00 PM to 6:00 AM every night.'
    }
  },
  {
    id: 'mangaluru',
    name: 'Mangaluru',
    kannadaName: 'ಮಂಗಳೂರು',
    region: 'Karavali Coast',
    tagline: 'Tulu Nadu Port Heritage, Sistine Chapel Frescoes & Ghee Roast',
    summary: 'A vibrant coastal port city where the Netravathi and Gurupura rivers embrace the Arabian Sea, celebrated for St. Aloysius Chapel paintings, Kadri bronze statues, and legendary seafood.',
    lat: 12.9141,
    lng: 74.8560,
    mapX: -4.1,
    mapZ: 5.0,
    elevationMeters: 22,
    interests: ['Food', 'Beaches', 'Culture', 'Heritage', 'Spiritual'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Moderate',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 3600,
    isHiddenGem: false,
    archetype: 'coast',
    accentHex: '#F97316',
    guide: {
      history: 'Named after Goddess Mangaladevi (9th century CE), Mangaluru served as Hyder Ali’s primary naval dockyard at Sultan Battery and boasts the 10th-century Kadri Manjunatha bronze Lokeshwara statue.',
      culture: 'Heartland of Tulu Nadu traditions: Bhoota Kola spirit worship, Yakshagana theatre, Pili Yesa (Tiger Dance), and world-famous ice cream parlors.',
      bestVisitingTimes: 'November to February for breezy beach evenings and Kambala festival weekends.',
      localCustoms: [
        'No visit to Mangaluru is complete without tasting the multi-layered "Gadbad" ice cream invented at Pabba’s / Ideal Cafe.',
        'Maintain silence inside St. Aloysius Chapel (1880) while admiring Antonio Moscheni’s floor-to-ceiling canvas frescoes.',
        'Take the local ferry from Sultan Battery across the Gurupura River to the quiet Tannirbhavi pine-tree beach.'
      ],
      hiddenAttractions: [
        { name: 'Sasihithlu Beach Confluence', description: 'Pristine white-sand peninsula where the Nandini and Shambhavi rivers meet the Arabian Sea.' },
        { name: 'St. Aloysius Chapel (1880)', description: 'Every square inch of ceiling and walls painted by Italian Jesuit master Brother Antonio Moscheni.' }
      ],
      photographySpots: ['Sasihithlu Surf Point Estuary', 'Sultan Battery Watchtower & River Ferry', 'Surathkal NITK Lighthouse on the Rocks'],
      morningActivity: 'Explore the 1068 CE bronze Lokeshwara at Kadri Manjunatha Temple and the frescoes of St. Aloysius Chapel.',
      afternoonActivity: 'Savor original Chicken/Paneer Ghee Roast and Kori Rotti, followed by a visit to Pilikula Artisan Village.',
      eveningExperience: 'Ferry crossing from Sultan Battery (1784 watchtower) to Tannirbhavi Beach for an Arabian Sea sunset.',
      breakfastSpot: 'Taj Mahal Cafe (Est. 1931) — Fluffy Buns (sweet banana bread), Goli Baje & Sajjige Bajil',
      lunchSpot: 'Machali / Maharaja — Iconic Shetty’s Ghee Roast, Kori Rotti (crispy rice wafers in chicken gravy) & Anjal Fry',
      dinnerSpot: 'Pabba’s Ideal Cafe — Mangalore snacks followed by the original Gadbad & Tiramisu sundae',
      shoppingHighlight: 'Roasted Mangalore cashews at Bunder market, crispy Kori Rotti packets, and Macaroons.',
      safetyNote: 'High humidity year-round; wear breathable linen or cotton clothing.'
    }
  },
  {
    id: 'shivamogga',
    name: 'Shivamogga & Thirthahalli',
    kannadaName: 'ಶಿವಮೊಗ್ಗ',
    region: 'Western Ghats & Malnad',
    tagline: 'Gateway to Malnad, Kuvempu Literary Trail & Tunga River Arc',
    summary: 'Cradled along the curving Tunga River, connecting Keladi Nayaka palaces, Sakrebailu elephant camp, Mandagadde bird island, and poet laureate Kuvempu’s Kuppalli.',
    lat: 13.9299,
    lng: 75.5681,
    mapX: -2.1,
    mapZ: 1.8,
    elevationMeters: 569,
    interests: ['Culture', 'Nature', 'Heritage', 'Wildlife', 'Waterfalls'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 2900,
    isHiddenGem: true,
    archetype: 'temple',
    accentHex: '#10B981',
    guide: {
      history: 'Stronghold of the Keladi Nayaka rulers (1499–1763 CE), notably Queen Keladi Chennamma, whose rosewood-and-teak Shivappa Nayaka Palace stands on the banks of the Tunga River.',
      culture: 'Literary capital of Kannada Jnanpith laureate Kuvempu at Kuppalli (Kavishaila), arecanut plantation architecture, and Chittara folk wall art.',
      bestVisitingTimes: 'August to February; mornings between 8:30 AM and 10:30 AM for Sakrebailu Elephant interaction.',
      localCustoms: [
        'Arrive at Sakrebailu Elephant Camp by 8:30 AM to watch mahouts bathe tuskers in the Tunga River backwaters.',
        'Climb to Kavishaila rock megalith above Kuppalli for quiet literary reflection.',
        'Admire the 16th-century Gandabherunda (two-headed mythical bird—Karnataka’s state emblem) carved on the ceiling of Keladi Rameshwara Temple.'
      ],
      hiddenAttractions: [
        { name: 'Kavishaila & Kuppalli Heritage House', description: 'Ancestral Malnad courtyard home of poet Kuvempu surrounded by hills near Thirthahalli.' },
        { name: 'Bheemeshwara & Kudli Sangama', description: 'Sacred confluence of the Tunga and Bhadra rivers marked by a 12th-century Hoysala temple.' }
      ],
      photographySpots: ['Thirthahalli Kuvempu Arch Bridge over Tunga', 'Sakrebailu Morning River Bath', 'Kavishaila Granite Sunset Circle'],
      morningActivity: 'Morning visit to Sakrebailu Elephant Camp on the Tunga River and boat view of Mandagadde Bird Sanctuary.',
      afternoonActivity: 'Drive through emerald arecanut valleys to Kuppalli (Kavishaila) and the 18th-century stone bridge at Thirthahalli.',
      eveningExperience: 'Explore Shivappa Nayaka’s rosewood palace and watch the sunset over Gajanur Dam.',
      breakfastSpot: 'Meenakshi Bhavan, Shivamogga — Crispy Khali Dosa, Avalakki (beaten rice) & filter coffee',
      lunchSpot: 'Thirthahalli Malnad Mess — Traditional Kadubu, midi-mavinakayi (tender mango) pickle & buttermilk',
      dinnerSpot: 'Royal Orchid Central — Malnad spice roast and banana-leaf dinner',
      shoppingHighlight: 'Hase Chittara folk art frames, Sagara sandalwood craft, and roasted areca-spice blends.',
      safetyNote: 'Respect safe viewing distances around calves at Sakrebailu Elephant Camp.'
    }
  },
  {
    id: 'pattadakal',
    name: 'Pattadakal',
    kannadaName: 'ಪಟ್ಟದಕಲ್ಲು',
    region: 'Deccan Heritage',
    tagline: 'UNESCO Royal Coronation Complex Along the Malaprabha River',
    summary: 'A harmonious 8th-century architectural ensemble where Northern Rekha-Nagara spires and Southern Dravida Vimanas stand side by side on manicured lawns.',
    lat: 15.9486,
    lng: 75.8164,
    mapX: -0.1,
    mapZ: -4.9,
    elevationMeters: 535,
    interests: ['Heritage', 'Culture', 'Photography', 'Spiritual'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 2800,
    isHiddenGem: true,
    archetype: 'temple',
    accentHex: '#D97706',
    guide: {
      history: 'Known in antiquity as Raktapura (Town of Red Stone) and Pattada-Kisuvolal, where Chalukya emperors were crowned. Queen Lokamahadevi commissioned the monumental Virupaksha Temple in 740 CE to celebrate Vikramaditya II’s victory over the Pallavas.',
      culture: 'Annual Pattadakal Classical Dance Festival held every January against floodlit 8th-century sandstone friezes.',
      bestVisitingTimes: 'November to February; January during the 3-day Pattadakal Dance Festival.',
      localCustoms: [
        'Examine the signed stone inscriptions of master architects Gunda Anivaritachari and Sarvasiddhi Achari on the Virupaksha facade.',
        'Compare the curved northern shikaras of Kashi Vishwanatha and Galaganatha directly beside the stepped Dravidian roof of Sangameshwara.',
        'Virupaksha remains an active temple—remove shoes at the Nandi pavilion.'
      ],
      hiddenAttractions: [
        { name: 'Jain Narayana Temple (9th Century)', description: 'Rashtrakuta-era granite and sandstone sanctuary 500m west of the main enclosure.' },
        { name: 'Mahakuta Group of Temples', description: 'Spring-fed sacred tank (Vishnu Pushkarini) surrounded by 20+ Chalukya shrines in a wooded gorge.' }
      ],
      photographySpots: ['Virupaksha Nandi Pavilion Framing', 'Galaganatha Curvilinear Spire against Blue Sky', 'Malaprabha River North Bank'],
      morningActivity: 'In-depth sculptural tour of the 9 Hindu temples inside the UNESCO enclosure decoding Ramayana & Mahabharata reliefs.',
      afternoonActivity: 'Excursion to the spring-fed Mahakuta Temple Tank and Banashankari weavers’ village.',
      eveningExperience: 'Golden-hour photography across the crimson sandstone courtyards.',
      breakfastSpot: 'KSTDC Mayura Chalukya — Hot Poori Saagu, Upma & North Karnataka tea',
      lunchSpot: 'Kamat Yatri Nivas — Authentic Jolada Rotti meal withJhunka (spiced gram flour) & curd',
      dinnerSpot: 'Clark’s Inn Courtyard — Regional Deccan thali',
      shoppingHighlight: 'Handwoven Ilkal sarees and miniature sandstone Nandi sculptures.',
      safetyNote: 'Wide open lawns have minimal shade at noon—wear a sun hat and carry water.'
    }
  },
  {
    id: 'aihole',
    name: 'Aihole',
    kannadaName: 'ಐಹೊಳೆ',
    region: 'Deccan Heritage',
    tagline: '125+ Ancient Stone Temples & The Cradle of Hindu Architecture',
    summary: 'Where early Chalukya master builders experimented with apsidal, stepped, and rock-cut temple geometries from the 5th to 8th centuries CE.',
    lat: 16.0193,
    lng: 75.8819,
    mapX: 0.2,
    mapZ: -5.2,
    elevationMeters: 528,
    interests: ['Heritage', 'Photography', 'Culture', 'Trekking'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 2600,
    isHiddenGem: true,
    archetype: 'temple',
    accentHex: '#B45309',
    guide: {
      history: 'Ancient Aryapura, home to the Ayyavole-500 merchant guild that traded across Southeast Asia, and location of Ravikirti’s famous 634 CE Sanskrit inscription at Meguti Hill praising Emperor Pulakeshin II.',
      culture: 'Quiet agrarian village life where 6th-century temples rise directly beside sunflower and sorghum fields.',
      bestVisitingTimes: 'October to March; mornings from 8:00 AM to 11:30 AM.',
      localCustoms: [
        'Start at the apsidal Durga Temple (named after a later fort watchtower, "Durg", built on its roof) and visit the onsite ASI Sculpture Gallery.',
        'Climb Meguti Hill for the 634 CE Jain temple and 40+ prehistoric megalithic dolmens scattered across the sandstone plateau.',
        'Ask the ASI caretaker to point out the pierced stone windows (Jalis) of Lad Khan Temple.'
      ],
      hiddenAttractions: [
        { name: 'Meguti Hill Megalithic Dolmens', description: 'Iron-Age prehistoric burial chambers sitting beside a 634 CE Jain temple.' },
        { name: 'Huchimalli & Kontigudi Complexes', description: 'Intimate village temples with intricate ceiling lotus medallions and celestial couples.' }
      ],
      photographySpots: ['Durga Temple Apsidal Colonnade', 'Lad Khan Pierced Stone Lattice Windows', 'Meguti Hill Valley Panorama'],
      morningActivity: 'Architectural exploration of Durga Temple, Lad Khan Temple (450 CE), and the ASI Archaeological Museum.',
      afternoonActivity: 'Hike up Meguti Hill to inspect the 634 CE Pulakeshin II inscription and prehistoric dolmens.',
      eveningExperience: 'Visit Ravana Phadi rock-cut cave and watch sunset over the Malaprabha sunflower fields.',
      breakfastSpot: 'Aihole Village Tiffin Center — Hot Susla (spiced puffed rice) & ginger tea',
      lunchSpot: 'Amegundi Resort Dining — Traditional Bagalkot Bhakri meal with Brinjal Yennegai & Kardantu sweet',
      dinnerSpot: 'Badami Court Veranda — North Karnataka millet & lentil feast',
      shoppingHighlight: 'Famous Amingad & Gokak Kardantu (nut-jaggery energy sweet) and handloom cotton stoles.',
      safetyNote: 'Wear sturdy walking shoes for the rocky sandstone slab trail up Meguti Hill.'
    }
  },
  {
    id: 'nagarhole',
    name: 'Nagarhole (Rajiv Gandhi NP)',
    kannadaName: 'ನಾಗರಹೊಳೆ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನ',
    region: 'Western Ghats & Malnad',
    tagline: 'Serpentine Forest Streams, Leopard Canopies & Brahmagiri Foothills',
    summary: 'Named after its winding "Serpent River" (Nagara-Hole), bridging the Coorg highlands and Mysore plateau with lush bamboo thickets and wild dhole packs.',
    lat: 12.0314,
    lng: 76.1207,
    mapX: -1.0,
    mapZ: 7.6,
    elevationMeters: 810,
    interests: ['Wildlife', 'Nature', 'Photography', 'Trekking', 'Waterfalls'],
    bestSeason: 'Winter (Oct–Feb)',
    crowdLevel: 'Low (Serene)',
    trekDifficulty: 'Easy Walk',
    baseDailyCostINR: 6200,
    isHiddenGem: false,
    archetype: 'wildlife',
    accentHex: '#15803D',
    guide: {
      history: 'Declared a wildlife sanctuary in 1955 and upgraded to a National Park and 37th Tiger Reserve of India, forming a crucial link in the Western Ghats UNESCO World Heritage cluster.',
      culture: 'Bordered by South Coorg coffee estates in Kutta and Virajpet alongside Tibetan settlements and Brahmagiri sacred groves.',
      bestVisitingTimes: 'November to May for elephant herds, Indian leopards resting on horizontal teak branches, and Asiatic wild dogs (Dholes).',
      localCustoms: [
        'Choose between the Veeranahosahalli (Hunsur side) or Nanachi Gate (Kutta/Coorg side) safari zones when booking.',
        'Combine your afternoon safari with a morning visit to the cascading Iruppu Falls on the Lakshmana Tirtha river.',
        'Keep voices low at all forest watchtowers.'
      ],
      hiddenAttractions: [
        { name: 'Brahmagiri Wildlife Trail from Iruppu', description: 'Guided forest trek through shola-grassland mosaics rich in endemic Nilgiri birds.' },
        { name: 'Lakshmana Tirtha Rameshwara Temple', description: 'Ancient riverside Shiva temple visited during Mahashivaratri.' }
      ],
      photographySpots: ['Nanachi Gate Teak Canopy', 'Sunkadakatte Forest Stream Crossing', 'Iruppu Falls Forest Bridge'],
      morningActivity: 'Morning forest safari from Nanachi Gate tracking leopards, dhole packs, and giant Malabar squirrels.',
      afternoonActivity: 'Forest walk to Iruppu Falls and coffee plantation tour in Kutta.',
      eveningExperience: 'Dusk safari and naturalist briefing under the Western Ghats night sky.',
      breakfastSpot: 'Kutta Planters Club — Fresh Akki Rotti, estate honey & Coorg filter coffee',
      lunchSpot: 'Machaan Nagarhole — Kodava bamboo shoot curry, steamed riceballs & papad',
      dinnerSpot: 'JLR Kings Sanctuary — Candlelit bush dinner in an organic mango orchard',
      shoppingHighlight: 'South Coorg estate pepper, wild honey, and hand-carved rosewood collectibles.',
      safetyNote: 'Check gate timings carefully—Nagarhole checkposts close strictly at 6:00 PM.'
    }
  }
];

export const KARNATAKA_FESTIVALS: KarnatakaFestival[] = [
  {
    id: 'mysuru-dasara',
    name: 'Mysuru Nada Habba Dasara',
    month: 'October',
    monthIndex: 10,
    season: 'Winter',
    destinationId: 'mysuru',
    locationName: 'Amba Vilas Palace, Mysuru',
    interests: ['Festivals', 'Culture', 'Heritage', 'Photography'],
    description: 'A 400-year-old royal state festival started by the Vijayanagara kings in 1610 CE, culminating in the grand Jumboo Savari procession carrying the 750-kg golden Ambari (Howdah) through illuminated streets.',
    ritualHighlight: '97,000 palace lights glowing nightly, classical music concerts in the palace courtyard, and the torchlight parade at Bannimantap.',
    travelerTip: 'Reserve Gold Card seating or Dasara Exhibition passes 3 weeks ahead; explore Mysuru by foot after 6:00 PM.'
  },
  {
    id: 'hampi-utsav',
    name: 'Hampi Utsav (Vijaya Utsav)',
    month: 'November',
    monthIndex: 11,
    season: 'Winter',
    destinationId: 'hampi',
    locationName: 'Virupaksha Bazaar & Vittala Courtyard, Hampi',
    interests: ['Festivals', 'Heritage', 'Culture', 'Photography'],
    description: 'Celebrated since Vijayanagara imperial times, bringing the 14th-century stone ruins alive with Hindustani and Carnatic maestros, Dollu Kunitha drums, and sound-and-light spectacles.',
    ritualHighlight: 'Janapada Kalavahini folk procession along Hampi Bazaar and classical recitals illuminated against Elephant Stables.',
    travelerTip: 'Stay in Kamalapura or Hospet and book evening shuttle passes to the Vittala Temple stage.'
  },
  {
    id: 'pattadakal-dance',
    name: 'Pattadakal Classical Dance Festival (Chalukya Utsav)',
    month: 'January',
    monthIndex: 1,
    season: 'Winter',
    destinationId: 'pattadakal',
    locationName: 'UNESCO Temple Lawns, Pattadakal',
    interests: ['Festivals', 'Culture', 'Heritage', 'Photography'],
    description: 'India’s premier classical dancers perform Bharatanatyam, Kathak, Odissi, and Kuchipudi with 8th-century Chalukya sandstone temples glowing golden as the stage backdrop.',
    ritualHighlight: 'Open-air twilight performances directly in front of the Virupaksha and Mallikarjuna shrines.',
    travelerTip: 'Entry to the cultural performances is open to visitors; pair with daytime trips to Badami and Aihole.'
  },
  {
    id: 'karaga-bengaluru',
    name: 'Bengaluru Karaga Shaktyotsava',
    month: 'April',
    monthIndex: 4,
    season: 'Summer',
    destinationId: 'bengaluru',
    locationName: 'Dharmaraya Swamy Temple, Tigalarapete, Bengaluru',
    interests: ['Festivals', 'Spiritual', 'Culture'],
    description: 'One of South India’s oldest nocturnal community festivals led by the Thigala community on Chaitra Purnima, featuring sword-wielding Veerakumaras and interfaith harmony at the Mastan Sahib Dargah.',
    ritualHighlight: 'Midnight procession where the priest carries a towering floral pyramid on his head untouched by hands.',
    travelerTip: 'Take the Metro to City Market station and observe from the elevated temple balconies.'
  },
  {
    id: 'kambala-karavali',
    name: 'Karavali Kambala Buffalo Race & Yakshagana Season',
    month: 'December',
    monthIndex: 12,
    season: 'Winter',
    destinationId: 'mangaluru',
    locationName: 'Moodabidri, Mulki & Mangaluru Paddy Tracks',
    interests: ['Festivals', 'Culture', 'Adventure', 'Photography'],
    description: 'Traditional Tulu Nadu slush-paddy sprint where champion pairs of water buffaloes race down twin 145-meter tracks amid brass horn fanfare and all-night Yakshagana bayalata theatre.',
    ritualHighlight: 'High-speed photo-finish sprints measured by laser timers alongside village culinary fairs.',
    travelerTip: 'Wear comfortable sandals and sun protection; evening races under floodlights offer dramatic photography.'
  },
  {
    id: 'kaveri-tula-sankramana',
    name: 'Kaveri Tula Sankramana & Huttari Harvest',
    month: 'October',
    monthIndex: 10,
    season: 'Winter',
    destinationId: 'coorg',
    locationName: 'Talacauvery & Madikeri, Coorg',
    interests: ['Festivals', 'Spiritual', 'Culture', 'Food'],
    description: 'Thousands gather at the Brahmagiri source of River Kaveri to witness the sacred Tirthodbhava (wellspring surge), followed by Kodagu’s Huttari rice-harvest celebrations and Puthari Kolata dances.',
    ritualHighlight: 'Ceremonial cutting of the first golden paddy sheaves under the full moon and feasting on Thambuttu sweet.',
    travelerTip: 'Book a Kodava heritage homestay to experience traditional Huttari songs and family harvest banquets.'
  },
  {
    id: 'malnad-monsoon-utsav',
    name: 'Sharavathi Monsoon Waterfall & Rainforest Festival',
    month: 'August',
    monthIndex: 8,
    season: 'Monsoon',
    destinationId: 'jog-falls',
    locationName: 'Jog Falls & Agumbe Plateau',
    interests: ['Waterfalls', 'Nature', 'Photography', 'Trekking'],
    description: 'Celebrates the peak Southwest Monsoon when Raja, Rani, Roarer, and Rocket cascades merge into a roaring curtain of mist across the Western Ghats.',
    ritualHighlight: 'Guided rainforest walks, Malnad culinary showcases of wild bamboo and jackfruit, and laser illumination at Jog Gorge.',
    travelerTip: 'Pack a rain poncho and waterproof camera sleeve; morning hours between 8:00 AM and 11:00 AM offer the clearest canyon views.'
  }
];

export const KARNATAKA_DISHES: KarnatakaDish[] = [
  {
    id: 'mysore-masala-dosa',
    name: 'Benne & Mysuru Masala Dosa',
    region: 'Old Mysore & Central Karnataka',
    originCity: 'Mysuru & Davanagere',
    dietary: 'Vegetarian',
    flavorProfile: 'Crisp fermented rice-lentil crepe, fiery red garlic-chili chutney, velvety potato palya, and white farm butter.',
    description: 'Golden-brown on the outside and pillowy within, smeared with house-ground red chili-garlic paste and crowned with melting white butter.',
    iconicVenue: 'Vinayaka Mylari (Mysuru) & CTR / MTR (Bengaluru)',
    bestPairedWith: 'Frothy brass-tumbler Chikmagalur Filter Coffee'
  },
  {
    id: 'coorg-pandi-curry',
    name: 'Kodava Pandi Curry & Kadambuttu',
    region: 'Western Ghats (Kodagu)',
    originCity: 'Madikeri, Coorg',
    dietary: 'Signature Meat',
    flavorProfile: 'Dark roasted spices, black pepper, and tangy Kachampuli (wild Garcinia) vinegar reduction.',
    description: 'The pride of Kodava celebratory cuisine, slow-simmered with roasted coriander, cumin, mustard, and aged black Kachampuli extract, served with steamed rice dumplings.',
    iconicVenue: 'Coorg Cuisine & Raintree (Madikeri)',
    bestPairedWith: 'Steamed Kadambuttu or Noolputtu (string hoppers)'
  },
  {
    id: 'mangalore-ghee-roast',
    name: 'Kundapura Ghee Roast & Neer Dosa',
    region: 'Karavali Coast',
    originCity: 'Kundapura & Mangaluru',
    dietary: 'Coastal Seafood',
    flavorProfile: 'Fiery Byadagi red chilies, fenugreek, tangy tamarind, and aromatic cow ghee.',
    description: 'Invented in Kundapura, featuring prawns, crab, chicken, or paneer slow-roasted in pure ghee and bright crimson Byadagi chili masala without a drop of water.',
    iconicVenue: 'Shetty Lunch Home (Kundapura) & Machali (Mangaluru)',
    bestPairedWith: 'Lacy paper-thin coconut Neer Dosa & chilled Kokum Kadi'
  },
  {
    id: 'jolada-rotti-thali',
    name: 'North Karnataka Jolada Rotti & Yennegai',
    region: 'Deccan Plateau (Uttara Karnataka)',
    originCity: 'Badami, Hubballi & Vijayapura',
    dietary: 'Vegetarian',
    flavorProfile: 'Earthy hand-patted sorghum flatbread, roasted peanut-garlic chutney powder, and stuffed baby brinjals.',
    description: 'A wholesome 12-item banana-leaf Khanavali spread featuring unleavened sorghum rottis, stuffed brinjal curry (Badanekayi Yennegai), sprouted moth beans, and thick curd.',
    iconicVenue: 'Banashankari Khanavali (Badami) & Kamat Bugle Rock',
    bestPairedWith: 'Crushed Shenga (peanut) pudi with cold-pressed groundnut oil & Dharwad Peda'
  },
  {
    id: 'bisi-bele-bath',
    name: 'Royal Bisi Bele Bath & Khara Boondi',
    region: 'Southern Maidan',
    originCity: 'Mysuru & Bengaluru',
    dietary: 'Vegetarian',
    flavorProfile: 'Warm cinnamon-marathi moggu spice blend, toor dal, tamarind tang, and cashews sizzled in ghee.',
    description: 'Originating in the kitchens of the Mysuru Palace, this comforting one-pot dish marries rice, lentils, garden vegetables, and 18 freshly roasted spices.',
    iconicVenue: 'MTR 1924 & Halli Mane (Bengaluru)',
    bestPairedWith: 'Crisp Khara Boondi, potato chips & cucumber raita'
  },
  {
    id: 'udupi-gadbad-sambar',
    name: 'Udupi Mattu Gulla Sambar & Gadbad Sundae',
    region: 'Karavali Coast',
    originCity: 'Udupi',
    dietary: 'Sweet & Beverage',
    flavorProfile: 'Sweet-spicy temple coconut sambar followed by layered fruit, jelly, cashews, and triple artisanal ice cream.',
    description: 'Pairs the subtle sweetness of jaggery-kissed Udupi temple sambar with the coastal finale of Gadbad—a tall glass of three ice cream flavors, fresh mango, figs, and nuts.',
    iconicVenue: 'Mitra Samaj (Udupi) & Pabba’s Ideal Cafe (Mangaluru)',
    bestPairedWith: 'Warm Goli Baje (Mangalore bajji) before dessert'
  }
];

export const SEASONAL_EXPERIENCES: SeasonalExperience[] = [
  {
    id: 'Monsoon',
    title: 'Emerald Western Ghats & Thundering Cataracts',
    months: 'June — September',
    subtitle: 'When the Sahyadri mountains awaken in 50 shades of rainforest green.',
    tempRange: '19°C – 26°C',
    topDestinations: ['Jog Falls', 'Agumbe', 'Coorg (Kodagu)', 'Chikmagalur', 'Sakleshpur'],
    signatureExperiences: [
      'Witness all four cascades (Raja, Rani, Roarer, Rocket) plunging 253m at Jog Falls',
      'Cup freshly roasted single-estate Arabica coffee on a rain-washed veranda in Coorg',
      'Guided herpetology and rainforest ecology walk on the misty Agumbe plateau',
      'Coracle ride past the partially submerged Gothic arches of Shettihalli Church'
    ],
    packingAdvice: 'Breathable rain shell, high-traction trekking shoes, anti-leech socks, and silica dry-pouches for cameras.'
  },
  {
    id: 'Winter',
    title: 'Imperial Stone Heritage, Cloud Summits & Coastal Trails',
    months: 'October — February',
    subtitle: 'Golden sunlight overUNESCO ruins, crisp highland treks, and turquoise Arabian Sea coves.',
    tempRange: '14°C – 29°C',
    topDestinations: ['Hampi', 'Mysuru', 'Gokarna', 'Badami, Pattadakal & Aihole', 'Kudremukh & Kalasa'],
    signatureExperiences: [
      'Sunrise boulder climb and architectural walk at Hampi Vittala & Virupaksha complexes',
      '5-Beach cliffside coastal trek from Kudle to Paradise Beach in Gokarna',
      'Summit the 1,892m horse-faced peak of Kudremukh under crystal-clear blue skies',
      'Experience the 97,000-bulb royal illumination of Amba Vilas Palace in Mysuru'
    ],
    packingAdvice: 'Light cotton daywear, a warm fleece for 12°C Western Ghats mornings, and polarized sunglasses.'
  },
  {
    id: 'Summer',
    title: 'Kabini Elephant Congregations & High-Altitude Shola Retreats',
    months: 'March — May',
    subtitle: 'Peak wildlife sightings along forest waterholes and white coffee blossoms in the hills.',
    tempRange: '22°C – 34°C',
    topDestinations: ['Kabini & Nagarhole', 'Bandipur Tiger Reserve', 'Chikmagalur', 'Coorg (Kodagu)', 'Udupi & Malpe'],
    signatureExperiences: [
      'Boat safari on the Kabini backwaters watching 100+ Asiatic elephants gather at dusk',
      'Track Bengal Tigers and the elusive Black Panther (Saya) in Nagarhole & Bandipur',
      'Walk through snow-white fragrant coffee blossom showers across Chikmagalur estates',
      'Sunset sea-kayaking and bioluminescence watch along the Karavali estuary beaches'
    ],
    packingAdvice: 'Neutral olive/khaki linen clothing for safaris, wide-brimmed sun hat, and 200–400mm telephoto lens.'
  }
];
