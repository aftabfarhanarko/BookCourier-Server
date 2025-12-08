// 	title (বইয়ের নাম)	string	Yes	“Introduction to Algorithms”
// 2	author (লেখক)	string	Yes	“Thomas H. Cormen”
// 3	publish/Unpublish (প্রকাশক)	string	No	“MIT Press”
// 5	language (ভাষা)	string	Yes	“Bangla” / “English”
// 7	category (বিভাগ)	string / tag	Yes	“Programming, Algorithms”
// 9	description (বর্ণনা)	text	Yes	Short + bullet 
// 10	page_count (পৃষ্ঠা সংখ্যা)	integer	Yes	“730”
// 13	weight (ওজন)	float (grams)	No	Courier cost calc এ লাগবে
// 14	price_mrp (MRP)	currency	Yes	৳1200
// 15	price_sell (Selling price)	currency	Yes	৳900
// 17	stock_qty (স্টক)	integer	Yes	“12”
// 19	availability_status	enum	Yes	“In Stock” / “Out of Stock” / “Preorder”
// 20	images (ছবি)	array of URLs	Yes	min 1 cover image; optional interior images
// 22	rating_avg	float	No	Average star rating (1–5)
// 27	return_policy	text	No	“7-day return, unused condition”

// 23	reviews	array (objects)	No	{user, rating, comment, date}
// 29	related_books	array of IDs	No	for recommendations

// 31	created_at	datetime	Yes	system-generated
// 32	updated_at	datetime	Yes	system-generated