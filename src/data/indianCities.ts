export interface IndianCity {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export const STARTING_CITIES: IndianCity[] = [
  { id: 'delhi', name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209 },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lon: 72.8777 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.4867 },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { id: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { id: 'ranchi', name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', lat: 31.634, lon: 74.8723 },
  { id: 'srinagar', name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lon: 74.7973 },
  { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { id: 'siliguri', name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lon: 88.3953 },
  { id: 'shillong', name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933 },
  // Uttar Pradesh
  { id: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { id: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { id: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lon: 82.1998 },
  { id: 'gorakhpur', name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732 },
  { id: 'noida', name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.391 },
  { id: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  { id: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064 },
  { id: 'jhansi', name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lon: 78.5685 },
  { id: 'bareilly', name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.367, lon: 79.4304 },
  { id: 'aligarh', name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.088 },
  { id: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737 },
  { id: 'moradabad', name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lon: 78.7733 },
  // Maharashtra
  { id: 'nashik', name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { id: 'kolhapur', name: 'Kolhapur', state: 'Maharashtra', lat: 16.705, lon: 74.2433 },
  { id: 'solapur', name: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
  { id: 'thane', name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },
  // Rajasthan
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { id: 'jaisalmer', name: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lon: 70.9083 },
  { id: 'kota', name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
  { id: 'bikaner', name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119 },
  { id: 'ajmer', name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lon: 74.6399 },
  // Gujarat
  { id: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { id: 'vadodara', name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { id: 'rajkot', name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { id: 'bhavnagar', name: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lon: 72.1519 },
  { id: 'bhuj', name: 'Bhuj', state: 'Gujarat', lat: 23.242, lon: 69.6669 },
  { id: 'jamnagar', name: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lon: 70.0577 },
  // Karnataka
  { id: 'mysuru', name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { id: 'mangaluru', name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lon: 74.856 },
  { id: 'hubballi', name: 'Hubballi', state: 'Karnataka', lat: 15.3647, lon: 75.124 },
  { id: 'belagavi', name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { id: 'udupi', name: 'Udupi', state: 'Karnataka', lat: 13.3409, lon: 74.7421 },
  // Tamil Nadu
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { id: 'tiruchirappalli', name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { id: 'salem', name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.146 },
  { id: 'tirunelveli', name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
  { id: 'kanyakumari', name: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lon: 77.5385 },
  // Andhra Pradesh & Telangana
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.648 },
  { id: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { id: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { id: 'rajahmundry', name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lon: 81.804 },
  { id: 'warangal', name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  { id: 'nizamabad', name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  // Kerala
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
  { id: 'kozhikode', name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804 },
  { id: 'thrissur', name: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144 },
  { id: 'kannur', name: 'Kannur', state: 'Kerala', lat: 11.8745, lon: 75.3704 },
  // Madhya Pradesh & Chhattisgarh
  { id: 'jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { id: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  { id: 'ujjain', name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885 },
  { id: 'rewa', name: 'Rewa', state: 'Madhya Pradesh', lat: 24.5362, lon: 81.3037 },
  { id: 'bilaspur', name: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0797, lon: 82.1409 },
  { id: 'jagdalpur', name: 'Jagdalpur', state: 'Chhattisgarh', lat: 19.0785, lon: 82.0214 },
  // Bihar, Jharkhand, Odisha, West Bengal
  { id: 'gaya', name: 'Gaya', state: 'Bihar', lat: 24.7914, lon: 85.0002 },
  { id: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647 },
  { id: 'bhagalpur', name: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lon: 86.9842 },
  { id: 'darbhanga', name: 'Darbhanga', state: 'Bihar', lat: 26.1542, lon: 85.8918 },
  { id: 'jamshedpur', name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lon: 86.2029 },
  { id: 'dhanbad', name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304 },
  { id: 'puri', name: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312 },
  { id: 'cuttack', name: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.883 },
  { id: 'rourkela', name: 'Rourkela', state: 'Odisha', lat: 22.2604, lon: 84.8536 },
  { id: 'sambalpur', name: 'Sambalpur', state: 'Odisha', lat: 21.4669, lon: 83.9812 },
  { id: 'durgapur', name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lon: 87.3119 },
  { id: 'asansol', name: 'Asansol', state: 'West Bengal', lat: 23.6739, lon: 86.9524 },
  { id: 'darjeeling', name: 'Darjeeling', state: 'West Bengal', lat: 27.041, lon: 88.2663 },
  // Uttarakhand, Himachal, Punjab, Haryana, J&K, Ladakh
  { id: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642 },
  { id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676 },
  { id: 'haldwani', name: 'Haldwani', state: 'Uttarakhand', lat: 29.2183, lon: 79.513 },
  { id: 'nainital', name: 'Nainital', state: 'Uttarakhand', lat: 29.3919, lon: 79.4542 },
  { id: 'dharamshala', name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.219, lon: 76.3234 },
  { id: 'manali', name: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lon: 77.1892 },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab', lat: 30.901, lon: 75.8573 },
  { id: 'jalandhar', name: 'Jalandhar', state: 'Punjab', lat: 31.326, lon: 75.5762 },
  { id: 'patiala', name: 'Patiala', state: 'Punjab', lat: 30.3398, lon: 76.3869 },
  { id: 'gurugram', name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
  { id: 'faridabad', name: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178 },
  { id: 'hisar', name: 'Hisar', state: 'Haryana', lat: 29.1492, lon: 75.7217 },
  { id: 'jammu', name: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lon: 74.857 },
  { id: 'leh', name: 'Leh', state: 'Ladakh', lat: 34.1526, lon: 77.5771 },
  { id: 'kargil', name: 'Kargil', state: 'Ladakh', lat: 34.5539, lon: 76.1349 },
  // Northeast India
  { id: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', lat: 27.4728, lon: 94.912 },
  { id: 'silchar', name: 'Silchar', state: 'Assam', lat: 24.8333, lon: 92.7789 },
  { id: 'jorhat', name: 'Jorhat', state: 'Assam', lat: 26.7509, lon: 94.2037 },
  { id: 'agartala', name: 'Agartala', state: 'Tripura', lat: 23.8315, lon: 91.2868 },
  { id: 'imphal', name: 'Imphal', state: 'Manipur', lat: 24.817, lon: 93.9368 },
  { id: 'aizawl', name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lon: 92.7176 },
  { id: 'kohima', name: 'Kohima', state: 'Nagaland', lat: 25.6751, lon: 94.1086 },
  { id: 'dimapur', name: 'Dimapur', state: 'Nagaland', lat: 25.9091, lon: 93.7266 },
  { id: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053 },
  { id: 'gangtok', name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065 },
  // Goa & Remaining UTs
  { id: 'panaji', name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278 },
  { id: 'margao', name: 'Margao', state: 'Goa', lat: 15.2832, lon: 73.9862 },
  { id: 'puducherry', name: 'Puducherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083 },
  { id: 'port-blair', name: 'Port Blair', state: 'Andaman and Nicobar Islands', lat: 11.6234, lon: 92.7265 },
  { id: 'daman', name: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.3974, lon: 72.8328 },
  { id: 'silvassa', name: 'Silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.2734, lon: 73.0192 },
  { id: 'kavaratti', name: 'Kavaratti', state: 'Lakshadweep', lat: 10.5669, lon: 72.6417 },
];

export const INDIA_STATES_AND_UTS: string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
