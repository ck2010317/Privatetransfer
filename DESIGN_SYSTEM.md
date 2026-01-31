# PrivatePay UI Design System & Specifications

A complete design guide for recreating the PrivatePay interface on another website.

---

## Overview
PrivatePay is a modern, dark-themed cryptocurrency interface featuring a gradient header, glassmorphism cards, and a responsive two-column layout. The design emphasizes privacy through visual depth, smooth animations, and a premium aesthetic.

---

## Color Palette

### Primary Colors
| Name | Value | Usage |
|------|-------|-------|
| **Background (Black)** | `#000000` | Page background, main surface |
| **Card Dark** | `rgb(20, 20, 30)` | Card backgrounds |
| **Card Light** | `rgb(30, 30, 45)` | Hover card backgrounds |

### Accent Colors
| Name | RGB / Hex | Usage |
|------|-----------|-------|
| **Primary Purple** | `#7B61FF` | Buttons, accents, focus states |
| **Blue** | `#3B82F6` | Header gradient, "Select Wallet" button |
| **Secondary Blue** | `#60A5FA` | Text gradients, hover states |
| **Purple (Light)** | `#A78BFA` | Gradient highlights |

### Text Colors
| Name | Value | Usage |
|------|-------|-------|
| **Text White** | `#FFFFFF` | Primary text, high contrast |
| **Text Gray Light** | `#E2E8F0` | Secondary text |
| **Text Gray Medium** | `#94A3B8` | Tertiary text, placeholders |
| **Text Gray Dark** | `#64748B` | Muted text, descriptions |

### Border & Input Colors
| Name | Value | Usage |
|------|-------|-------|
| **Border Dark** | `#232136` | Card borders, subtle dividers |
| **Border Medium** | `#2D2639` | Input borders |
| **Input Background** | `rgba(39, 39, 54, 0.3)` | Input field backgrounds |
| **Success Green** | `#10B981` | Validation, success states |

### Gradient Overlays
| Name | Definition | Usage |
|------|-----------|-------|
| **Header Gradient** | `linear-gradient(90deg, #3B82F6 0%, #A78BFA 100%)` | "PrivatePay" text |
| **Button Gradient** | `linear-gradient(90deg, #7B61FF33 0%, #232136 100%)` | Wallet hover states |

---

## Typography

### Font Family
- **Primary Font**: `system-ui, -apple-system, sans-serif` (System fonts for performance)
- **Fallback**: Geist, Geist_Mono (Google Fonts)

### Font Sizes & Weights
| Element | Size | Weight | Letter Spacing |
|---------|------|--------|-----------------|
| **Page Title ("PrivatePay")** | 30px | 700 (Bold) | Normal |
| **Subtitle** | 14px | 400 | Normal |
| **Card Title** | 18-20px | 600 | Normal |
| **Card Description** | 14px | 400 | Normal |
| **Button Text** | 14px | 500 | Normal |
| **Input Label** | 14px | 500 | Normal |
| **Body Text** | 14px | 400 | Normal |

---

## Layout & Spacing

### Page Structure
```
┌─────────────────────────────────────────────────┐
│ HEADER (60px padding)                           │
│ PrivatePay | "Private SOL Transfers" | Button  │
├─────────────────────────────────────────────────┤
│  MAIN CONTENT (max-width: 1280px, gap: 32px)   │
│  ┌─────────────────────┬──────────────────────┐ │
│  │ Transfer Form       │ Wallet Info Panel    │ │
│  │ (2/3 width)         │ (1/3 width)          │ │
│  │                     │                      │ │
│  └─────────────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────┤
│ FOOTER (32px padding)                           │
└─────────────────────────────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| **Mobile** | < 1024px | Single column (form full width, wallet info below) |
| **Tablet** | 1024px - 1280px | Two columns, adaptive |
| **Desktop** | > 1280px | Two columns (2:1 ratio) |

### Spacing Scale
| Unit | Value | Usage |
|------|-------|-------|
| **xs** | 4px | Micro spacing |
| **sm** | 8px | Tight spacing |
| **md** | 12px | Normal spacing |
| **lg** | 16px | Comfortable spacing |
| **xl** | 24px | Section spacing |
| **2xl** | 32px | Major section gaps |

---

## Component Specifications

### 1. Header
```
Height: 60px
Background: bg-slate-900/50 (rgba with 50% opacity)
Backdrop Filter: blur(8px)
Border Bottom: 1px solid #234567 (slate-700/50)
Padding: 24px (1.5rem)

Layout:
- Left: Title + Subtitle (flex column)
- Right: "Select Wallet" Button
```

**Title Structure:**
- Text: "PrivatePay"
- Gradient: `linear-gradient(90deg, #3B82F6 0%, #A78BFA 100%)`
- Font Size: 30px
- Font Weight: 700

**Subtitle:**
- Text: "Private SOL Transfers on Solana"
- Color: `#94A3B8` (slate-400)
- Font Size: 14px
- Margin Top: 4px

### 2. Select Wallet Button
```
Background: #1e40af (blue-600)
Hover Background: #1d3a8a (blue-700)
Text Color: #FFFFFF
Font Size: 14px
Font Weight: 500
Padding: 10px 24px
Border Radius: 6px
Transition: background 0.15s ease-in-out
```

### 3. Main Card (Transfer Form)
```
Background: rgba(30, 30, 45, 0.8)
Border: 1px solid #2D2639
Border Radius: 16px
Padding: 32px
Box Shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 1.5px 8px rgba(123, 97, 255, 0.13)
Backdrop Filter: blur(12px)

Layout: Flex column with 24px gap
```

### 4. Input Fields
```
Background: rgba(39, 39, 54, 0.3)
Border: 1px solid #2D2639
Border Radius: 8px
Padding: 12px 16px
Font Size: 14px
Color: #FFFFFF
Placeholder Color: #64748B (text-slate-500)

Transitions:
- Border: 150ms
- Box Shadow: 150ms

Focus State:
- Border: 1px solid #7B61FF (primary)
- Box Shadow: 0 0 0 3px rgba(123, 97, 255, 0.1)
```

### 5. Primary Button (Initialize Encryption / Deposit & Withdraw)
```
Background: #7B61FF (purple-600)
Hover Background: #6D55E5
Text Color: #FFFFFF
Font Size: 14px
Font Weight: 600
Padding: 12px 24px
Border Radius: 8px
Transition: all 0.15s ease-in-out
Cursor: pointer

Disabled State:
- Opacity: 0.5
- Cursor: not-allowed
- Background: unchanged
```

### 6. Secondary Button (Disabled State)
```
Background: #4B4565 (gray-700)
Text Color: #9CA3AF (gray-400)
Opacity: 0.6
Font Size: 14px
Padding: 12px 24px
Border Radius: 8px
Cursor: not-allowed
```

### 7. Card Labels
```
Font Size: 14px
Font Weight: 600
Color: #FFFFFF
Margin Bottom: 8px
Text Transform: None (sentence case)
```

### 8. Card Description Text (Italic Gray)
```
Background: rgba(39, 39, 54, 0.4)
Border Radius: 8px
Padding: 12px 16px
Font Size: 13px
Color: #CBD5E1 (slate-300)
Font Style: Italic
Border Left: 2px solid #7B61FF
Margin Bottom: 16px
```

### 9. Instructions List
```
Font Size: 14px
Color: #E2E8F0 (slate-200)
Line Height: 1.6
Margin Top: 16px

List Items:
- Numbered (1, 2, 3, 4)
- Spacing: 8px between items
```

### 10. Wallet Info Panel (Right Sidebar)
```
Background: rgba(30, 30, 45, 0.9)
Border: 1px solid #1F2937
Border Radius: 16px
Padding: 24px
Box Shadow: 0 8px 32px rgba(0, 0, 0, 0.3)

Layout: Flex column with 16px gap
```

**Wallet Icon (Disconnected State):**
- Icon: Wallet icon (lucide-react)
- Size: 32px
- Color: #A855F7 (purple-500)
- Filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))

**Wallet Title (Disconnected):**
- Text: "Wallet"
- Font Size: 18px
- Font Weight: 700
- Color: #F1F5F9 (slate-100)
- Tracking: wide

**Wallet Subtitle (Disconnected):**
- Text: "Connect your wallet to begin"
- Font Size: 16px
- Color: #CBD5E1 (slate-300)
- Text Align: Center

### 11. Badge (Status)
```
Background: #065F46 (green-700)
Text Color: #DCFCE7 (green-100)
Font Size: 12px
Padding: 4px 12px
Border Radius: 16px
Font Weight: 500
Display: Inline-block
```

---

## Effects & Animations

### Glassmorphism
```css
/* Applied to cards and modals */
backdrop-filter: blur(12px);
background: rgba(30, 30, 45, 0.8);
border: 1px solid rgba(45, 38, 57, 1);
```

### Hover Effects
```css
/* Wallet dropdown items */
background: linear-gradient(90deg, rgba(123, 97, 255, 0.2) 0%, rgba(35, 33, 54, 1) 100%);
color: #7B61FF;
transition: all 0.15s ease-in-out;

/* Button hover */
background: #6D55E5;
transition: background 0.15s ease-in-out;
```

### Shadows
| Type | Value |
|------|-------|
| **Card Shadow** | `0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 8px 0 rgba(123, 97, 255, 0.13)` |
| **Button Shadow** | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| **Dropdown Shadow** | `0 8px 32px 0 rgba(0,0,0,0.25)` |

### Border Radius
| Element | Radius |
|---------|--------|
| **Page Cards** | 16px (1.25rem) |
| **Input Fields** | 8px (0.5rem) |
| **Buttons** | 8px (0.5rem) |
| **Dropdown Menu** | 20px (1.25rem) |

### Transitions
- **Default Duration**: 150ms
- **Easing**: ease-in-out
- **Properties**: background, color, border, box-shadow

---

## Footer

```
Height: Auto
Background: bg-slate-900/50
Border Top: 1px solid #234567 (slate-700/50)
Padding: 32px (2rem)
Text Color: #64748B (slate-400)
Font Size: 14px
Text Align: Center

Link Styling:
- Color: #60A5FA (blue-400)
- Hover: #93C5FD (blue-300)
- Underline: None (hover adds underline via `hover:text-blue-300`)
```

---

## Icon Library

All icons sourced from **lucide-react** with the following properties:

| Icon | Size | Color | Usage |
|------|------|-------|-------|
| **Lock** | 20px | #7B61FF | Encryption locked state |
| **Unlock** | 20px | #10B981 | Encryption unlocked state |
| **Wallet** | 32px | #A855F7 | Wallet panel when disconnected |
| **CheckCircle2** | 20px | #10B981 | Success states |
| **AlertCircle** | 20px | #F87171 | Error/warning states |

---

## Form Input Validation States

### Default State
- Border: `#2D2639`
- Background: `rgba(39, 39, 54, 0.3)`
- Color: `#FFFFFF`

### Focus State
- Border: `#7B61FF`
- Background: `rgba(39, 39, 54, 0.3)`
- Box Shadow: `0 0 0 3px rgba(123, 97, 255, 0.1)`

### Error State
- Border: `#EF4444` (red-500)
- Background: `rgba(39, 39, 54, 0.3)`
- Box Shadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`

### Disabled State
- Border: `#2D2639`
- Background: `rgba(39, 39, 54, 0.2)`
- Color: `#64748B`
- Cursor: `not-allowed`
- Opacity: `0.5`

---

## Wallet Dropdown Menu

```
Background: rgba(20, 20, 30, 0.85)
Backdrop Filter: blur(16px)
Border: 1.5px solid #232136
Border Radius: 20px
Padding: 12px 0
Box Shadow: 0 8px 32px rgba(0,0,0,0.25), 0 1.5px 8px rgba(123, 97, 255, 0.13)

List Items:
- Padding: 12px 24px
- Border Radius: 12px
- Margin: 4px 0
- Color: #FFFFFF
- Transition: all 0.15s

Hover Item:
- Background: linear-gradient(90deg, rgba(123, 97, 255, 0.2) 0%, rgba(35, 33, 54, 1) 100%)
- Color: #7B61FF
```

---

## Responsive Design Rules

### Desktop (> 1024px)
- Grid Layout: 3 columns (2fr + 1fr gap-8)
- Max Width: 1280px
- Padding: 16px (1rem)
- Card Gap: 24px

### Tablet (768px - 1024px)
- Grid Layout: 2 columns (equal width, gap-6)
- Max Width: 100%
- Padding: 16px
- Adjusted Card Gap: 20px

### Mobile (< 768px)
- Grid Layout: 1 column (full width)
- Max Width: 100%
- Padding: 12px
- Card Padding: 20px (reduced from 32px)
- Font Sizes: Reduced by 1-2px for readability
- Button Height: 44px (minimum touch target)

---

## Implementation Checklist for New Website

- [ ] Set up Tailwind CSS with custom colors
- [ ] Configure color variables in globals.css or CSS custom properties
- [ ] Install lucide-react for icons
- [ ] Create Card, Button, Input, Badge components
- [ ] Implement glassmorphism backdrop blur on cards
- [ ] Set up responsive grid layout (1 column mobile, 2 columns desktop)
- [ ] Add gradient text to header title
- [ ] Configure transitions and hover states
- [ ] Set up proper z-index for dropdown menus and modals
- [ ] Test dark mode and contrast ratios (WCAG AA minimum)
- [ ] Implement smooth animations for state changes
- [ ] Optimize images and icons for performance
- [ ] Test on multiple devices (mobile, tablet, desktop)

---

## CSS Variables Template

```css
:root {
  /* Colors */
  --color-bg-dark: #000000;
  --color-card: rgb(30, 30, 45);
  --color-primary: #7B61FF;
  --color-primary-light: #A78BFA;
  --color-blue: #3B82F6;
  --color-blue-light: #60A5FA;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #E2E8F0;
  --color-text-tertiary: #94A3B8;
  --color-text-muted: #64748B;
  --color-border: #232136;
  --color-border-medium: #2D2639;
  --color-success: #10B981;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Shadows */
  --shadow-card: 0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 8px 0 rgba(123, 97, 255, 0.13);
  --shadow-button: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  
  /* Transitions */
  --duration-default: 150ms;
  --ease-default: ease-in-out;
}
```

---

## File Structure Reference

Key files from PrivatePay codebase:
- `app/page.tsx` - Main page layout and header/footer
- `components/PrivateTransferForm.tsx` - Form component structure
- `components/WalletInfo.tsx` - Right sidebar wallet info panel
- `components/ui/button.tsx` - Button component variants
- `components/ui/card.tsx` - Card component structure
- `components/ui/input.tsx` - Input field styling
- `app/globals.css` - Global styles and color configuration
- `tailwind.config.ts` - Tailwind configuration (if using Tailwind)

---

## Additional Notes

1. **Performance**: Use Tailwind CSS for utility-first styling and minimal CSS output
2. **Accessibility**: Ensure proper contrast ratios (WCAG AA 4.5:1 for text)
3. **Dark Mode**: Design is dark-mode first, no light mode alternative needed
4. **State Management**: Use React hooks for form state and wallet connection
5. **Wallet Integration**: Support Phantom and Solflare wallets via `@solana/wallet-adapter-react`
6. **Responsiveness**: Test on iPhone SE (375px), iPad (768px), and desktop (1920px)

---

Last Updated: January 24, 2026
