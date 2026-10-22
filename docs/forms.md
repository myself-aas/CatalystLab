# Form Error-Placement & Feedback Pass

**Date:** 2026-10-22 · **Scope:** recommendation R4 of the [ui-ux-pro-max design-system audit](audit/2026-10-22-design-system-review-uiux-pro-max.md) (rule priority 8 — Forms & Feedback).

## Standard

Every form surface in CatalystLab must satisfy all five checks before delivery:

1. **Inline, specific errors** — validation messages appear next to the field (or, for
   server/form-level failures, in a summary at the top of the form), never only in a
   blocking `alert()` or a toast that disappears.
2. **Programmatic association** — the error container is referenced from the `<form>`
   (or field) via `aria-describedby` while the error is visible; fields with their own
   messages also set `aria-invalid`.
3. **Announced + focusable summary** — form-level error summaries carry `role="alert"`
   (auto-announced) and `tabIndex={-1}` so keyboard users can jump to them and reach any
   embedded action (e.g. the Firebase domain-whitelist button).
4. **Success without focus theft** — when a success state replaces the form, focus is
   moved to the confirmation (`role="status"`, `tabIndex={-1}`, focused via effect) so
   screen-reader/keyboard users are not dropped to `<body>`.
5. **No dead-end feedback** — recovery paths (retry, contact support, whitelist domain)
   are part of the message, not a separate hunt.

## Verification results (2026-10-22)

| Surface | Errors | Assoc. | Summary a11y | Success focus | Status |
|---|---|---|---|---|---|
| `LoginPage` | top banner (form-level) | ✔ `aria-describedby="login-form-error"` (added) | ✔ `role="alert"` + `tabIndex={-1}` (added) | n/a (redirect) | **fixed** |
| `SignUpPage` | top banner | ✔ `signup-form-error` (added) | ✔ added | n/a (redirect) | **fixed** |
| `ForgotPasswordPage` | top banner | ✔ `forgot-form-error` (added) | ✔ added | success copy rendered inline below form (no replacement) | **fixed** |
| `ContactPage` | was blocking `alert()` → now inline `role="alert"` banner + `aria-describedby` (added) | ✔ | ✔ | success panel now `role="status"` + `tabIndex={-1}` + focus moved on submit (added) | **fixed** |
| `CookiePreferenceCenter` | existing `role="alert"` box (line 176) | n/a (preference toggles, no field errors) | ✔ pre-existing | save button swaps to “Preferences Saved!” in place — focus preserved | **pass** |
| `TrialActivationModal` | existing `role="alert"` | n/a | ✔ pre-existing | modal focus trap handles return | **pass** |
| `SecurityDisclosureSection` safe-harbor checkbox | native `required` + inline constraint UI | ✔ `id="safe-harbor"` + label | native validation summary | n/a | **pass** |
| `BlogEditorPage` | autosave status text (non-blocking) | n/a | n/a | n/a | **pass** (no error surface today; apply standard if validation is added) |
| Terminal/search inputs (`TerminalInput`, `EngineInput`, `NavbarSearch`, `CLISimulator`, cmd-K) | inline empty-state hints | ✔ `aria-describedby` where descriptions exist (e.g. `TerminalInput`) | n/a (not submit forms with server errors) | n/a | **pass** |

**Settings / Billing:** the recommendation named “login/settings/billing”; the app has no
dedicated settings or billing pages today (user dashboard tabs carry no forms). If they
are introduced, they inherit this standard.

## Changes made in this pass

- `LoginPage.tsx`, `SignUpPage.tsx`, `ForgotPasswordPage.tsx`: error banners gained
  `id`, `role="alert"`, `tabIndex={-1}`; forms reference them via conditional
  `aria-describedby`.
- `ContactPage.tsx`: replaced the blocking `alert()` failure path with an inline
  `role="alert"` banner (`contact-form-error`) wired with `aria-describedby`; the
  success panel became a focusable `role="status"` region and receives focus when the
  form is replaced (previously focus was lost to `<body>`).
- Related (R2): password-visibility toggles enlarged to 44px hits; the “Keep session
  active” checkbox and all bare checkboxes now meet the 24px minimum target via a new
  base-layer rule in `src/index.css`.
