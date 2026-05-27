## Plan: Dynamic Company Logo in Sidebar

### Goal
Replace the hardcoded logo in the left sidebar with the logo of the company currently being audited. If no company is selected (landing screen), hide the logo entirely.

### Current State
- `SideNav.tsx` renders a hardcoded `<img src={logoUrl}>` at the top
- `Index` route holds `brand` state that gets set when the user submits a company name on the landing screen
- `SideNav` is rendered when `revealing` is true (i.e. `brand !== null`)

### Changes Required

#### 1. `src/features/pulse/hud/SideNav.tsx`
- Add optional `brand?: string` prop
- Replace the static logo `<img>` block with conditional rendering:
  - If `brand` is provided: display the company "logo" as a favicon fetched from `https://www.google.com/s2/favicons?domain=<brand>.com&sz=128`, falling back to a styled initial-letter avatar
  - If `brand` is absent/empty: do not render any logo element at all (the `h-16` logo container is removed/conditional)

#### 2. `src/routes/index.tsx`
- Pass the `brand` value into `<SideNav brand={brand} />`

### Acceptance Criteria
- Sidebar shows a company identifier (favicon or initials) when a brand is being audited
- Sidebar logo area is completely absent when on the landing screen (no blank placeholder)
- No visual regressions in sidebar layout when logo is hidden

### Technical Notes
- Use a small inline helper to generate the favicon URL from the brand string
- Handle spaces in brand names by stripping them for the domain guess
- Keep the existing sidebar width (72px) and styling intact