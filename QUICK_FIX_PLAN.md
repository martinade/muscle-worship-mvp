# Quick Fix Plan - Priority Order

## Phase 1: Critical User Flows (Day 1 - 4 hours)

### 1.1 Fix Login/Register Redirect (30 min)
- [x] Login page exists
- [x] Register page exists
- [ ] Update dashboard to redirect by role

### 1.2 Creator Onboarding Wizard (2 hours)
**File:** `src/pages/creator/onboarding.tsx`
- Step 1: Legal Disclaimer
- Step 2: Profile Setup
- Step 3: Tax Form Upload
- Step 4: KYC Submission
- Progress indicator

### 1.3 Role-Based Dashboards (1.5 hours)
**Files:**
- `src/pages/creator/dashboard.tsx` - Creator home
- `src/pages/fan/dashboard.tsx` - Fan home
- Update `src/pages/dashboard.tsx` to redirect by role

---

## Phase 2: Essential Pages (Day 1-2 - 4 hours)

### 2.1 Creator Pages
- `src/pages/creator/profile.tsx` - View/edit profile
- `src/pages/creator/kyc.tsx` - KYC form (with disclaimer check)
- `src/pages/creator/tax-form.tsx` - Tax form upload
- `src/pages/creator/wallet.tsx` - Wallet & earnings

### 2.2 Fan Pages
- `src/pages/fan/browse.tsx` - Browse creators
- `src/pages/fan/wallet.tsx` - Wallet & top-up

### 2.3 Shared Pages
- `src/pages/settings.tsx` - Account settings
- `src/pages/wallet/history.tsx` - Transaction history

---

## Phase 3: Components (Day 2 - 3 hours)

### 3.1 Onboarding Components
- `src/components/creator/OnboardingWizard.tsx`
- `src/components/creator/LegalDisclaimer.tsx`
- `src/components/creator/ProfileSetupForm.tsx`
- `src/components/creator/KYCForm.tsx`
- `src/components/creator/TaxFormUpload.tsx`

### 3.2 Status Components
- `src/components/creator/ProfileStatus.tsx` - Completion indicator
- `src/components/creator/TierBadge.tsx` - Show tier level
- `src/components/wallet/BalanceCard.tsx` - Wallet balance

### 3.3 Navigation
- `src/components/layout/CreatorNav.tsx`
- `src/components/layout/FanNav.tsx`

---

## Phase 4: Utilities & Hooks (Day 2 - 1 hour)

### 4.1 Auth Utilities
- `src/hooks/useAuth.ts` - Get current user
- `src/hooks/useRole.ts` - Get user role
- `src/middleware/withAuth.ts` - Protect pages

### 4.2 Data Hooks
- `src/hooks/useProfile.ts` - Fetch profile data
- `src/hooks/useWallet.ts` - Fetch wallet balance
- `src/hooks/useKYCStatus.ts` - Check KYC status

---

## Implementation Order (Start Here)

### Step 1: Role-Based Redirect (15 min)
Update dashboard to redirect by role

### Step 2: Creator Dashboard (30 min)
Basic dashboard with status cards

### Step 3: Onboarding Wizard (2 hours)
Multi-step form with all required steps

### Step 4: Individual Pages (3 hours)
KYC, tax form, profile, wallet pages

### Step 5: Polish (1 hour)
Error handling, loading states, validation

---

## Total Time Estimate
- **Minimum Viable:** 4 hours (Phase 1 only)
- **Complete Core:** 8 hours (Phase 1-2)
- **Production Ready:** 12 hours (All phases)

---

## What to Build First

**Priority 1 (Must Have):**
1. Role-based dashboard redirect
2. Creator onboarding wizard
3. KYC submission page
4. Tax form upload page

**Priority 2 (Should Have):**
5. Wallet page
6. Profile page
7. Settings page

**Priority 3 (Nice to Have):**
8. Transaction history
9. Browse creators (for fans)
10. Advanced features

---

## Quick Start Command

I'll start building in this order:
1. Update dashboard redirect
2. Create creator dashboard
3. Create onboarding wizard
4. Create KYC page
5. Create tax form page

Ready to proceed?
