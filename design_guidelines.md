# Design Guidelines for Paste-Life

## Design Approach: Reference-Based (Developer Tools)

**Primary References:** GitHub Gist, Vercel, Linear, VS Code
**Rationale:** Developer-focused product requiring code readability, minimal interface, and professional aesthetics

**Core Principles:**
- Code-first interface with maximum readability
- Clean, distraction-free layouts
- High information density without clutter
- Professional developer tool aesthetic

---

## Typography System

**Display & Headings:**
- Font: Inter or DM Sans (Google Fonts CDN)
- H1: text-3xl md:text-4xl, font-semibold
- H2: text-2xl, font-medium
- H3: text-xl, font-medium

**Body Text:**
- Base: text-base, font-normal
- Small: text-sm
- Metadata/Labels: text-xs, uppercase tracking-wide

**Code Display:**
- Font: JetBrains Mono or Fira Code (Google Fonts CDN)
- Paste Content: text-sm md:text-base
- Inline Code: text-sm, rounded px-1.5 py-0.5

---

## Layout & Spacing System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 md:p-6
- Section spacing: space-y-6 md:space-y-8
- Form fields: space-y-4
- Card padding: p-6 md:p-8

**Container Strategy:**
- Max-width: max-w-5xl for paste view/create
- Full-width: Code blocks stretch to container edges
- Centered: mx-auto for main content

**Responsive Grid:**
- Mobile: Single column, stack all elements
- Desktop: Two-column for create form (settings sidebar + main editor)

---

## Component Library

### Navigation Header
- Sticky header: sticky top-0 z-50, backdrop-blur-sm
- Logo + "New Paste" button prominently placed
- Height: h-14 md:h-16
- Layout: flex justify-between items-center, px-4 md:px-6

### Create Paste Form
**Layout:** Two-column on desktop (2/3 editor, 1/3 settings)
- **Editor Section:**
  - Title input: Full-width, text-lg, border-b only
  - Content textarea: min-h-96, monospace font, line numbers optional
  - Language selector: Dropdown above editor, compact design
  
- **Settings Sidebar (Desktop) / Bottom Panel (Mobile):**
  - Expiration: Radio buttons or select dropdown
  - Privacy: Radio buttons with clear icons
  - Submit button: Full-width, prominent, h-12
  - Secondary actions below (Cancel/Clear)

### View Paste Page
**Layout:** Single-column, full-width code display

**Metadata Header:**
- Title: text-2xl, font-semibold, mb-2
- Info row: Flex layout with created date, expiration, language tag, view count
- Action buttons: Copy, Raw, Edit (if has token), Delete - flex gap-2

**Code Display:**
- Full-width container with subtle border
- Line numbers in gutter (optional but recommended)
- Padding: p-4 md:p-6
- Horizontal scroll for long lines
- Syntax highlighting via Prism.js or Highlight.js

**Action Bar (Below Code):**
- Copy button, Raw link, Embed code snippet
- Layout: flex flex-wrap gap-3

### Form Elements
**Inputs:**
- Height: h-10 md:h-12
- Padding: px-4
- Border: 1px, rounded-md
- Focus: ring-2 offset

**Buttons:**
- Primary: h-10 md:h-12, px-6, rounded-md, font-medium
- Secondary: Same sizing, stroke style
- Icon buttons: h-10 w-10, rounded-md

**Select/Dropdown:**
- Match input styling
- Chevron icon right-aligned

### Cards & Containers
**Paste Cards (Recent/Public List):**
- Padding: p-4 md:p-6
- Border: 1px rounded-lg
- Hover: Subtle lift/shadow effect
- Layout: Title, truncated content preview, metadata row

**Modal/Dialog:**
- Max-width: max-w-md
- Padding: p-6
- Backdrop: blur-sm

---

## Page Layouts

### Homepage/Create Page
- Centered container, max-w-6xl
- Hero section: Minimal - just logo + tagline (text-xl), mb-8
- Immediate access to paste creation form
- No large hero image - focus on functionality

### View Paste Page
- Minimal header with back/home link
- Metadata section: compact, mb-4
- Full-width code container
- Footer with action buttons

### Public/Recent Pastes List (Optional)
- Grid: grid-cols-1 md:grid-cols-2 gap-4
- Each card shows preview + metadata
- Infinite scroll or pagination

---

## Special Considerations

**Syntax Highlighting:**
- Use Prism.js with Tomorrow Night theme for consistency
- Support 20+ common languages (JavaScript, Python, HTML, CSS, JSON, etc.)
- Language tag displayed prominently

**Expired Pastes:**
- Centered message container
- Icon + friendly message
- Suggestion to create new paste

**Rate Limiting Notice:**
- Toast notification or inline banner
- Clear error messaging

**Copy Feedback:**
- Toast notification: "Copied to clipboard"
- Position: top-right, duration 2s

---

## Images

**No large hero images required** - This is a utility-focused tool where immediate functionality is paramount.

**Favicon:** Use tap/faucet icon from icon library or public CDN
- Suggested: Font Awesome `fa-faucet` or similar tap icon
- Include both favicon.ico and apple-touch-icon

**Empty States:**
- Simple icon + text for no pastes found
- Centered, max-w-sm container

**Optional Background:** Subtle grid pattern or noise texture on main container backgrounds for depth (via CSS, not images)

---

## Icon System

**Library:** Heroicons (Outline style)
- Copy: DocumentDuplicateIcon
- Delete: TrashIcon  
- Edit: PencilIcon
- Link: LinkIcon
- Clock: ClockIcon
- Eye: EyeIcon
- Lock: LockClosedIcon

---

## Interaction Patterns

**Minimal Animations:**
- Button hover: Subtle scale (scale-[1.02])
- Card hover: Translate up 1px + shadow
- Modal: Fade in only
- Toast: Slide in from top

**No distracting transitions** - prioritize instant feedback for copy/submit actions