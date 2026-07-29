// Providers pick their work areas from models.WorkAreas() on the backend,
// which stores them as Amharic strings (e.g. "ጉለሌ"). expo-location's
// reverseGeocodeAsync, on the other hand, returns the district name from the
// phone's system geocoder in Latin script (e.g. "Gulele"). Without this map,
// a customer's detected area would never string-match a provider's stored
// area, and /providers?area=... would silently return nothing — this is
// what maps one to the other so location-based filtering actually works.
const AREA_EN_TO_AM: Record<string, string> = {
  bole: "ቦሌ",
  piassa: "ፒያሳ",
  piazza: "ፒያሳ",
  kazanchis: "ካዛንቺስ",
  merkato: "መርካቶ",
  mercato: "መርካቶ",
  megenagna: "መገናኛ",
  kirkos: "ቂርቆስ",
  gerji: "ገርጂ",
  cmc: "ሲኤምሲ",
  summit: "ሰሚት",
  lideta: "ልደታ",
  arada: "አራዳ",
  sarbet: "ሳርቤት",
  gofa: "ጎፋ",
  "bisrate gabriel": "ብስራተ ገብርኤል",
  "bisrate gebriel": "ብስራተ ገብርኤል",
  yerer: "ያሬድ",
  ayat: "አያት",
  gulele: "ጉለሌ",
  kotebe: "ኮተቤ",
};

// Geocoders often append "Sub-City" / "Subcity" / "Woreda N" etc. — strip the
// common suffixes before matching so "Gulele Sub-City" still resolves.
function normalize(label: string): string {
  return label
    .toLowerCase()
    .replace(/\bsub[\s-]?city\b/g, "")
    .replace(/\bworeda.*$/g, "")
    .trim();
}

// Returns the Amharic work-area string a provider would have on file for the
// given human-readable district name, or null if we don't recognize it.
export function matchWorkArea(label?: string | null): string | null {
  if (!label) return null;
  const normalized = normalize(label);
  if (AREA_EN_TO_AM[normalized]) return AREA_EN_TO_AM[normalized];

  // Fall back to a substring match in case the geocoder returns something
  // like "Gulele, Addis Ababa" or "Yeka - Gulele".
  const hit = Object.keys(AREA_EN_TO_AM).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );
  return hit ? AREA_EN_TO_AM[hit] : null;
}
