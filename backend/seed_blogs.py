"""
Run with:  python seed_blogs.py
(from the backend/ directory with the venv active)
"""
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from django.utils import timezone
from apps.accounts.models import CustomUser
from apps.blog.models import Post, PostCategory

author = CustomUser.objects.get(email="admin@haskerrealtygroup.com")

POSTS = [
    {
        "title": "5 Apartments Under $1,100 in San Antonio You Can Move Into This Month",
        "excerpt": "Five San Antonio apartments under $1,100/month that are available now — with honest pros and cons for each.",
        "category": PostCategory.MARKET_UPDATE,
        "tags": ["San Antonio", "apartments", "affordable", "rentals"],
        "read_time_minutes": 3,
        "is_featured": True,
        "content": """<p>We found five apartments in San Antonio that are under $1,100 a month and ready for move-in. A few of these have been listed for less than a week, so they probably won't stick around long.</p>

<h2>Near Lackland AFB — $875/month</h2>
<p>There's a one-bedroom off Military Drive that's going for $875. It's about 650 square feet, comes with a window AC unit (no central air), and the landlord covers water and trash. The area is loud — you're close to the base and there's constant traffic on Military — but for the price, it's hard to beat. Laundry is on-site but shared.</p>

<h2>Medical Center area — $1,050/month</h2>
<p>This is a one-bedroom in a mid-size complex near the Medical Center. It has central AC, an in-unit washer/dryer hookup, and assigned parking. The catch? The lease requires a 620 credit score minimum, and they're strict about it. But if you qualify, this is a solid deal for the area. Most one-bedrooms near the Medical Center are running $1,200+.</p>

<h2>Southside — $795/month</h2>
<p>A studio on the south side, close to Brooks. 480 square feet, so it's tight. No dishwasher. But it's $795 and the building was renovated in 2023, so everything inside is new — cabinets, countertops, flooring. If you don't need a lot of space, this works. Month-to-month lease is available too, which is rare at this price.</p>

<h2>Near UTSA — $1,075/month</h2>
<p>Two-bedroom near UTSA off Hausman Road. This one surprised me — two-bedrooms in this area usually start around $1,300. It's on the second floor, has a small balcony, and the complex has a pool. Downside: the parking lot is a mess and the reviews mention slow maintenance response times. Worth seeing in person before you commit.</p>

<h2>East side — $925/month</h2>
<p>One-bedroom on the east side, near AT&T Center. Older building, but the apartment itself was updated last year. New appliances, fresh paint. The neighborhood is still rough around the edges, and you'll want renter's insurance. But $925 for a one-bedroom with updated finishes? That's below average for San Antonio right now.</p>

<h2>These Move Fast</h2>
<p>San Antonio's rental market is competitive at this price range. If something here caught your eye, reach out and we'll check if it's still available.</p>""",
    },
    {
        "title": "6 One-Bedrooms Under $1,200 in Austin You Can Actually Afford Right Now",
        "excerpt": "Six Austin one-bedroom apartments under $1,200/month — real listings, honest trade-offs, no fluff.",
        "category": PostCategory.MARKET_UPDATE,
        "tags": ["Austin", "apartments", "affordable", "one-bedroom"],
        "read_time_minutes": 3,
        "is_featured": False,
        "content": """<p>Austin's reputation for being expensive is mostly earned. But there are pockets where the rent hasn't completely lost its mind. Here are six one-bedrooms we found under $1,200, all currently available.</p>

<h2>North Lamar — $1,150/month</h2>
<p>Ground-floor unit in a smaller complex. Central AC, in-unit washer/dryer hookup, hardwood floors. The building is older — 1970s construction — and you'll notice it in the insulation. Expect higher electric bills in summer. That said, North Lamar has good walkability and you're close to several bus lines.</p>

<h2>Rundberg area — $975/month</h2>
<p>This is the cheapest one-bedroom we found in Austin proper. The Rundberg area has a reputation — do your research and drive by at night before signing. But the apartment itself is clean, recently painted, and the landlord is a smaller operation, which usually means faster maintenance responses.</p>

<h2>East Austin (far east) — $1,100/month</h2>
<p>Past 183, the prices drop significantly. This unit has updated appliances, a small private patio, and assigned parking. You're not walking to bars, but you're also not paying for that. The commute to downtown is 20–25 minutes by car.</p>

<h2>Pflugerville — $1,050/month</h2>
<p>Technically not Austin, but it's in the metro. Two miles from the Samsung campus, close to 130. New construction complex, so everything is pristine. Community pool and gym. If you work north or northeast, this is a legitimate option.</p>

<h2>South Congress adjacent — $1,175/month</h2>
<p>One of the better deals we've seen near SoCo. Small — around 580 square feet — but the location is genuinely good. Walk to restaurants and coffee shops. The building has no covered parking, which matters in Texas summers.</p>

<h2>Del Valle — $925/month</h2>
<p>Cheap for a reason — this is a long way from most employers. But if you work from home or near the airport, it works. The unit was updated in 2022. Month-to-month is available after the first year.</p>

<h2>Availability Moves Fast</h2>
<p>Austin inventory at this price point turns over quickly. These listings were active as of this week. Contact us to check current availability.</p>""",
    },
    {
        "title": "What $900/Month Gets You in Houston Right Now — Honest Neighborhood Breakdown",
        "excerpt": "A no-spin look at what $900/month actually rents in Houston — five real options across different neighborhoods.",
        "category": PostCategory.MARKET_ANALYSIS,
        "tags": ["Houston", "apartments", "budget", "neighborhoods"],
        "read_time_minutes": 3,
        "is_featured": False,
        "content": """<p>Houston is one of the more affordable big cities in Texas, but "affordable" is relative. Here's what $900/month realistically gets you right now, broken down by area.</p>

<h2>Midtown — A Studio, Barely</h2>
<p>You can find a studio in Midtown for $900, but it'll be small — under 450 square feet — and probably in an older building without modern finishes. The trade-off is obvious: Midtown is walkable, lively, and close to everything. If you don't spend much time at home, this works.</p>

<h2>Montrose — A Room in a House</h2>
<p>At $900 in Montrose, you're likely looking at renting a room in a shared house, not a solo apartment. That's not a knock — Montrose is one of the best neighborhoods in Houston — just be clear about what you're getting.</p>

<h2>The Heights — One-Bedroom in an Older Complex</h2>
<p>One-bedrooms in the Heights hover around $1,100–$1,300, but there are outliers. We found one in a dated 1980s complex for $895. No updated finishes, shared laundry, surface lot parking. The neighborhood itself is great. The unit is functional.</p>

<h2>Greenspoint — A Spacious One-Bedroom</h2>
<p>Greenspoint has struggled with crime historically. Check the specific block before committing. But for $900, you can get a full one-bedroom — maybe 700+ square feet — with central AC and a dishwasher. Some complexes here have genuinely improved in the last few years.</p>

<h2>Katy (West Houston Suburbs) — A Solid One-Bedroom</h2>
<p>If you can work remotely or your job is in the Energy Corridor, Katy at $900/month is a strong deal. Newer construction, good school district if that matters, quiet streets. The I-10 commute into central Houston is brutal during rush hour. Plan around it.</p>

<h2>The Honest Summary</h2>
<p>In Houston, $900/month works if you're willing to either compromise on location or on amenity level. You can have a nice unit in a less desirable area, or a small/dated unit in a great neighborhood. You probably can't have both.</p>""",
    },
    {
        "title": "5 Best San Antonio Neighborhoods to Rent in Right Now — Ranked by Value",
        "excerpt": "Which San Antonio neighborhoods give renters the most for their money? A practical ranking with average rents and what you actually get.",
        "category": PostCategory.MARKET_ANALYSIS,
        "tags": ["San Antonio", "neighborhoods", "rental market", "value"],
        "read_time_minutes": 4,
        "is_featured": True,
        "content": """<p>San Antonio is one of the more renter-friendly cities in Texas, but not every neighborhood is equal. Here's a practical breakdown of where the value actually is right now.</p>

<h2>1. Alamo Heights Adjacent</h2>
<p>Just outside the incorporated city of Alamo Heights (where rents are steeper), you can find one-bedrooms in the $950–$1,100 range. Good schools nearby, mature trees, quiet streets. The housing stock is mostly older but well-maintained. This is where you move if you want a calm, established neighborhood without paying a premium for the zip code.</p>

<h2>2. Stone Oak</h2>
<p>Stone Oak surprises people. It's suburban but not in a boring way — there's real infrastructure here: grocery stores, restaurants, parks. One-bedrooms run $1,050–$1,250. Newer construction, so maintenance costs are lower for tenants. Traffic on 281 is the main complaint.</p>

<h2>3. Dignowity Hill</h2>
<p>One of the more interesting neighborhoods in San Antonio right now. It's east side, adjacent to downtown, and it's been slowly improving for the past decade. Rents are still relatively low — studios around $750–$900 — and the walkability to downtown is real. It's not for everyone, but if you want character and proximity, it delivers.</p>

<h2>4. Near Southside / King William Area</h2>
<p>King William proper is pricey, but the blocks just south of it are more accessible. You'll find bungalows and older apartment buildings in the $850–$1,050 range. Close to Blue Star arts district. Older housing stock means occasional maintenance issues — ask the landlord about HVAC age before signing.</p>

<h2>5. Medical Center Corridor</h2>
<p>Not exciting, but practical. If you work in healthcare or at UTSA, this is the efficient choice. One-bedrooms run $1,000–$1,200 and the infrastructure is solid. Newer mid-rises have been built here in the last few years, driving up quality options.</p>

<h2>Ready to Find Your Neighborhood?</h2>
<p>Every renter's priorities are different. Contact our team and we'll match you with the right area based on your commute, budget, and lifestyle.</p>""",
    },
    {
        "title": "How to Find an Apartment Fast When You Have Less Than 2 Weeks",
        "excerpt": "Moving quickly? A practical guide to finding and locking down an apartment in under two weeks — without making a bad decision.",
        "category": PostCategory.BUYERS_GUIDE,
        "tags": ["renting tips", "moving", "apartment hunting", "quick move"],
        "read_time_minutes": 4,
        "is_featured": False,
        "content": """<p>Whether you got a new job, a lease ended unexpectedly, or something else came up — sometimes you need an apartment fast. Here's what actually works.</p>

<h2>Start With Furnished Short-Terms to Buy Time</h2>
<p>If you're in a genuine crunch — one week or less — furnished short-term rentals buy you breathing room. They're more expensive per month, but cheaper than signing a bad long-term lease out of panic. Give yourself 30 days to find the right place.</p>

<h2>Get Your Documents Ready Before You Start Looking</h2>
<p>The thing that slows down most apartment applications isn't the apartment search — it's document prep. Have these ready before your first inquiry: last two pay stubs (or an offer letter), your most recent bank statement, a government ID, and your SSN for the credit check. If you have them ready, you can apply same-day.</p>

<h2>Call the Leasing Office — Don't Just Fill Out the Online Form</h2>
<p>Online applications go into a queue. A phone call gets you a human. Tell them you need to move within a specific date and ask if they can expedite the approval. Smaller landlords move faster than large management companies.</p>

<h2>Prioritize Move-In Ready Over Perfect</h2>
<p>When you're on a tight timeline, "move-in ready" matters more than floor plan or amenities. A unit that can house you in four days beats an ideal unit that has a two-week wait on the previous tenant's move-out.</p>

<h2>Know Your Deal-Breakers Going In</h2>
<p>You'll see a lot of apartments quickly. Without a clear list of non-negotiables, you'll either overthink every option or talk yourself into something bad. Before you start: write down three things you won't compromise on. Everything else is negotiable.</p>

<h2>Book Your Movers Before You Sign</h2>
<p>If you have furniture, book movers the moment you know your move-in date. In peak months (May–August), movers get booked fast. Losing your move-in slot because movers weren't available is a real problem.</p>

<h2>Need Help Moving Fast?</h2>
<p>Our team keeps an updated list of immediately available units. Reach out and we'll find you something that works within your timeline.</p>""",
    },
    {
        "title": "7 Red Flags to Look for on an Apartment Tour — Things Most Renters Miss",
        "excerpt": "Before you sign, check these seven things on your apartment tour. They're easy to overlook and expensive to deal with later.",
        "category": PostCategory.BUYERS_GUIDE,
        "tags": ["apartment tour", "renting tips", "red flags", "checklist"],
        "read_time_minutes": 4,
        "is_featured": False,
        "content": """<p>A good apartment tour takes 20 minutes. A thorough one takes 40. Here's what separates people who end up with apartment regrets from people who don't.</p>

<h2>1. Run Every Faucet and Flush Every Toilet</h2>
<p>Low water pressure is a building-wide problem — not something your landlord can fix easily. Run every faucet at full pressure. If it's weak anywhere, ask directly about the building's water pressure and pipe age.</p>

<h2>2. Open Every Cabinet Under Every Sink</h2>
<p>Water damage lives under sinks. Look for warped particle board, staining, or mold. A single water-damaged cabinet isn't necessarily a deal-breaker, but it tells you the building has had plumbing issues and how the landlord handles them.</p>

<h2>3. Check the Electrical Panel</h2>
<p>If you can access it, look at the panel. Check how many amps the unit has and whether the panel looks maintained. Outdated panels found in older buildings are fire hazards.</p>

<h2>4. Test the Cell Signal in Every Room</h2>
<p>Sounds minor until you realize you work from home and your carrier has dead spots in your bedroom. This is especially important in concrete or steel buildings, and in basement-level or interior units.</p>

<h2>5. Ask When the HVAC Was Last Replaced</h2>
<p>HVAC units over 15 years old fail more often and run less efficiently. In Texas, this matters — your electric bills will reflect it. Most landlords will tell you the age if asked directly.</p>

<h2>6. Visit on a Weekday Evening, Not a Saturday Morning</h2>
<p>If noise and neighbor activity matter to you, tour at the time of day when you'll actually be home. Saturday morning is the quietest time. A Tuesday at 7 PM tells you a lot more.</p>

<h2>7. Look at the Parking Lot</h2>
<p>The parking lot is one of the better indicators of how a building is managed. Deferred maintenance, abandoned vehicles, and poor lighting in the lot usually reflect how the rest of the property is operated.</p>

<h2>One More Thing</h2>
<p>Ask the leasing agent directly: "What's the most common complaint from current tenants?" The answer — and the way they answer it — is telling.</p>""",
    },
    {
        "title": "Studio Apartments Under $1,000 in Dallas — 5 Options Worth Looking At",
        "excerpt": "Five Dallas studios under $1,000/month — real options, honest assessments, and what each neighborhood is actually like.",
        "category": PostCategory.MARKET_UPDATE,
        "tags": ["Dallas", "studios", "affordable", "apartments"],
        "read_time_minutes": 3,
        "is_featured": False,
        "content": """<p>Dallas has a reputation for being sprawling and car-dependent, which is accurate. But it also has pockets where studios are genuinely affordable and the location still makes sense. Here are five.</p>

<h2>Deep Ellum — $950/month</h2>
<p>A studio in Deep Ellum at $950 is a find. The neighborhood is loud on weekends — bars, live music, foot traffic — so it's not for everyone. But if you're young, single, and don't mind noise, the location is excellent. The unit we found is on an upper floor with good natural light. The building is older with surface lot parking only.</p>

<h2>Oak Cliff — $875/month</h2>
<p>Bishop Arts District adjacent. Oak Cliff has been gentrifying unevenly — some blocks are beautiful and walkable, some are still rough. The studio here is newly renovated in a smaller building. Month-to-month available. The trade-off is the commute — you're crossing the Trinity River to get north or east, and traffic on the bridges backs up.</p>

<h2>Uptown — $995/month</h2>
<p>The cheapest thing in Uptown we could find. Small — 420 square feet. No in-unit laundry. But you're in the middle of a genuinely walkable neighborhood with restaurants and bars within walking distance. It's a lifestyle choice: you pay for location, not space.</p>

<h2>Garland — $775/month</h2>
<p>Garland is east of Dallas and not glamorous. But $775 for a studio with central AC, updated kitchen, and a pool is hard to argue with. If you work east of Dallas or from home, it's worth considering. The DART Blue Line runs through Garland with a connection to downtown.</p>

<h2>Irving — $825/month</h2>
<p>Close to DFW Airport and Las Colinas. If you work in either area, Irving is worth a serious look. The studio here is in a clean, mid-size complex with covered parking. Nothing special, but nothing wrong with it either. Functional and affordable.</p>

<h2>Availability</h2>
<p>Dallas inventory at the sub-$1,000 level turns over faster than most people expect. Contact us to check current availability on any of these.</p>""",
    },
    {
        "title": "How to Negotiate Your Rent — What Actually Works and What Landlords Ignore",
        "excerpt": "A practical guide to negotiating rent — the tactics that work, the ones that don't, and exactly what to say.",
        "category": PostCategory.BUYERS_GUIDE,
        "tags": ["rent negotiation", "renting tips", "saving money", "landlords"],
        "read_time_minutes": 4,
        "is_featured": False,
        "content": """<p>Most renters never try to negotiate rent. Of the ones who do, most go about it the wrong way. Here's what actually works.</p>

<h2>The Best Time to Negotiate Is Before You Sign — Not at Renewal</h2>
<p>Your leverage is highest when the landlord has an empty unit. Once you're in and your lease is up, they know the cost of replacing you is moderate. At lease signing, their unit is vacant and costing them money every day.</p>

<h2>Lead With a Competing Offer, Not a Number You Made Up</h2>
<p>"I found a comparable unit two blocks over for $75 less — is there anything you can do?" is far more effective than "I think this is overpriced." A real competing offer forces a landlord to respond to market reality. A preference statement doesn't.</p>

<h2>Offer Something in Exchange</h2>
<p>Landlords value stability and low maintenance. Offering to sign an 18-month or 2-year lease (instead of 12) is genuinely valuable to them and often worth a $25–$50/month reduction. Offering to pre-pay two months can also move the number.</p>

<h2>Ask for Concessions If They Won't Move on Price</h2>
<p>If the base rent is firm, ask about concessions: one month free, free parking (if it's currently charged), a lower security deposit, or a free upgrade. Large management companies often have more flexibility on concessions than on advertised rent.</p>

<h2>Put It in Writing Immediately</h2>
<p>Any verbal agreement about rent, concessions, or move-in specials means nothing. Ask for an updated lease or a written amendment before you rely on it.</p>

<h2>What Doesn't Work</h2>
<p>Emotional appeals. Telling a landlord you really love the apartment does not move rent numbers. Neither does asking for a discount because you're a good tenant — that's a baseline expectation, not leverage.</p>

<h2>When to Walk</h2>
<p>If the rent is meaningfully above your budget and they won't move, walk. Committing to a lease you'll be stretched by month three is a worse outcome than continuing to search. Our agents can help you find a better deal.</p>""",
    },
    {
        "title": "First-Time Renter's Checklist — 11 Things to Do Before You Sign Anything",
        "excerpt": "First time renting on your own? Here are 11 things to check, ask, and verify before you sign a lease.",
        "category": PostCategory.BUYERS_GUIDE,
        "tags": ["first-time renter", "checklist", "renting tips", "lease"],
        "read_time_minutes": 5,
        "is_featured": True,
        "content": """<p>Renting for the first time has more moving parts than people expect. Here's a practical checklist.</p>

<h2>1. Pull Your Own Credit Report First</h2>
<p>Before you apply anywhere, know your credit score. If it's below 600, expect rejections or requirements for a co-signer and higher deposits. You can dispute errors on your report — but that takes time, so do it before you start applying.</p>

<h2>2. Calculate Your Actual Budget</h2>
<p>The standard rule is rent shouldn't exceed 30% of gross income. In high-cost cities, people push this to 35–40%, which is manageable but leaves less room for error. Be honest with yourself about what you can sustain.</p>

<h2>3. Understand What's Included in Rent</h2>
<p>Water? Trash? Gas? Electric? A $900/month apartment that requires $150/month in utilities is equivalent to a $1,050 apartment that includes them. Get specifics in writing.</p>

<h2>4. Read the Full Lease Before Signing</h2>
<p>Not the summary. The full document. Pay attention to: early termination fees, guest policies, pet policies, and what happens if you need to break the lease.</p>

<h2>5. Document the Unit Before Move-In</h2>
<p>Take timestamped photos and video of everything — every wall, every appliance, every inch of carpet. Email them to the landlord the day you move in. This protects your security deposit.</p>

<h2>6. Understand the Security Deposit Rules in Your State</h2>
<p>In Texas, landlords have 30 days to return your deposit after move-out (or send an itemized statement of deductions). Know your rights before you need them.</p>

<h2>7. Get Renters Insurance</h2>
<p>It's cheap — typically $10–$20/month. Your landlord's insurance covers the building, not your belongings. If there's a fire or break-in, renters insurance covers your stuff.</p>

<h2>8. Verify the Landlord Is Who They Say They Are</h2>
<p>Rental scams are common. Confirm the property ownership through your county appraisal district website. Anyone asking for a deposit before you've toured in person is a red flag.</p>

<h2>9. Ask About the Lease Renewal Process</h2>
<p>How much notice does the landlord require before you move out? What's the typical rent increase at renewal? These aren't uncomfortable questions — they're reasonable planning.</p>

<h2>10. Know Your Move-In Date in Writing</h2>
<p>A verbal move-in date means nothing if the previous tenant hasn't vacated. Get your move-in date in the lease.</p>

<h2>11. Set Up Utilities Before Move-In Day</h2>
<p>Don't show up to a dark apartment with no AC running in July. Set up electricity, internet, and any other utilities to transfer on or before your move-in date.</p>""",
    },
    {
        "title": "5 Questions You Should Ask Every Landlord Before You Sign",
        "excerpt": "Five questions that separate good landlords from bad ones — and what their answers actually tell you.",
        "category": PostCategory.BUYERS_GUIDE,
        "tags": ["landlord tips", "renting", "questions to ask", "lease"],
        "read_time_minutes": 4,
        "is_featured": False,
        "content": """<p>The lease isn't the only thing that determines whether renting somewhere is a good experience. The landlord is. Here are five questions worth asking — and how to read the answers.</p>

<h2>1. "How Do You Handle Maintenance Requests?"</h2>
<p>What you're looking for: a specific process. "Submit a request through our portal and we respond within 48 hours" is a good answer. "Just text me" from a private owner is fine if they're responsive. "We'll take care of it" with no specifics is a yellow flag. Ask a follow-up: "What's your typical turnaround for non-emergency repairs?"</p>

<h2>2. "How Long Have Current Tenants Been Here?"</h2>
<p>High turnover is a signal. If most tenants are on their first year and the building has been around for 10 years, that's worth understanding. A landlord who can't tell you — or gets evasive — is also a signal.</p>

<h2>3. "What's Changed in the Building or Neighborhood in the Last Two Years?"</h2>
<p>This opens a conversation about renovation history, rent increases, and neighborhood dynamics. A landlord who's invested in the property will have a real answer. One who isn't paying attention won't.</p>

<h2>4. "What's the Most Common Complaint From Residents?"</h2>
<p>This one is underused. Most landlords will answer honestly because they see it as a chance to explain themselves. The answer tells you the real problem the building has — noise, parking, laundry, water pressure, slow maintenance. Take it seriously.</p>

<h2>5. "Is There Anything I Should Know About This Specific Unit?"</h2>
<p>A good landlord will tell you: "The upstairs neighbor works nights so there's some noise mid-morning" or "we're planning to replace the HVAC next spring." These aren't necessarily deal-breakers — but you should know them going in, not three months later.</p>

<h2>What the Conversation Tells You Beyond the Answers</h2>
<p>How a landlord handles these questions tells you a lot. Defensive, vague, or rushed responses are data. A landlord who answers directly, admits trade-offs, and doesn't oversell the property is someone you can probably work with. Our agents are happy to help you evaluate any landlord or listing before you commit.</p>""",
    },
]

created = 0
skipped = 0

for data in POSTS:
    if Post.objects.filter(title=data["title"]).exists():
        print(f"  SKIP (exists): {data['title'][:60]}")
        skipped += 1
        continue

    post = Post.objects.create(
        title=data["title"],
        excerpt=data["excerpt"],
        content=data["content"],
        category=data["category"],
        author=author,
        is_published=True,
        is_featured=data["is_featured"],
        tags=data["tags"],
        read_time_minutes=data["read_time_minutes"],
    )
    print(f"  CREATED: {post.title[:60]}  (id={post.id})")
    created += 1

print(f"\nDone — {created} created, {skipped} skipped.")
