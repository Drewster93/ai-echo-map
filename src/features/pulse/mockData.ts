import type { Location, PromptResult, Assistant } from "./types";

export const COMPETITORS = ["Brewline", "Northsip", "Caffea", "Morningfox", "Grindhouse"];

const GENERIC_PROMPTS = [
  "Best specialty coffee near me",
  "Where to work from a café",
  "Best flat white in the city",
  "Pet-friendly coffee shops",
  "Quiet café for reading",
  "Coffee with WiFi",
  "Best espresso downtown",
  "Coffee shop open late",
];

const PROMPTS_BY_CITY: Record<string, string[]> = {
  Berlin: ["Best coffee Alexanderplatz", "Specialty coffee Kreuzberg", "Quiet café Prenzlauer Berg", "Best flat white Berlin", "Coffee shops open late Berlin", "Pet-friendly café Mitte"],
  Paris: ["Specialty coffee Le Marais", "Coffee shop near Louvre", "Best espresso Saint-Germain", "Pet-friendly café Paris", "Coffee with terrace Paris", "Quiet café Montmartre"],
  London: ["Best coffee Shoreditch", "Specialty coffee Soho", "Coffee WiFi London Bridge", "Quiet café Notting Hill", "Best flat white London", "Coffee near Liverpool Street"],
  Amsterdam: ["Specialty coffee Jordaan", "Best flat white De Pijp", "Quiet café Vondelpark", "Pet-friendly coffee Amsterdam", "Coffee near Centraal", "Specialty roasters Oost"],
  Barcelona: ["Best coffee El Born", "Specialty coffee Gràcia", "Best flat white Eixample", "Coffee with terrace Barcelona", "Quiet café Poblenou"],
  Milan: ["Specialty coffee Brera", "Best espresso Navigli", "Best flat white Porta Romana", "Coffee near Duomo Milan", "Quiet café Isola"],
  Madrid: ["Specialty coffee Malasaña", "Best flat white Chueca", "Coffee near Sol Madrid", "Pet-friendly café Madrid"],
  Lisbon: ["Specialty coffee Príncipe Real", "Coffee shop Chiado", "Best flat white Lisbon", "Quiet café Alfama"],
  Dublin: ["Specialty coffee Temple Bar", "Best flat white Dublin", "Coffee near Trinity College", "Quiet café Portobello"],
  Stockholm: ["Specialty coffee Södermalm", "Best fika Stockholm", "Coffee shop Östermalm", "Quiet café Vasastan"],
  Copenhagen: ["Specialty coffee Vesterbro", "Best flat white Copenhagen", "Coffee near Nyhavn", "Quiet café Nørrebro"],
  Oslo: ["Specialty coffee Grünerløkka", "Best espresso Oslo", "Coffee shop Majorstuen"],
  Warsaw: ["Specialty coffee Śródmieście", "Best coffee Praga", "Coffee near Old Town Warsaw"],
  Vienna: ["Specialty coffee Neubau", "Best espresso Vienna", "Coffee near Stephansplatz", "Quiet café Leopoldstadt"],
  Zurich: ["Specialty coffee Kreis 5", "Best flat white Zurich", "Coffee near Bahnhofstrasse"],
  Rome: ["Specialty coffee Trastevere", "Best espresso Rome", "Coffee near Pantheon", "Quiet café Testaccio"],
  Athens: ["Specialty coffee Koukaki", "Best freddo cappuccino Athens", "Coffee near Acropolis"],
  Istanbul: ["Specialty coffee Karaköy", "Best Turkish coffee Beyoğlu", "Coffee near Galata Tower", "Quiet café Kadıköy"],
  "New York": ["Specialty coffee SoHo", "Best flat white Lower East Side", "Coffee WiFi Midtown", "Quiet café Greenpoint", "Pet-friendly coffee Brooklyn", "Coffee near Bryant Park"],
  "San Francisco": ["Specialty coffee Mission", "Best flat white SoMa", "Quiet café Noe Valley", "Coffee near Salesforce Tower"],
  "Los Angeles": ["Specialty coffee Silver Lake", "Best flat white Venice", "Coffee shop DTLA", "Quiet café Highland Park"],
  Chicago: ["Specialty coffee West Loop", "Best espresso Wicker Park", "Coffee near Millennium Park"],
  Austin: ["Specialty coffee East Austin", "Best flat white South Congress", "Coffee shop downtown Austin"],
  Miami: ["Specialty coffee Wynwood", "Best café Brickell", "Coffee near South Beach"],
  Seattle: ["Specialty coffee Capitol Hill", "Best espresso Ballard", "Coffee shop Fremont"],
  Vancouver: ["Specialty coffee Mount Pleasant", "Best flat white Gastown", "Coffee near Granville Island"],
  Montreal: ["Specialty coffee Mile End", "Best espresso Plateau", "Coffee shop Old Montreal"],
  Toronto: ["Specialty coffee Queen West", "Best flat white Kensington Market", "Quiet café Leslieville", "Coffee near Union Station"],
  "Mexico City": ["Specialty coffee Roma Norte", "Best café Condesa", "Coffee shop Polanco", "Quiet café Coyoacán"],
  "São Paulo": ["Specialty coffee Vila Madalena", "Best espresso Pinheiros", "Coffee shop Itaim Bibi"],
  "Buenos Aires": ["Specialty coffee Palermo", "Best flat white Recoleta", "Coffee shop San Telmo"],
  Bogotá: ["Specialty coffee Chapinero", "Best café Usaquén", "Coffee near Zona Rosa"],
  Lima: ["Specialty coffee Barranco", "Best espresso Miraflores", "Coffee shop San Isidro"],
  Dubai: ["Specialty coffee Alserkal", "Best flat white DIFC", "Coffee near Dubai Marina", "Quiet café Jumeirah"],
  "Tel Aviv": ["Specialty coffee Florentin", "Best flat white Rothschild", "Coffee shop Neve Tzedek"],
  Cairo: ["Specialty coffee Zamalek", "Best café Maadi", "Coffee shop downtown Cairo"],
  Nairobi: ["Specialty coffee Westlands", "Best flat white Karen", "Coffee shop Kilimani"],
  "Cape Town": ["Specialty coffee Woodstock", "Best flat white Sea Point", "Coffee shop De Waterkant"],
  Lagos: ["Specialty coffee Lekki", "Best café Victoria Island", "Coffee shop Ikoyi"],
  Mumbai: ["Specialty coffee Bandra", "Best espresso Lower Parel", "Coffee shop Colaba"],
  Bangalore: ["Specialty coffee Indiranagar", "Best flat white Koramangala", "Coffee shop Jayanagar"],
  Delhi: ["Specialty coffee Hauz Khas", "Best café Khan Market", "Coffee near Connaught Place"],
  Bangkok: ["Specialty coffee Ari", "Best flat white Thonglor", "Coffee shop Ekkamai", "Quiet café Sathorn"],
  Jakarta: ["Specialty coffee Kemang", "Best espresso Senopati", "Coffee shop Menteng"],
  Seoul: ["Specialty coffee Seongsu", "Best flat white Itaewon", "Coffee shop Hongdae", "Quiet café Yeonnam"],
  "Hong Kong": ["Specialty coffee Sheung Wan", "Best flat white Central", "Coffee shop Sai Ying Pun"],
  Taipei: ["Specialty coffee Da'an", "Best pour-over Taipei", "Coffee shop Zhongshan"],
  Manila: ["Specialty coffee BGC", "Best flat white Makati", "Coffee shop Poblacion"],
  "Kuala Lumpur": ["Specialty coffee Bangsar", "Best flat white KLCC", "Coffee shop Bukit Bintang"],
  Shanghai: ["Specialty coffee Jing'an", "Best flat white Xuhui", "Coffee shop French Concession"],
  Tokyo: ["Specialty coffee Shibuya", "Quiet café Daikanyama", "Best pour-over Nakameguro", "Coffee near Tokyo Station", "Specialty coffee Shimokitazawa"],
  Singapore: ["Specialty coffee Tiong Bahru", "Best flat white Telok Ayer", "Quiet café Tanjong Pagar", "Coffee near Raffles Place"],
  Sydney: ["Specialty coffee Surry Hills", "Best flat white Newtown", "Quiet café Paddington", "Coffee near Circular Quay"],
  Melbourne: ["Specialty coffee Fitzroy", "Best flat white Collingwood", "Coffee shop CBD", "Quiet café Carlton"],
  Brisbane: ["Specialty coffee Fortitude Valley", "Best flat white West End", "Coffee shop New Farm"],
  Perth: ["Specialty coffee Leederville", "Best flat white Northbridge", "Coffee shop Subiaco"],
  Auckland: ["Specialty coffee Ponsonby", "Best flat white CBD Auckland", "Coffee shop Kingsland"],
};

const ASSISTANTS: Exclude<Assistant, "all">[] = ["chatgpt", "perplexity", "gemini", "claude"];

type Seed = [string, string, number, number]; // [area, name, lat, lng]

const SEEDS: Record<string, Seed[]> = {
  Berlin: [
    ["Mitte", "Lumen Mitte Flagship", 52.524, 13.404],
    ["Mitte", "Lumen Hackescher Markt", 52.5225, 13.4023],
    ["Mitte", "Lumen Rosenthaler", 52.526, 13.4015],
    ["Mitte", "Lumen Friedrichstraße", 52.519, 13.388],
    ["Kreuzberg", "Lumen Bergmannkiez", 52.491, 13.39],
    ["Kreuzberg", "Lumen Kotti", 52.499, 13.418],
    ["Kreuzberg", "Lumen Görlitzer", 52.497, 13.43],
    ["Prenzlauer Berg", "Lumen Kollwitzplatz", 52.537, 13.418],
    ["Prenzlauer Berg", "Lumen Helmholtzplatz", 52.547, 13.42],
    ["Friedrichshain", "Lumen Boxhagener", 52.512, 13.462],
    ["Friedrichshain", "Lumen RAW", 52.508, 13.453],
    ["Charlottenburg", "Lumen Savignyplatz", 52.506, 13.32],
    ["Neukölln", "Lumen Reuterkiez", 52.488, 13.428],
  ],
  Paris: [
    ["Le Marais", "Lumen Marais", 48.857, 2.359],
    ["Le Marais", "Lumen Saint-Paul", 48.854, 2.362],
    ["Saint-Germain", "Lumen Saint-Germain", 48.853, 2.333],
    ["Montmartre", "Lumen Abbesses", 48.884, 2.338],
    ["Canal Saint-Martin", "Lumen Canal", 48.872, 2.366],
    ["Bastille", "Lumen Bastille", 48.853, 2.369],
    ["Latin Quarter", "Lumen Sorbonne", 48.848, 2.344],
    ["Pigalle", "Lumen Pigalle", 48.882, 2.337],
    ["Belleville", "Lumen Belleville", 48.872, 2.378],
  ],
  London: [
    ["Shoreditch", "Lumen Shoreditch", 51.526, -0.078],
    ["Shoreditch", "Lumen Old Street", 51.525, -0.087],
    ["Soho", "Lumen Soho", 51.513, -0.133],
    ["Soho", "Lumen Carnaby", 51.513, -0.139],
    ["Covent Garden", "Lumen Covent", 51.512, -0.123],
    ["Notting Hill", "Lumen Portobello", 51.515, -0.205],
    ["Camden", "Lumen Camden", 51.539, -0.142],
    ["London Bridge", "Lumen Borough", 51.505, -0.09],
    ["Hackney", "Lumen Broadway Market", 51.535, -0.063],
  ],
  Amsterdam: [
    ["Jordaan", "Lumen Jordaan", 52.374, 4.883],
    ["Jordaan", "Lumen Westerstraat", 52.376, 4.881],
    ["De Pijp", "Lumen De Pijp", 52.355, 4.893],
    ["De Pijp", "Lumen Albert Cuyp", 52.356, 4.896],
    ["Oost", "Lumen Javastraat", 52.363, 4.929],
    ["Centrum", "Lumen Negen Straatjes", 52.371, 4.886],
    ["Noord", "Lumen NDSM", 52.401, 4.892],
    ["Vondelpark", "Lumen Overtoom", 52.361, 4.866],
  ],
  Barcelona: [
    ["El Born", "Lumen Born", 41.385, 2.183],
    ["El Born", "Lumen Princesa", 41.386, 2.181],
    ["Gràcia", "Lumen Gràcia", 41.402, 2.156],
    ["Gràcia", "Lumen Verdi", 41.404, 2.158],
    ["Eixample", "Lumen Passeig de Gràcia", 41.394, 2.162],
    ["Poblenou", "Lumen Poblenou", 41.404, 2.198],
    ["Barceloneta", "Lumen Barceloneta", 41.379, 2.189],
    ["Raval", "Lumen Raval", 41.381, 2.169],
  ],
  Milan: [
    ["Brera", "Lumen Brera", 45.473, 9.187],
    ["Brera", "Lumen Garibaldi", 45.481, 9.188],
    ["Navigli", "Lumen Navigli", 45.451, 9.176],
    ["Porta Romana", "Lumen Porta Romana", 45.453, 9.198],
    ["Isola", "Lumen Isola", 45.488, 9.191],
    ["Duomo", "Lumen Duomo", 45.464, 9.191],
    ["Porta Venezia", "Lumen Porta Venezia", 45.474, 9.205],
  ],
  Madrid: [
    ["Malasaña", "Lumen Malasaña", 40.426, -3.703],
    ["Chueca", "Lumen Chueca", 40.422, -3.697],
    ["Salamanca", "Lumen Serrano", 40.428, -3.687],
    ["La Latina", "Lumen La Latina", 40.41, -3.711],
    ["Sol", "Lumen Sol", 40.417, -3.703],
    ["Chamberí", "Lumen Chamberí", 40.434, -3.702],
  ],
  Lisbon: [
    ["Príncipe Real", "Lumen Príncipe Real", 38.717, -9.149],
    ["Chiado", "Lumen Chiado", 38.711, -9.142],
    ["Alfama", "Lumen Alfama", 38.712, -9.131],
    ["Belém", "Lumen Belém", 38.697, -9.207],
    ["Cais do Sodré", "Lumen Cais", 38.706, -9.144],
  ],
  Dublin: [
    ["Temple Bar", "Lumen Temple Bar", 53.345, -6.265],
    ["Portobello", "Lumen Portobello", 53.333, -6.269],
    ["Stoneybatter", "Lumen Stoneybatter", 53.353, -6.286],
    ["Ranelagh", "Lumen Ranelagh", 53.327, -6.255],
    ["Smithfield", "Lumen Smithfield", 53.348, -6.279],
  ],
  Stockholm: [
    ["Södermalm", "Lumen Södermalm", 59.314, 18.072],
    ["Östermalm", "Lumen Östermalm", 59.338, 18.087],
    ["Vasastan", "Lumen Vasastan", 59.345, 18.052],
    ["Norrmalm", "Lumen Norrmalm", 59.333, 18.064],
    ["SoFo", "Lumen SoFo", 59.314, 18.082],
  ],
  Copenhagen: [
    ["Vesterbro", "Lumen Vesterbro", 55.668, 12.546],
    ["Nørrebro", "Lumen Nørrebro", 55.692, 12.553],
    ["Indre By", "Lumen Indre By", 55.679, 12.578],
    ["Østerbro", "Lumen Østerbro", 55.711, 12.572],
    ["Frederiksberg", "Lumen Frederiksberg", 55.679, 12.535],
  ],
  Oslo: [
    ["Grünerløkka", "Lumen Grünerløkka", 59.923, 10.762],
    ["Majorstuen", "Lumen Majorstuen", 59.929, 10.715],
    ["Sentrum", "Lumen Sentrum", 59.913, 10.749],
    ["Frogner", "Lumen Frogner", 59.92, 10.71],
  ],
  Warsaw: [
    ["Śródmieście", "Lumen Śródmieście", 52.231, 21.011],
    ["Praga", "Lumen Praga", 52.252, 21.045],
    ["Mokotów", "Lumen Mokotów", 52.197, 21.022],
    ["Old Town", "Lumen Old Town", 52.249, 21.012],
  ],
  Vienna: [
    ["Neubau", "Lumen Neubau", 48.203, 16.348],
    ["Leopoldstadt", "Lumen Leopoldstadt", 48.218, 16.385],
    ["Innere Stadt", "Lumen Stephansplatz", 48.208, 16.373],
    ["Wieden", "Lumen Wieden", 48.193, 16.366],
    ["Josefstadt", "Lumen Josefstadt", 48.21, 16.349],
  ],
  Zurich: [
    ["Kreis 5", "Lumen Kreis 5", 47.387, 8.527],
    ["Kreis 4", "Lumen Langstrasse", 47.376, 8.526],
    ["Niederdorf", "Lumen Niederdorf", 47.373, 8.544],
    ["Enge", "Lumen Enge", 47.363, 8.531],
  ],
  Rome: [
    ["Trastevere", "Lumen Trastevere", 41.889, 12.469],
    ["Monti", "Lumen Monti", 41.894, 12.491],
    ["Pantheon", "Lumen Pantheon", 41.899, 12.477],
    ["Testaccio", "Lumen Testaccio", 41.876, 12.477],
    ["Prati", "Lumen Prati", 41.908, 12.464],
  ],
  Athens: [
    ["Koukaki", "Lumen Koukaki", 37.965, 23.722],
    ["Kolonaki", "Lumen Kolonaki", 37.978, 23.744],
    ["Psyrri", "Lumen Psyrri", 37.978, 23.725],
    ["Exarchia", "Lumen Exarchia", 37.984, 23.734],
  ],
  Istanbul: [
    ["Karaköy", "Lumen Karaköy", 41.024, 28.977],
    ["Beyoğlu", "Lumen Beyoğlu", 41.036, 28.977],
    ["Kadıköy", "Lumen Kadıköy", 40.99, 29.026],
    ["Cihangir", "Lumen Cihangir", 41.031, 28.983],
    ["Beşiktaş", "Lumen Beşiktaş", 41.043, 29.007],
  ],
  "New York": [
    ["Williamsburg", "Lumen Williamsburg", 40.714, -73.957],
    ["Williamsburg", "Lumen Bedford Ave", 40.717, -73.957],
    ["SoHo", "Lumen SoHo", 40.723, -74.0],
    ["SoHo", "Lumen Prince St", 40.724, -73.998],
    ["Lower East Side", "Lumen LES", 40.717, -73.987],
    ["Greenpoint", "Lumen Greenpoint", 40.729, -73.954],
    ["West Village", "Lumen West Village", 40.735, -74.004],
    ["Midtown", "Lumen Bryant Park", 40.754, -73.984],
    ["Midtown", "Lumen Grand Central", 40.752, -73.977],
    ["Chelsea", "Lumen Chelsea", 40.744, -74.001],
    ["DUMBO", "Lumen DUMBO", 40.703, -73.989],
    ["Harlem", "Lumen Harlem", 40.811, -73.946],
  ],
  "San Francisco": [
    ["Mission", "Lumen Mission", 37.76, -122.418],
    ["Mission", "Lumen Valencia", 37.762, -122.421],
    ["Hayes Valley", "Lumen Hayes Valley", 37.776, -122.425],
    ["SoMa", "Lumen SoMa", 37.78, -122.402],
    ["SoMa", "Lumen Yerba Buena", 37.785, -122.402],
    ["Castro", "Lumen Castro", 37.762, -122.435],
    ["Noe Valley", "Lumen Noe", 37.751, -122.433],
    ["North Beach", "Lumen North Beach", 37.8, -122.41],
    ["FiDi", "Lumen FiDi", 37.794, -122.4],
    ["Marina", "Lumen Marina", 37.802, -122.437],
  ],
  "Los Angeles": [
    ["Silver Lake", "Lumen Silver Lake", 34.087, -118.27],
    ["Venice", "Lumen Venice", 33.99, -118.466],
    ["DTLA", "Lumen DTLA", 34.045, -118.251],
    ["Highland Park", "Lumen Highland Park", 34.114, -118.193],
    ["West Hollywood", "Lumen WeHo", 34.09, -118.386],
    ["Echo Park", "Lumen Echo Park", 34.078, -118.26],
    ["Santa Monica", "Lumen Santa Monica", 34.019, -118.491],
  ],
  Chicago: [
    ["West Loop", "Lumen West Loop", 41.882, -87.648],
    ["Wicker Park", "Lumen Wicker Park", 41.908, -87.677],
    ["Logan Square", "Lumen Logan Square", 41.929, -87.708],
    ["Loop", "Lumen Loop", 41.882, -87.629],
    ["Lincoln Park", "Lumen Lincoln Park", 41.921, -87.65],
  ],
  Austin: [
    ["East Austin", "Lumen East Austin", 30.262, -97.715],
    ["South Congress", "Lumen SoCo", 30.249, -97.749],
    ["Downtown", "Lumen Congress Ave", 30.27, -97.743],
    ["Mueller", "Lumen Mueller", 30.297, -97.706],
  ],
  Miami: [
    ["Wynwood", "Lumen Wynwood", 25.802, -80.199],
    ["Brickell", "Lumen Brickell", 25.764, -80.193],
    ["South Beach", "Lumen South Beach", 25.79, -80.13],
    ["Little Havana", "Lumen Little Havana", 25.766, -80.224],
  ],
  Seattle: [
    ["Capitol Hill", "Lumen Capitol Hill", 47.624, -122.32],
    ["Ballard", "Lumen Ballard", 47.668, -122.384],
    ["Fremont", "Lumen Fremont", 47.651, -122.35],
    ["Pike Place", "Lumen Pike Place", 47.609, -122.342],
  ],
  Vancouver: [
    ["Mount Pleasant", "Lumen Mount Pleasant", 49.263, -123.1],
    ["Gastown", "Lumen Gastown", 49.283, -123.105],
    ["Kitsilano", "Lumen Kits", 49.272, -123.165],
    ["Yaletown", "Lumen Yaletown", 49.275, -123.121],
  ],
  Montreal: [
    ["Mile End", "Lumen Mile End", 45.524, -73.6],
    ["Plateau", "Lumen Plateau", 45.523, -73.583],
    ["Old Montreal", "Lumen Vieux", 45.508, -73.554],
    ["Griffintown", "Lumen Griffintown", 45.49, -73.563],
  ],
  Toronto: [
    ["Queen West", "Lumen Queen West", 43.647, -79.42],
    ["Queen West", "Lumen Trinity Bellwoods", 43.648, -79.413],
    ["Kensington", "Lumen Kensington", 43.654, -79.401],
    ["Leslieville", "Lumen Leslieville", 43.663, -79.337],
    ["The Junction", "Lumen Junction", 43.665, -79.469],
    ["Downtown", "Lumen Union", 43.645, -79.381],
    ["Yorkville", "Lumen Yorkville", 43.671, -79.391],
  ],
  "Mexico City": [
    ["Roma Norte", "Lumen Roma Norte", 19.418, -99.165],
    ["Condesa", "Lumen Condesa", 19.412, -99.171],
    ["Polanco", "Lumen Polanco", 19.434, -99.197],
    ["Coyoacán", "Lumen Coyoacán", 19.349, -99.162],
    ["Juárez", "Lumen Juárez", 19.426, -99.157],
  ],
  "São Paulo": [
    ["Vila Madalena", "Lumen Vila Madalena", -23.546, -46.692],
    ["Pinheiros", "Lumen Pinheiros", -23.561, -46.683],
    ["Itaim Bibi", "Lumen Itaim", -23.585, -46.677],
    ["Jardins", "Lumen Jardins", -23.566, -46.668],
    ["Vila Olímpia", "Lumen Vila Olímpia", -23.594, -46.687],
  ],
  "Buenos Aires": [
    ["Palermo", "Lumen Palermo", -34.583, -58.426],
    ["Palermo", "Lumen Palermo Soho", -34.587, -58.428],
    ["Recoleta", "Lumen Recoleta", -34.588, -58.393],
    ["San Telmo", "Lumen San Telmo", -34.621, -58.373],
    ["Belgrano", "Lumen Belgrano", -34.562, -58.456],
  ],
  Bogotá: [
    ["Chapinero", "Lumen Chapinero", 4.654, -74.063],
    ["Usaquén", "Lumen Usaquén", 4.694, -74.031],
    ["Zona Rosa", "Lumen Zona Rosa", 4.667, -74.054],
    ["La Candelaria", "Lumen Candelaria", 4.597, -74.075],
  ],
  Lima: [
    ["Barranco", "Lumen Barranco", -12.146, -77.022],
    ["Miraflores", "Lumen Miraflores", -12.121, -77.029],
    ["San Isidro", "Lumen San Isidro", -12.097, -77.036],
    ["Surco", "Lumen Surco", -12.144, -76.997],
  ],
  Dubai: [
    ["Alserkal", "Lumen Alserkal", 25.144, 55.234],
    ["DIFC", "Lumen DIFC", 25.212, 55.281],
    ["Dubai Marina", "Lumen Marina", 25.08, 55.14],
    ["Jumeirah", "Lumen Jumeirah", 25.205, 55.252],
    ["JLT", "Lumen JLT", 25.069, 55.142],
    ["Downtown", "Lumen Downtown Dubai", 25.197, 55.274],
  ],
  "Tel Aviv": [
    ["Florentin", "Lumen Florentin", 32.057, 34.768],
    ["Rothschild", "Lumen Rothschild", 32.066, 34.774],
    ["Neve Tzedek", "Lumen Neve Tzedek", 32.062, 34.768],
    ["Jaffa", "Lumen Jaffa", 32.054, 34.751],
  ],
  Cairo: [
    ["Zamalek", "Lumen Zamalek", 30.061, 31.219],
    ["Maadi", "Lumen Maadi", 29.96, 31.258],
    ["Downtown", "Lumen Downtown Cairo", 30.044, 31.236],
    ["New Cairo", "Lumen New Cairo", 30.03, 31.47],
  ],
  Nairobi: [
    ["Westlands", "Lumen Westlands", -1.265, 36.804],
    ["Karen", "Lumen Karen", -1.319, 36.706],
    ["Kilimani", "Lumen Kilimani", -1.291, 36.787],
    ["Lavington", "Lumen Lavington", -1.279, 36.768],
  ],
  "Cape Town": [
    ["Woodstock", "Lumen Woodstock", -33.926, 18.448],
    ["Sea Point", "Lumen Sea Point", -33.917, 18.385],
    ["De Waterkant", "Lumen De Waterkant", -33.917, 18.418],
    ["Camps Bay", "Lumen Camps Bay", -33.951, 18.378],
  ],
  Lagos: [
    ["Lekki", "Lumen Lekki", 6.448, 3.504],
    ["Victoria Island", "Lumen VI", 6.428, 3.428],
    ["Ikoyi", "Lumen Ikoyi", 6.452, 3.435],
  ],
  Mumbai: [
    ["Bandra", "Lumen Bandra", 19.06, 72.836],
    ["Lower Parel", "Lumen Lower Parel", 18.999, 72.83],
    ["Colaba", "Lumen Colaba", 18.907, 72.815],
    ["Andheri", "Lumen Andheri", 19.119, 72.847],
    ["Powai", "Lumen Powai", 19.117, 72.906],
  ],
  Bangalore: [
    ["Indiranagar", "Lumen Indiranagar", 12.971, 77.641],
    ["Koramangala", "Lumen Koramangala", 12.935, 77.624],
    ["Jayanagar", "Lumen Jayanagar", 12.93, 77.583],
    ["MG Road", "Lumen MG Road", 12.975, 77.607],
    ["Whitefield", "Lumen Whitefield", 12.97, 77.75],
  ],
  Delhi: [
    ["Hauz Khas", "Lumen Hauz Khas", 28.55, 77.206],
    ["Khan Market", "Lumen Khan Market", 28.6, 77.227],
    ["Connaught Place", "Lumen CP", 28.633, 77.219],
    ["Saket", "Lumen Saket", 28.527, 77.219],
    ["Gurgaon", "Lumen Gurgaon", 28.46, 77.029],
  ],
  Bangkok: [
    ["Ari", "Lumen Ari", 13.78, 100.545],
    ["Thonglor", "Lumen Thonglor", 13.732, 100.585],
    ["Ekkamai", "Lumen Ekkamai", 13.723, 100.587],
    ["Sathorn", "Lumen Sathorn", 13.722, 100.532],
    ["Siam", "Lumen Siam", 13.745, 100.534],
  ],
  Jakarta: [
    ["Kemang", "Lumen Kemang", -6.262, 106.811],
    ["Senopati", "Lumen Senopati", -6.235, 106.811],
    ["Menteng", "Lumen Menteng", -6.196, 106.832],
    ["SCBD", "Lumen SCBD", -6.225, 106.808],
  ],
  Seoul: [
    ["Seongsu", "Lumen Seongsu", 37.544, 127.056],
    ["Itaewon", "Lumen Itaewon", 37.534, 126.994],
    ["Hongdae", "Lumen Hongdae", 37.557, 126.924],
    ["Yeonnam", "Lumen Yeonnam", 37.564, 126.924],
    ["Gangnam", "Lumen Gangnam", 37.498, 127.028],
    ["Apgujeong", "Lumen Apgujeong", 37.527, 127.029],
  ],
  "Hong Kong": [
    ["Sheung Wan", "Lumen Sheung Wan", 22.286, 114.151],
    ["Central", "Lumen Central", 22.282, 114.158],
    ["Sai Ying Pun", "Lumen Sai Ying Pun", 22.286, 114.143],
    ["Causeway Bay", "Lumen Causeway Bay", 22.28, 114.184],
    ["Tsim Sha Tsui", "Lumen TST", 22.298, 114.172],
  ],
  Taipei: [
    ["Da'an", "Lumen Da'an", 25.027, 121.543],
    ["Zhongshan", "Lumen Zhongshan", 25.063, 121.523],
    ["Xinyi", "Lumen Xinyi", 25.033, 121.567],
    ["Ximen", "Lumen Ximen", 25.042, 121.508],
  ],
  Manila: [
    ["BGC", "Lumen BGC", 14.55, 121.05],
    ["Makati", "Lumen Makati", 14.555, 121.024],
    ["Poblacion", "Lumen Poblacion", 14.564, 121.029],
  ],
  "Kuala Lumpur": [
    ["Bangsar", "Lumen Bangsar", 3.128, 101.673],
    ["KLCC", "Lumen KLCC", 3.158, 101.713],
    ["Bukit Bintang", "Lumen Bukit Bintang", 3.147, 101.711],
    ["TTDI", "Lumen TTDI", 3.139, 101.628],
  ],
  Shanghai: [
    ["Jing'an", "Lumen Jing'an", 31.229, 121.448],
    ["Xuhui", "Lumen Xuhui", 31.188, 121.437],
    ["French Concession", "Lumen FFC", 31.214, 121.45],
    ["Pudong", "Lumen Pudong", 31.231, 121.516],
  ],
  Tokyo: [
    ["Shibuya", "Lumen Shibuya", 35.659, 139.7],
    ["Shibuya", "Lumen Miyashita", 35.661, 139.702],
    ["Daikanyama", "Lumen Daikanyama", 35.65, 139.703],
    ["Nakameguro", "Lumen Nakameguro", 35.644, 139.699],
    ["Shimokitazawa", "Lumen Shimokita", 35.661, 139.668],
    ["Shinjuku", "Lumen Shinjuku", 35.69, 139.7],
    ["Ginza", "Lumen Ginza", 35.671, 139.764],
    ["Marunouchi", "Lumen Tokyo Station", 35.681, 139.767],
    ["Aoyama", "Lumen Aoyama", 35.665, 139.712],
    ["Kichijoji", "Lumen Kichijoji", 35.703, 139.58],
  ],
  Singapore: [
    ["Tiong Bahru", "Lumen Tiong Bahru", 1.286, 103.832],
    ["Telok Ayer", "Lumen Telok Ayer", 1.281, 103.847],
    ["Tanjong Pagar", "Lumen Tanjong Pagar", 1.276, 103.846],
    ["Raffles Place", "Lumen Raffles", 1.284, 103.851],
    ["Joo Chiat", "Lumen Joo Chiat", 1.31, 103.903],
    ["Bugis", "Lumen Bugis", 1.3, 103.855],
    ["Holland Village", "Lumen Holland V", 1.311, 103.795],
  ],
  Sydney: [
    ["Surry Hills", "Lumen Surry Hills", -33.886, 151.211],
    ["Surry Hills", "Lumen Crown St", -33.884, 151.213],
    ["Newtown", "Lumen Newtown", -33.898, 151.179],
    ["Paddington", "Lumen Paddington", -33.884, 151.227],
    ["Redfern", "Lumen Redfern", -33.892, 151.205],
    ["CBD", "Lumen Circular Quay", -33.861, 151.211],
    ["Bondi", "Lumen Bondi", -33.891, 151.276],
    ["Darlinghurst", "Lumen Darlinghurst", -33.879, 151.218],
  ],
  Melbourne: [
    ["Fitzroy", "Lumen Fitzroy", -37.799, 144.978],
    ["Collingwood", "Lumen Collingwood", -37.802, 144.988],
    ["CBD", "Lumen Flinders Lane", -37.816, 144.967],
    ["Carlton", "Lumen Carlton", -37.8, 144.967],
    ["South Yarra", "Lumen South Yarra", -37.838, 144.992],
    ["Brunswick", "Lumen Brunswick", -37.769, 144.96],
  ],
  Brisbane: [
    ["Fortitude Valley", "Lumen Fortitude Valley", -27.456, 153.034],
    ["West End", "Lumen West End", -27.483, 153.005],
    ["New Farm", "Lumen New Farm", -27.468, 153.05],
  ],
  Perth: [
    ["Leederville", "Lumen Leederville", -31.937, 115.838],
    ["Northbridge", "Lumen Northbridge", -31.946, 115.86],
    ["Subiaco", "Lumen Subiaco", -31.948, 115.825],
  ],
  Auckland: [
    ["Ponsonby", "Lumen Ponsonby", -36.854, 174.736],
    ["CBD", "Lumen Britomart", -36.844, 174.768],
    ["Kingsland", "Lumen Kingsland", -36.875, 174.74],
    ["Newmarket", "Lumen Newmarket", -36.87, 174.778],
  ],
};

export function rand(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPrompts(city: string, score: number, rng: () => number): PromptResult[] {
  const pool = PROMPTS_BY_CITY[city] ?? GENERIC_PROMPTS;
  const count = 5 + Math.floor(rng() * 4);
  const picked = [...pool].sort(() => rng() - 0.5).slice(0, count);
  return picked.map((prompt) => {
    const r = rng() * 100;
    let status: PromptResult["status"];
    if (r < score - 10) status = "mentioned";
    else if (r < score + 25) status = "competitor_higher";
    else status = "not_mentioned";
    return {
      prompt,
      status,
      assistant: ASSISTANTS[Math.floor(rng() * ASSISTANTS.length)],
      competitor:
        status !== "mentioned"
          ? COMPETITORS[Math.floor(rng() * COMPETITORS.length)]
          : undefined,
    };
  });
}

function buildLocations(): Location[] {
  const rng = rand(42);
  type Row = [string, string, string, number, number];
  const all: Row[] = [];
  for (const [city, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      all.push([city, s[0], s[1], s[2], s[3]]);
    }
  }

  return all.map((row, i) => {
    const [city, area, name, lat, lng] = row;
    const base = 30 + Math.floor(rng() * 65);
    const scoresByAssistant = ASSISTANTS.reduce(
      (acc, a) => {
        acc[a] = Math.max(0, Math.min(100, base + Math.floor((rng() - 0.5) * 40)));
        return acc;
      },
      {} as Record<Exclude<Assistant, "all">, number>,
    );
    const history7d = Array.from({ length: 7 }, (_, d) => {
      const drift = (rng() - 0.4) * 8;
      return Math.max(5, Math.min(98, base - 18 + d * 3 + drift));
    });
    return {
      id: `loc-${i}`,
      city,
      cluster: `${city} ${area}`,
      name,
      lat,
      lng,
      visibilityScore: base,
      scoresByAssistant,
      history7d,
      prompts: buildPrompts(city, base, rng),
    };
  });
}

export const MOCK_LOCATIONS: Location[] = buildLocations();

export const DEFAULT_BRAND = "Lumen Coffee";

export function getDateLabels(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(
      d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    );
  }
  return out;
}
