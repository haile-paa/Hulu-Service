package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// PriceType describes how a category's service is billed. The app decides
// this per category (not the provider) so pricing stays consistent across
// everyone offering that type of work.
type PriceType string

const (
	PriceOneTime    PriceType = "one_time"   // paid once per job
	PriceMonthly    PriceType = "monthly"    // paid every month (e.g. tutoring)
	PriceNegotiable PriceType = "negotiable" // no fixed app price; customer & provider agree
)

type Category struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	NameEn    string             `bson:"name_en" json:"nameEn"`
	NameAm    string             `bson:"name_am" json:"nameAm"`
	Icon      string             `bson:"icon" json:"icon"` // tabler icon name, e.g. "bulb"
	SortOrder int                `bson:"sort_order" json:"sortOrder"`

	// PriceType and Price are set by the app (via SeedCategories below), not
	// by the provider. Whenever a provider registers under a category, this
	// is the price customers will see for that category's work.
	// Price is in Ethiopian Birr and is ignored/0 when PriceType is "negotiable".
	PriceType PriceType `bson:"price_type" json:"priceType"`
	Price     float64   `bson:"price,omitempty" json:"price,omitempty"`
}

// SeedCategories returns the default Ethiopian service categories, each with
// the app-assigned price for that type of work. Run via the seed script to
// populate (or refresh) the categories collection.
func SeedCategories() []Category {
	return []Category{
		{NameEn: "Electrician", NameAm: "ኤሌክትሪክ ባለሙያ", Icon: "bulb", SortOrder: 1, PriceType: PriceOneTime, Price: 300},
		{NameEn: "Plumber", NameAm: "የቧንቧ ሰራተኛ", Icon: "droplet", SortOrder: 2, PriceType: PriceOneTime, Price: 300},
		{NameEn: "Satellite / DSTV installer", NameAm: "ዲሽ/ዲኤስቲቪ ገጣሚ", Icon: "antenna", SortOrder: 3, PriceType: PriceOneTime, Price: 500},
		{NameEn: "Home cleaner", NameAm: "የቤት ጽዳት ሰራተኛ", Icon: "wash", SortOrder: 4, PriceType: PriceOneTime, Price: 400},
		{NameEn: "Painter", NameAm: "ቀለም ቀቢ", Icon: "brush", SortOrder: 5, PriceType: PriceNegotiable},
		{NameEn: "Carpenter", NameAm: "አናጺ", Icon: "hammer", SortOrder: 6, PriceType: PriceNegotiable},
		{NameEn: "Mechanic", NameAm: "መካኒክ", Icon: "tools", SortOrder: 7, PriceType: PriceNegotiable},
		{NameEn: "Generator technician", NameAm: "ጀነሬተር ቴክኒሻን", Icon: "engine", SortOrder: 8, PriceType: PriceOneTime, Price: 600},
		{NameEn: "AC / Fridge technician", NameAm: "ኤሲ/ማቀዝቀዣ ቴክኒሻን", Icon: "snowflake", SortOrder: 9, PriceType: PriceOneTime, Price: 500},
		{NameEn: "Tutor", NameAm: "አስተማሪ", Icon: "book", SortOrder: 10, PriceType: PriceMonthly, Price: 5000},
		{NameEn: "Mason / Construction", NameAm: "ግንበኛ", Icon: "building", SortOrder: 11, PriceType: PriceNegotiable},
		{NameEn: "Gardener", NameAm: "አትክልተኛ", Icon: "plant", SortOrder: 12, PriceType: PriceMonthly, Price: 1500},
		{NameEn: "Moving / Loading labor", NameAm: "ጭነት አጓጓዥ", Icon: "truck", SortOrder: 13, PriceType: PriceNegotiable},
		{NameEn: "Solar panel installer", NameAm: "ሶላር ገጣሚ", Icon: "solar-panel", SortOrder: 14, PriceType: PriceNegotiable},
		{NameEn: "CCTV installer", NameAm: "ሲሲቲቪ ገጣሚ", Icon: "camera", SortOrder: 15, PriceType: PriceOneTime, Price: 800},
	}
}