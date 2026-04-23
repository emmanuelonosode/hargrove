# Plan: Seamless Registration Continuation

## Objective
Provide a seamless and welcoming experience for users who register while trying to complete an action (like applying for a rental property). After verifying their email, they should see a specific "Account Created" welcome screen and automatically continue to their intended destination, bypassing the generic intent-selection onboarding.

## Key Files & Context
- `frontend/app/(auth)/register/page.tsx`: Contains the `MultiStepRegister` component, handling the signup, email verification, and onboarding steps. The `next` URL parameter is used to determine where to redirect the user after registration.

## Implementation Steps

1.  **Update Onboarding Logic in `RegisterPage`:**
    *   In the `step === "onboarding"` rendering block of `frontend/app/(auth)/register/page.tsx`, check if the `next` URL is a custom destination (i.e., `next !== "/portal/dashboard"`).
    *   **If the user has a custom destination (`next` is set):**
        *   Render a specialized "Account Created!" welcome screen.
        *   Include a success icon, a welcoming message, and a button that says "Continue to Application" (if `next` includes `/apply`) or "Continue to Property".
        *   Implement an `useEffect` hook to automatically save default onboarding preferences (e.g., `intent: "renting"` if applying) in the background and redirect the user to their `next` destination after a short delay (e.g., 2-3 seconds).
    *   **If the user has no custom destination (normal sign-up):**
        *   Retain the existing onboarding flow asking them to select an intent (Buying/Selling/Renting/Exploring) with the "Go to Dashboard" button.

2.  **Refactor `handleOnboarding` for Auto-completion:**
    *   Extract the API call (`PATCH /api/v1/auth/me/`) that completes onboarding into a separate helper or ensure it can be triggered programmatically without a form event.
    *   This will allow the custom destination screen to automatically mark onboarding as complete without requiring the user to fill out the form.

## Verification & Testing
- Attempt to register a new account normally (navigating directly to `/register`). Verify the intent selection screen appears and works.
- Attempt to register with a `?next=/apply?property=test` parameter. Verify that after entering the email OTP, a "Welcome! Account created." screen is shown, and the user is automatically redirected to the `/apply` page within a few seconds.
