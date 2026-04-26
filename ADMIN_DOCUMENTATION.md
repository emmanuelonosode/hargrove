# Hasker & Co. Realty Group — Admin Documentation

Welcome to the comprehensive guide for the Hasker & Co. Realty Group Admin Dashboard. This system is powered by Django and the `django-unfold` theme, providing a modern, sleek interface for managing every aspect of the real estate platform.

---

## 1. Accessing the Dashboard
- **URL:** Navigate to `https://admin.haskerrealtygroup.com/admin/` (or your local equivalent).
- **Login:** Enter your Admin or Manager credentials.

---

## 2. Property Management (`Properties` App)
This is where you manage your portfolio of available homes.

### Properties
- **Create a Listing:** Add new properties for Sale, Rent, or Lease.
- **Details:** Enter critical data including Price, Bedrooms, Bathrooms, Square Footage, and Address.
- **Coordinates:** Set Latitude and Longitude for map pins.
- **Virtual Tours:** Add links to 360-degree Matterport or Zillow 3D home tours.
- **Publishing & Featuring:** Toggle `Is Published` to make the listing visible on the public website. Toggle `Is Featured` to pin it to the homepage hero section.

### Property Images
- **Uploads:** Images are managed via Cloudinary.
- **Primary Image:** Mark one image as `Is Primary` to serve as the cover photo on the frontend.
- **Ordering:** Drag and drop or set numerical orders for the image gallery.

### Amenities & Categories
- **Categorization:** Group features (e.g., "Kitchen Appliances", "Outdoor Space").
- **Tags:** Tag properties with amenities like "Washer/Dryer", "Granite Countertops", or "Pet Friendly". The frontend automatically assigns corresponding visual icons to these tags.

### Favorite Properties
- **Tracking:** View which users have "Saved/Favorited" specific properties. This is an excellent tool for gauging interest and following up with warm leads.

---

## 3. CRM & Rental Applications (`CRM` App)
Manage your inbound leads and tenant applications.

### Leads
- **Inquiries:** View form submissions from the public site.
- **Lead Activity:** Log calls, emails, and internal notes on a lead's timeline.

### Rental Applications
- **Review Pipeline:** View all submitted rental applications.
- **Statuses:** Track an application through its lifecycle:
  - `Draft`
  - `Pending Payment` (Awaiting the $50 application fee)
  - `Verifying Payment` (User submitted proof, waiting for admin approval)
  - `Submitted` (Ready for review)
  - `Under Review`
  - `Approved` / `Rejected`
- **Application Fee:** Track if the application fee has been paid. *(Note: Verifying a payment in the Transactions app automatically updates the application status to Submitted)*.
- **PDF Export:** Generate and download a PDF snapshot of the applicant's data.

---

## 4. Billing, Invoices & Payments (`Transactions` App)
The central hub for all financial operations, including the manual P2P verification system.

### Invoices
- **Targeting:** Create a bill for a specific `Transaction` (e.g., a formal lease) OR assign it directly to a `User` profile (e.g., for ad-hoc charges or security deposits).
- **Line Items:** Add JSON-based line items (Description, Quantity, Unit Price) to calculate totals.
- **Issuing:** When an invoice status is changed to `SENT`, the system automatically emails the client a "New Invoice Due" notification with a link to pay.
- **PDFs:** Generate formal PDF invoices for record-keeping.

### Payments & Manual Verification
Because the platform accepts manual P2P payments (Venmo, CashApp, PayPal, Chime, Zelle), admins must verify receipts.
- **Pending Verification:** When a user uploads a screenshot of their transfer from the frontend portal, a `Payment` record is created here with the status `PENDING_VERIFICATION`.
- **Review Proof:** Open the payment record to view the `Reference ID` and click the `Proof Image` thumbnail to view the full-size receipt screenshot.
- **Verify Payment (Action):** Select one or more pending payments from the list view and use the **"Verify Selected Payments"** action dropdown.
  - *What happens automatically?*
    1. The payment status changes to `VERIFIED`.
    2. The linked Invoice status changes to `PAID`.
    3. If it was an application fee, the Rental Application status changes to `SUBMITTED`.
    4. An automated "Payment Approved" email is sent to the user.
- **Reject Payment:** If the receipt is invalid, use the Reject action and provide a reason.

### Transactions
- **Record Keeping:** Log formal Sales, Rentals, or Leases, linking a Property to a Client and the assigned Agent.

---

## 5. Accounts & Personnel (`Accounts` App)
Manage your team and your users.

### Users
- **Roles:** Assign users as `CLIENT`, `AGENT`, `MANAGER`, `ADMIN`, or `ACCOUNTANT` to restrict or grant permissions.
- **Basic Info:** Manage names, emails, and passwords.

### Agent Profiles
- **Public Roster:** For users marked as `AGENT`, create an Agent Profile.
- **Details:** Add their Bio, License Number, Years of Experience, Sales Volume, and Specialties (e.g., "First-Time Buyers", "Relocation").
- **Visibility:** This data populates the public "Meet Our Team" page and individual agent detail pages.

---

## 6. Content Management (`Blog` App)
Control the educational content on the frontend.

### Blog Posts
- **Renter's Guide:** Publish articles, tips, and market updates.
- **Rich Text:** The content field supports standard HTML formatting.
- **SEO & Organization:** Set the Slug, Category, and comma-separated Tags.
- **Featuring:** Mark a post as `Is Featured` to highlight it at the top of the blog page.
- **Images:** Provide a Cloudinary URL for the cover photo.

---

## 7. Global Admin Features
- **Global Search:** Use the search bar at the top of list views to quickly find users by email, invoices by number, or properties by title.
- **Filters:** Use the right-hand sidebar to filter records (e.g., filter Applications by Status, or Payments by Date).
- **Batch Actions:** Use the dropdown at the top of any list (next to the "Go" button) to perform actions on multiple selected rows at once (e.g., bulk verifying payments or generating multiple PDFs).
