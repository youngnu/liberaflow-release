# Liberaflow Code Style Guide

## CSS/Styling Guidelines

### Color Scheme
- **Primary Background**: `#ffffff` (white)
- **Primary Text**: `#1d1d1f` (dark gray)
- **Secondary Text**: `#86868b` (medium gray)
- **Tertiary Text**: `#515154` (gray)
- **Brand Blue**: `#0071e3` (primary actions)
- **Brand Blue Hover**: `#0077ed`
- **Success Green**: `#30d158`
- **Light Background**: `#f5f5f7`
- **Dark Background**: `#1d1d1f`
- **Border Color**: `#e5e5e7`, `#d2d2d7`
- **Notice Background**: `#f0f5ff`
- **Notice Border**: `#d1e4ff`

### Typography
- **Font Stack**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif`
- **Base Line Height**: `1.6`
- **Base Font Weight**: `400`
- **Letter Spacing**: `-0.02em` for large headings, `-0.01em` for smaller headings

### Font Sizes
- **Large Logo**: `4rem` (desktop), `3rem` (mobile)
- **Section Titles**: `2.25rem` (desktop), `1.875rem` (mobile)
- **Subsection Headers**: `1.5rem`
- **Feature Titles**: `1.25rem`
- **Body Text**: `1.25rem` (tagline), `1.1rem` (lang titles), `1rem` (base)
- **Small Text**: `0.9rem`

### Spacing & Layout
- **Container Max Width**: `980px`
- **Base Padding**: `60px 20px` (desktop), `40px 20px` (mobile)
- **Section Margins**: `80px 0` (desktop), `60px 0` (mobile)
- **Card Padding**: `40px` (large), `32px` (medium), `24px` (mobile)
- **Button Padding**: `16px 32px`
- **Gap Spacing**: `32px` (grid), `20px` (buttons)

### Border Radius
- **Large Cards**: `12px`
- **Small Components**: `8px`

### Transitions & Effects
- **Standard Transition**: `all 0.2s ease`
- **Hover Transform**: `translateY(-1px)` or `translateY(-2px)`
- **Box Shadow**: `0 4px 12px rgba(0, 113, 227, 0.3)` (buttons), `0 4px 16px rgba(0, 0, 0, 0.08)` (cards)

### Grid & Flexbox
- **Feature Grid**: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- **Button Layout**: `display: flex, justify-content: center, gap: 20px, flex-wrap: wrap`
- **Mobile**: Single column layouts with `flex-direction: column`

### Mobile Responsiveness
- **Breakpoint**: `@media (max-width: 768px)`
- **Mobile Adjustments**:
  - Reduced font sizes
  - Single column grids
  - Smaller padding/margins
  - Stacked button layouts

### Interactive Elements
- **Buttons**: Blue background (`#0071e3`), hover state, subtle transform
- **Links**: Blue color (`#0071e3`), no underline
- **Icons**: Unicode/emoji based, consistent sizing
- **Hover States**: Subtle transforms and shadow effects

### Content Organization
- **Sections**: Clear visual separation with background colors
- **Cards**: Light gray background (`#f5f5f7`) with subtle borders
- **Notices**: Special blue-tinted background for important information
- **Lists**: Clean, icon-prefixed list items without bullets

### Accessibility
- **Focus States**: Maintain keyboard navigation
- **Color Contrast**: Dark text on light backgrounds
- **Semantic HTML**: Proper heading hierarchy and structure
- **Responsive Design**: Mobile-first approach with desktop enhancements