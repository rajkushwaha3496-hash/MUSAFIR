import type { MusafirDestination, Testimonial, TravelPackage } from '../types.ts';

export const HERO_MOUNTAIN_IMAGE =
  '/src/assets/images/wanderly_hero_mountains_1794981284218.jpg';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DESTINATIONS: MusafirDestination[] = [
  {
    id: 'agra-taj',
    name: 'Taj Mahal & Agra',
    country: 'Uttar Pradesh · Wonder of the World',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 4999,
    bestSeason: 'October – March',
    idealDuration: '3–4 Days',
    imageUrl: '/src/assets/images/india_taj_mahal_1794982487231.jpg',
    tagline:
      'Walk through India’s marble wonder at sunrise, red sandstone royal forts, and nearby pink-city palaces.',
    easyDescription:
      'One of the easiest and most unforgettable heritage trips in India. Start your morning watching the white marble Taj Mahal turn soft pink at sunrise, explore the massive Agra Fort right beside the Yamuna river, and continue onward to Jaipur’s iconic Hawa Mahal.',
    highlights: [
      'Early-morning skip-the-line entry to the Taj Mahal at sunrise',
      'Guided walk inside Agra Fort’s royal marble & sandstone halls',
      'Optional day extension to Jaipur’s Hawa Mahal & royal bazaars',
    ],
    gallery: [
      {
        id: 'taj-1',
        title: 'Taj Mahal at Sunrise',
        imageUrl: '/src/assets/images/india_taj_mahal_1794982487231.jpg',
        description:
          'Arrive at 6:00 AM to see the ivory marble monument glow in soft pink sunlight and reflect in the long garden water pool.',
      },
      {
        id: 'taj-2',
        title: 'Agra Fort Royal Arches',
        imageUrl: '/src/assets/images/india_agra_fort_1794982487266.jpg',
        description:
          'A grand red sandstone fort with peaceful Mughal courtyards and direct arched views looking straight toward the Taj Mahal.',
      },
      {
        id: 'taj-3',
        title: 'Hawa Mahal, Jaipur Extension',
        imageUrl: '/src/assets/images/india_jaipur_hawa_1794982490936.jpg',
        description:
          'Just a few hours away along the Golden Triangle route—famous for 953 sculpted sandstone windows built to let cool breeze inside.',
      },
      {
        id: 'taj-4',
        title: 'Golden Temple Spiritual Stop',
        imageUrl: '/src/assets/images/india_golden_temple_1794982490078.jpg',
        description:
          'Easily paired by overnight train from North India to experience the tranquil shimmering pool and community kitchen in Amritsar.',
      },
      {
        id: 'taj-5',
        title: 'Ganga Ghats Heritage Trail',
        imageUrl: '/src/assets/images/india_kashi_ghats_1794982488101.jpg',
        description:
          'Connect Agra’s Mughal architecture with ancient riverfront stone ghats for a complete North India cultural story.',
      },
    ],
  },
  {
    id: 'varanasi-kashi',
    name: 'Varanasi & Kashi Temple',
    country: 'Uttar Pradesh · Sacred Temples',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 5499,
    bestSeason: 'October – March',
    idealDuration: '3–4 Days',
    imageUrl: '/src/assets/images/india_kashi_temple_1794982488435.jpg',
    tagline:
      'Ancient Kashi Vishwanath temple spires, sunrise boat rides on the Ganga, and glowing evening aarti.',
    easyDescription:
      'Varanasi is one of the oldest living cities in the world and feels deeply peaceful once you step onto its river ghats. Visit the golden-spired Kashi Vishwanath Temple, glide along the Ganga in a quiet wooden boat at dawn, and witness hundreds of oil lamps lit together at sunset.',
    highlights: [
      'Guided darshan walk through the new Kashi Vishwanath Corridor',
      'Sunrise & sunset wooden rowboat rides along historic Ganga ghats',
      'Front-row boat view of the evening Dashashwamedh Ganga Aarti',
    ],
    gallery: [
      {
        id: 'kashi-1',
        title: 'Kashi Vishwanath Temple Corridor',
        imageUrl: '/src/assets/images/india_kashi_temple_1794982488435.jpg',
        description:
          'Walk through intricately carved sandstone pillars leading straight to the gleaming gold-plated spire of Kashi Vishwanath.',
      },
      {
        id: 'kashi-2',
        title: 'Dashashwamedh Ghat Evening Aarti',
        imageUrl: '/src/assets/images/india_kashi_ghats_1794982488101.jpg',
        description:
          'As dusk settles, thousands gather on stone steps and wooden boats to watch synchronized brass oil lamps and river chants.',
      },
      {
        id: 'kashi-3',
        title: 'Rishikesh Upstream Ganga',
        imageUrl: '/src/assets/images/india_rishikesh_ganga_1794982488813.jpg',
        description:
          'Follow the sacred river upstream to the Himalayan foothills where emerald waters flow gently beneath forested hills.',
      },
      {
        id: 'kashi-4',
        title: 'Golden Temple Reflection',
        imageUrl: '/src/assets/images/india_golden_temple_1794982490078.jpg',
        description:
          'Combine your spiritual circuit with Amritsar’s serene Sarovar pool and peaceful morning prayers.',
      },
    ],
  },
  {
    id: 'kedarnath-rishikesh',
    name: 'Kedarnath & Rishikesh',
    country: 'Uttarakhand · Himalayan Temples',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 8499,
    bestSeason: 'May – June, Sep – Oct',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_kedarnath_temple_1794982489180.jpg',
    tagline:
      'Ancient stone Kedarnath Temple framed by snowy Himalayan peaks, paired with Rishikesh river serenity.',
    easyDescription:
      'A deeply moving blend of high-mountain scenery and sacred tradition. Begin by resting beside the clear emerald Ganga in Rishikesh, then journey into Uttarakhand’s dramatic valleys to stand before the 1,000-year-old stone Kedarnath Temple surrounded by snow peaks.',
    highlights: [
      'Comfortable valley stays in Rishikesh, Guptkashi & Sonprayag',
      'Organized Kedarnath temple darshan & scenic mountain trail assistance',
      'Evening Ganga Aarti by the quiet white sands of Rishikesh',
    ],
    gallery: [
      {
        id: 'kedar-1',
        title: 'Kedarnath Temple & Snow Peaks',
        imageUrl: '/src/assets/images/india_kedarnath_temple_1794982489180.jpg',
        description:
          'Perched at 3,583 meters, this ancient stone shrine stands calmly against towering snowy Himalayan walls and misty streams.',
      },
      {
        id: 'kedar-2',
        title: 'Rishikesh Suspension Bridge & Ganga',
        imageUrl: '/src/assets/images/india_rishikesh_ganga_1794982488813.jpg',
        description:
          'Start your ascent gently in Rishikesh with sunrise walks across the iconic bridge and riverside meditation.',
      },
      {
        id: 'kedar-3',
        title: 'Himalayan Cedar River Trails',
        imageUrl: '/src/assets/images/dest_manali_1794981285289.jpg',
        description:
          'Crisp mountain air, rushing glacial rivers, and tall deodar pine forests line the northern hill routes.',
      },
      {
        id: 'kedar-4',
        title: 'High Alpine Meadow Views',
        imageUrl: '/src/assets/images/manali_solang_valley_1794982490917.jpg',
        description:
          'Expansive green summer valleys beneath snow-capped ridges offer unforgettable spots to pause and breathe.',
      },
    ],
  },
  {
    id: 'madurai-hampi',
    name: 'Hampi & Madurai Temples',
    country: 'Karnataka & Tamil Nadu · South Heritage',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 7499,
    bestSeason: 'November – February',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_hampi_chariot_1794982490213.jpg',
    tagline:
      'Explore Hampi’s carved granite Stone Chariot and Madurai’s towering colorful Meenakshi Temple.',
    easyDescription:
      'Discover South India’s finest architectural marvels without rushed crowds. Marvel at the famous carved Stone Chariot set among golden boulders in Hampi, and walk beneath the vibrant, intricately sculpted gopuram towers of Madurai’s Meenakshi Amman Temple.',
    highlights: [
      'Sunset guided walk at Hampi’s Vittala Temple & Stone Chariot',
      'Private heritage tour of Madurai’s Meenakshi Amman Temple',
      'Comfortable boutique stays and local South Indian culinary walks',
    ],
    gallery: [
      {
        id: 'south-1',
        title: 'Vittala Stone Chariot, Hampi',
        imageUrl: '/src/assets/images/india_hampi_chariot_1794982490213.jpg',
        description:
          'An iconic 16th-century granite chariot carved with moving stone wheels, framed by sunset boulders and coconut palms.',
      },
      {
        id: 'south-2',
        title: 'Meenakshi Amman Temple Gopuram',
        imageUrl: '/src/assets/images/india_meenakshi_temple_1794982490447.jpg',
        description:
          'Rising high over Madurai, these colorful tiered gateways showcase thousands of hand-painted and carved stone sculptures.',
      },
      {
        id: 'south-3',
        title: 'Konark Sun Temple Stone Craft',
        imageUrl: '/src/assets/images/india_konark_temple_1795340627921.jpg',
        description:
          'Compare South Indian granite chariot carvings with Odisha’s famed 13th-century Sun Temple wheels.',
      },
      {
        id: 'south-4',
        title: 'Kashi Heritage Architecture',
        imageUrl: '/src/assets/images/india_kashi_temple_1794982488435.jpg',
        description:
          'See how Dravidian South Indian gopurams contrast beautifully with North India’s Nagara-style sandstone shikharas.',
      },
    ],
  },
  {
    id: 'amritsar-golden-temple',
    name: 'Amritsar & Golden Temple',
    country: 'Punjab · Sacred Heritage',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 4299,
    bestSeason: 'October – March',
    idealDuration: '2–3 Days',
    imageUrl: '/src/assets/images/india_golden_temple_1794982490078.jpg',
    tagline:
      'Golden reflection on the Amrit Sarovar, soulful morning kirtan, and warm Punjabi hospitality.',
    easyDescription:
      'Step into the serene marble courtyard of Sri Harmandir Sahib (Golden Temple), where gilded domes shimmer across sacred water day and night. Experience the world’s largest community kitchen (Langar), stroll historic Amritsar bazaars, and visit Jallianwala Bagh.',
    highlights: [
      'Early-morning Palki Sahib ceremony at the Golden Temple',
      'Guided heritage walk through Old Amritsar & Partition Museum',
      'Authentic Amritsari kulcha & lassi culinary trail',
    ],
    gallery: [
      {
        id: 'amr-1',
        title: 'Sri Harmandir Sahib Reflection',
        imageUrl: '/src/assets/images/india_golden_temple_1794982490078.jpg',
        description:
          'Soft golden light reflects off the tranquil Amrit Sarovar while devotional hymns echo gently across the marble parikrama.',
      },
      {
        id: 'amr-2',
        title: 'Rishikesh Ganga Spiritual Link',
        imageUrl: '/src/assets/images/india_rishikesh_ganga_1794982488813.jpg',
        description:
          'Pair Punjab’s sacred shrine with a peaceful Himalayan river retreat just an overnight train away.',
      },
      {
        id: 'amr-3',
        title: 'Taj Mahal North India Route',
        imageUrl: '/src/assets/images/india_taj_mahal_1794982487231.jpg',
        description:
          'Connect Amritsar seamlessly with Delhi and Agra for an iconic North India heritage week.',
      },
      {
        id: 'amr-4',
        title: 'Dal Lake Northern Extension',
        imageUrl: '/src/assets/images/dest_kashmir_1794981286401.jpg',
        description:
          'Amritsar is a favorite gateway stopover before flying north into Srinagar and the Kashmir Valley.',
      },
    ],
  },
  {
    id: 'konark-puri',
    name: 'Konark & Puri Temple Trail',
    country: 'Odisha · East India Heritage',
    regionCategory: 'Indian Wonders & Temples',
    startingPriceInr: 5299,
    bestSeason: 'October – February',
    idealDuration: '3–4 Days',
    imageUrl: '/src/assets/images/india_konark_temple_1795340627921.jpg',
    tagline:
      'UNESCO-listed Konark Sun Temple stone chariot wheels, Puri Jagannath traditions, and golden beaches.',
    easyDescription:
      'Discover East India’s crowning architectural treasure. Walk around the 13th-century Konark Sun Temple shaped like a colossal stone chariot pulled by seven horses, visit sacred Puri Jagannath Dham, and enjoy calm mornings along the Bay of Bengal coast.',
    highlights: [
      'Sunrise historian tour of UNESCO-listed Konark Sun Temple',
      'Guided darshan assistance at Shri Jagannath Temple, Puri',
      'Peaceful drive along Marine Drive & Chilika Lake dolphin sanctuary',
    ],
    gallery: [
      {
        id: 'kon-1',
        title: 'Konark Sun Temple Chariot Wheel',
        imageUrl: '/src/assets/images/india_konark_temple_1795340627921.jpg',
        description:
          'Twenty-four intricately carved sandstone wheels act as accurate sundials bathed in warm morning light.',
      },
      {
        id: 'kon-2',
        title: 'Hampi Stone Chariot Companion',
        imageUrl: '/src/assets/images/india_hampi_chariot_1794982490213.jpg',
        description:
          'Pair Odisha’s Kalinga architecture with Vijayanagara’s iconic stone chariot in South India.',
      },
      {
        id: 'kon-3',
        title: 'Golden Bay of Bengal Coast',
        imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
        description:
          'Unwind along quiet palm-fringed coastal stretches between Puri and Konark at sunset.',
      },
      {
        id: 'kon-4',
        title: 'Kashi Sacred Heritage Link',
        imageUrl: '/src/assets/images/india_kashi_temple_1794982488435.jpg',
        description:
          'Connect East India’s coastal temples with Varanasi for a complete sacred India pilgrimage.',
      },
    ],
  },
  {
    id: 'manali',
    name: 'Manali & Solang',
    country: 'Himachal Pradesh · Himalayas',
    regionCategory: 'Mountains',
    startingPriceInr: 5999,
    bestSeason: 'March – June, Oct',
    idealDuration: '4–5 Days',
    imageUrl: '/src/assets/images/dest_manali_1794981285289.jpg',
    tagline:
      'Deodar cedar forests, clear mountain streams, Solang meadows, and cozy riverside stays.',
    easyDescription:
      'A classic, easy-to-reach Himalayan escape. Spend quiet mornings walking beside the Beas river under tall pine trees, ride up to Solang Valley’s open green slopes, and enjoy warm Himachali hospitality in wooden mountain cottages.',
    highlights: [
      'Private riverside cottage in Old Manali away from traffic',
      'Full-day excursion to Solang Valley & Atal Tunnel snow viewpoints',
      'Guided cedar forest trail walk & local orchard cafe stops',
    ],
    gallery: [
      {
        id: 'manali-1',
        title: 'Beas River & Deodar Forest Trail',
        imageUrl: '/src/assets/images/dest_manali_1794981285289.jpg',
        description:
          'Gentle stone footpaths beside rushing glacial water lined with tall cedar trees and clear views of snowy peaks.',
      },
      {
        id: 'manali-2',
        title: 'Solang Valley Green Meadows',
        imageUrl: '/src/assets/images/manali_solang_valley_1794982490917.jpg',
        description:
          'Wide wildflower meadows ideal for picnics, cable-car rides, and soft mountain sunsets.',
      },
      {
        id: 'manali-3',
        title: 'Himalayan Temple Architecture',
        imageUrl: '/src/assets/images/india_kedarnath_temple_1794982489180.jpg',
        description:
          'Experience traditional carved stone and timber Himalayan shrines nestled below snow ridges.',
      },
      {
        id: 'manali-4',
        title: 'Rishikesh Foothill River',
        imageUrl: '/src/assets/images/india_rishikesh_ganga_1794982488813.jpg',
        description:
          'Extend your northern hill trip south to Rishikesh’s calm riverbanks and sunrise suspension bridge walks.',
      },
    ],
  },
  {
    id: 'kashmir',
    name: 'Kashmir Valley',
    country: 'Jammu & Kashmir · Srinagar & Gulmarg',
    regionCategory: 'Mountains',
    startingPriceInr: 9499,
    bestSeason: 'April – October',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/dest_kashmir_1794981286401.jpg',
    tagline:
      'Calm dawn shikara rides on Dal Lake, cedar houseboats, and Gulmarg’s wildflower meadows.',
    easyDescription:
      'Often called heaven on earth, Kashmir moves at a gentle, poetic pace. Wake up inside a carved walnut-wood houseboat on Dal Lake, sip hot Kahwa tea as mist lifts off the water, and head up to Gulmarg’s endless green flower meadows.',
    highlights: [
      'Heritage cedar houseboat stay on quiet Nigeen & Dal Lake',
      'Private sunrise shikara ride past floating gardens',
      'Gulmarg Gondola ride & wildflower valley picnic',
    ],
    gallery: [
      {
        id: 'kash-1',
        title: 'Dal Lake Dawn Shikara Ride',
        imageUrl: '/src/assets/images/dest_kashmir_1794981286401.jpg',
        description:
          'Watch the rose-pink morning sky reflect across mirror-calm water as wooden shikaras glide past snow-capped peaks.',
      },
      {
        id: 'kash-2',
        title: 'Gulmarg Wildflower Meadows',
        imageUrl: '/src/assets/images/kashmir_gulmarg_meadow_1794982493657.jpg',
        description:
          'Vast green pastures dotted with yellow and purple wildflowers beneath jagged Himalayan summits.',
      },
      {
        id: 'kash-3',
        title: 'Amritsar Golden Temple Stopover',
        imageUrl: '/src/assets/images/india_golden_temple_1794982490078.jpg',
        description:
          'Many travelers pair Kashmir with a peaceful evening visit to the Golden Temple in Amritsar.',
      },
      {
        id: 'kash-4',
        title: 'Northern Alpine River Valleys',
        imageUrl: '/src/assets/images/dest_manali_1794981285289.jpg',
        description:
          'Crystal snowmelt streams and quiet pine groves similar to Pahalgam’s famed Lidder valley.',
      },
    ],
  },
  {
    id: 'leh-ladakh',
    name: 'Leh & Ladakh',
    country: 'Ladakh · Trans-Himalayas',
    regionCategory: 'Mountains',
    startingPriceInr: 13999,
    bestSeason: 'May – September',
    idealDuration: '6–7 Days',
    imageUrl: '/src/assets/images/india_ladakh_pangong_1795340608313.jpg',
    tagline:
      'Sapphire waters of Pangong Tso Lake, whitewashed cliffside monasteries, and Nubra sand dunes.',
    easyDescription:
      'A high-altitude land of dramatic mountain passes and crystal-clear blue skies. Take time to acclimatize gently in Leh’s warm guesthouses, visit peaceful Thiksey Monastery, ride over Khardung La into Nubra Valley, and gaze across color-shifting Pangong Lake.',
    highlights: [
      'Unrushed acclimatization itinerary with oxygen-supported SUV',
      'Sunrise lakeside camp stay near Pangong Tso',
      'Thiksey Monastery morning prayers & Nubra Valley double-humped camel dunes',
    ],
    gallery: [
      {
        id: 'lad-1',
        title: 'Pangong Tso Alpine Lake',
        imageUrl: '/src/assets/images/india_ladakh_pangong_1795340608313.jpg',
        description:
          'Stretching across rugged golden Himalayan slopes, Pangong Lake shifts from turquoise to deep cobalt under crisp skies.',
      },
      {
        id: 'lad-2',
        title: 'High Mountain Pass Meadows',
        imageUrl: '/src/assets/images/manali_solang_valley_1794982490917.jpg',
        description:
          'The overland Manali–Leh highway climbs through sweeping alpine pastures and snow-crowned passes.',
      },
      {
        id: 'lad-3',
        title: 'Kashmir to Ladakh Circuit',
        imageUrl: '/src/assets/images/kashmir_gulmarg_meadow_1794982493657.jpg',
        description:
          'Connect Srinagar’s lush green valleys with Ladakh’s stark high-desert peaks via Zoji La pass.',
      },
      {
        id: 'lad-4',
        title: 'Himalayan River Trails',
        imageUrl: '/src/assets/images/dest_manali_1794981285289.jpg',
        description:
          'Clear snowmelt rivers carve deep valleys through the western Indian Himalayas.',
      },
    ],
  },
  {
    id: 'darjeeling-sikkim',
    name: 'Darjeeling & Sikkim',
    country: 'West Bengal & Sikkim · East Himalayas',
    regionCategory: 'Mountains',
    startingPriceInr: 8999,
    bestSeason: 'March – May, Oct – Dec',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_darjeeling_hills_1795340608275.jpg',
    tagline:
      'Misty emerald tea estates, sunrise over Mount Kanchenjunga, and tranquil Gangtok monasteries.',
    easyDescription:
      'Wake up to fresh mountain tea overlooking the world’s third-highest peak. Ride the heritage Darjeeling Toy Train past cloud-wrapped hills, walk along sloping emerald tea gardens, and continue to Gangtok’s serene monasteries and glacial Tsomgo Lake.',
    highlights: [
      'Tiger Hill dawn view of golden sunlight hitting Kanchenjunga',
      'Heritage tea estate stay with private tasting walk',
      'Scenic drive into Gangtok, Rumtek Monastery & Tsomgo Lake',
    ],
    gallery: [
      {
        id: 'dar-1',
        title: 'Darjeeling Tea Gardens & Kanchenjunga',
        imageUrl: '/src/assets/images/india_darjeeling_hills_1795340608275.jpg',
        description:
          'Rolling emerald tea terraces draped in morning mist with towering snowy Himalayan ridges on the horizon.',
      },
      {
        id: 'dar-2',
        title: 'High Eastern Himalayan Valleys',
        imageUrl: '/src/assets/images/wanderly_hero_mountains_1794981284218.jpg',
        description:
          'Quiet pine ridges and fresh mountain streams frame every turn along the Sikkim hill road.',
      },
      {
        id: 'dar-3',
        title: 'Northeast River Extension',
        imageUrl: '/src/assets/images/india_meghalaya_dawki_1795340627252.jpg',
        description:
          'Pair East Himalayan tea hills with Meghalaya’s crystal-clear emerald rivers.',
      },
      {
        id: 'dar-4',
        title: 'Southern Tea Hills Comparison',
        imageUrl: '/src/assets/images/india_munnar_hills_1795340627288.jpg',
        description:
          'See how Darjeeling’s crisp Himalayan tea slopes compare with Munnar’s lush Western Ghats estates.',
      },
    ],
  },
  {
    id: 'meghalaya-shillong',
    name: 'Meghalaya & Shillong',
    country: 'Meghalaya · Northeast India',
    regionCategory: 'Mountains',
    startingPriceInr: 9999,
    bestSeason: 'October – April',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_meghalaya_dawki_1795340627252.jpg',
    tagline:
      'Crystal-clear Umngot River at Dawki, living root bridges of Cherrapunji, and misty Khasi hills.',
    easyDescription:
      'Known as the abode of clouds, Meghalaya feels unlike anywhere else in India. Glide in a wooden boat over Dawki’s glass-clear green river where pebbles shine beneath you, walk across centuries-old living root bridges, and explore Mawlynnong—Asia’s cleanest village.',
    highlights: [
      'Private boat ride on Dawki’s crystal-clear Umngot River',
      'Guided trek to Cherrapunji’s Double-Decker Living Root Bridge',
      'Mawlynnong cleanest village visit & Shillong cafe culture',
    ],
    gallery: [
      {
        id: 'meg-1',
        title: 'Umngot River, Dawki',
        imageUrl: '/src/assets/images/india_meghalaya_dawki_1795340627252.jpg',
        description:
          'Transparent emerald river water makes wooden country boats look as if they are floating mid-air.',
      },
      {
        id: 'meg-2',
        title: 'Misty Eastern Hill Slopes',
        imageUrl: '/src/assets/images/india_darjeeling_hills_1795340608275.jpg',
        description:
          'Soft drifting clouds weave across green terraced hillsides throughout the morning.',
      },
      {
        id: 'meg-3',
        title: 'Cloud-Wrapped Rain Hills',
        imageUrl: '/src/assets/images/india_munnar_hills_1795340627288.jpg',
        description:
          'Verdant plateaus and winding trails surrounded by pine and bamboo groves.',
      },
      {
        id: 'meg-4',
        title: 'Clear Mountain Stream Heritage',
        imageUrl: '/src/assets/images/india_rishikesh_ganga_1794982488813.jpg',
        description:
          'Pure river corridors framed by forested gorges offer calm spots to pause.',
      },
    ],
  },
  {
    id: 'kerala-munnar',
    name: 'Kerala Backwaters & Munnar',
    country: 'Kerala · South India',
    regionCategory: 'Tropical & Coastal',
    startingPriceInr: 8999,
    bestSeason: 'September – March',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_kerala_backwaters_1795340608631.jpg',
    tagline:
      'Emerald Alleppey backwater houseboats, misty Munnar tea hills, and warm spice plantations.',
    easyDescription:
      'Slow down in God’s Own Country with a seamless blend of cool misty hills and palm-lined lagoons. Spend two peaceful nights amid Munnar’s rolling emerald tea estates, then board a private wooden kettuvallam houseboat in Alleppey for freshly cooked Kerala meals on calm water.',
    highlights: [
      'Overnight private wooden houseboat cruise in Alleppey backwaters',
      'Boutique hillside resort amidst Munnar tea & cardamom plantations',
      'Fort Kochi heritage walk & traditional Kathakali evening performance',
    ],
    gallery: [
      {
        id: 'ker-1',
        title: 'Alleppey Backwater Houseboat',
        imageUrl: '/src/assets/images/india_kerala_backwaters_1795340608631.jpg',
        description:
          'Drift calmly along coconut-shaded canals at sunset aboard a hand-crafted traditional wooden boat.',
      },
      {
        id: 'ker-2',
        title: 'Munnar Emerald Tea Plantations',
        imageUrl: '/src/assets/images/india_munnar_hills_1795340627288.jpg',
        description:
          'Cool misty ridges covered in manicured green tea gardens across the Western Ghats.',
      },
      {
        id: 'ker-3',
        title: 'Madurai Temple Short Link',
        imageUrl: '/src/assets/images/india_meenakshi_temple_1794982490447.jpg',
        description:
          'Just a scenic drive over the Western Ghats from Munnar lies Madurai’s iconic Meenakshi Temple.',
      },
      {
        id: 'ker-4',
        title: 'Arabian Sea Sunset Shores',
        imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
        description:
          'Extend to Kovalam or Marari’s quiet palm beaches along India’s lush southwestern coast.',
      },
    ],
  },
  {
    id: 'goa',
    name: 'Goa Beaches & Old Goa',
    country: 'Goa · West Coast',
    regionCategory: 'Tropical & Coastal',
    startingPriceInr: 5999,
    bestSeason: 'November – February',
    idealDuration: '4–5 Days',
    imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
    tagline:
      'Golden South Goa coves, historic Fontainhas pastel lanes, and relaxed seaside shack sunsets.',
    easyDescription:
      'Experience the calmer, more soulful side of Goa. Stay steps from South Goa’s uncrowded golden sands, wander through Panjim’s colorful heritage Latin Quarter, visit 16th-century Old Goa churches, and enjoy unhurried sunset dinners by the Arabian Sea.',
    highlights: [
      'Boutique beachside stay near Palolem or Agonda in South Goa',
      'Guided heritage walk in Fontainhas Latin Quarter & Old Goa',
      'Mandovi river sunset cruise & coastal spice farm lunch',
    ],
    gallery: [
      {
        id: 'goa-1',
        title: 'South Goa Sunset Cove',
        imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
        description:
          'Leaning coconut palms and soft golden sand glow amber as gentle Arabian Sea waves roll ashore.',
      },
      {
        id: 'goa-2',
        title: 'Mumbai Konkan Coast Link',
        imageUrl: '/src/assets/images/india_mumbai_gateway_1795340607922.jpg',
        description:
          'Connected by scenic coastal train or a quick 1-hour flight straight from Mumbai.',
      },
      {
        id: 'goa-3',
        title: 'Hampi Deccan Heritage Hop',
        imageUrl: '/src/assets/images/india_hampi_chariot_1794982490213.jpg',
        description:
          'Combine coastal relaxation in Goa with an overnight heritage excursion to Hampi’s stone temples.',
      },
      {
        id: 'goa-4',
        title: 'West Coast Backwater Groves',
        imageUrl: '/src/assets/images/india_kerala_backwaters_1795340608631.jpg',
        description:
          'Explore Goa’s peaceful Chapora and Zuari river mangroves lined with lush tropical palms.',
      },
    ],
  },
  {
    id: 'andaman-havelock',
    name: 'Andaman & Havelock Islands',
    country: 'Andaman & Nicobar · Bay of Bengal',
    regionCategory: 'Tropical & Coastal',
    startingPriceInr: 14999,
    bestSeason: 'October – May',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_andaman_havelock_1795340608293.jpg',
    tagline:
      'Crystal turquoise waters at Radhanagar Beach, vibrant coral reefs, and rainforest island calm.',
    easyDescription:
      'India’s finest tropical island paradise—no passport required. Ferry from Port Blair to Swaraj Dweep (Havelock Island), swim in the glass-clear waters of Asia’s top-rated Radhanagar Beach, snorkel over colorful coral reefs at Elephant Beach, and stargaze on Neil Island.',
    highlights: [
      'Private eco-resort stay near Radhanagar Beach, Havelock Island',
      'High-speed catamaran ferries across Port Blair, Havelock & Neil Island',
      'Guided coral-reef snorkeling & Cellular Jail evening sound show',
    ],
    gallery: [
      {
        id: 'and-1',
        title: 'Radhanagar Beach, Havelock Island',
        imageUrl: '/src/assets/images/india_andaman_havelock_1795340608293.jpg',
        description:
          'Powder-soft white sand meets calm turquoise Bay of Bengal waters bordered by ancient tropical rainforest.',
      },
      {
        id: 'and-2',
        title: 'Golden Island Sunset Shores',
        imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
        description:
          'Quiet sunset walks along palm-lined coves at Lakshmanpur Beach on Neil Island.',
      },
      {
        id: 'and-3',
        title: 'Glass-Clear Lagoon Waters',
        imageUrl: '/src/assets/images/india_meghalaya_dawki_1795340627252.jpg',
        description:
          'Crystal visibility lets you spot coral gardens and reef fish right from shallow island boats.',
      },
      {
        id: 'and-4',
        title: 'Coastal Palm Sanctuaries',
        imageUrl: '/src/assets/images/india_kerala_backwaters_1795340608631.jpg',
        description:
          'Lush island coconut groves and coastal lagoons keep every morning calm and unhurried.',
      },
    ],
  },
  {
    id: 'jaipur-udaipur',
    name: 'Jaipur & Udaipur',
    country: 'Rajasthan · Royal Cities',
    regionCategory: 'Iconic Cities',
    startingPriceInr: 7499,
    bestSeason: 'October – March',
    idealDuration: '5–6 Days',
    imageUrl: '/src/assets/images/india_udaipur_palace_1795340607936.jpg',
    tagline:
      'Udaipur’s golden Lake Pichola palaces paired with Jaipur’s rose-pink Hawa Mahal & Amer Fort.',
    easyDescription:
      'Step into India’s royal heritage without stress. Watch sunset boats glide past Udaipur’s marble Lake Palace against the Aravalli hills, then travel to Jaipur to admire Hawa Mahal’s 953 carved windows, Amer Fort’s mirrored halls, and colorful block-print bazaars.',
    highlights: [
      'Sunset boat cruise on Lake Pichola & Udaipur City Palace tour',
      'Sunrise visit to Jaipur’s Hawa Mahal & hilltop Amer Fort',
      'Heritage haveli stays with authentic Rajasthani thali dinner',
    ],
    gallery: [
      {
        id: 'raj-1',
        title: 'Lake Pichola & City Palace, Udaipur',
        imageUrl: '/src/assets/images/india_udaipur_palace_1795340607936.jpg',
        description:
          'Warm golden hour light illuminates royal sandstone domes reflecting calmly in Udaipur’s storied lake.',
      },
      {
        id: 'raj-2',
        title: 'Hawa Mahal, Pink City Jaipur',
        imageUrl: '/src/assets/images/india_jaipur_hawa_1794982490936.jpg',
        description:
          'Jaipur’s iconic honeycomb palace facade glows rosy pink in morning sunlight above bustling old-city markets.',
      },
      {
        id: 'raj-3',
        title: 'Agra Fort Golden Triangle Link',
        imageUrl: '/src/assets/images/india_agra_fort_1794982487266.jpg',
        description:
          'Connect Rajasthan seamlessly with Agra’s grand red sandstone forts along the classic Golden Triangle.',
      },
      {
        id: 'raj-4',
        title: 'Taj Mahal Sunrise Extension',
        imageUrl: '/src/assets/images/india_taj_mahal_1794982487231.jpg',
        description:
          'Complete your royal heritage journey with dawn entry at India’s timeless marble wonder.',
      },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai & Konkan Coast',
    country: 'Maharashtra · City of Dreams',
    regionCategory: 'Iconic Cities',
    startingPriceInr: 5799,
    bestSeason: 'November – February',
    idealDuration: '3–4 Days',
    imageUrl: '/src/assets/images/india_mumbai_gateway_1795340607922.jpg',
    tagline:
      'Gateway of India harbor twilight, Marine Drive sea breeze, and UNESCO Elephanta Caves.',
    easyDescription:
      'Experience Mumbai’s timeless coastal charm and Victorian-Gothic heritage. Stroll Colaba’s tree-lined art galleries, take a morning ferry from the Gateway of India to the ancient rock-cut Elephanta Caves, and watch evening lights shimmer along Marine Drive.',
    highlights: [
      'Private heritage walk across Colaba, Kala Ghoda & Fort district',
      'Morning ferry excursion from Gateway of India to Elephanta Caves',
      'Marine Drive sunset promenade & authentic Mumbai street food tour',
    ],
    gallery: [
      {
        id: 'mum-1',
        title: 'Gateway of India & Harbor Twilight',
        imageUrl: '/src/assets/images/india_mumbai_gateway_1795340607922.jpg',
        description:
          'Golden architectural lights illuminate the Gateway of India and Taj Mahal Palace beside gentle Arabian Sea ferries.',
      },
      {
        id: 'mum-2',
        title: 'Konkan & Goa Coastal Drive',
        imageUrl: '/src/assets/images/india_goa_beach_1795340607666.jpg',
        description:
          'Head south along Maharashtra’s scenic Konkan coastline toward quiet beaches and sea forts.',
      },
      {
        id: 'mum-3',
        title: 'Sahyadri Western Ghats Mist',
        imageUrl: '/src/assets/images/india_munnar_hills_1795340627288.jpg',
        description:
          'Just two hours from Mumbai, lush Sahyadri hill stations offer cool mist and green valleys.',
      },
      {
        id: 'mum-4',
        title: 'Deccan Rock-Cut & Stone Heritage',
        imageUrl: '/src/assets/images/india_hampi_chariot_1794982490213.jpg',
        description:
          'Pair Mumbai’s coastal islands with ancient Deccan stone carving wonders like Ajanta, Ellora, and Hampi.',
      },
    ],
  },
];

export const FEATURED_PACKAGES: TravelPackage[] = [
  {
    id: 'pkg-taj-heritage',
    destinationId: 'agra-taj',
    title: 'Taj Mahal Sunrise & Royal Jaipur Trail',
    locationLabel: 'Agra & Jaipur, India · Golden Triangle',
    duration: '4 Days / 3 Nights',
    days: 4,
    pricePerGuestInr: 6999,
    rating: 4.9,
    reviewCount: 284,
    description:
      'Witness the Taj Mahal at first light, tour Agra Fort with a local guide, and continue to Jaipur’s rose-sandstone Hawa Mahal with comfortable AC travel.',
    imageUrl: '/src/assets/images/india_taj_mahal_1794982487231.jpg',
    inclusions: ['Clean heritage stays', 'Taj Mahal sunrise entry', 'Comfortable AC transfers'],
  },
  {
    id: 'pkg-kashi-kedarnath',
    destinationId: 'varanasi-kashi',
    title: 'Sacred Kashi Temple & Ganga Aarti Retreat',
    locationLabel: 'Varanasi, Uttar Pradesh · Spiritual Heritage',
    duration: '4 Days / 3 Nights',
    days: 4,
    pricePerGuestInr: 6499,
    rating: 4.9,
    reviewCount: 196,
    description:
      'Guided Kashi Vishwanath darshan, peaceful dawn boat rides along the ghats, Sarnath heritage walk, and evening Ganga Aarti views.',
    imageUrl: '/src/assets/images/india_kashi_ghats_1794982488101.jpg',
    inclusions: ['Ghat-side cozy stays', 'Dawn & dusk boat rides', 'Local spiritual guide'],
  },
  {
    id: 'pkg-kedarnath-yatra',
    destinationId: 'kedarnath-rishikesh',
    title: 'Kedarnath Dham & Rishikesh Himalayan Circuit',
    locationLabel: 'Uttarakhand, India · Sacred Himalayas',
    duration: '6 Days / 5 Nights',
    days: 6,
    pricePerGuestInr: 9999,
    rating: 4.9,
    reviewCount: 162,
    description:
      'Travel smoothly from Rishikesh’s tranquil Ganga riverbanks up into high snow peaks for a guided, budget-friendly Kedarnath Temple yatra.',
    imageUrl: '/src/assets/images/india_kedarnath_temple_1794982489180.jpg',
    inclusions: ['Clean valley lodges', 'Darshan registration help', 'All hill transfers & meals'],
  },
  {
    id: 'pkg-kashmir-horizon',
    destinationId: 'kashmir',
    title: 'Dal Lake Houseboat & Gulmarg Meadows',
    locationLabel: 'Kashmir, India · Srinagar & Gulmarg',
    duration: '5 Days / 4 Nights',
    days: 5,
    pricePerGuestInr: 10499,
    rating: 4.8,
    reviewCount: 174,
    description:
      'Drift across Dal Lake at dawn in a traditional shikara, stay aboard a cozy wooden houseboat, and explore Gulmarg’s flower meadows.',
    imageUrl: '/src/assets/images/dest_kashmir_1794981286401.jpg',
    inclusions: ['Cedar houseboat stay', 'Dawn shikara boat ride', 'Gulmarg cab transfers'],
  },
  {
    id: 'pkg-ladakh-pangong',
    destinationId: 'leh-ladakh',
    title: 'Pangong Lake & Leh Monasteries Expedition',
    locationLabel: 'Ladakh, India · Trans-Himalayas',
    duration: '7 Days / 6 Nights',
    days: 7,
    pricePerGuestInr: 15499,
    rating: 4.9,
    reviewCount: 148,
    description:
      'Acclimatize comfortably in Leh, cross Khardung La to Nubra Valley dunes, and wake beside the sapphire waters of Pangong Tso.',
    imageUrl: '/src/assets/images/india_ladakh_pangong_1795340608313.jpg',
    inclusions: ['Cozy Leh guesthouses', 'Shared/private SUV tour', 'Pangong lakeside camp'],
  },
  {
    id: 'pkg-kerala-backwaters',
    destinationId: 'kerala-munnar',
    title: 'Alleppey Houseboat & Munnar Misty Hills',
    locationLabel: 'Kerala, India · God’s Own Country',
    duration: '6 Days / 5 Nights',
    days: 6,
    pricePerGuestInr: 9999,
    rating: 4.9,
    reviewCount: 214,
    description:
      'Wake amid Munnar’s misty emerald tea estates, walk spice-scented trails, and glide along Alleppey’s palm-lined backwaters in a wooden houseboat.',
    imageUrl: '/src/assets/images/india_kerala_backwaters_1795340608631.jpg',
    inclusions: ['Kettuvallam houseboat', 'Munnar hill homestay', 'Traditional Kerala meals'],
  },
  {
    id: 'pkg-rajasthan-royal',
    destinationId: 'jaipur-udaipur',
    title: 'Royal Udaipur Lakes & Pink City Jaipur',
    locationLabel: 'Rajasthan, India · Udaipur & Jaipur',
    duration: '6 Days / 5 Nights',
    days: 6,
    pricePerGuestInr: 8499,
    rating: 4.9,
    reviewCount: 189,
    description:
      'Sail across golden Lake Pichola below Udaipur’s City Palace before exploring Jaipur’s Hawa Mahal, Amer Fort, and vibrant local bazaars.',
    imageUrl: '/src/assets/images/india_udaipur_palace_1795340607936.jpg',
    inclusions: ['Heritage haveli stays', 'Lake Pichola boat ride', 'Intercity AC transfers'],
  },
  {
    id: 'pkg-andaman-island',
    destinationId: 'andaman-havelock',
    title: 'Havelock Radhanagar Beach & Island Escape',
    locationLabel: 'Andaman Islands, India · Swaraj Dweep',
    duration: '6 Days / 5 Nights',
    days: 6,
    pricePerGuestInr: 15999,
    rating: 4.9,
    reviewCount: 137,
    description:
      'Ferry across turquoise island waters to Havelock and Neil Island, swim at Radhanagar Beach, and snorkel over vibrant coral reefs.',
    imageUrl: '/src/assets/images/india_andaman_havelock_1795340608293.jpg',
    inclusions: ['Cozy island stays', 'Inter-island ferries', 'Guided reef snorkeling'],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'rev-1',
    name: 'Claire Laurent',
    location: 'Visiting Agra & Jaipur',
    tripTaken: 'Taj Mahal & Jaipur Heritage · ₹6,999',
    rating: 5,
    quote:
      'Seeing the Taj Mahal in soft sunrise light at such an affordable price with zero queue stress was unforgettable. Musafir truly lived up to har safar ek nayi kahani.',
    avatarUrl: '/src/assets/images/avatar_claire_1794981287693.jpg',
  },
  {
    id: 'rev-2',
    name: 'Arjun Mehta',
    location: 'Mumbai, India',
    tripTaken: 'Kedarnath & Rishikesh Circuit · ₹9,999',
    rating: 5,
    quote:
      'Super budget-friendly! Everything from Rishikesh riverfront rooms to the mountain trail logistics was crystal clear in Rupees with zero surprise charges.',
    avatarUrl: '/src/assets/images/avatar_arjun_1794981287692.jpg',
  },
  {
    id: 'rev-3',
    name: 'Sophia Lin',
    location: 'Bengaluru, India',
    tripTaken: 'Varanasi Kashi & Ganga Aarti · ₹6,499',
    rating: 5,
    quote:
      'Our evening boat ride during Ganga Aarti and the peaceful sunrise walk through Kashi Vishwanath corridor felt magical, safe, and so easy on the pocket.',
    avatarUrl: '/src/assets/images/avatar_sophia_1794981288230.jpg',
  },
];
