RULES (Muscle Worship)

These rules govern *all* AI-assisted work (Claude, Claude Code, etc.). If a request conflicts with these rules, stop and ask for clarification.

---

## 0) North Star
**Build working user journeys in the browser.** APIs don’t count as “done” unless users can complete the flow via real pages.

---

## 1) The One Rule
**No new backend endpoints until the user can click through the feature end-to-end in the UI.**

---

## 2) Non-Negotiables (always)
1. **Page-first development:** Build pages/components with mock data first, then wire APIs.
2. **No API links:** Never use `<a href="/api/...">`. Pages call APIs via `fetch`/actions from forms/buttons.
3. **Small changes:** Touch the fewest files and lines possible. No refactors unless required.
4. **No band-aids by default:** Fix root cause unless a temporary mitigation is explicitly requested.
5. **Role correctness:** Creators, fans, admins must see role-appropriate pages and navigation.

---

## 3) Daily Workflow (repeat every session)
1. Pick **ONE** flow step to implement (smallest possible slice).
2. Produce a plan (checklist) in `tasks/todo.md`.
3. Get approval **unless** the change is trivial (1–2 lines, low risk).
4. Implement the plan one task at a time.
5. Manually click-test the step end-to-end in the browser.
6. Commit to GitHub with a clear message.
7. If broken: fix immediately. **Do not start new work** until it’s stable.

---

## 4) Planning Rules (required before coding)
1. Inspect **only relevant files** (do not “read the whole codebase”).
2. Write the plan to `tasks/todo.md` as a checklist.
3. Each task must be:
   - small,
   - testable,
   - reversible,
   - and ideally affects <= 5 files.
4. For each task, include:
   - files to change/create,
   - what success looks like,
   - the manual test steps.

---

## 5) Execution Rules (while coding)
1. Implement tasks one-by-one and check them off in `tasks/todo.md`.
2. **Max 5 files per change-set** unless explicitly approved.
3. Keep code minimal and consistent with existing patterns.
4. Add UI states for any async action:
   - loading,
   - success,
   - error (user-friendly).
5. Do not introduce new libraries unless explicitly approved.
6. Avoid broad “cleanup” changes while fixing a feature.

---

## 6) Definition of Done (a step is NOT done unless all true)
- A user-facing **page exists** for it.
- There is a **navigation path** to reach it.
- It has **loading + error UI** (not raw JSON errors).
- Redirects after success are correct.
- **No console errors** for the flow.
- Works at mobile width (basic responsiveness).

---

## 7) Phase 1 Build Order (do not reorder)
1. **Role Router**
   - `/dashboard` redirects by role:
     - creator → `/creator/dashboard`
     - fan → `/fan/dashboard`
     - admin → `/admin/dashboard`
2. **Shared Dashboard Layout**
   - header + sidebar
   - role-based menu items
3. **Creator Onboarding Wizard (5 steps)**
   - `/creator/onboarding`
   - cannot skip steps
   - legal disclaimer BEFORE KYC
   - progress persisted
4. **Admin KYC Queue**
   - `/admin/kyc-queue`
   - approve/reject updates creator status
5. **Wallet UI (basic)**
   - balance + transaction history visible
   - top-up can be placeholder initially

---

## 8) Must-Not-Forget Product Requirements
### A) Admin-adjustable parameters (no hardcoding)
1. Create a `platform_config` (or `settings`) table for:
   - fees/percentages,
   - tier thresholds,
   - configurable limits.
2. Create `getPlatformConfig()` helper (typed, cached if needed).
3. Create `/admin/settings` UI to update config safely.
4. **Rule:** No hardcoded fees/percentages scattered across files.

### B) UI/UX developed in tandem
- Every backend capability must have a corresponding page/flow.
- Do not rely on backend error messages to guide user behavior.
- Guide users with status + “what’s next” UI.

---

## 9) Safety Rails (prevents future “Module 4” stalls)
1. Maintain a **Golden Path Manual Test** doc in repo (e.g., `docs/GOLDEN_PATH_TEST.md`):
   - Register creator → onboarding → submit KYC → admin approves → creator becomes active
   - Register fan → dashboard shows wallet → wallet page shows history
2. After any major change, run the golden path in the browser.
3. Never merge changes that break the golden path.

---

## 10) Communication Rules (how the AI must respond)
1. Output must include:
   - files changed/created,
   - complete code for each file,
   - and **3-click manual test steps**.
2. Provide short summaries **per completed task/commit**, not verbose step-by-step narration.
3. If uncertain, ask one tight question **only after** presenting the best plan and assumptions.

---

## 11) Session Prompt Template (paste this into Claude each time)
“Read `docs/AI_RULES.md` and follow it strictly.
Task: Phase 1 Step __ only.
Constraints: max 5 files changed, no new APIs unless strictly required.
Output: plan in `tasks/todo.md` + files list + full code + 3-step manual browser test.”
