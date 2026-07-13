# Snip Design System
*Inspired by Lovable.dev's visual language*

## Color Palette

### Background & Surfaces
- **Background**: `#fafafa` (very light gray)
- **Surface**: `#ffffff` (white cards/inputs)
- **Surface Elevated**: `rgba(255, 255, 255, 0.95)` (semi-transparent white)

### Text
- **Primary**: `#1a1a1a` (near-black, high contrast)
- **Secondary**: `#64748b` (muted gray-blue, for subtitles)
- **Muted**: `#94a3b8` (lighter gray, for hints)

### Accent Gradient
- **Hero Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffa726 100%)`
  - Blue → Purple → Pink → Coral → Orange
  - Used behind hero section, buttons, accents

### States
- **Success**: `#10b981` (emerald green)
- **Success BG**: `#d1fae5` (light green tint)
- **Error**: `#ef4444` (red)
- **Error BG**: `#fee2e2` (light red tint)

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
```

### Type Scale
- **Hero Headline**: `3.5rem / 56px`, weight 700, letter-spacing -0.02em
- **Section Heading**: `2rem / 32px`, weight 600
- **Subheading**: `1.25rem / 20px`, weight 400, muted color
- **Body**: `1rem / 16px`, weight 400
- **Small**: `0.875rem / 14px`, weight 400

## Spacing
- **Section Padding**: `4rem` (64px vertical breathing room)
- **Card Padding**: `2.5rem` (40px internal)
- **Element Gap**: `1.5rem` (24px between related items)
- **Tight Gap**: `0.75rem` (12px for form elements)

## Borders & Radii
- **Border Radius (Cards)**: `24px` (generously rounded)
- **Border Radius (Input/Buttons)**: `9999px` (pill-shaped, full round)
- **Border**: `1px solid rgba(0, 0, 0, 0.06)` (subtle, barely visible)

## Shadows & Effects
- **Card Shadow**: `0 8px 32px rgba(0, 0, 0, 0.06)` (soft, elevated)
- **Gradient Glow**: Apply gradient as background with overlay content
- **Hover Lift**: `translateY(-2px)` + shadow increase

## Component Mapping

### Page Structure
- **Header** → Hero with gradient background
  - Bold headline (✂️ Snip) centered
  - Muted tagline below
  - Gradient fills ~40vh

### URL Form → Chat-Style Input
- Large pill-rounded white surface
- Input + button in one unified pill
- Generous padding, shadow for elevation
- Sits centered over gradient hero

### Success/Error Messages
- Pill-rounded notices below input
- Colored background tints, not solid
- Icon + text, gentle styling

### Links Table → Content Card
- White surface, rounded (24px)
- Subtle border, soft shadow
- Clean table with minimal borders
- Hover states for interactivity

### Accent Elements
- Primary button uses gradient background
- Code badges have gradient text or border
- Hits counter subtle color from gradient palette
