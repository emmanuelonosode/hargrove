# Plan: Client Portal Data (Applications, Payments, Favorites)

## Objective
Connect the client dashboard (`/portal/dashboard`) to real backend data for Rental Applications, Payments, and Favorite Properties, creating a comprehensive and personalized hub for the user.

## Key Files & Context
- `backend/apps/properties/models.py`: Needs a new `FavoriteProperty` model.
- `backend/apps/properties/views.py` & `urls.py`: Needs endpoints for managing favorites.
- `backend/apps/crm/views.py` & `urls.py`: Needs an endpoint to fetch the logged-in user's rental applications.
- `backend/apps/transactions/views.py` & `urls.py`: Needs an endpoint to fetch the logged-in user's payments.
- `frontend/app/(portal)/dashboard/page.tsx`: The main dashboard UI that needs to fetch and display this data.
- `frontend/app/(public)/properties/[slug]/page.tsx`: The public property page where users can click a heart icon to add to favorites.

## Implementation Steps

### Phase 1: Backend API Development

**1. Favorites Feature (`properties` app)**
- Create a `FavoriteProperty` model in `backend/apps/properties/models.py` linking `CustomUser` and `Property`.
- Create a `FavoritePropertySerializer`.
- Create an API view (`FavoritePropertyListView`) to list, create, and delete favorites for the authenticated user.
- Add the corresponding URL route (`/api/v1/properties/favorites/`).

**2. My Applications Endpoint (`crm` app)**
- Create a `UserRentalApplicationListView` in `backend/apps/crm/views.py`.
- Filter `RentalApplication` where `email=request.user.email`.
- Add the URL route (`/api/v1/leads/apply/my-applications/`).

**3. My Payments Endpoint (`transactions` app)**
- Create a `UserPaymentListView` in `backend/apps/transactions/views.py`.
- Filter `Payment` records where the linked `rental_application.email == request.user.email` OR `transaction.client.user == request.user`.
- Add the URL route (`/api/v1/transactions/my-payments/`).

### Phase 2: Frontend Integration

**1. Dashboard Updates (`frontend/app/(portal)/dashboard/page.tsx`)**
- Implement `useEffect` to fetch data from the three new endpoints concurrently.
- **My Applications UI:** Add a card or list displaying the status of active applications (e.g., "Verifying Payment", "Under Review", "Approved").
- **My Payments UI:** Add a section showing recent payment history, displaying the amount, method, and status.
- **Favorites UI:** Create a horizontal scroll or grid section displaying saved properties with mini property cards (image, title, price) linking back to the property details page.

**2. Property Page Updates (`frontend/app/(public)/properties/[slug]/page.tsx`)**
- Add a "Favorite" button (heart icon) to the property header or image gallery.
- Implement logic to toggle the favorite state via the new API endpoint (requires user to be logged in).

## Verification & Testing
- Run Django migrations for the new `FavoriteProperty` model.
- Verify API endpoints return data specific to the logged-in user.
- Test adding/removing a favorite property on the frontend.
- Verify that a user's submitted rental application appears on their dashboard with the correct status.
- Verify that a user's payment proof submission appears in their payment history.
