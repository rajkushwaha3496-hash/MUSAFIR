// Place-specific food, accurate regional climate/season, and reachability helpers
// for all 560 Indian destinations in data/destinations-db.json

function hasAny(text, keywords) {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  return keywords.some((kw) => {
    const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return cleanKw.length > 0 && normalized.includes(` ${cleanKw} `);
  });
}

export function resolvePlaceFood(dest) {
  const id = (dest.id || '').toLowerCase();
  const name = (dest.name || '').toLowerCase();
  const district = (dest.district || '').toLowerCase();
  const state = dest.state || '';
  const category = dest.category || '';
  const key = `${id} ${name} ${district}`;

  // 1. Uttar Pradesh (split by cultural city / subregion)
  if (state === 'Uttar Pradesh') {
    if (hasAny(key, ['ayodhya'])) {
      return ['Tehri (Spiced Veg Rice)', 'Kachori Sabzi', 'Ram Laddu & Rabri', 'Bedmi Poori', 'Sattu Paratha'];
    }
    if (hasAny(key, ['varanasi', 'kashi', 'sarnath'])) {
      return ['Banarasi Kachori Sabzi', 'Tamatar Chaat', 'Malaiyyo (Winter)', 'Banarasi Lassi & Thandai', 'Chura Matar'];
    }
    if (hasAny(key, ['agra', 'taj-mahal', 'fatehpur-sikri', 'bateshwar'])) {
      return ['Agra Petha', 'Bedai & Jalebi', 'Agra Dalmoth', 'Mughlai Paratha', 'Aloo Tikki Chaat'];
    }
    if (hasAny(key, ['lucknow', 'naimisharanya', 'sitapur'])) {
      return ['Tunday Galouti Kabab', 'Lucknowi Biryani', 'Basket Chaat', 'Sheermal & Kulcha Nihari', 'Makhan Malai'];
    }
    if (hasAny(key, ['mathura', 'vrindavan', 'barsana', 'nandgaon'])) {
      return ['Mathura Peda', 'Bedmi Poori & Dubki Aloo', 'Makhan Mishri', 'Kulhad Lassi & Rabri', 'Heeng Kachori'];
    }
    if (hasAny(key, ['prayagraj', 'sangam'])) {
      return ['Allahabadi Chaat', 'Dehati Rasgulla', 'Kachori Sabzi', 'Allahabadi Surkha Guava', 'Sattu Sharbat'];
    }
    if (hasAny(key, ['jhansi', 'devgarh', 'lalitpur', 'kalinjar', 'banda', 'chitrakoot'])) {
      return ['Bundelkhandi Kadhi', 'Maalpua & Rabri', 'Bhakosa (Dal Dumplings)', 'Gond Pak', 'Bundeli Desi Thali'];
    }
    if (hasAny(key, ['meerut', 'hastinapur', 'sankisa', 'farrukhabad'])) {
      return ['Meerut Gajak & Rewari', 'Nankhatai', 'Chole Bhature', 'Kachori Sabzi', 'Sweet Lassi'];
    }
    if (hasAny(key, ['vindhyachal', 'mirzapur', 'kushinagar', 'shravasti', 'dudhwa', 'lakhimpur'])) {
      return ['Litti Chokha', 'Sattu Paratha', 'Kachori Sabzi', 'Khoya Jalebi', 'Purvanchal Thali'];
    }
    return ['Kachori Sabzi', 'Bedmi Poori', 'Aloo Chaat', 'Sattu Paratha', 'Kulhad Chai & Jalebi'];
  }

  // 2. Uttarakhand (split Garhwal, Kumaon, Foothills, Dehradun/Mussoorie)
  if (state === 'Uttarakhand') {
    if (hasAny(key, ['haridwar', 'rishikesh'])) {
      return ['Aloo Puri & Chole', 'Garhwali Thali', 'Kachori & Jalebi', 'Rajma Chawal', 'Kulhad Lassi & Herbal Tea'];
    }
    if (hasAny(key, ['mussoorie', 'dehradun', 'chakrata', 'lansdowne', 'pauri'])) {
      return ['Bun Tikki & Omelette', 'Tibetan Momos & Thukpa', 'Garhwali Thali', 'Stick Jaws & Bakery Treats', 'Hot Ginger Chai'];
    }
    if (hasAny(key, ['nainital', 'bhimtal', 'naukuchiatal', 'sattal', 'pangot', 'almora', 'ranikhet', 'kausani', 'bageshwar', 'mukteshwar', 'binsar', 'munsiyari', 'chaukori', 'jageshwar', 'patal', 'pithoragarh', 'abbott', 'champawat', 'corbett'])) {
      return ['Bal Mithai & Singori', 'Aloo Ke Gutke', 'Bhatt Ki Churkani', 'Bhang Ki Chutney', 'Kumaoni Raita & Thali'];
    }
    return ['Garhwali Kafuli', 'Chainsoo (Black Gram Curry)', 'Mandua Roti & Ghee', 'Hot Rajma Chawal', 'Pahadi Maggi & Ginger Chai'];
  }

  // 3. Himachal Pradesh (split Shimla, Kullu/Manali, Kangra/Dharamshala, Lahaul-Spiti, Kinnaur, Chamba, Mandi/Sirmaur)
  if (state === 'Himachal Pradesh') {
    if (hasAny(key, ['spiti', 'tabo', 'dhankar', 'chandratal', 'keylong', 'jispa', 'sissu', 'lahaul'])) {
      return ['Spitian Thukpa & Momos', 'Butter Tea (Po Cha)', 'Skyu & Tsampa', 'Sea Buckthorn Juice', 'Hot Rajma Chawal'];
    }
    if (hasAny(key, ['kalpa', 'chitkul', 'nako', 'reckong', 'kinnaur'])) {
      return ['Kinnauri Rajma Chawal', 'Chilra (Buckwheat Crepe)', 'Thukpa & Momos', 'Kinnauri Apples & Apricots', 'Salted Butter Tea'];
    }
    if (hasAny(key, ['dharamshala', 'mcleod', 'bir', 'triund', 'palampur', 'kangra'])) {
      return ['Tibetan Momos & Thenthuk', 'Kangra Dham', 'Laphing & Tingmo', 'Kangra Tea & Bakery Cakes', 'Chana Madra'];
    }
    if (hasAny(key, ['manali', 'kullu', 'kasol', 'tosh', 'malana', 'kheerganga', 'tirthan', 'jibhi', 'shoja', 'barot'])) {
      return ['Kullu Siddu & Ghee', 'Kullu Trout / Dham', 'Tibetan Thukpa & Momos', 'Kasol Pita & Shakshuka', 'Babru & Rajma Chawal'];
    }
    if (hasAny(key, ['dalhousie', 'khajjiar', 'chamba'])) {
      return ['Chamba Madra', 'Chamba Chukh & Dham', 'Rajma Chawal', 'Patande', 'Steamed Tibetan Momos'];
    }
    if (hasAny(key, ['prashar', 'tattapani', 'mandi', 'renuka', 'nahan', 'paonta', 'sirmaur'])) {
      return ['Mandi Sepu Vadi & Dham', 'Himachali Siddu', 'Kaddu Ka Khatta', 'Rajma Chawal', 'Pahadi Thali'];
    }
    return ['Himachali Siddu', 'Chana Madra', 'Samosa & Bun Chana', 'Babru', 'Apple Cider & Bakery Pies'];
  }

  // 4. Jammu and Kashmir
  if (state === 'Jammu and Kashmir') {
    if (hasAny(key, ['katra', 'vaishno', 'reasi', 'jammu', 'patnitop', 'udhampur', 'bhaderwah', 'doda'])) {
      return ['Jammu Rajma Chawal', 'Kalari Kulcha', 'Ambal & Khatta Meat', 'Patisa & Sund Panjiri', 'Aloo Puri & Chole'];
    }
    return ['Kashmiri Kahwa & Noon Chai', 'Nadru Yakhni (Lotus Stem)', 'Dum Aloo & Modur Pulav', 'Rogan Josh / Wazwan', 'Lavasa & Sheermal'];
  }

  // 5. Ladakh
  if (state === 'Ladakh') {
    if (hasAny(key, ['kargil', 'drass'])) {
      return ['Thukpa & Khambir Bread', 'Apricot Soup & Dried Apricots', 'Rajma Chawal', 'Butter Tea (Gur Gur)', 'Steamed Momos'];
    }
    return ['Thukpa & Mokthuk', 'Skyu (Traditional Stew)', 'Butter Tea (Gur Gur Chai)', 'Khambir & Apricot Jam', 'Momos & Sea Buckthorn Tea'];
  }

  // 6. Punjab & Chandigarh
  if (state === 'Punjab') {
    if (hasAny(key, ['amritsar', 'harike', 'tarn'])) {
      return ['Amritsari Kulcha & Chole', 'Golden Temple Langar Prasad', 'Sarson Ka Saag & Makki Roti', 'Pedewali Lassi', 'Pinni & Jalebi'];
    }
    return ['Chole Bhature', 'Sarson Ka Saag & Makki Roti', 'Rajma Chawal & Kadhi', 'Stuffed Tandoori Paratha', 'Sweet Lassi & Pinni'];
  }
  if (state === 'Chandigarh') {
    return ['Sector 17 Chole Bhature', 'Rajma Chawal & Kadhi', 'Amritsari Kulcha', 'Tandoori Momos & Rolls', 'Sweet Lassi'];
  }

  // 7. Haryana
  if (state === 'Haryana') {
    return ['Bajra Khichdi & Desi Ghee', 'Besan Masala Roti', 'Churma & Lassi', 'Kadhi Pakora Chawal', 'Aloo Paratha & Kachri Chutney'];
  }

  // 8. Delhi
  if (state === 'Delhi') {
    if (hasAny(key, ['red-fort', 'old-delhi', 'central-delhi'])) {
      return ['Paranthe Wali Gali Parathas', 'Daulat Ki Chaat (Winter)', 'Old Delhi Chole Bhature', 'Aloo Tikki Chaat', 'Shahi Tukda'];
    }
    return ['Dilli Chole Bhature', 'Rajma Chawal', 'Aloo Chaat & Golgappe', 'Momos & Kathi Rolls', 'North Indian Thali'];
  }

  // 9. Rajasthan (split by Jaipur, Jodhpur, Jaisalmer, Mewar/Udaipur, Bikaner/Shekhawati, Pushkar/Ajmer, Hadoti/Kota, Mewat/Alwar, Mount Abu)
  if (state === 'Rajasthan') {
    if (hasAny(key, ['jaisalmer'])) {
      return ['Ker Sangri & Bajra Roti', 'Dal Baati Churma', 'Pyaaz Kachori', 'Ghotua Ladoo', 'Makhaniya Lassi'];
    }
    if (hasAny(key, ['jodhpur', 'osian', 'khimsar', 'barmer'])) {
      return ['Jodhpuri Mirchi Vada', 'Mawa Kachori', 'Ker Sangri & Bajra Roti', 'Makhaniya Lassi', 'Dal Baati Churma'];
    }
    if (hasAny(key, ['bikaner', 'churu'])) {
      return ['Bikaneri Bhujia & Rasgulla', 'Dal Kachori', 'Ker Sangri', 'Gatte Ki Sabzi', 'Raj Kachori'];
    }
    if (hasAny(key, ['pushkar', 'ajmer'])) {
      return ['Pushkar Malpua & Rabri', 'Kadhi Kachori', 'Dal Baati Churma', 'Ajmer Sohan Halwa', 'Rose Lassi'];
    }
    if (hasAny(key, ['udaipur', 'chittorgarh', 'kumbhalgarh', 'nathdwara', 'eklingji', 'ranakpur', 'banswara', 'rajsamand', 'pali', 'jawai', 'menar', 'bassi'])) {
      return ['Mewari Dal Baati Churma', 'Gatte Ki Sabzi & Makki Roti', 'Kanda Poha & Kachori', 'Mawa Mishri & Malpua', 'Spiced Chaas'];
    }
    if (hasAny(key, ['kota', 'bundi', 'jhalawar', 'jhalrapatan'])) {
      return ['Kota Heeng Kachori', 'Dal Baati Churma', 'Poha Jalebi', 'Gatte Ki Sabzi', 'Mawa Ladoo'];
    }
    if (hasAny(key, ['mount-abu', 'sirohi'])) {
      return ['Dal Baati Churma', 'Rabri & Gajar Halwa', 'Gujarati-Rajasthani Thali', 'Masala Corn & Street Chaat', 'Pyaaz Kachori'];
    }
    if (hasAny(key, ['alwar', 'bhangarh', 'sariska', 'bharatpur', 'keoladeo', 'ranthambore', 'sawai', 'karauli', 'deeg'])) {
      return ['Alwar Ka Kalakand', 'Bedai & Kachori Sabzi', 'Dal Baati Churma', 'Pyaaz Kachori', 'Rajasthani Thali'];
    }
    return ['Jaipuri Pyaaz Kachori', 'Dal Baati Churma', 'Jaipuri Ghevar', 'Mirchi Vada', 'Kulhad Lassi'];
  }

  // 10. Gujarat (split by Kutch, Saurashtra, Ahmedabad, Vadodara/South, North Gujarat)
  if (state === 'Gujarat') {
    if (hasAny(key, ['kutch', 'bhuj', 'mandvi', 'dholavira', 'naliya', 'little-rann', 'surendranagar'])) {
      return ['Kutchi Dabeli', 'Bajra Rotlo & Ringan Bharta', 'Kutchi Kadak & Pakwan', 'Khichdi Kadhi', 'Gulab Pak'];
    }
    if (hasAny(key, ['somnath', 'dwarka', 'gir', 'junagadh', 'gondal', 'porbandar', 'palitana', 'velavadar', 'bhavnagar', 'jamnagar', 'rajkot', 'diu'])) {
      return ['Kathiyawadi Thali & Rotlo', 'Fafda Jalebi & Gathiya', 'Khaman & Dabeli', 'Masala Chaas', 'Bhajia & Khichdi'];
    }
    if (hasAny(key, ['vadodara', 'kevadia', 'champaner', 'saputara', 'wilson', 'valsad', 'daman', 'narmada', 'panchmahal', 'dang'])) {
      return ['Vadodara Sev Usal', 'Surti Locho / Undhiyu', 'Khaman & Dabeli', 'Gujarati Thali', 'Masala Chaas'];
    }
    if (hasAny(key, ['patan', 'modhera', 'ambaji', 'vadnagar', 'polo', 'mehsana', 'banaskantha', 'sabarkantha'])) {
      return ['Patan Devda & Khaman', 'Gujarati Thali', 'Bajra Rotlo & Dal', 'Fafda Jalebi', 'Masala Chaas'];
    }
    return ['Khaman Dhokla & Fafda Jalebi', 'Gujarati Thali', 'Dalvada & Maskabun', 'Khandvi & Handvo', 'Manek Chowk Snacks'];
  }

  // 11. Goa & DNHDD
  if (state === 'Goa') {
    return ['Goan Fish Curry Rice', 'Poi Bread & Ros Omelette', 'Chicken/Veg Xacuti', 'Vindaloo & Prawn Balchao', 'Bebinca & Kokum Sherbet'];
  }
  if (state === 'Dadra and Nagar Haveli and Daman and Diu') {
    if (hasAny(key, ['silvassa', 'dadra'])) {
      return ['Ubadiyu', 'Gujarati & Parsi Thali', 'Rice Bhakri & Turiya Patra', 'Vada Pav & Misal', 'Masala Chaas'];
    }
    return ['Fresh Seafood & Fish Curry', 'Gujarati-Portuguese Thali', 'Veg Xacuti & Poi Bread', 'Dabeli & Chaat', 'Tender Coconut Water'];
  }

  // 12. Maharashtra (split Mumbai, Pune/Sahyadri, Satara/Mahabaleshwar, Konkan, Nashik, Marathwada, Kolhapur, Vidarbha)
  if (state === 'Maharashtra') {
    if (hasAny(key, ['mumbai', 'elephanta', 'alibaug'])) {
      return ['Mumbai Vada Pav', 'Pav Bhaji & Bhel Puri', 'Kanda Poha & Bun Maska', 'Malvani Coastal Thali', 'Misal Pav'];
    }
    if (hasAny(key, ['tarkarli', 'malvan', 'ganpatipule', 'ratnagiri', 'diveagar', 'harihareshwar', 'dapoli', 'vengurla', 'amboli', 'sindhudurg'])) {
      return ['Malvani Fish Curry & Solkadhi', 'Kombdi Vade / Konkani Veg Thali', 'Ukadiche Modak & Ghavan', 'Kanda Poha', 'Kokum Sharbat'];
    }
    if (hasAny(key, ['mahabaleshwar', 'panchgani', 'satara', 'pratapgad', 'thoseghar', 'sajjangad', 'koyna'])) {
      return ['Fresh Strawberries & Cream', 'Pithla Bhakri & Bharli Vangi', 'Masala Corn Pattice', 'Misal Pav', 'Chikki & Fudge'];
    }
    if (hasAny(key, ['kolhapur', 'panhala'])) {
      return ['Kolhapuri Misal Pav', 'Tambda & Pandhra Rassa', 'Jowar Bhakri & Pithla', 'Kolhapuri Bhel', 'Jaggery Gul Poli'];
    }
    if (hasAny(key, ['ajanta', 'ellora', 'daulatabad', 'sambhajinagar', 'lonar', 'paithan', 'pitalkhora'])) {
      return ['Naan Qalia', 'Aurangabadi Tahari', 'Pithla Bhakri & Hurda', 'Kanda Poha', 'Imarti & Jalebi'];
    }
    if (hasAny(key, ['nagpur', 'tadoba', 'chikhaldara', 'pench', 'nagzira', 'ramtek', 'chandrapur', 'amravati', 'gondia'])) {
      return ['Nagpuri Tarri Poha', 'Saoji Curry & Bhakri', 'Patodi Rassa', 'Santra Barfi', 'Sabudana Vada'];
    }
    if (hasAny(key, ['nashik', 'shirdi', 'igatpuri', 'bhandardara', 'malshej', 'harihar', 'anjneri', 'anjaneri', 'sandhan'])) {
      return ['Nashik Misal Pav', 'Sabudana Khichdi & Kanda Poha', 'Pithla Bhakri', 'Vada Pav', 'Jowar Bhakri Thali'];
    }
    return ['Pune Misal Pav', 'Pithla Bhakri & Thecha', 'Kanda Bhaji (Ghat Special)', 'Vada Pav & Mastani', 'Lonavala Chikki'];
  }

  // 13. Madhya Pradesh (split Malwa/Indore, Bhopal, Bundelkhand/Baghelkhand, Mahakoshal/Jabalpur)
  if (state === 'Madhya Pradesh') {
    if (hasAny(key, ['indore', 'ujjain', 'omkareshwar', 'mandu', 'maheshwar', 'khargone', 'dhar', 'khandwa'])) {
      return ['Indori Poha & Jalebi', 'Bhutte Ka Kees', 'Dal Bafla & Laddu', 'Sabudana Khichdi', 'Mawa Bati'];
    }
    if (hasAny(key, ['bhopal', 'sanchi', 'bhimbetka', 'pachmarhi', 'satpura', 'raisen', 'narmadapuram'])) {
      return ['Bhopali Poha Jalebi', 'Bhopali Biryani / Korma', 'Dal Bafla', 'Sulemani Chai & Mawa Bati', 'Roasted Masala Bhutta'];
    }
    if (hasAny(key, ['jabalpur', 'bhedaghat', 'amarkantak', 'anuppur'])) {
      return ['Khoya Jalebi', 'Poha & Mangode', 'Dal Bafla', 'Sabudana Vada', 'Narmada Ghat Chaat'];
    }
    return ['Bedai & Jalebi', 'Dal Bafla & Bundeli Thali', 'Mawa Bati & Khoya Jalebi', 'Poha & Samosa', 'Desi Veg Thali'];
  }

  // 14. Chhattisgarh
  if (state === 'Chhattisgarh') {
    return ['Chila (Rice Flour Crepe)', 'Faraa (Steamed Rice Dumplings)', 'Bore Baasi', 'Bastar Bamboo & Mahua Treats', 'Dehrori'];
  }

  // 15. Karnataka (split Bengaluru/Mysuru, Malnad/Coorg, Coastal, North Karnataka/Hampi)
  if (state === 'Karnataka') {
    if (hasAny(key, ['coorg', 'kodagu', 'chikmagalur', 'chikkamagaluru', 'nagarhole', 'sakleshpur', 'kudremukh', 'belur', 'halebidu', 'sringeri', 'hassan'])) {
      return ['Akki Roti & Coorg/Malnad Curry', 'Kadambuttu & Bamboo Shoot Curry', 'Neer Dosa', 'Malnad Filter Coffee', 'Goli Baje'];
    }
    if (hasAny(key, ['gokarna', 'udupi', 'malpe', 'murudeshwar', 'yana', 'dandeli', 'uttara'])) {
      return ['Udupi Neer Dosa & Goli Baje', 'Udupi Temple Meals', 'Coastal Fish Curry / Mangalore Buns', 'Gadbad Ice Cream', 'Filter Coffee'];
    }
    if (hasAny(key, ['hampi', 'vijayanagara', 'badami', 'pattadakal', 'aihole', 'bijapur', 'vijayapura', 'bidar', 'bagalkot'])) {
      return ['Jolada Rotti & Ennegayi', 'Girmit & Mirchi Bajji', 'Dharwad Peda', 'Masala Dosa & Bisi Bele Bath', 'Fresh Banana Lassi'];
    }
    return ['Masala Dosa & Idli Vada', 'Bisi Bele Bath', 'Ragi Mudde & Saaru', 'Mysore Pak', 'South Indian Filter Coffee'];
  }

  // 16. Kerala (split Malabar, High Ranges, Backwaters/Coastal)
  if (state === 'Kerala') {
    if (hasAny(key, ['kozhikode', 'wayanad', 'kannur', 'bekal', 'kasaragod', 'silent-valley'])) {
      return ['Kozhikode Malabar Biryani', 'Malabar Parotta & Roast', 'Pathiri & Coastal Curry', 'Kozhikode Halwa & Banana Chips', 'Sulaimani Black Tea'];
    }
    if (hasAny(key, ['munnar', 'thekkady', 'vagamon', 'idukki', 'gavi', 'nelliampathy'])) {
      return ['Kerala Parotta & Curry', 'Appam & Stew', 'Puttu & Kadala Curry', 'Fresh Munnar Cardamom Tea', 'Kappa & Banana Chips'];
    }
    return ['Appam & Vegetable/Chicken Stew', 'Kerala Sadya', 'Karimeen Pollichathu', 'Puttu & Kadala Curry', 'Pazham Pori & Sulaimani Tea'];
  }

  // 17. Tamil Nadu (split Hill Stations, South/Temple Circuit, Chennai/North Coast)
  if (state === 'Tamil Nadu') {
    if (hasAny(key, ['ooty', 'coonoor', 'kodaikanal', 'yercaud', 'valparai', 'kolli', 'mudumalai', 'nilgiris'])) {
      return ['Nilgiri Tea & Homemade Chocolates', 'Ooty Varkey & Bakery Buns', 'Hot Masala Corn & Momos', 'South Indian Thali & Parotta', 'Filter Coffee'];
    }
    if (hasAny(key, ['madurai', 'rameswaram', 'kanyakumari', 'chettinad', 'karaikudi', 'thanjavur', 'kumbakonam', 'trichy', 'tiruchirappalli', 'velankanni', 'courtallam'])) {
      return ['Madurai Jigarthanda & Kari Dosa', 'Chettinad Meals & Paniyaram', 'Kumbakonam Degree Coffee', 'Rameswaram Seafood & Sambar Rice', 'Parotta & Salna'];
    }
    return ['Idli Sambar & Medu Vada', 'Kanchipuram Pepper Idli', 'Ven Pongal & Filter Coffee', 'Beach Sundal & Bajji', 'Tamil Banana-Leaf Meals'];
  }

  // 18. Puducherry
  if (state === 'Puducherry') {
    return ['French Croissants & Cafe Crepes', 'Pondy Creole Curry', 'Masala Dosa & Idli', 'Baguette Sandwiches', 'Filter Coffee'];
  }

  // 19. Andhra Pradesh (split Rayalaseema/Tirupati vs Coastal/Araku)
  if (state === 'Andhra Pradesh') {
    if (hasAny(key, ['tirupati', 'lepakshi', 'horsley', 'gandikota', 'belum', 'ahobilam', 'srisailam', 'kadapa', 'nandyal'])) {
      return ['Tirupati Laddu & Pulihora', 'Ragi Sangati & Pappu', 'Andhra Meals (Gongura & Pickle)', 'Pesarattu & Dosa', 'Filter Coffee'];
    }
    return ['Pesarattu Upma', 'Araku Coffee & Bamboo Chicken/Veg', 'Andhra Meals & Gongura', 'Pootharekulu', 'Punugulu & Mirchi Bajji'];
  }

  // 20. Telangana (split Hyderabad vs Rural/Districts)
  if (state === 'Telangana') {
    if (hasAny(key, ['hyderabad', 'ramoji', 'rangareddy'])) {
      return ['Hyderabadi Biryani', 'Irani Chai & Osmania Biscuit', 'Mirchi Ka Salan', 'Double Ka Meetha', 'Punugulu & Chaat'];
    }
    return ['Sarva Pindi', 'Jonna Rotte & Pulusu', 'Telangana Biryani', 'Sakinalu & Garelu', 'Irani Chai'];
  }

  // 21. Odisha (split Puri/Cuttack/Coast vs Interior/Tribal Hills)
  if (state === 'Odisha') {
    if (hasAny(key, ['puri', 'konark', 'chilika', 'bhubaneswar', 'khordha', 'cuttack', 'gopalpur', 'chandipur'])) {
      return ['Cuttack Dahibara Aloodum', 'Puri Khaja & Abhada Temple Meal', 'Chhena Poda', 'Dalma & Pakhala Bhata', 'Chilika Prawn / Crab Curry'];
    }
    return ['Pakhala Bhata & Badi Chura', 'Odisha Dalma', 'Chhena Poda', 'Arisa & Manda Pitha', 'Koraput Coffee & Desi Thali'];
  }

  // 22. West Bengal (split Darjeeling/Kalimpong/Hills, Coastal/Sundarbans, Kolkata/Plains)
  if (state === 'West Bengal') {
    if (hasAny(key, ['darjeeling', 'kalimpong', 'kurseong', 'mirik', 'sandakphu', 'lava', 'loleygaon', 'dooars', 'jaldapara', 'alipurduar'])) {
      return ['Darjeeling First-Flush Tea', 'Tibetan Momos & Thukpa', 'Shaphaley & Alu Dum', 'Churpi & Gundruk Soup', 'Kalimpong Cheese & Bakery'];
    }
    if (hasAny(key, ['sundarbans', 'digha', 'mandarmani', 'tajpur', 'shankarpur', 'purba-medinipur'])) {
      return ['Bengali Fish Curry & Rice', 'Prawn Malai Curry & Crab Fry', 'Luchi Aloor Dum', 'Jhalmuri & Tender Coconut', 'Mishti Doi & Rosogolla'];
    }
    return ['Kolkata Kathi Roll & Phuchka', 'Luchi Aloor Dum', 'Bengali Thali / Kosha Mangsho', 'Mishti Doi & Rosogolla', 'Sondesh & Jhalmuri'];
  }

  // 23. Bihar (Gaya/Rajgir/Nalanda vs Rest of Bihar)
  if (state === 'Bihar') {
    if (hasAny(key, ['bodh-gaya', 'gaya', 'nalanda', 'rajgir', 'pawapuri'])) {
      return ['Silao Khaja', 'Litti Chokha', 'Tibetan Momos & Thukpa', 'Sattu Paratha', 'Gaya Tilkut'];
    }
    return ['Litti Chokha', 'Sattu Paratha', 'Dal Pitha & Ghugni', 'Thekua & Malpua', 'Bihari Thali'];
  }

  // 24. Jharkhand
  if (state === 'Jharkhand') {
    if (hasAny(key, ['deoghar', 'baidyanath'])) {
      return ['Deoghar Peda', 'Dhuska & Aloo Chana', 'Litti Chokha', 'Chilka Roti', 'Thekua'];
    }
    return ['Dhuska & Aloo Chana', 'Chilka Roti', 'Litti Chokha', 'Rugra / Bamboo Shoot Curry', 'Thekua'];
  }

  // 25. Northeast States & Islands
  if (state === 'Sikkim') {
    return ['Steamed Momos & Thukpa', 'Phagshapa / Gundruk Soup', 'Sael Roti & Kinema', 'Chhurpi & Tingmo', 'Temi Organic Sikkim Tea'];
  }
  if (state === 'Meghalaya') {
    return ['Jadoh (Spiced Khasi Rice)', 'Dohneiiong / Tungrymbai', 'Khasi Red Rice Platter', 'Pukhlein & Sohiong Juice', 'Momos & Lakadong Tea'];
  }
  if (state === 'Assam') {
    return ['Assamese Khar & Masor Tenga', 'Assam Thali (Joha Rice & Pitika)', 'Pitha & Jolpan', 'Bamboo Shoot & Aloo Pitika', 'Fresh Assam Tea'];
  }
  if (state === 'Arunachal Pradesh') {
    if (hasAny(key, ['tawang', 'bomdila', 'dirang'])) {
      return ['Tibetan Thukpa & Momos', 'Zan (Millet Porridge) & Khura', 'Butter Tea (Po Cha)', 'Gyapa Khazi (Spiced Rice)', 'Yak Cheese Curry'];
    }
    return ['Bamboo Shoot Curry & Boiled Rice', 'Smoked / Boiled Local Platter', 'Thukpa & Momos', 'Apong Rice Beverage', 'Herb Chutney & Rice'];
  }
  if (state === 'Nagaland') {
    return ['Naga Bamboo Shoot Curry', 'Axone (Soybean) Chutney', 'Galho (Naga Rice Stew)', 'Raja Mircha Local Platter', 'Sticky Rice & Black Tea'];
  }
  if (state === 'Manipur') {
    return ['Eromba (Mashed Veg & Chili)', 'Kangsoi (Herbal Stew)', 'Singju (Manipuri Salad)', 'Chak-hao (Black Rice) Kheer', 'Steamed Rice & Herbal Side'];
  }
  if (state === 'Mizoram') {
    return ['Bai (Bamboo Shoot Stew)', 'Sawhchiar (Mizo Rice Porridge)', 'Mizo Thali & Vawksa Rep', 'Sanpiau (Rice Snack)', 'Thingpui (Mizo Tea)'];
  }
  if (state === 'Tripura') {
    return ['Mui Borok (Traditional Platter)', 'Wahan Mosdeng / Berma Curry', 'Bhangui Rice & Gudok', 'Tripura Pineapple & Citrus', 'Luchi & Bengali Sweets'];
  }
  if (state === 'Andaman and Nicobar Islands') {
    return ['Grilled Reef Fish & Lobster', 'Coconut Prawn Curry', 'South Indian / Bengali Thali', 'Fresh Tender Coconut', 'Banana Pancakes & Seafood BBQ'];
  }
  if (state === 'Lakshadweep') {
    return ['Tuna Fish Curry & Mus Kavaab', 'Coconut Rice & Appam', 'Kilanji & Bonda', 'Fresh Tender Coconut', 'Malabar Parotta & Veg Stew'];
  }

  return ['Regional Thali', 'Local Street Snacks', 'Masala Chai'];
}

export function resolvePlaceClimate(dest) {
  const id = (dest.id || '').toLowerCase();
  const name = (dest.name || '').toLowerCase();
  const district = (dest.district || '').toLowerCase();
  const state = dest.state || '';
  const category = dest.category || '';
  const key = `${id} ${name} ${district}`;

  // 1. Specific high-altitude / seasonal exception places first
  if (hasAny(key, ['valley-of-flowers', 'valley of flowers'])) {
    return {
      bestSeason: 'July – September',
      weatherNotes:
        'Alpine meadow blooms peak from mid-July to early September (8°C–18°C). Expect light rain and mist—carry rain gear; the valley remains snow-closed from November to May.',
    };
  }

  if (hasAny(key, ['roopkund'])) {
    return {
      bestSeason: 'May – June, September – October',
      weatherNotes:
        'Clear high-altitude trek windows run May–June and September–October (0°C–14°C). Heavy winter snow blocks trails from November to April, and July–August brings slippery monsoon fog.',
    };
  }

  if (hasAny(key, ['goechala'])) {
    return {
      bestSeason: 'April – May, October – November',
      weatherNotes:
        'Best mountain views occur in spring (April–May rhododendrons) and crisp autumn (October–November, -2°C–14°C). Trails close or turn treacherous in monsoon (June–September) and deep winter.',
    };
  }

  if (hasAny(key, ['sandakphu'])) {
    return {
      bestSeason: 'March – May, October – December',
      weatherNotes:
        'Crisp sunrise views of Kanchenjunga & Everest from October–December and spring blooms in March–May (2°C–15°C). Heavy fog hides peaks in June–September.',
    };
  }

  if (hasAny(key, ['kedarnath', 'badrinath', 'gangotri', 'yamunotri', 'tungnath', 'kartik-swami'])) {
    return {
      bestSeason: 'May – June, September – October',
      weatherNotes:
        'Temple portals and high trails are open from May to October/early November (4°C–18°C). Heavy winter snowfall closes access from November to April; expect landslide checks during July–August rains.',
    };
  }

  if (hasAny(key, ['auli', 'gulmarg', 'sankri', 'kedarkantha', 'kufri', 'narkanda'])) {
    return {
      bestSeason: 'December – June, September – November',
      weatherNotes:
        'Winter snow & ski season peaks December–March (-4°C–8°C), while meadows stay cool and green from May–June and September–November (10°C–20°C).',
    };
  }

  if (hasAny(key, ['rann-of-kutch', 'rann of kutch', 'little-rann', 'dholavira'])) {
    return {
      bestSeason: 'November – February',
      weatherNotes:
        'Cool, dry desert skies during Rann Utsav season from November to February (10°C–28°C; pack a warm layer for chilly nights). Summers (March–June) exceed 43°C and monsoon floods the salt flats.',
    };
  }

  if (hasAny(key, ['dawki', 'umngot'])) {
    return {
      bestSeason: 'November – April',
      weatherNotes:
        'Crystal-clear emerald river waters are visible during the dry season from November to April (12°C–25°C). Heavy monsoon runoff (June–September) makes the river muddy.',
    };
  }

  if (hasAny(key, ['cherrapunji', 'mawsynram', 'krang-suri', 'laitlum'])) {
    return {
      bestSeason: 'October – May',
      weatherNotes:
        'Clear canyon views and safe root-bridge treks run October to May (10°C–24°C). Monsoon (June–September) unleashes dramatic waterfalls alongside intense rain and dense fog.',
    };
  }

  // 2. Ladakh & High Trans-Himalayan Himachal/J&K (Spiti, Lahaul, Kinnaur upper, Sonamarg, Gurez)
  if (
    state === 'Ladakh' ||
    hasAny(key, [
      'spiti', 'tabo', 'dhankar', 'chandratal', 'keylong', 'jispa', 'sissu', 'lahaul',
      'nako', 'chitkul', 'kalpa', 'sonamarg', 'gurez', 'har-ki-dun', 'harsil', 'munsiyari',
    ])
  ) {
    return {
      bestSeason: 'May – September',
      weatherNotes:
        'High-altitude Himalayan window with clear skies and open passes from May to September (5°C–22°C; sub-zero nights early/late season). Heavy winter snow closes high passes from November to April.',
    };
  }

  // 3. Sikkim High Lakes & Arunachal High Valleys
  if (
    state === 'Sikkim' &&
    hasAny(key, ['tsomgo', 'nathula', 'gurudongmar', 'lachen', 'lachung', 'yumthang', 'zuluk'])
  ) {
    return {
      bestSeason: 'April – June, October – December',
      weatherNotes:
        'Spring rhododendrons (April–June) and crisp snow-peak views (October–December, -2°C–15°C). Heavy winter snow (Jan–Feb) and monsoon landslides (July–September) can restrict high-pass permits.',
    };
  }

  if (
    state === 'Arunachal Pradesh' &&
    hasAny(key, ['tawang', 'bomdila', 'dirang', 'mechuka', 'anini', 'dong', 'mayudia'])
  ) {
    return {
      bestSeason: 'March – June, October – November',
      weatherNotes:
        'Pleasant valley days and clear mountain passes in March–June and October–November (4°C–19°C). Expect snow blockages at Sela/Mayudia passes in Dec–Feb and heavy monsoon rain from July–September.',
    };
  }

  // 4. Foothill Himalayan Towns & Katra/Vaishno Devi (cool winter, hot May-Jun, accessible all year)
  if (hasAny(key, ['rishikesh', 'haridwar', 'kangra-fort', 'paonta-sahib', 'nahan', 'bahu-fort'])) {
    return {
      bestSeason: 'October – April',
      weatherNotes:
        'Pleasant daytime sun and cool evenings from October to April (10°C–28°C). May–June is warm (up to 40°C), and river rafting/hill roads pause or slow during July–August monsoon.',
    };
  }

  if (hasAny(key, ['katra', 'vaishno'])) {
    return {
      bestSeason: 'March – June, September – December',
      weatherNotes:
        'Comfortable pilgrimage weather in spring and autumn (10°C–28°C). Pack warm woollens for chilly nights near Bhawan (Dec–Feb) and avoid peak monsoon landslide delays in July–August.',
    };
  }

  // 5. Bird Sanctuaries, Marine Park, Mangrove Boat Safaris & Hill Sanctuaries
  if (hasAny(key, ['pangot', 'binsar'])) {
    return {
      bestSeason: 'March – June, September – November',
      weatherNotes:
        'Crisp mountain forest trails (10°C–22°C) ideal for Himalayan birding and peak views. Winters (Dec–Feb) are chilly, and July–August brings dense monsoon fog.',
    };
  }

  if (hasAny(key, ['doyang'])) {
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Amur falcon migratory roosting peaks in October–November alongside crisp Nagaland winter weather (10°C–24°C). Avoid June–September monsoon rain.',
    };
  }

  if (hasAny(key, ['sundarbans'])) {
    return {
      bestSeason: 'November – March',
      weatherNotes:
        'Calm tidal creeks and pleasant winter temperatures (14°C–27°C) make riverboat safaris comfortable. Avoid hot summer humidity (April–June) and monsoon cyclones (July–October).',
    };
  }

  if (hasAny(key, ['marine-national-park'])) {
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Cool coastal mornings and clear low-tide coral walks from October to March (16°C–30°C; time visits with low tide). Monsoon seas (June–September) close island boats.',
    };
  }

  if (hasAny(key, ['keoladeo', 'sultanpur', 'harike', 'menar', 'paithan', 'jayakwadi', 'thattekad', 'nalsarovar'])) {
    return {
      bestSeason: 'November – February',
      weatherNotes:
        'Peak migratory bird season during cool, dry winter mornings (8°C–25°C; carry a light jacket at dawn). Summers (April–June) are hot and wetlands shrink.',
    };
  }

  // 6. Wildlife Sanctuaries & National Parks (split floodplains/North-Central vs South India)
  if (category === 'Wildlife' || hasAny(key, ['corbett', 'kaziranga', 'ranthambore'])) {
    if (
      ['Kerala', 'Karnataka', 'Tamil Nadu'].includes(state)
    ) {
      return {
        bestSeason: 'October – May',
        weatherNotes:
          'Dry, comfortable forest trails and strong wildlife sightings from October to May (15°C–29°C). Heavy Southwest monsoon rain arrives June–September, making tracks wet and misty.',
      };
    }
    if (['Assam', 'Arunachal Pradesh', 'Uttarakhand', 'Uttar Pradesh', 'Bihar', 'West Bengal'].includes(state)) {
      return {
        bestSeason: 'November – April',
        weatherNotes:
          'Dry winter and spring offer the clearest safari sightings (November–April; pack warm layers for chilly dawn drives in Dec–Jan). Reserves generally close during monsoon floods (May/June–October).',
      };
    }
    return {
      bestSeason: 'November – May',
      weatherNotes:
        'Best wildlife spotting in dry winter and early summer (November–May; carry warm jackets for cold morning open-gypsy safaris in Dec–Jan). Core forest zones stay closed during July–October monsoon.',
    };
  }

  // 6. Mid-Himalayan Hill Stations (Uttarakhand, Himachal, J&K, Darjeeling/Kalimpong, Sikkim)
  if (
    ['Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir', 'Sikkim'].includes(state) ||
    hasAny(key, ['darjeeling', 'kalimpong', 'kurseong', 'mirik', 'lava', 'loleygaon'])
  ) {
    return {
      bestSeason: 'March – June, September – November',
      weatherNotes:
        'Cool, refreshing summers (12°C–24°C) from March to June and crystal-clear Himalayan views from September to November. Expect cold winter weather with occasional ridge snowfall in Dec–Feb and monsoon mist in July–August.',
    };
  }

  // 7. Northeast Hills & Plains (Assam, Meghalaya, Arunachal low, Nagaland, Manipur, Mizoram, Tripura)
  if (['Meghalaya', 'Assam', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'].includes(state)) {
    if (category === 'Waterfalls') {
      return {
        bestSeason: 'July – December',
        weatherNotes:
          'Waterfalls run at full flow during late monsoon and crisp early winter (July–December, 12°C–25°C). Wear grip footwear near misty viewpoints and check hill road updates during heavy rain.',
      };
    }
    return {
      bestSeason: 'October – April',
      weatherNotes:
        'Crisp, dry weather and clear valley vistas from October to April (10°C–25°C). Heavy Northeast monsoon rainfall peaks between June and September.',
    };
  }

  // 8. West Coast Beaches, Backwaters & Tropical Islands
  if (
    state === 'Goa' ||
    state === 'Andaman and Nicobar Islands' ||
    state === 'Lakshadweep' ||
    state === 'Dadra and Nagar Haveli and Daman and Diu' ||
    (state === 'Kerala' && !hasAny(key, ['munnar', 'wayanad', 'thekkady', 'vagamon', 'idukki', 'gavi', 'nelliampathy'])) ||
    (state === 'Maharashtra' && hasAny(key, ['alibaug', 'tarkarli', 'malvan', 'ganpatipule', 'ratnagiri', 'diveagar', 'harihareshwar', 'dapoli', 'vengurla', 'mumbai', 'elephanta'])) ||
    (state === 'Karnataka' && hasAny(key, ['gokarna', 'udupi', 'malpe', 'murudeshwar'])) ||
    (state === 'Gujarat' && category === 'Beaches')
  ) {
    if (category === 'Waterfalls') {
      return {
        bestSeason: 'October – February',
        weatherNotes:
          'Waterfall trails and jeep safaris operate cleanly post-monsoon from October to February (20°C–30°C). Flow peaks in monsoon (July–September), though forest access can restrict during heavy downpours.',
      };
    }
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Warm tropical sunshine, calm seas, and comfortable beach breezes from October to March (22°C–32°C; water sports stay open through May). Avoid heavy Southwest monsoon seas from June to September.',
    };
  }

  // 9. Tamil Nadu & Puducherry Coast / Plains (Northeast Monsoon hits Oct–Nov!)
  if (
    state === 'Puducherry' ||
    (state === 'Tamil Nadu' && !hasAny(key, ['ooty', 'coonoor', 'kodaikanal', 'yercaud', 'valparai', 'kolli', 'mudumalai']))
  ) {
    if (category === 'Waterfalls') {
      return {
        bestSeason: 'July – January',
        weatherNotes:
          'Waterfalls run full during Southwest and Northeast monsoon months through January (20°C–29°C). Expect humid tropical weather and slippery rocks near cascades.',
      };
    }
    return {
      bestSeason: 'November – March',
      weatherNotes:
        'Pleasant, breezy coastal and temple-town weather from November to March (21°C–30°C). Note the Northeast monsoon brings rain in October–November, while April–June is hot and humid.',
    };
  }

  // 10. Western Ghats & South Indian Hill Stations
  if (
    hasAny(key, [
      'munnar', 'wayanad', 'vagamon', 'idukki', 'gavi', 'nelliampathy',
      'ooty', 'coonoor', 'kodaikanal', 'yercaud', 'valparai', 'kolli',
      'coorg', 'kodagu', 'chikmagalur', 'chikkamagaluru', 'nandi-hills', 'sakleshpur', 'kudremukh',
      'araku', 'lambasingi', 'horsley', 'daringbadi', 'deomali', 'netarhat', 'pachmarhi', 'chikhaldara', 'saputara', 'wilson-hills', 'mount-abu',
    ])
  ) {
    return {
      bestSeason: 'September – May',
      weatherNotes:
        'Cool hill breezes and misty plantation valleys from September to May (12°C–26°C). Heavy monsoon showers in July–August bring lush greenery alongside dense fog and slippery trails.',
    };
  }

  // 11. Maharashtra Sahyadri Ghats, Forts & Waterfalls
  if (
    state === 'Maharashtra' &&
    (category === 'Waterfalls' ||
      hasAny(key, [
        'lonavala', 'khandala', 'matheran', 'mahabaleshwar', 'panchgani', 'malshej', 'bhandardara',
        'sinhagad', 'raigad-fort', 'lohagad', 'torna', 'rajmachi', 'korigad', 'tikona', 'pratapgad',
        'sajjangad', 'sandhan', 'harihar', 'anjneri', 'anjaneri', 'tamhini', 'igatpuri', 'amboli', 'bhimashankar', 'thoseghar', 'devkund',
      ]))
  ) {
    if (hasAny(key, ['mahabaleshwar', 'panchgani', 'matheran'])) {
      return {
        bestSeason: 'October – June',
        weatherNotes:
          'Cool Sahyadri plateau weather from October to June (13°C–27°C; strawberry season in winter). July–September brings heavy monsoon downpours and thick valley mist.',
      };
    }
    return {
      bestSeason: 'July – February',
      weatherNotes:
        'Sahyadri cliffs turn emerald green during monsoon (July–September) and stay crisp and breezy through winter (October–February, 14°C–27°C). Avoid harsh April–May summer heat on exposed fort climbs.',
    };
  }

  // 12. Remaining Waterfalls across Central/South/East India
  if (category === 'Waterfalls') {
    return {
      bestSeason: 'July – January',
      weatherNotes:
        'Peak waterfall flow runs from the July monsoon through crisp January winter (16°C–28°C). Carry grip footwear for wet stone paths and check local forest safety barriers in heavy rain.',
    };
  }

  // 13. Arid Desert Rajasthan & Kutch
  if (
    (state === 'Rajasthan' && hasAny(key, ['jaisalmer', 'jodhpur', 'bikaner', 'barmer', 'churu', 'osian', 'khimsar'])) ||
    state === 'Gujarat' && hasAny(key, ['bhuj', 'mandvi', 'kutch'])
  ) {
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Crisp desert days and cool nights from October to March (8°C–28°C; pack a light jacket after sunset). Summers (April–June) are intensely hot (44°C+), while July–September brings light monsoon showers.',
    };
  }

  // 14. Coastal East India (Odisha, AP coast, West Bengal coast)
  if (
    (state === 'Odisha' && hasAny(key, ['puri', 'konark', 'chilika', 'gopalpur', 'chandipur', 'bhubaneswar', 'cuttack'])) ||
    (state === 'Andhra Pradesh' && hasAny(key, ['visakhapatnam', 'suryalanka', 'papikondalu', 'amaravati', 'vijayawada', 'simhachalam'])) ||
    (state === 'West Bengal' && hasAny(key, ['digha', 'mandarmani', 'tajpur', 'kolkata']))
  ) {
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Pleasant winter sunshine and comfortable sea breezes from October to March (16°C–30°C). Check Bay of Bengal rain/cyclone alerts in Oct–Nov; April–June is warm and humid.',
    };
  }

  // 15. North, Central, West & East Indian Plains / Heritage / Temples (UP, Delhi, Punjab, Haryana, Bihar, Jharkhand, MP, Chhattisgarh, Rajasthan, Gujarat, Telangana, Maharashtra plains)
  if (['Uttar Pradesh', 'Delhi', 'Punjab', 'Haryana', 'Bihar', 'Jharkhand'].includes(state)) {
    return {
      bestSeason: 'October – March',
      weatherNotes:
        'Pleasant, sunny winter sightseeing weather from October to March (8°C–26°C; carry a warm jacket for Dec–Jan morning fog). April–June exceeds 42°C, and July–September brings humid monsoon showers.',
    };
  }

  return {
    bestSeason: 'October – March',
    weatherNotes:
      'Comfortable daytime sightseeing weather from October to March (13°C–29°C). Summers (April–June) are very warm (38°C–44°C), while July–September brings monsoon showers and greener landscapes.',
  };
}

export function resolvePlaceHowToReach(dest) {
  const state = dest.state || '';
  const name = dest.name || '';
  const district = dest.district || '';

  if (state === 'Andaman and Nicobar Islands') {
    return `Fly into Veer Savarkar International Airport (Port Blair) or take a coastal ship from Chennai/Kolkata/Visakhapatnam, then board government or private ferries to reach ${name}.`;
  }
  if (state === 'Lakshadweep') {
    return `Fly into Agatti Airport from Kochi (or take a Kochi–Lakshadweep passenger ship with entry permit), then transfer by local boat/ferry to ${name}.`;
  }
  if (state === 'Ladakh') {
    return `Fly directly into Kushok Bakula Rimpochee Airport (Leh) or travel via the Srinagar–Leh / Manali–Leh mountain highways (May–September), then take shared cabs or buses to ${name}.`;
  }
  if (state === 'Sikkim') {
    return `Arrive at New Jalpaiguri (NJP) railway station or Bagdogra Airport, then take a shared Sumo/cab via Gangtok or Melli to reach ${name}.`;
  }
  if (state === 'Meghalaya') {
    return `Arrive at Guwahati railway station or Shillong (Umroi) Airport, then take a shared Sumo, Meghalaya Transport bus, or cab to ${name}.`;
  }
  return dest.howToReach || `Reach ${district} by Indian Railways or state bus network, then take local shared transport or auto-rickshaw to ${name}.`;
}

export function updateThingsToDoAndItinerary(dest, newFoods) {
  const firstTwo = newFoods.slice(0, 2).join(' and ');
  const firstOne = newFoods[0] || 'local specialties';

  const thingsToDo = Array.isArray(dest.thingsToDo)
    ? dest.thingsToDo.map((item) =>
        item.startsWith('Walk local markets and sample ')
          ? `Walk local markets and sample ${firstTwo}`
          : item
      )
    : [];

  const suggestedItinerary = Array.isArray(dest.suggestedItinerary)
    ? dest.suggestedItinerary.map((step) => {
        const replaced = step.replace(/, enjoy local [^,]+, and depart by evening\.$/, `, enjoy local ${firstOne}, and depart by evening.`);
        if (dest.state === 'Andaman and Nicobar Islands' || dest.state === 'Lakshadweep') {
          return replaced.replace('via budget train/bus', 'via flight/ferry');
        }
        if (dest.state === 'Ladakh') {
          return replaced.replace('via budget train/bus', 'via flight or Leh highway bus');
        }
        return replaced;
      })
    : [];

  return { thingsToDo, suggestedItinerary };
}
