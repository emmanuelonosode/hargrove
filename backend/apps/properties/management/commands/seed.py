from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Role
from apps.properties.models import Property, PropertyAmenity, AmenityCategory, PropertyImage
from decimal import Decimal

User = get_user_model()


PROPERTIES = [
    {
        "data": {
            "title": "Spacious 3-Bed Home in East Atlanta",
            "slug": "spacious-3bed-east-atlanta",
            "type": "house",
            "listing_type": "for-rent",
            "price": Decimal("1850"),
            "bedrooms": 3, "bathrooms": 2, "sqft": 1420,
            "address": "742 Peachtree Rd NE", "city": "Atlanta", "state": "GA",
            "zip_code": "30306", "neighborhood": "East Atlanta Village",
            "description": "Bright and airy 3-bedroom home minutes from Ponce City Market. Updated kitchen, large backyard, and covered parking. Pets welcome with deposit.",
            "condition": "good", "cross_street": "Moreland Ave",
            "year_built": 1998, "garage": 1, "stories": 2,
            "latitude": 33.7490, "longitude": -84.3880, "is_featured": True,
        },
        "amenities": {
            "home": ["Central Air", "Hardwood Floors", "In-Unit Laundry", "Walk-in Closet"],
            "kitchen": ["Granite Countertops", "Stainless Appliances", "Dishwasher"],
            "utility": ["Trash Included", "Lawn Care Included"],
            "pet": ["Dogs Allowed", "Cats Allowed", "Pet Deposit Required"],
        },
        "image": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    },
    {
        "data": {
            "title": "Modern 2-Bed Apartment in Uptown Charlotte",
            "slug": "modern-2bed-uptown-charlotte",
            "type": "apartment",
            "listing_type": "for-rent",
            "price": Decimal("1450"),
            "bedrooms": 2, "bathrooms": 2, "sqft": 980,
            "address": "301 S Tryon St", "city": "Charlotte", "state": "NC",
            "zip_code": "28202", "neighborhood": "Uptown",
            "description": "Contemporary apartment in the heart of Uptown. Floor-to-ceiling windows, rooftop pool, and secured parking. Walking distance to Bank of America Stadium.",
            "condition": "excellent", "cross_street": "Stonewall St",
            "year_built": 2019, "garage": 1, "stories": 1,
            "latitude": 35.2271, "longitude": -80.8431, "is_featured": True,
        },
        "amenities": {
            "home": ["Central Air", "In-Unit Laundry", "Balcony", "High-Speed Internet Ready"],
            "kitchen": ["Quartz Countertops", "Stainless Appliances", "Microwave"],
            "community": ["Rooftop Pool", "Fitness Center", "Concierge", "Package Lockers"],
            "pet": ["Cats Allowed", "Small Dogs (under 25 lbs)"],
        },
        "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    },
    {
        "data": {
            "title": "Cozy 1-Bed Near Houston Medical Center",
            "slug": "cozy-1bed-houston-medical-center",
            "type": "apartment",
            "listing_type": "for-rent",
            "price": Decimal("950"),
            "bedrooms": 1, "bathrooms": 1, "sqft": 620,
            "address": "5800 Almeda Rd", "city": "Houston", "state": "TX",
            "zip_code": "77004", "neighborhood": "Museum District",
            "description": "Affordable and well-maintained 1-bedroom near the Texas Medical Center and Hermann Park. Great Metro Rail access. Water included.",
            "condition": "good", "cross_street": "Old Spanish Trail",
            "year_built": 2005, "garage": 0, "stories": 1,
            "latitude": 29.7107, "longitude": -95.3850, "is_featured": False,
        },
        "amenities": {
            "home": ["Central Air", "Ceiling Fans"],
            "kitchen": ["Dishwasher", "Refrigerator Included"],
            "utility": ["Water Included", "On-Site Laundry"],
            "community": ["Gated Community", "Swimming Pool"],
            "pet": ["No Pets"],
        },
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    },
    {
        "data": {
            "title": "4-Bed Desert Oasis For Sale in Scottsdale",
            "slug": "4bed-desert-oasis-scottsdale",
            "type": "house",
            "listing_type": "for-sale",
            "price": Decimal("489000"),
            "bedrooms": 4, "bathrooms": 3, "sqft": 2640,
            "address": "9800 E McDowell Rd", "city": "Scottsdale", "state": "AZ",
            "zip_code": "85256", "neighborhood": "Old Town Scottsdale",
            "description": "Stunning 4-bed home with pool and mountain views. Open-plan living, chef's kitchen, primary suite with spa bath. 3-car garage. Entertainers' dream.",
            "condition": "excellent", "cross_street": "Pima Rd",
            "year_built": 2015, "garage": 3, "stories": 1, "lot_size": Decimal("0.35"),
            "latitude": 33.4942, "longitude": -111.9261, "is_featured": True,
        },
        "amenities": {
            "home": ["Private Pool", "Mountain Views", "Smart Home", "Solar Panels", "Walk-in Closet"],
            "kitchen": ["Chef's Kitchen", "Granite Countertops", "Wine Fridge", "Double Oven"],
            "community": ["HOA Community", "Tennis Courts", "Walking Trails"],
            "pet": ["Dogs Allowed", "Cats Allowed"],
        },
        "image": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
    },
    {
        "data": {
            "title": "Stylish 2-Bed Townhouse in The Gulch Nashville",
            "slug": "stylish-2bed-townhouse-nashville-gulch",
            "type": "townhouse",
            "listing_type": "for-rent",
            "price": Decimal("2100"),
            "bedrooms": 2, "bathrooms": 2, "sqft": 1280,
            "address": "1100 Division St", "city": "Nashville", "state": "TN",
            "zip_code": "37203", "neighborhood": "The Gulch",
            "description": "Trendy 2-story townhouse in Nashville's hottest neighborhood. Rooftop terrace, attached garage, and steps from the best restaurants and live music.",
            "condition": "excellent", "cross_street": "12th Ave S",
            "year_built": 2021, "garage": 1, "stories": 2,
            "latitude": 36.1492, "longitude": -86.7908, "is_featured": True,
        },
        "amenities": {
            "home": ["Rooftop Terrace", "Hardwood Floors", "In-Unit Laundry", "Smart Thermostat"],
            "kitchen": ["Quartz Countertops", "Gas Range", "Wine Refrigerator"],
            "utility": ["Trash Included"],
            "pet": ["Dogs Allowed (under 50 lbs)", "Cats Allowed", "Pet Deposit Required"],
        },
        "image": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    },
    {
        "data": {
            "title": "3-Bed Waterfront Condo in Brickell Miami",
            "slug": "3bed-waterfront-condo-brickell-miami",
            "type": "condo",
            "listing_type": "for-sale",
            "price": Decimal("725000"),
            "bedrooms": 3, "bathrooms": 2, "sqft": 1680,
            "address": "801 Brickell Key Dr", "city": "Miami", "state": "FL",
            "zip_code": "33131", "neighborhood": "Brickell",
            "description": "Luxury waterfront condo with panoramic bay views. Floor-to-ceiling glass, Italian kitchen, and resort-style amenities. Walking distance to Brickell City Centre.",
            "condition": "new", "cross_street": "SE 8th St",
            "year_built": 2022, "garage": 2, "stories": 1,
            "latitude": 25.7617, "longitude": -80.1918, "is_featured": False,
        },
        "amenities": {
            "home": ["Bay Views", "Floor-to-Ceiling Windows", "Private Balcony", "Smart Home"],
            "kitchen": ["Italian Cabinetry", "Miele Appliances", "Marble Countertops"],
            "community": ["Infinity Pool", "Concierge", "Valet Parking", "Fitness Center", "Spa"],
            "pet": ["Pets Allowed (breed restrictions apply)"],
        },
        "image": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    },
    {
        "data": {
            "title": "3-Bed Beach Cottage Near Virginia Beach Oceanfront",
            "slug": "3bed-beach-cottage-virginia-beach",
            "type": "house",
            "listing_type": "for-rent",
            "price": Decimal("2200"),
            "bedrooms": 3, "bathrooms": 2, "sqft": 1380,
            "address": "213 Bob Ln", "city": "Virginia Beach", "state": "VA",
            "zip_code": "23454", "neighborhood": "Oceanfront",
            "description": "Charming beach cottage minutes from the Atlantic. Large deck, outdoor shower, bike storage. Perfect for families relocating to Hampton Roads. Summer and annual leases available.",
            "condition": "good", "cross_street": "Atlantic Ave",
            "year_built": 2002, "garage": 0, "stories": 1,
            "latitude": 36.8529, "longitude": -75.9780, "is_featured": True,
        },
        "amenities": {
            "home": ["Outdoor Deck", "Ceiling Fans", "Bike Storage"],
            "kitchen": ["Full Kitchen", "Dishwasher"],
            "utility": ["Water Included", "Lawn Care Included"],
            "pet": ["Cats Allowed", "Small Dogs Allowed", "Pet Deposit Required"],
        },
        "image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    },
    {
        "data": {
            "title": "Studio Apartment in RiNo Art District Denver",
            "slug": "studio-rino-art-district-denver",
            "type": "apartment",
            "listing_type": "for-rent",
            "price": Decimal("1150"),
            "bedrooms": 0, "bathrooms": 1, "sqft": 480,
            "address": "2940 Larimer St", "city": "Denver", "state": "CO",
            "zip_code": "80205", "neighborhood": "RiNo",
            "description": "Modern industrial-chic studio in Denver's trendiest neighborhood. Exposed brick, polished concrete floors, and a communal rooftop with mountain views.",
            "condition": "excellent", "cross_street": "29th St",
            "year_built": 2018, "garage": 0, "stories": 1,
            "latitude": 39.7673, "longitude": -104.9763, "is_featured": False,
        },
        "amenities": {
            "home": ["Exposed Brick", "Polished Concrete", "High Ceilings", "In-Unit Laundry"],
            "kitchen": ["Open Kitchen", "Stainless Appliances"],
            "community": ["Rooftop Deck", "Bike Storage", "Package Lockers"],
            "pet": ["Cats Allowed", "No Dogs"],
        },
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    },
    {
        "data": {
            "title": "4-Bed Family Home For Sale in Raleigh",
            "slug": "4bed-family-home-raleigh-nc",
            "type": "house",
            "listing_type": "for-sale",
            "price": Decimal("375000"),
            "bedrooms": 4, "bathrooms": 3, "sqft": 2200,
            "address": "4501 Falls of Neuse Rd", "city": "Raleigh", "state": "NC",
            "zip_code": "27609", "neighborhood": "North Hills",
            "description": "Beautiful 4-bedroom home in top-rated school district. Open concept living, updated kitchen, large backyard, and 2-car garage. Move-in ready.",
            "condition": "excellent", "cross_street": "Wake Forest Rd",
            "year_built": 2010, "garage": 2, "stories": 2, "lot_size": Decimal("0.28"),
            "latitude": 35.8468, "longitude": -78.6413, "is_featured": True,
        },
        "amenities": {
            "home": ["Hardwood Floors", "Vaulted Ceilings", "Walk-in Closet", "Fireplace"],
            "kitchen": ["Granite Countertops", "Stainless Appliances", "Breakfast Bar"],
            "community": ["Top-Rated Schools", "Walking Trails", "Quiet Neighborhood"],
            "pet": ["Dogs Allowed", "Cats Allowed"],
        },
        "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    },
    {
        "data": {
            "title": "2-Bed Apartment in Downtown Austin",
            "slug": "2bed-apartment-downtown-austin-tx",
            "type": "apartment",
            "listing_type": "for-rent",
            "price": Decimal("1750"),
            "bedrooms": 2, "bathrooms": 2, "sqft": 1050,
            "address": "600 W 6th St", "city": "Austin", "state": "TX",
            "zip_code": "78701", "neighborhood": "Downtown",
            "description": "Live in the heart of Austin. Modern 2-bed with city views, walk to 6th Street entertainment and Lady Bird Lake. Concierge building with gym and dog park.",
            "condition": "excellent", "cross_street": "Lamar Blvd",
            "year_built": 2020, "garage": 1, "stories": 1,
            "latitude": 30.2672, "longitude": -97.7431, "is_featured": False,
        },
        "amenities": {
            "home": ["City Views", "In-Unit Laundry", "Smart Thermostat", "Balcony"],
            "kitchen": ["Quartz Countertops", "Gas Range", "Wine Cooler"],
            "community": ["Dog Park", "Fitness Center", "Pool", "Concierge"],
            "pet": ["Dogs Allowed", "Cats Allowed", "Pet Fee Required"],
        },
        "image": "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800",
    },
]


class Command(BaseCommand):
    help = "Seed the database with dummy data for testing"

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing property data...")
        PropertyAmenity.objects.all().delete()
        PropertyImage.objects.all().delete()
        Property.objects.all().delete()
        AmenityCategory.objects.all().delete()

        self.stdout.write("Clearing all users...")
        User.objects.all().delete()

        # Superuser
        admin = User.objects.create_superuser(
            email="admin@haskerrealtygroup.com",
            password="Admin1234!",
            first_name="Admin",
            last_name="Hasker",
        )
        self.stdout.write(self.style.SUCCESS("Superuser: admin@haskerrealtygroup.com / Admin1234!"))

        # Agent
        agent = User.objects.create_user(
            email="agent@haskerrealtygroup.com",
            password="Agent1234!",
            first_name="Marcus",
            last_name="Reid",
            role=Role.AGENT,
            phone="(757) 555-0101",
        )
        self.stdout.write(self.style.SUCCESS("Agent: agent@haskerrealtygroup.com / Agent1234!"))

        # Tenant
        User.objects.create_user(
            email="tenant@test.com",
            password="Tenant1234!",
            first_name="Jamie",
            last_name="Carter",
            role=Role.CLIENT,
            phone="(404) 555-0202",
        )
        self.stdout.write(self.style.SUCCESS("Tenant: tenant@test.com / Tenant1234!"))

        # Amenity categories
        cats = {}
        for order, (key, name, icon) in enumerate([
            ("home",      "Home Features",         "Home"),
            ("kitchen",   "Kitchen Features",      "ChefHat"),
            ("utility",   "Utility & Maintenance", "Zap"),
            ("community", "Community Features",    "Users"),
            ("pet",       "Pet Policy",            "PawPrint"),
        ]):
            cats[key] = AmenityCategory.objects.create(name=name, icon=icon, order=order)
        self.stdout.write("Amenity categories created.")

        # Properties
        for item in PROPERTIES:
            p = Property.objects.create(agent=agent, is_published=True, **item["data"])
            for cat_key, names in item["amenities"].items():
                cat = cats.get(cat_key)
                for name in names:
                    PropertyAmenity.objects.create(property=p, category=cat, name=name)
            self.stdout.write(f"  Created: {p.title}")

        self.stdout.write(self.style.SUCCESS(f"\n{len(PROPERTIES)} properties created."))
        self.stdout.write(self.style.SUCCESS("\n=== SEED COMPLETE ==="))
        self.stdout.write("Superuser : admin@haskerrealtygroup.com / Admin1234!")
        self.stdout.write("Agent     : agent@haskerrealtygroup.com / Agent1234!")
        self.stdout.write("Tenant    : tenant@test.com / Tenant1234!")
        self.stdout.write(f"\nAdmin panel: http://127.0.0.1:8000/admin/")
        self.stdout.write(f"API:         http://127.0.0.1:8000/api/v1/properties/")
