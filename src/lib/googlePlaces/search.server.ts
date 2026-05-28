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

type Rect = { low: { latitude: number; longitude: number }; high: { latitude: number; longitude: number } };

const COUNTRY_SUB_REGIONS: Record<string, { label: string; rect: Rect }[]> = {
  US: [
    { label: 'PACIFIC_NW',  rect: { low: { latitude: 42.0, longitude: -125.0 }, high: { latitude: 49.0, longitude: -116.0 } } },
    { label: 'WEST_COAST',  rect: { low: { latitude: 32.5, longitude: -125.0 }, high: { latitude: 42.0, longitude: -114.0 } } },
    { label: 'MOUNTAIN',    rect: { low: { latitude: 31.3, longitude: -116.0 }, high: { latitude: 49.0, longitude: -102.0 } } },
    { label: 'TEXAS',       rect: { low: { latitude: 25.8, longitude: -106.7 }, high: { latitude: 36.5, longitude: -93.5  } } },
    { label: 'MIDWEST',     rect: { low: { latitude: 36.0, longitude: -102.0 }, high: { latitude: 49.0, longitude: -82.0  } } },
    { label: 'SOUTH',       rect: { low: { latitude: 24.4, longitude: -93.5  }, high: { latitude: 36.5, longitude: -75.5  } } },
    { label: 'FLORIDA',     rect: { low: { latitude: 24.4, longitude: -87.6  }, high: { latitude: 31.0, longitude: -80.0  } } },
    { label: 'NORTHEAST',   rect: { low: { latitude: 36.5, longitude: -82.0  }, high: { latitude: 47.5, longitude: -66.9  } } },
  ],
  DE: [
    { label: 'NORTH',  rect: { low: { latitude: 52.5, longitude: 6.5  }, high: { latitude: 55.1, longitude: 14.0 } } },
    { label: 'WEST',   rect: { low: { latitude: 49.5, longitude: 5.87 }, high: { latitude: 52.5, longitude: 9.0  } } },
    { label: 'EAST',   rect: { low: { latitude: 50.2, longitude: 11.0 }, high: { latitude: 53.7, longitude: 15.0 } } },
    { label: 'SOUTH',  rect: { low: { latitude: 47.3, longitude: 7.5  }, high: { latitude: 50.5, longitude: 13.8 } } },
  ],
  GB: [
    { label: 'SCOTLAND', rect: { low: { latitude: 54.6, longitude: -8.0 }, high: { latitude: 60.9, longitude: -0.5 } } },
    { label: 'N_ENG',    rect: { low: { latitude: 52.8, longitude: -3.5 }, high: { latitude: 55.0, longitude: 0.5  } } },
    { label: 'MIDLANDS', rect: { low: { latitude: 51.6, longitude: -3.5 }, high: { latitude: 53.0, longitude: 1.7  } } },
    { label: 'SOUTH',    rect: { low: { latitude: 49.9, longitude: -6.0 }, high: { latitude: 51.8, longitude: 1.7  } } },
    { label: 'WALES',    rect: { low: { latitude: 51.3, longitude: -5.5 }, high: { latitude: 53.5, longitude: -2.6 } } },
  ],
  FR: [
    { label: 'IDF',         rect: { low: { latitude: 48.1, longitude: 1.4  }, high: { latitude: 49.2, longitude: 3.6  } } },
    { label: 'NORTH',       rect: { low: { latitude: 49.0, longitude: -1.0 }, high: { latitude: 51.1, longitude: 5.5  } } },
    { label: 'WEST',        rect: { low: { latitude: 45.5, longitude: -5.1 }, high: { latitude: 49.0, longitude: 1.5  } } },
    { label: 'SOUTH_WEST',  rect: { low: { latitude: 41.4, longitude: -2.0 }, high: { latitude: 45.5, longitude: 3.5  } } },
    { label: 'SOUTH_EAST',  rect: { low: { latitude: 41.4, longitude: 3.5  }, high: { latitude: 47.5, longitude: 9.6  } } },
  ],
  NO: [
    { label: 'SOUTH', rect: { low: { latitude: 58.0, longitude: 4.6  }, high: { latitude: 62.5, longitude: 12.5 } } },
    { label: 'MID',   rect: { low: { latitude: 62.5, longitude: 4.6  }, high: { latitude: 66.5, longitude: 17.0 } } },
    { label: 'NORTH', rect: { low: { latitude: 66.5, longitude: 12.0 }, high: { latitude: 71.2, longitude: 31.2 } } },
  ],
  NL: [
    { label: 'NORTH', rect: { low: { latitude: 52.3, longitude: 4.5 }, high: { latitude: 53.5, longitude: 7.2 } } },
    { label: 'WEST',  rect: { low: { latitude: 51.7, longitude: 3.4 }, high: { latitude: 52.6, longitude: 5.2 } } },
    { label: 'SOUTH', rect: { low: { latitude: 50.7, longitude: 3.4 }, high: { latitude: 52.0, longitude: 7.2 } } },
  ],
  AT: [
    { label: 'WEST', rect: { low: { latitude: 46.4, longitude: 9.5  }, high: { latitude: 49.0, longitude: 13.0 } } },
    { label: 'EAST', rect: { low: { latitude: 46.4, longitude: 13.0 }, high: { latitude: 49.0, longitude: 17.2 } } },
  ],
  CH: [
    { label: 'WEST', rect: { low: { latitude: 45.8, longitude: 5.96 }, high: { latitude: 47.8, longitude: 8.2  } } },
    { label: 'EAST', rect: { low: { latitude: 45.8, longitude: 8.2  }, high: { latitude: 47.8, longitude: 10.5 } } },
  ],
  ES: [
    { label: 'NORTH',  rect: { low: { latitude: 41.5, longitude: -9.3 }, high: { latitude: 43.8, longitude: 3.4  } } },
    { label: 'CENTER', rect: { low: { latitude: 38.5, longitude: -7.5 }, high: { latitude: 41.5, longitude: 0.5  } } },
    { label: 'EAST',   rect: { low: { latitude: 37.0, longitude: 0.0  }, high: { latitude: 41.5, longitude: 3.4  } } },
    { label: 'SOUTH',  rect: { low: { latitude: 35.9, longitude: -7.5 }, high: { latitude: 38.5, longitude: 0.0  } } },
  ],
  IT: [
    { label: 'NORTH',  rect: { low: { latitude: 43.7, longitude: 6.6  }, high: { latitude: 47.1, longitude: 14.0 } } },
    { label: 'CENTER', rect: { low: { latitude: 41.0, longitude: 9.5  }, high: { latitude: 43.7, longitude: 14.5 } } },
    { label: 'SOUTH',  rect: { low: { latitude: 36.6, longitude: 12.0 }, high: { latitude: 41.0, longitude: 18.5 } } },
    { label: 'ISLES',  rect: { low: { latitude: 36.6, longitude: 7.5  }, high: { latitude: 41.3, longitude: 12.0 } } },
  ],
  SE: [
    { label: 'SOUTH', rect: { low: { latitude: 55.3, longitude: 11.1 }, high: { latitude: 59.5, longitude: 19.0 } } },
    { label: 'MID',   rect: { low: { latitude: 59.5, longitude: 11.1 }, high: { latitude: 64.0, longitude: 20.5 } } },
    { label: 'NORTH', rect: { low: { latitude: 64.0, longitude: 12.0 }, high: { latitude: 69.1, longitude: 24.2 } } },
  ],
  DK: [
    { label: 'WEST', rect: { low: { latitude: 54.5, longitude: 8.0  }, high: { latitude: 57.8, longitude: 11.0 } } },
    { label: 'EAST', rect: { low: { latitude: 54.5, longitude: 11.0 }, high: { latitude: 57.8, longitude: 15.2 } } },
  ],
  PL: [
    { label: 'NORTH', rect: { low: { latitude: 52.0, longitude: 14.1 }, high: { latitude: 54.9, longitude: 24.2 } } },
    { label: 'WEST',  rect: { low: { latitude: 49.0, longitude: 14.1 }, high: { latitude: 52.0, longitude: 19.0 } } },
    { label: 'EAST',  rect: { low: { latitude: 49.0, longitude: 19.0 }, high: { latitude: 52.0, longitude: 24.2 } } },
  ],
  BE: [
    { label: 'NORTH', rect: { low: { latitude: 50.7, longitude: 2.55 }, high: { latitude: 51.5, longitude: 6.4 } } },
    { label: 'SOUTH', rect: { low: { latitude: 49.5, longitude: 2.55 }, high: { latitude: 50.7, longitude: 6.4 } } },
  ],
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
    const subRegions = COUNTRY_SUB_REGIONS[upperCountry];
    const bounds = COUNTRY_BOUNDS[upperCountry];

    if (!subRegions || subRegions.length === 0) {
      const locationParam = bounds ? { locationRestriction: { rectangle: bounds } } : {};
      const results = await searchRegion(brand, googleApiKey, language, maxLocations, locationParam, countryNames, upperCountry);
      return results
        .filter(nameFilter)
        .map(({ _placeId: _pid, ...rest }) => { void _pid; return rest; });
    }

    const perRegion = Math.max(10, Math.ceil(maxLocations / Math.max(1, Math.ceil(subRegions.length / 2))));
    const regionResults = await Promise.all(
      subRegions.map(r =>
        searchRegion(
          brand,
          googleApiKey,
          language,
          perRegion,
          { locationRestriction: { rectangle: r.rect } },
          countryNames,
          `${upperCountry}_${r.label}`,
        ),
      ),
    );

    // Dedupe + name filter, preserve per-region buckets for interleaving
    const seen = new Set<string>();
    const buckets: PlaceWithId[][] = regionResults.map(list => {
      const out: PlaceWithId[] = [];
      for (const p of list) {
        const id = p._placeId || p.name + '|' + p.address;
        if (seen.has(id)) continue;
        seen.add(id);
        if (!nameFilter(p)) continue;
        out.push(p);
      }
      return out;
    });

    // Domain filter across all
    const flat = ([] as PlaceWithId[]).concat(...buckets);
    const domainFiltered = new Set(filterByDominantDomain(flat).map(p => p._placeId || p.name + '|' + p.address));
    const filteredBuckets = buckets.map(b => b.filter(p => domainFiltered.has(p._placeId || p.name + '|' + p.address)));

    // Round-robin interleave so every sub-region is represented
    const interleaved: PlaceWithId[] = [];
    const cursors = filteredBuckets.map(() => 0);
    let added = true;
    while (added && interleaved.length < maxLocations) {
      added = false;
      for (let i = 0; i < filteredBuckets.length; i++) {
        if (interleaved.length >= maxLocations) break;
        const bucket = filteredBuckets[i];
        if (cursors[i] < bucket.length) {
          interleaved.push(bucket[cursors[i]++]);
          added = true;
        }
      }
    }

    const counts = subRegions.map((r, i) => `${r.label}:${filteredBuckets[i].length}`).join(', ');
    console.log(`[Google Places ${upperCountry}] ${counts} → Final: ${interleaved.length}`);

    return interleaved.map(({ _placeId: _pid, ...rest }) => { void _pid; return rest; });
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
