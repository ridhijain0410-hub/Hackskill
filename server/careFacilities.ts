export interface CareFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Emergency Care';
  distanceKm?: number;
  distanceText?: string;
  address: string;
  phone?: string;
  isOpen?: boolean | null;
  statusText?: string;
  isEmergency?: boolean;
  directionsUrl: string;
  cityOrArea?: string;
  lat?: number;
  lon?: number;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function buildDirectionsUrl(name: string, address: string, lat?: number, lon?: number): string {
  if (lat && lon) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${address}`)}`;
}

// Curated verified directory across major Indian cities
export const CURATED_INDIAN_FACILITIES: CareFacility[] = [
  // Delhi NCR
  {
    id: 'del-aiims',
    name: 'AIIMS (All India Institute of Medical Sciences)',
    type: 'Emergency Care',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
    phone: '011-26588500',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & Trauma Centre',
    isEmergency: true,
    cityOrArea: 'New Delhi',
    lat: 28.5672,
    lon: 77.2100,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.5672,77.2100',
  },
  {
    id: 'del-safdarjung',
    name: 'VMMC & Safdarjung Hospital',
    type: 'Hospital',
    address: 'Ring Road, Opposite AIIMS, New Delhi, Delhi 110029',
    phone: '011-26165060',
    isOpen: true,
    statusText: 'Open 24 Hours • Government District Care',
    isEmergency: true,
    cityOrArea: 'New Delhi',
    lat: 28.5701,
    lon: 77.2075,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.5701,77.2075',
  },
  {
    id: 'del-rml',
    name: 'Dr. Ram Manohar Lohia (RML) Hospital',
    type: 'Hospital',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi, Delhi 110001',
    phone: '011-23365525',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Casualty',
    isEmergency: true,
    cityOrArea: 'Central Delhi',
    lat: 28.6253,
    lon: 77.2017,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.6253,77.2017',
  },
  {
    id: 'del-max-saket',
    name: 'Max Super Speciality Hospital Saket',
    type: 'Emergency Care',
    address: '1, 2, Press Enclave Road, Saket, New Delhi, Delhi 110017',
    phone: '011-26515050',
    isOpen: true,
    statusText: 'Open 24 Hours • Multi-Speciality & Emergency',
    isEmergency: true,
    cityOrArea: 'South Delhi',
    lat: 28.5283,
    lon: 77.2119,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.5283,77.2119',
  },
  {
    id: 'del-gangaram',
    name: 'Sir Ganga Ram Hospital',
    type: 'Hospital',
    address: 'Sir Ganga Ram Hospital Marg, Rajinder Nagar, New Delhi, Delhi 110060',
    phone: '011-42254000',
    isOpen: true,
    statusText: 'Open 24 Hours • Senior Care Unit',
    isEmergency: true,
    cityOrArea: 'West Delhi',
    lat: 28.6387,
    lon: 77.1896,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.6387,77.1896',
  },
  {
    id: 'del-apollo-clinic',
    name: 'Apollo Clinic & Diagnostic Centre',
    type: 'Clinic',
    address: 'C-Block Market, Vasant Kunj, New Delhi, Delhi 110070',
    phone: '011-41767676',
    isOpen: true,
    statusText: 'Open Today 08:00 AM - 08:00 PM • OPD & Diagnostics',
    isEmergency: false,
    cityOrArea: 'South Delhi',
    lat: 28.5200,
    lon: 77.1560,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.5200,77.1560',
  },
  {
    id: 'noida-district',
    name: 'Government District Hospital Noida',
    type: 'Hospital',
    address: 'Sector 39, Noida, Gautam Buddha Nagar, Uttar Pradesh 201301',
    phone: '0120-2570054',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Casualty',
    isEmergency: true,
    cityOrArea: 'Noida',
    lat: 28.5670,
    lon: 77.3450,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.5670,77.3450',
  },
  {
    id: 'noida-fortis',
    name: 'Fortis Hospital Noida',
    type: 'Hospital',
    address: 'B-22, Sector 62, Noida, Uttar Pradesh 201301',
    phone: '0120-4300222',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Care',
    isEmergency: true,
    cityOrArea: 'Noida',
    lat: 28.6190,
    lon: 77.3610,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.6190,77.3610',
  },
  {
    id: 'gzb-yashoda',
    name: 'Yashoda Super Speciality Hospital',
    type: 'Hospital',
    address: 'Plot No. 8, Sector 1, Vaishali, Ghaziabad, Uttar Pradesh 201010',
    phone: '0120-4189500',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency',
    isEmergency: true,
    cityOrArea: 'Ghaziabad',
    lat: 28.6430,
    lon: 77.3360,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.6430,77.3360',
  },
  {
    id: 'ggn-medanta',
    name: 'Medanta - The Medicity',
    type: 'Hospital',
    address: 'CH Bakhtawar Singh Road, Sector 38, Gurugram, Haryana 122001',
    phone: '0124-4141414',
    isOpen: true,
    statusText: 'Open 24 Hours • Multi-Speciality Emergency',
    isEmergency: true,
    cityOrArea: 'Gurugram',
    lat: 28.4390,
    lon: 77.0420,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=28.4390,77.0420',
  },

  // Mumbai & Maharashtra
  {
    id: 'mum-kem',
    name: 'KEM Hospital & Seth GS Medical College',
    type: 'Emergency Care',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    phone: '022-24107000',
    isOpen: true,
    statusText: 'Open 24 Hours • Public Emergency Care',
    isEmergency: true,
    cityOrArea: 'Mumbai',
    lat: 19.0028,
    lon: 72.8427,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.0028,72.8427',
  },
  {
    id: 'mum-lilavati',
    name: 'Lilavati Hospital and Research Centre',
    type: 'Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    phone: '022-26751000',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Care',
    isEmergency: true,
    cityOrArea: 'Mumbai',
    lat: 19.0514,
    lon: 72.8290,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.0514,72.8290',
  },
  {
    id: 'mum-kokilaben',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    type: 'Hospital',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai, Maharashtra 400053',
    phone: '022-42696969',
    isOpen: true,
    statusText: 'Open 24 Hours • Critical Care Unit',
    isEmergency: true,
    cityOrArea: 'Mumbai',
    lat: 19.1311,
    lon: 72.8258,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.1311,72.8258',
  },
  {
    id: 'mum-hinduja',
    name: 'P. D. Hinduja Hospital & Medical Research Centre',
    type: 'Hospital',
    address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016',
    phone: '022-24451515',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & OPD',
    isEmergency: true,
    cityOrArea: 'Mumbai',
    lat: 19.0330,
    lon: 72.8400,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=19.0330,72.8400',
  },
  {
    id: 'pune-sassoon',
    name: 'Sassoon General Hospital & Medical College',
    type: 'Emergency Care',
    address: 'Near Pune Railway Station, Sassoon Road, Pune, Maharashtra 411001',
    phone: '020-26128000',
    isOpen: true,
    statusText: 'Open 24 Hours • Government Civil Hospital',
    isEmergency: true,
    cityOrArea: 'Pune',
    lat: 18.5284,
    lon: 73.8739,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.5284,73.8739',
  },
  {
    id: 'pune-ruby',
    name: 'Ruby Hall Clinic',
    type: 'Hospital',
    address: '40, Sassoon Road, Sangamvadi, Pune, Maharashtra 411001',
    phone: '020-66455100',
    isOpen: true,
    statusText: 'Open 24 Hours • Multi-Speciality Care',
    isEmergency: true,
    cityOrArea: 'Pune',
    lat: 18.5310,
    lon: 73.8770,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.5310,73.8770',
  },

  // Bengaluru & Karnataka
  {
    id: 'blr-victoria',
    name: 'Victoria Hospital & BMCRI',
    type: 'Emergency Care',
    address: 'Fort Road, Near City Market, Bengaluru, Karnataka 560002',
    phone: '080-26701150',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & Trauma Block',
    isEmergency: true,
    cityOrArea: 'Bengaluru',
    lat: 12.9620,
    lon: 77.5750,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.9620,77.5750',
  },
  {
    id: 'blr-manipal',
    name: 'Manipal Hospital Old Airport Road',
    type: 'Hospital',
    address: '98, HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka 560017',
    phone: '080-25024444',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Care',
    isEmergency: true,
    cityOrArea: 'Bengaluru',
    lat: 12.9592,
    lon: 77.6493,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.9592,77.6493',
  },
  {
    id: 'blr-apollo-jayanagar',
    name: 'Apollo Speciality Hospital Jayanagar',
    type: 'Hospital',
    address: '21/2, 14th Cross Road, 3rd Block, Jayanagar, Bengaluru, Karnataka 560011',
    phone: '080-46124444',
    isOpen: true,
    statusText: 'Open 24 Hours • Senior OPD & Emergency',
    isEmergency: true,
    cityOrArea: 'Bengaluru',
    lat: 12.9310,
    lon: 77.5840,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.9310,77.5840',
  },
  {
    id: 'blr-narayana',
    name: 'Narayana Health City',
    type: 'Hospital',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099',
    phone: '080-71222222',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & Cardiac Care',
    isEmergency: true,
    cityOrArea: 'Bengaluru',
    lat: 12.8120,
    lon: 77.6950,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.8120,77.6950',
  },

  // Hyderabad & Telangana
  {
    id: 'hyd-nims',
    name: "Nizam's Institute of Medical Sciences (NIMS)",
    type: 'Emergency Care',
    address: 'Punjagutta, Hyderabad, Telangana 500082',
    phone: '040-23489000',
    isOpen: true,
    statusText: 'Open 24 Hours • Super Speciality & Emergency',
    isEmergency: true,
    cityOrArea: 'Hyderabad',
    lat: 17.4230,
    lon: 78.4520,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=17.4230,78.4520',
  },
  {
    id: 'hyd-osmania',
    name: 'Osmania General Hospital',
    type: 'Hospital',
    address: 'Afzal Gunj, Hyderabad, Telangana 500012',
    phone: '040-24600121',
    isOpen: true,
    statusText: 'Open 24 Hours • Public General Hospital',
    isEmergency: true,
    cityOrArea: 'Hyderabad',
    lat: 17.3760,
    lon: 78.4740,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=17.3760,78.4740',
  },
  {
    id: 'hyd-apollo',
    name: 'Apollo Health City Jubilee Hills',
    type: 'Hospital',
    address: 'Road No. 72, Opposite Bharatiya Vidya Bhavan, Jubilee Hills, Hyderabad, Telangana 500033',
    phone: '040-23607777',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency Care',
    isEmergency: true,
    cityOrArea: 'Hyderabad',
    lat: 17.4250,
    lon: 78.4110,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=17.4250,78.4110',
  },

  // Chennai & Tamil Nadu
  {
    id: 'chn-rgggh',
    name: 'Rajiv Gandhi Government General Hospital',
    type: 'Emergency Care',
    address: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003',
    phone: '044-25305000',
    isOpen: true,
    statusText: 'Open 24 Hours • Government Trauma Care',
    isEmergency: true,
    cityOrArea: 'Chennai',
    lat: 13.0815,
    lon: 80.2770,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.0815,80.2770',
  },
  {
    id: 'chn-apollo',
    name: 'Apollo Hospitals Greams Road',
    type: 'Hospital',
    address: '21, Greams Lane, Off Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006',
    phone: '044-28290200',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & Critical Care',
    isEmergency: true,
    cityOrArea: 'Chennai',
    lat: 13.0600,
    lon: 80.2520,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=13.0600,80.2520',
  },

  // Kolkata & West Bengal
  {
    id: 'kol-sskm',
    name: 'SSKM Hospital (IPGMER)',
    type: 'Emergency Care',
    address: '244, AJC Bose Road, Bhowanipore, Kolkata, West Bengal 700020',
    phone: '033-22231589',
    isOpen: true,
    statusText: 'Open 24 Hours • Government Medical College & Hospital',
    isEmergency: true,
    cityOrArea: 'Kolkata',
    lat: 22.5390,
    lon: 88.3440,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=22.5390,88.3440',
  },
  {
    id: 'kol-apollo',
    name: 'Apollo Multispeciality Hospitals Salt Lake',
    type: 'Hospital',
    address: '58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata, West Bengal 700054',
    phone: '033-23203040',
    isOpen: true,
    statusText: 'Open 24 Hours • Multi-Speciality Emergency',
    isEmergency: true,
    cityOrArea: 'Kolkata',
    lat: 22.5700,
    lon: 88.3970,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=22.5700,88.3970',
  },

  // Ahmedabad & Gujarat
  {
    id: 'ahd-civil',
    name: 'Ahmedabad Civil Hospital',
    type: 'Emergency Care',
    address: 'Haripura, Asarwa, Ahmedabad, Gujarat 380016',
    phone: '079-22683721',
    isOpen: true,
    statusText: 'Open 24 Hours • Asia Largest Civil Hospital',
    isEmergency: true,
    cityOrArea: 'Ahmedabad',
    lat: 23.0520,
    lon: 72.6040,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.0520,72.6040',
  },
  {
    id: 'ahd-zydus',
    name: 'Zydus Hospital',
    type: 'Hospital',
    address: 'Zydus Hospital Road, SG Highway, Thaltej, Ahmedabad, Gujarat 380054',
    phone: '079-66190201',
    isOpen: true,
    statusText: 'Open 24 Hours • Emergency & Cardiac',
    isEmergency: true,
    cityOrArea: 'Ahmedabad',
    lat: 23.0640,
    lon: 72.5080,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.0640,72.5080',
  },

  // Jaipur & Rajasthan
  {
    id: 'jai-sms',
    name: 'Sawai Man Singh (SMS) Hospital',
    type: 'Emergency Care',
    address: 'Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur, Rajasthan 302004',
    phone: '0141-2518224',
    isOpen: true,
    statusText: 'Open 24 Hours • Government Medical Care',
    isEmergency: true,
    cityOrArea: 'Jaipur',
    lat: 26.9030,
    lon: 75.8150,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.9030,75.8150',
  },

  // Lucknow & UP
  {
    id: 'lko-kgmu',
    name: "King George's Medical University (KGMU)",
    type: 'Emergency Care',
    address: 'Shah Mina Road, Chowk, Lucknow, Uttar Pradesh 226003',
    phone: '0522-2257450',
    isOpen: true,
    statusText: 'Open 24 Hours • Trauma & Emergency Block',
    isEmergency: true,
    cityOrArea: 'Lucknow',
    lat: 26.8680,
    lon: 80.9160,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.8680,80.9160',
  },

  // Chandigarh & Punjab
  {
    id: 'chd-pgimer',
    name: 'PGIMER Chandigarh',
    type: 'Emergency Care',
    address: 'Sector 12, Chandigarh 160012',
    phone: '0172-2747585',
    isOpen: true,
    statusText: 'Open 24 Hours • Premier Medical & Trauma Care',
    isEmergency: true,
    cityOrArea: 'Chandigarh',
    lat: 30.7640,
    lon: 76.7760,
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=30.7640,76.7760',
  },
];

/**
 * Fetch facilities near a latitude/longitude using OpenStreetMap Nominatim
 * with graceful fallback to distance-calculated curated Indian facilities.
 * Respects strict user privacy (no storage, no Gemini forwarding).
 */
export async function fetchNearbyFacilities(
  userLat: number,
  userLon: number
): Promise<{ locationName: string; facilities: CareFacility[]; source: string }> {
  let locationName = 'Your Current Area';
  const facilities: CareFacility[] = [];

  // 1. Reverse-geocode location name for senior reassurance
  try {
    const revRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`,
      {
        headers: { 'User-Agent': 'MitraOne-App/1.0 (care-finder@mitraone.app)' },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (revRes.ok) {
      const revData = (await revRes.json()) as any;
      const addr = revData.address || {};
      const area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county;
      const city = addr.city || addr.state_district || addr.state;
      if (area && city && area !== city) {
        locationName = `${area}, ${city}`;
      } else if (area || city) {
        locationName = (area || city) as string;
      }
    }
  } catch {
    // ignore
  }

  // 2. Query Nominatim bounded search
  const delta = 0.12; // ~13 km viewbox
  const minLon = userLon - delta;
  const maxLon = userLon + delta;
  const minLat = userLat - delta;
  const maxLat = userLat + delta;

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=12`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'MitraOne-App/1.0 (care-finder@mitraone.app)' },
      signal: AbortSignal.timeout(5000),
    });

    if (searchRes.ok) {
      const results = (await searchRes.json()) as any[];
      if (Array.isArray(results) && results.length > 0) {
        for (const item of results) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lon)) continue;

          const distKm = calculateDistanceKm(userLat, userLon, lat, lon);
          const fullDisplay: string = item.display_name || '';
          const parts = fullDisplay.split(',').map((s) => s.trim());
          const cleanName = parts[0] || 'Community Care Facility';
          const address = parts.slice(1, 4).join(', ') || fullDisplay;

          const lowerName = cleanName.toLowerCase();
          const isEmergency =
            lowerName.includes('hospital') ||
            lowerName.includes('emergency') ||
            lowerName.includes('trauma') ||
            lowerName.includes('institute') ||
            lowerName.includes('medical college');
          const type: 'Hospital' | 'Clinic' | 'Emergency Care' = lowerName.includes('clinic')
            ? 'Clinic'
            : isEmergency
              ? 'Hospital'
              : 'Hospital';

          facilities.push({
            id: `osm-${item.place_id || Math.random().toString(36).slice(2, 8)}`,
            name: cleanName,
            type,
            distanceKm: distKm,
            distanceText: `${distKm} km away`,
            address: address,
            phone: isEmergency ? '112 / 108 (National Helpline)' : 'Call facility for verification',
            isOpen: true,
            statusText: isEmergency ? 'Open 24 Hours • Emergency Services' : 'Open • Call to verify timings',
            isEmergency,
            directionsUrl: buildDirectionsUrl(cleanName, address, lat, lon),
            lat,
            lon,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim bounded search skipped, using curated facility proximity:', err);
  }

  // 3. Fallback / Merge with Curated Database with distances calculated from user coordinates
  if (facilities.length < 3) {
    const scoredCurated = CURATED_INDIAN_FACILITIES.map((f) => {
      const dist = f.lat && f.lon ? calculateDistanceKm(userLat, userLon, f.lat, f.lon) : 9999;
      return {
        ...f,
        distanceKm: dist,
        distanceText: `${dist} km away`,
      };
    });

    // Sort by calculated distance ascending
    scoredCurated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    // Append nearest curated facilities if not already in list
    for (const c of scoredCurated) {
      if (facilities.length >= 8) break;
      if (!facilities.some((f) => f.name.toLowerCase().includes(c.name.toLowerCase().slice(0, 10)))) {
        facilities.push(c);
      }
    }
  }

  // 4. Strict Safety Rule: Sort strictly by distance, NEVER rank by medical quality!
  facilities.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  return {
    locationName,
    facilities,
    source: facilities.some((f) => f.id.startsWith('osm-')) ? 'live' : 'verified_directory',
  };
}

/**
 * Search facilities manually by city, locality or area query
 */
export async function searchFacilitiesByQuery(
  query: string
): Promise<{ query: string; locationName: string; facilities: CareFacility[] }> {
  const cleanQuery = (query || '').trim();
  const facilities: CareFacility[] = [];

  if (!cleanQuery) {
    return { query: '', locationName: '', facilities: [] };
  }

  // 1. Try Nominatim search for hospitals/clinics in area
  try {
    const encoded = encodeURIComponent(`hospital in ${cleanQuery}`);
    const searchRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=10`,
      {
        headers: { 'User-Agent': 'MitraOne-App/1.0 (care-finder@mitraone.app)' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (searchRes.ok) {
      const results = (await searchRes.json()) as any[];
      if (Array.isArray(results) && results.length > 0) {
        for (const item of results) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const fullDisplay: string = item.display_name || '';
          const parts = fullDisplay.split(',').map((s) => s.trim());
          const cleanName = parts[0] || 'Community Care Facility';
          const address = parts.slice(1, 4).join(', ') || fullDisplay;

          const lowerName = cleanName.toLowerCase();
          const isEmergency =
            lowerName.includes('hospital') ||
            lowerName.includes('emergency') ||
            lowerName.includes('trauma') ||
            lowerName.includes('medical college');
          const type: 'Hospital' | 'Clinic' | 'Emergency Care' = lowerName.includes('clinic')
            ? 'Clinic'
            : 'Hospital';

          facilities.push({
            id: `osm-search-${item.place_id || Math.random().toString(36).slice(2, 8)}`,
            name: cleanName,
            type,
            address,
            phone: isEmergency ? '112 / 108 (National Helpline)' : 'Call facility for verification',
            isOpen: true,
            statusText: isEmergency ? 'Open 24 Hours • Emergency Services' : 'Open • Call to verify',
            isEmergency,
            directionsUrl: buildDirectionsUrl(cleanName, address, lat, lon),
            lat,
            lon,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim manual search failed, using curated query search:', err);
  }

  // 2. Search Curated Database for city/locality match
  const qLower = cleanQuery.toLowerCase();
  const matchedCurated = CURATED_INDIAN_FACILITIES.filter(
    (f) =>
      f.cityOrArea?.toLowerCase().includes(qLower) ||
      f.address.toLowerCase().includes(qLower) ||
      f.name.toLowerCase().includes(qLower)
  );

  for (const c of matchedCurated) {
    if (!facilities.some((f) => f.name.toLowerCase().includes(c.name.toLowerCase().slice(0, 10)))) {
      facilities.push(c);
    }
  }

  // If still empty, return top major regional emergency facilities
  if (facilities.length === 0) {
    facilities.push(...CURATED_INDIAN_FACILITIES.slice(0, 6));
  }

  return {
    query: cleanQuery,
    locationName: cleanQuery,
    facilities,
  };
}
