"""
Run with:
  DJANGO_SETTINGS_MODULE=config.settings.local DATABASE_URL="sqlite:///db.sqlite3" py -3 manage.py shell < seed_data.py
"""

import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
os.environ.setdefault("DATABASE_URL", "sqlite:///db.sqlite3")

from django.contrib.auth import get_user_model
from apps.accounts.models import Role
from apps.properties.models import Property, PropertyAmenity, AmenityCategory, PropertyImage
from apps.transactions.models import Transaction, Invoice

User = get_user_model()

# ── Superuser ──────────────────────────────────────────────────────────────
admin = User.objects.create_superuser(
    email="admin@haskerrealtygroup.com",
    password="Admin1234!",
    first_name="Admin",
    last_name="Hasker",
)
print("Superuser created: admin@haskerrealtygroup.com / Admin1234!")

# ── Agent ──────────────────────────────────────────────────────────────────
agent = User.objects.create_user(
    email="agent@haskerrealtygroup.com",
    password="Agent1234!",
    first_name="Marcus",
    last_name="Reid",
    role=Role.AGENT,
    phone="(757) 555-0101",
)
print("Agent created: agent@haskerrealtygroup.com / Agent1234!")

# ── Test tenant ────────────────────────────────────────────────────────────
tenant = User.objects.create_user(
    email="tenant@test.com",
    password="Tenant1234!",
    first_name="Jamie",
    last_name="Carter",
    role=Role.CLIENT,
    phone="(404) 555-0202",
)
print("Tenant created: tenant@test.com / Tenant1234!")

# ── Amenity Categories ─────────────────────────────────────────────────────
cats = {}
for order, (key, name, icon) in enumerate([
    ("home",      "Home Features",          "Home"),
    ("kitchen",   "Kitchen Features",       "ChefHat"),
    ("utility",   "Utility & Maintenance",  "Zap"),
    ("community", "Community Features",     "Users"),
    ("pet",       "Pet Policy",             "PawPrint"),
]):
    cats[key] = AmenityCategory.objects.create(name=name, icon=icon, order=order)
print("Amenity categories created.")

# ── Helper ─────────────────────────────────────────────────────────────────
def make_property(data, amenities_map):
    p = Property.objects.create(agent=agent, is_published=True, **data)
    for cat_key, names in amenities_map.items():
        cat = cats.get(cat_key)
        for name in names:
            PropertyAmenity.objects.create(property=p, category=cat, name=name)
    return p

# ── Properties ─────────────────────────────────────────────────────────────
props = []

# 1 – Atlanta, GA – for rent
p1 = make_property({
    "title": "Spacious 3-Bed Home in East Atlanta",
    "slug": "spacious-3bed-east-atlanta",
    "type": "house",
    "listing_type": "for-rent",
    "price": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1420,
    "address": "742 Peachtree Rd NE",
    "city": "Atlanta",
    "state": "GA",
    "zip_code": "30306",
    "neighborhood": "East Atlanta Village",
    "description": "Bright and airy 3-bedroom home minutes from Ponce City Market. Updated kitchen, large backyard, and covered parking. Pets welcome with deposit.",
    "condition": "good",
    "cross_street": "Moreland Ave",
    "year_built": 1998,
    "garage": 1,
    "stories": 2,
    "latitude": 33.7490,
    "longitude": -84.3880,
    "primary_image_url": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    "is_featured": True,
}, {
    "home": ["Central Air", "Hardwood Floors", "In-Unit Laundry", "Walk-in Closet"],
    "kitchen": ["Granite Countertops", "Stainless Appliances", "Dishwasher"],
    "utility": ["Trash Included", "Lawn Care Included"],
    "pet": ["Dogs Allowed", "Cats Allowed", "Pet Deposit Required"],
})
props.append(p1)

# 2 – Charlotte, NC – for rent
p2 = make_property({
    "title": "Modern 2-Bed Apartment in Uptown Charlotte",
    "slug": "modern-2bed-uptown-charlotte",
    "type": "apartment",
    "listing_type": "for-rent",
    "price": 1450,
    "bedrooms": 2,
    "bathrooms": 2,
    "sqft": 980,
    "address": "301 S Tryon St",
    "city": "Charlotte",
    "state": "NC",
    "zip_code": "28202",
    "neighborhood": "Uptown",
    "description": "Contemporary apartment in the heart of Uptown. Floor-to-ceiling windows, rooftop pool, and secured parking. Walking distance to Bank of America Stadium.",
    "condition": "excellent",
    "cross_street": "Stonewall St",
    "year_built": 2019,
    "garage": 1,
    "stories": 1,
    "latitude": 35.2271,
    "longitude": -80.8431,
    "primary_image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "is_featured": True,
}, {
    "home": ["Central Air", "In-Unit Laundry", "Balcony", "High-Speed Internet Ready"],
    "kitchen": ["Quartz Countertops", "Stainless Appliances", "Microwave"],
    "community": ["Rooftop Pool", "Fitness Center", "Concierge", "Package Lockers"],
    "pet": ["Cats Allowed", "Small Dogs (under 25 lbs)"],
})
props.append(p2)

# 3 – Houston, TX – for rent
p3 = make_property({
    "title": "Cozy 1-Bed Near Houston Medical Center",
    "slug": "cozy-1bed-houston-medical-center",
    "type": "apartment",
    "listing_type": "for-rent",
    "price": 950,
    "bedrooms": 1,
    "bathrooms": 1,
    "sqft": 620,
    "address": "5800 Almeda Rd",
    "city": "Houston",
    "state": "TX",
    "zip_code": "77004",
    "neighborhood": "Museum District",
    "description": "Affordable and well-maintained 1-bedroom near the Texas Medical Center and Hermann Park. Great Metro Rail access. Water included.",
    "condition": "good",
    "cross_street": "Old Spanish Trail",
    "year_built": 2005,
    "garage": 0,
    "stories": 1,
    "latitude": 29.7107,
    "longitude": -95.3850,
    "primary_image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "is_featured": False,
}, {
    "home": ["Central Air", "Ceiling Fans"],
    "kitchen": ["Dishwasher", "Refrigerator Included"],
    "utility": ["Water Included", "On-Site Laundry"],
    "community": ["Gated Community", "Swimming Pool"],
    "pet": ["No Pets"],
})
props.append(p3)

# 4 – Phoenix, AZ – for sale
p4 = make_property({
    "title": "4-Bed Desert Oasis For Sale in Scottsdale",
    "slug": "4bed-desert-oasis-scottsdale",
    "type": "house",
    "listing_type": "for-sale",
    "price": 489000,
    "bedrooms": 4,
    "bathrooms": 3,
    "sqft": 2640,
    "address": "9800 E McDowell Rd",
    "city": "Scottsdale",
    "state": "AZ",
    "zip_code": "85256",
    "neighborhood": "Old Town Scottsdale",
    "description": "Stunning 4-bed home with pool and mountain views. Open-plan living, chef's kitchen, primary suite with spa bath. 3-car garage. Entertainers' dream.",
    "condition": "excellent",
    "cross_street": "Pima Rd",
    "year_built": 2015,
    "garage": 3,
    "stories": 1,
    "lot_size": 0.35,
    "latitude": 33.4942,
    "longitude": -111.9261,
    "primary_image_url": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
    "is_featured": True,
}, {
    "home": ["Private Pool", "Mountain Views", "Smart Home", "Solar Panels", "Walk-in Closet"],
    "kitchen": ["Chef's Kitchen", "Granite Countertops", "Wine Fridge", "Double Oven"],
    "community": ["HOA Community", "Tennis Courts", "Walking Trails"],
    "pet": ["Dogs Allowed", "Cats Allowed"],
})
props.append(p4)

# 5 – Nashville, TN – for rent
p5 = make_property({
    "title": "Stylish 2-Bed Townhouse in The Gulch",
    "slug": "stylish-2bed-townhouse-nashville-gulch",
    "type": "townhouse",
    "listing_type": "for-rent",
    "price": 2100,
    "bedrooms": 2,
    "bathrooms": 2,
    "sqft": 1280,
    "address": "1100 Division St",
    "city": "Nashville",
    "state": "TN",
    "zip_code": "37203",
    "neighborhood": "The Gulch",
    "description": "Trendy 2-story townhouse in Nashville's hottest neighborhood. Rooftop terrace, attached garage, and steps from the best restaurants and live music.",
    "condition": "excellent",
    "cross_street": "12th Ave S",
    "year_built": 2021,
    "garage": 1,
    "stories": 2,
    "latitude": 36.1492,
    "longitude": -86.7908,
    "primary_image_url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    "is_featured": True,
}, {
    "home": ["Rooftop Terrace", "Hardwood Floors", "In-Unit Laundry", "Smart Thermostat"],
    "kitchen": ["Quartz Countertops", "Gas Range", "Wine Refrigerator"],
    "utility": ["Trash Included"],
    "pet": ["Dogs Allowed (under 50 lbs)", "Cats Allowed", "Pet Deposit Required"],
})
props.append(p5)

# 6 – Miami, FL – for sale
p6 = make_property({
    "title": "3-Bed Waterfront Condo in Brickell",
    "slug": "3bed-waterfront-condo-brickell-miami",
    "type": "condo",
    "listing_type": "for-sale",
    "price": 725000,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1680,
    "address": "801 Brickell Key Dr",
    "city": "Miami",
    "state": "FL",
    "zip_code": "33131",
    "neighborhood": "Brickell",
    "description": "Luxury waterfront condo with panoramic bay views. Floor-to-ceiling glass, Italian kitchen, and resort-style amenities. Walking distance to Brickell City Centre.",
    "condition": "new",
    "cross_street": "SE 8th St",
    "year_built": 2022,
    "garage": 2,
    "stories": 1,
    "latitude": 25.7617,
    "longitude": -80.1918,
    "primary_image_url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "is_featured": False,
}, {
    "home": ["Bay Views", "Floor-to-Ceiling Windows", "Private Balcony", "Smart Home"],
    "kitchen": ["Italian Cabinetry", "Miele Appliances", "Marble Countertops"],
    "community": ["Infinity Pool", "Concierge", "Valet Parking", "Fitness Center", "Spa"],
    "pet": ["Pets Allowed (breed restrictions apply)"],
})
props.append(p6)

# 7 – Virginia Beach, VA – for rent (local)
p7 = make_property({
    "title": "3-Bed Beach Cottage Near Oceanfront",
    "slug": "3bed-beach-cottage-virginia-beach",
    "type": "house",
    "listing_type": "for-rent",
    "price": 2200,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1380,
    "address": "213 Bob Ln",
    "city": "Virginia Beach",
    "state": "VA",
    "zip_code": "23454",
    "neighborhood": "Oceanfront",
    "description": "Charming beach cottage minutes from the Atlantic. Large deck, outdoor shower, bike storage. Perfect for families relocating to Hampton Roads. Summer and annual leases available.",
    "condition": "good",
    "cross_street": "Atlantic Ave",
    "year_built": 2002,
    "garage": 0,
    "stories": 1,
    "latitude": 36.8529,
    "longitude": -75.9780,
    "primary_image_url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    "is_featured": True,
}, {
    "home": ["Ocean Views", "Outdoor Deck", "Ceiling Fans", "Bike Storage"],
    "kitchen": ["Full Kitchen", "Dishwasher"],
    "utility": ["Water Included", "Lawn Care Included"],
    "pet": ["Cats Allowed", "Small Dogs Allowed", "Pet Deposit Required"],
})
props.append(p7)

# 8 – Denver, CO – for rent
p8 = make_property({
    "title": "Studio Apartment in RiNo Art District",
    "slug": "studio-rino-art-district-denver",
    "type": "apartment",
    "listing_type": "for-rent",
    "price": 1150,
    "bedrooms": 0,
    "bathrooms": 1,
    "sqft": 480,
    "address": "2940 Larimer St",
    "city": "Denver",
    "state": "CO",
    "zip_code": "80205",
    "neighborhood": "RiNo",
    "description": "Modern industrial-chic studio in Denver's trendiest neighborhood. Exposed brick, polished concrete floors, and a communal rooftop with mountain views.",
    "condition": "excellent",
    "cross_street": "29th St",
    "year_built": 2018,
    "garage": 0,
    "stories": 1,
    "latitude": 39.7673,
    "longitude": -104.9763,
    "primary_image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "is_featured": False,
}, {
    "home": ["Exposed Brick", "Polished Concrete", "High Ceilings", "In-Unit Laundry"],
    "kitchen": ["Open Kitchen", "Stainless Appliances"],
    "community": ["Rooftop Deck", "Bike Storage", "Package Lockers"],
    "pet": ["Cats Allowed", "No Dogs"],
})
props.append(p8)

print(f"{len(props)} properties created.")

# ── Transaction & Invoice for tenant ───────────────────────────────────────
try:
    from apps.accounts.models import Client
    client_obj, _ = Client.objects.get_or_create(user=tenant)

    txn = Transaction.objects.create(
        client=client_obj,
        property=p7,
        transaction_type="rent",
        amount=2200,
        status="active",
        description="Monthly rent – 213 Bob Ln, Virginia Beach",
    )

    from decimal import Decimal
    from django.utils import timezone
    import datetime

    Invoice.objects.create(
        transaction=txn,
        invoice_number="INV-2026-0001",
        issued_date=timezone.now().date(),
        due_date=timezone.now().date() + datetime.timedelta(days=14),
        subtotal=Decimal("2200.00"),
        tax_rate=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total=Decimal("2200.00"),
        status="SENT",
        line_items=[{"description": "Monthly Rent – April 2026", "quantity": 1, "unit_price": 2200, "total": 2200}],
    )
    print("Transaction and invoice created for tenant.")
except Exception as e:
    print(f"Skipped transaction/invoice: {e}")

print("\n=== SEED COMPLETE ===")
print("Superuser : admin@haskerrealtygroup.com / Admin1234!")
print("Agent     : agent@haskerrealtygroup.com / Agent1234!")
print("Tenant    : tenant@test.com / Tenant1234!")
