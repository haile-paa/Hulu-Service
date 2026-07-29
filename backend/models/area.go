package models

// WorkAreas returns common Addis Ababa areas/sub-cities that providers pick from
// to describe where they work. Kept as plain strings (not a DB collection) since
// this list rarely changes and doesn't need admin editing yet.
func WorkAreas() []string {
	return []string{
		"ቦሌ",       // Bole
		"ፒያሳ",      // Piassa
		"ካዛንቺስ",    // Kazanchis
		"መርካቶ",     // Merkato
		"መገናኛ",     // Megenagna
		"ቂርቆስ",     // Kirkos
		"ገርጂ",      // Gerji
		"ሲኤምሲ",     // CMC
		"ሰሚት",      // Summit
		"ልደታ",      // Lideta
		"አራዳ",      // Arada
		"ሳርቤት",     // Sarbet
		"ጎፋ",       // Gofa
		"ብስራተ ገብርኤል", // Bisrate Gabriel
		"ያሬድ",      // Yerer
		"አያት",      // Ayat
		"ጉለሌ",      // Gulele
		"ኮተቤ",      // Kotebe
	}
}
