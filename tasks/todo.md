# Tasks - Muscle Worship Platform

## Current Goal
Phase 1 Step 2: Shared Dashboard Layout + WalletCard component (minimal)

## Plan

- [x] Task 1: Create `src/components/layout/DashboardLayout.tsx` - Shared layout with header (logo, role badge, username) and sidebar with placeholder links (href="#"). No logout button.

- [x] Task 2: Create `src/components/wallet/WalletCard.tsx` - Simple presentational card showing "Balance: —" with a disabled "Top Up" button. No loading/error states.

- [x] Task 3: Update `src/pages/fan/dashboard.tsx` - Wrap content in DashboardLayout, add WalletCard, pass role and userName from SSR props.

- [x] Task 4: Update `src/pages/creator/dashboard.tsx` - Wrap content in DashboardLayout, add WalletCard, pass role and userName from SSR props.

## Files to Change/Create (4 total)
1. `src/components/layout/DashboardLayout.tsx` - CREATE
2. `src/components/wallet/WalletCard.tsx` - CREATE
3. `src/pages/fan/dashboard.tsx` - MODIFY
4. `src/pages/creator/dashboard.tsx` - MODIFY

## What Success Looks Like
- Fan dashboard shows header with "Fan" badge and username, sidebar with placeholder links, and WalletCard showing "Balance: —"
- Creator dashboard shows header with "Creator" badge and username, sidebar with placeholder links, and WalletCard showing "Balance: —"
- Sidebar links use href="#" (no navigation to non-existent pages)
- Layout is responsive (sidebar collapses or stacks on mobile)
- No console errors

## Manual Test Steps (3-click test)
1. Login as fan → see `/fan/dashboard` with header (logo, "Fan" badge, username), sidebar, WalletCard
2. Login as creator → see `/creator/dashboard` with header (logo, "Creator" badge, username), sidebar, WalletCard
3. Click any sidebar link → stays on same page (href="#")
4. Resize browser to mobile → layout remains usable

## Notes
- Using existing shadcn/ui components: Card, Button
- No logout button in this step (will be added later)
- WalletCard is purely presentational (no real balance, no API calls)
- Sidebar links are "#" placeholders to avoid 404s
- Admin dashboard NOT updated in this step

## Component Specifications

### DashboardLayout Props
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "fan" | "creator" | "admin";
  userName?: string;
}
```

### DashboardLayout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Role Badge | Username            │
├────────────┬────────────────────────────────────┤
│            │                                    │
│  Sidebar   │       Main Content                 │
│  - Link 1  │       (children)                   │
│  - Link 2  │                                    │
│  - Link 3  │                                    │
│            │                                    │
└────────────┴────────────────────────────────────┘
```

### Sidebar Links by Role (all href="#")
**Fan:** Dashboard, Browse Creators, My Sessions, Wallet, Settings
**Creator:** Dashboard, My Profile, Sessions, Communities, Wallet, Settings

### WalletCard
- Shows "Wallet" heading
- Shows "Balance: —" (em dash, not real value)
- Disabled "Top Up" button (grayed out, not clickable)

## Review (fill after work)
- What changed:
  1. `src/components/layout/DashboardLayout.tsx` - NEW: Shared layout with header (logo, role badge, username), sidebar with role-based placeholder links (all href="#"), responsive design (sidebar hidden on mobile, replaced with horizontal scroll menu)
  2. `src/components/wallet/WalletCard.tsx` - NEW: Simple card showing "Wallet" heading, "Balance: —", and disabled "Top Up" button
  3. `src/pages/fan/dashboard.tsx` - MODIFIED: Now uses DashboardLayout wrapper, includes WalletCard, fetches username from database in SSR
  4. `src/pages/creator/dashboard.tsx` - MODIFIED: Now uses DashboardLayout wrapper, includes WalletCard, fetches username from database in SSR

- How to test:
  1. Login as fan → see `/fan/dashboard` with header showing "Muscle Worship" logo, blue "fan" badge, username from DB
  2. Verify sidebar shows: Dashboard, Browse Creators, My Sessions, Wallet, Settings (all href="#")
  3. Verify WalletCard shows "Balance: —" with grayed-out "Top Up" button
  4. Login as creator → see `/creator/dashboard` with purple "creator" badge, different sidebar links
  5. Resize browser to mobile width → sidebar becomes horizontal scrollable menu
  6. Click any sidebar link → page stays the same (no navigation)

- Risks / follow-ups:
  1. Username fetch adds a DB call per page load - acceptable for now, could cache later
  2. No logout button yet - will add in a future step
  3. Admin dashboard not updated - intentionally deferred
  4. Sidebar links are all "#" - will wire to real pages as they're built


