# Design System: MediGo

## 1. Visual Principles
- **Clarity & Urgency**: High-contrast elements for critical actions (Emergency red) paired with a calming, trustworthy primary blue.
- **Modern Layering**: Extensive use of glassmorphism (frosted glass) and blue-tinted shadows to create depth and hierarchy.
- **Soft Precision**: Large border radii (20px) for comfort, balanced by clean Inter typography for technical accuracy.

## 2. Color Palette

### Brand Colors
- **Primary (Vivid Blue)**: `#0066FF` — Primary CTAs, active states, highlights.
- **Primary Dark (Deep Blue)**: `#0047B3` — Headers, nav bars, primary text elements.
- **Primary Light (Soft Blue)**: `#E8F0FF` — Backgrounds, input fills, subtle highlights.
- **Accent (Cyan Blue)**: `#00C2FF` — Map radius, gradients, glow effects.

### Semantic Colors
- **Emergency (Red)**: `#FF3B30` — Emergency call button, alert badges.
- **Success (Green)**: `#2DC653` — Available status, verified badges.
- **Warning (Orange)**: `#FF9500` — Pending status, limited availability.

### Neutrals
- **Background (Cool Off-white)**: `#F0F4FF` — Subtle blue tint for the main workspace.
- **Surface (White)**: `#FFFFFF` — Card backgrounds and floating elements.
- **Text Primary**: `#0A0F2C` — Deep navy-black for maximum readability.
- **Text Secondary**: `#6B7280` — Mid-grey for subtext and captions.

## 3. Typography (Inter)
- **H1 (Headings)**: 26px | Bold | `#0A0F2C`
- **H2 (Subheadings)**: 18px | SemiBold | `#0A0F2C`
- **Body**: 14px | Regular | `#0A0F2C`
- **Labels**: 12px | Medium | `#6B7280`
- **Caption**: 11px | Regular | `#6B7280`

## 4. Layout & Spacing
- **Grid**: 8pt spacing system.
- **Screen Padding**: 20px horizontal padding on all mobile frames.
- **Border Radius**: 
  - Cards & Bottom Sheets: 20px
  - Inputs: 14px
  - Buttons: 50px (Pill shape)
- **Shadows**: `0px 8px 24px rgba(0, 102, 255, 0.12)` (Distinct blue-tinted shadow).

## 5. Components & FX
- **Glassmorphism**: 
  - `background: rgba(255, 255, 255, 0.7)`
  - `backdrop-filter: blur(12px)`
  - Used for floating bars and top notification overlays.
- **Inputs**: 
  - Background: `#F0F4FF`
  - Focus: 1.5px border `#0066FF` + soft blue glow.
- **Buttons**:
  - Primary: Solid `#0066FF` with white text.
  - Ghost: Transparent with `#0066FF` border and text.
  - Emergency: Solid `#FF3B30` with pulse animation.

## 6. Motion & Interaction
- **Springs**: 0.4s ease-out for bottom sheets.
- **Press State**: Scale down to 96% with subtle haptic feedback.
- **Pulsing**: Continuous soft glow for active alert buttons.
