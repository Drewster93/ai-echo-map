import { GooglePlacesLocation } from './types';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.types',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.location',
  'places.googleMapsUri',
  'places.photos',
  'places.reviews',
].join(',');

interface GooglePlacesResponse {
  places?: GooglePlaceRaw[];
  nextPageToken?: string;
}

interface GoogleReviewRaw {
  rating?: number;
  text?: { text: string };
  originalText?: { text: string };
  authorAttribution?: { displayName: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface GooglePlaceRaw {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  photos?: Array<{ name: string }>;
  reviews?: GoogleReviewRaw[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function parseOpeningHours(descriptions: string[] | undefined): { day: string; hours: string }[] | null {
  if (!descriptions || descriptions.length === 0) return null;
  return descriptions.map((desc, i) => {
    const parts = desc.split(': ');
    return {
      day: parts[0] || DAYS[i] || `Day ${i + 1}`,
      hours: parts.slice(1).join(': ') || desc,
    };
  });
}

function mapPlace(raw: GooglePlaceRaw): GooglePlacesLocation {
  const googleReviews = (raw.reviews || []).map(r => ({
    rating: r.rating || 0,
    hasOwnerResponse: false,
  }));

  return {
    name: raw.displayName?.text || 'Unknown',
    address: raw.formattedAddress || '',
    phone: raw.internationalPhoneNumber || null,
    website: raw.websiteUri || null,
    latitude: raw.location?.latitude || 0,
    longitude: raw.location?.longitude || 0,
    rating: raw.rating || null,
    reviewCount: raw.userRatingCount || 0,
    businessStatus: raw.businessStatus || 'UNKNOWN',
    primaryCategory: raw.primaryTypeDisplayName?.text || raw.primaryType || '',
    allCategories: raw.types || [],
    openingHours: parseOpeningHours(raw.regularOpeningHours?.weekdayDescriptions),
    googleMapsUri: raw.googleMapsUri || '',
    placeId: raw.id || '',
    photosCount: raw.photos?.length || 0,
    googleReviews,
  };
}

const COUNTRY_NAMES: Record<string, string[]> = {
  US: ['United States', 'USA', 'U.S.A.', 'U.S.'],
  DE: ['Germany', 'Deutschland'],
  GB: ['United Kingdom', 'UK', 'England', 'Scotland', 'Wales'],
  FR: ['France'],
  NO: ['Norway', 'Norge'],
  NL: ['Netherlands', 'Nederland'],
  AT: ['Austria', 'Österreich'],
  CH: ['Switzerland', 'Schweiz', 'Suisse', 'Svizzera'],
  ES: ['Spain', 'España'],
  IT: ['Italy', 'Italia'],
  SE: ['Sweden', 'Sverige'],
  DK: ['Denmark', 'Danmark'],
  PL: ['Poland', 'Polska'],
  BE: ['Belgium', 'Belgique', 'België'],
};

const COUNTRY_BOUNDS: Record<string, { low: { latitude: number; longitude: number }; high: { latitude: number; longitude: number } }> = {
  US: { low: { latitude: 24.396, longitude: -125.0 }, high: { latitude: 49.384, longitude: -66.934 } },
  DE: { low: { latitude: 47.27, longitude: 5.87 }, high: { latitude: 55.06, longitude: 15.04 } },
  GB: { low: { latitude: 49.96, longitude: -8.17 }, high: { latitude: 60.86, longitude: 1.75 } },
  FR: { low: { latitude: 41.36, longitude: -5.14 }, high: { latitude: 51.09, longitude: 9.56 } },
  NO: { low: { latitude: 57.96, longitude: 4.64 }, high: { latitude: 71.19, longitude: 31.17 } },
  NL: { low: { latitude: 50.75, longitude: 3.37 }, high: { latitude: 53.47, longitude: 7.21 } },
  AT: { low: { latitude: 46.37, longitude: 9.53 }, high: { latitude: 49.02, longitude: 17.16 } },
  CH: { low: { latitude: 45.82, longitude: 5.96 }, high: { latitude: 47.81, longitude: 10.49 } },
  ES: { low: { latitude: 36.0, longitude: -9.3 }, high: { latitude: 43.79, longitude: 3.35 } },
  IT: { low: { latitude: 36.62, longitude: 6.63 }, high: { latitude: 47.09, longitude: 18.52 } },
  SE: { low: { latitude: 55.34, longitude: 11.11 }, high: { latitude: 69.06, longitude: 24.17 } },
  DK: { low: { latitude: 54.56, longitude: 8.07 }, high: { latitude: 57.75, longitude: 15.2 } },
  PL: { low: { latitude: 49.0, longitude: 14.12 }, high: { latitude: 54.84, longitude: 24.15 } },
  BE: { low: { latitude: 49.5, longitude: 2.55 }, high: { latitude: 51.5, longitude: 6.4 } },
};

interface PlaceWithId extends GooglePlacesLocation {
  _placeId?: string;
}

async function searchRegion(
  brand: string,
  googleApiKey: string,
  language: string,
  maxLocations: number,
  locationParam: Record<string, unknown>,
  countryNames: string[] | null,
  regionLabel: string,
): Promise<PlaceWithId[]> {
  const places: PlaceWithId[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;
  const maxPages = 5;

  while (pageCount < maxPages) {
    const body: Record<string, unknown> = {
      textQuery: brand,
      languageCode: language,
      pageSize: 20,
      ...locationParam,
    };

    if (pageToken) body.pageToken = pageToken;

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': FIELD_MASK + ',nextPageToken',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Places API error (${response.status}): ${errText}`);
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.places) {
      for (const place of data.places) {
        const mapped = mapPlace(place) as PlaceWithId;
        mapped._placeId = place.id;
        if (countryNames) {
          const addr = (mapped.address || '').toLowerCase();
          if (!countryNames.some(n => addr.includes(n.toLowerCase()))) continue;
        }
        places.push(mapped);
        if (places.length >= maxLocations) break;
      }
    }

    pageToken = data.nextPageToken;
    pageCount++;
    console.log(`[Google Places ${regionLabel}] Page ${pageCount}: ${data.places?.length || 0} raw, ${places.length} kept, hasNextPage: ${!!pageToken}`);

    if (places.length >= maxLocations || !pageToken) break;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return places;
}

export async function searchGooglePlaces(
  brand: string,
  googleApiKey: string,
  options: {
    country?: string;
    language?: string;
    maxLocations?: number;
  } = {}
): Promise<GooglePlacesLocation[]> {
  const { country, language = 'en', maxLocations = 20 } = options;
  const upperCountry = country ? country.toUpperCase() : '';
  const countryNames = (upperCountry && upperCountry !== 'GLOBAL') ? COUNTRY_NAMES[upperCountry] : null;

  const GENERIC = new Set(['group', 'inc', 'llc', 'ltd', 'gmbh', 'co', 'corp', 'corporation', 'the', 'and', '&']);
  const brandWords = brand.toLowerCase().split(/\s+/)
    .map(w => w.replace(/[^a-zà-ÿ0-9]/gi, ''))
    .filter(w => w.length > 2 && !GENERIC.has(w));

  const nameFilter = (place: GooglePlacesLocation): boolean => {
    if (brandWords.length === 0) return true;
    const nameLower = (place.name || '').toLowerCase();
    return brandWords.some(w => nameLower.includes(w));
  };

  if (country && country.toLowerCase() !== 'global') {
    const bounds = COUNTRY_BOUNDS[upperCountry];
    const locationParam = bounds ? { locationRestriction: { rectangle: bounds } } : {};
    const results = await searchRegion(brand, googleApiKey, language, maxLocations, locationParam, countryNames, upperCountry);
    return results
      .filter(nameFilter)
      .map(({ _placeId: _pid, ...rest }) => { void _pid; return rest; });
  }

  const regions: { label: string; bias: Record<string, unknown> }[] = [
    { label: 'NA_WEST',    bias: { locationBias: { rectangle: { low: { latitude: 15.0,  longitude: -170.0 }, high: { latitude: 72.0,  longitude: -100.0 } } } } },
    { label: 'NA_EAST',    bias: { locationBias: { rectangle: { low: { latitude: 15.0,  longitude: -100.0 }, high: { latitude: 72.0,  longitude: -50.0  } } } } },
    { label: 'S_AMERICA',  bias: { locationBias: { rectangle: { low: { latitude: -60.0, longitude: -90.0  }, high: { latitude: 15.0,  longitude: -30.0  } } } } },
    { label: 'EU_WEST',    bias: { locationBias: { rectangle: { low: { latitude: 35.0,  longitude: -15.0  }, high: { latitude: 72.0,  longitude: 20.0   } } } } },
    { label: 'EU_EAST',    bias: { locationBias: { rectangle: { low: { latitude: 35.0,  longitude: 20.0   }, high: { latitude: 72.0,  longitude: 60.0   } } } } },
    { label: 'AFRICA_ME',  bias: { locationBias: { rectangle: { low: { latitude: -40.0, longitude: -20.0  }, high: { latitude: 40.0,  longitude: 60.0   } } } } },
    { label: 'ASIA',       bias: { locationBias: { rectangle: { low: { latitude: 0.0,   longitude: 60.0   }, high: { latitude: 72.0,  longitude: 150.0  } } } } },
    { label: 'OCEANIA',    bias: { locationBias: { rectangle: { low: { latitude: -50.0, longitude: 110.0  }, high: { latitude: 0.0,   longitude: 179.0  } } } } },
  ];

  const results = await Promise.all(
    regions.map(r => searchRegion(brand, googleApiKey, language, 60, r.bias, null, r.label))
  );

  const seen = new Set<string>();
  const nameFiltered: PlaceWithId[] = [];
  const flat: PlaceWithId[] = ([] as PlaceWithId[]).concat(...results);
  let nameFilterRejects = 0;
  for (const place of flat) {
    const id = place._placeId || place.name + '|' + place.address;
    if (seen.has(id)) continue;
    seen.add(id);
    if (!nameFilter(place)) { nameFilterRejects++; continue; }
    nameFiltered.push(place);
  }

  const domainFiltered = filterByDominantDomain(nameFiltered);

  const merged: GooglePlacesLocation[] = domainFiltered.slice(0, maxLocations).map(({ _placeId: _pid, ...rest }) => { void _pid; return rest; });

  const counts = regions.map((r, i) => `${r.label}:${results[i].length}`).join(', ');
  console.log(`[Google Places GLOBAL] ${counts} → Name-filtered: ${nameFiltered.length} (rejected: ${nameFilterRejects}) → Domain-filtered: ${domainFiltered.length} → Final: ${merged.length}`);
  return merged;
}

function filterByDominantDomain(places: PlaceWithId[]): PlaceWithId[] {
  const getDomain = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const u = new URL(url.startsWith('http') ? url : 'https://' + url);
      const parts = u.hostname.split('.');
      return parts.slice(-2).join('.').toLowerCase();
    } catch { return null; }
  };

  const domainCounts: Record<string, number> = {};
  for (const p of places) {
    const d = getDomain(p.website);
    if (d) domainCounts[d] = (domainCounts[d] || 0) + 1;
  }

  const entries = Object.entries(domainCounts);
  if (entries.length === 0) return places;
  const maxCount = Math.max(...entries.map(([, c]) => c));
  if (maxCount < 3) return places;

  const topDomains = new Set(
    entries.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d)
  );

  return places.filter(p => {
    const d = getDomain(p.website);
    return d === null || topDomains.has(d);
  });
}
