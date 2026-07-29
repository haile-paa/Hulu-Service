package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Category struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	NameEn   string             `bson:"name_en" json:"nameEn"`
	NameAm   string             `bson:"name_am" json:"nameAm"`
	Icon     string             `bson:"icon" json:"icon"` // tabler icon name, e.g. "bulb"
	SortOrder int               `bson:"sort_order" json:"sortOrder"`
}

// SeedCategories returns the default Ethiopian service categories.
// Run once via the seed script to populate the categories collection.
func SeedCategories() []Category {
	return []Category{
		{NameEn: "Electrician", NameAm: "ኤሌክትሪክ ባለሙያ", Icon: "bulb", SortOrder: 1},
		{NameEn: "Plumber", NameAm: "የቧንቧ ሰራተኛ", Icon: "droplet", SortOrder: 2},
		{NameEn: "Satellite / DSTV installer", NameAm: "ዲሽ/ዲኤስቲቪ ገጣሚ", Icon: "antenna", SortOrder: 3},
		{NameEn: "Home cleaner", NameAm: "የቤት ጽዳት ሰራተኛ", Icon: "wash", SortOrder: 4},
		{NameEn: "Painter", NameAm: "ቀለም ቀቢ", Icon: "brush", SortOrder: 5},
		{NameEn: "Carpenter", NameAm: "አናጺ", Icon: "hammer", SortOrder: 6},
		{NameEn: "Mechanic", NameAm: "መካኒክ", Icon: "tools", SortOrder: 7},
		{NameEn: "Generator technician", NameAm: "ጀነሬተር ቴክኒሻን", Icon: "engine", SortOrder: 8},
		{NameEn: "AC / Fridge technician", NameAm: "ኤሲ/ማቀዝቀዣ ቴክኒሻን", Icon: "snowflake", SortOrder: 9},
		{NameEn: "Tutor", NameAm: "አስተማሪ", Icon: "book", SortOrder: 10},
		{NameEn: "Mason / Construction", NameAm: "ግንበኛ", Icon: "building", SortOrder: 11},
		{NameEn: "Gardener", NameAm: "አትክልተኛ", Icon: "plant", SortOrder: 12},
		{NameEn: "Moving / Loading labor", NameAm: "ጭነት አጓጓዥ", Icon: "truck", SortOrder: 13},
		{NameEn: "Solar panel installer", NameAm: "ሶላር ገጣሚ", Icon: "solar-panel", SortOrder: 14},
		{NameEn: "CCTV installer", NameAm: "ሲሲቲቪ ገጣሚ", Icon: "camera", SortOrder: 15},
	}
}
