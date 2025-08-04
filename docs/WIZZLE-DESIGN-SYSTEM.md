# Wizzle Design System

## Overview
This document outlines the unified design system for Wizzle, based on the excellent patterns from the Story Generator UI. The goal is to create consistency across all pages while maintaining the playful, kid-friendly aesthetic.

## Key Principles
- **Consistency**: All pages use the same design tokens and components
- **Playful**: Bright, engaging colors and animations
- **Accessible**: Kid-friendly with clear visual hierarchy
- **Responsive**: Works great on all screen sizes
- **Performance**: Optimized for fast loading

## Design Tokens

### Colors
- **Primary**: `#f59e0b` (Amber)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Background**: Gradient from rose-50 to amber-50
- **Card Background**: White with 80% opacity + blur

### Gradients
- **Primary Gradient**: `from-amber-500 via-orange-500 to-pink-500`
- **Secondary Gradient**: `from-purple-500 via-blue-500 to-cyan-500`
- **Background Gradient**: `from-rose-50 via-orange-50 to-amber-50`

### Shadows
- **Card**: `shadow-lg hover:shadow-xl`
- **Button**: `shadow-md hover:shadow-lg`

### Border Radius
- **Cards**: `rounded-2xl`
- **Buttons**: `rounded-xl`
- **Icons**: `rounded-2xl`

## Components

### 1. WizzleCard
A reusable card component with consistent styling:
```tsx
import { WizzleCard } from '@/components/ui/WizzleCard';

<WizzleCard>
  <h3>Your Content</h3>
</WizzleCard>
```

### 2. WizzleHeader
Consistent page headers:
```tsx
import { WizzleHeader } from '@/components/ui/WizzleCard';

<WizzleHeader 
  title="Page Title" 
  subtitle="Optional subtitle"
  gradient="from-amber-600 via-orange-600 to-pink-600"
/>
```

### 3. WizzleButton
Unified button styling:
```tsx
import { WizzleButton } from '@/components/ui/WizzleCard';

<WizzleButton variant="primary" size="md">
  Click Me
</WizzleButton>
```

### 4. WizzleIcon
Consistent icon styling:
```tsx
import { WizzleIcon } from '@/components/ui/WizzleCard';

<WizzleIcon icon={Sparkles} size="md" />
```

## Page Structure Template

Every page should follow this structure:

```tsx
import { WizzleCard, WizzleHeader } from '@/components/ui/WizzleCard';

const MyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <WizzleHeader 
          title="Page Title"
          subtitle="Optional subtitle"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WizzleCard>
            <h3>Card Title</h3>
            <p>Card content</p>
          </WizzleCard>
        </div>
      </div>
    </div>
  );
};
```

## Migration Guide

### Before (Inconsistent)
```tsx
// Old DoodlePage.tsx
<Card className="p-4 shadow-md border-kid-blue/20">
  <h2 className="text-xl font-semibold text-foreground">Your Doodle</h2>
</Card>
```

### After (Consistent)
```tsx
// New DoodlePage.tsx
<WizzleCard>
  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 text-transparent bg-clip-text">
    Your Doodle
  </h3>
</WizzleCard>
```

## CSS Classes

### Utility Classes
- `.wizzle-container` - Main container with gradient background
- `.wizzle-card` - Standard card styling
- `.wizzle-button` - Primary button styling
- `.wizzle-title` - Gradient title text
- `.wizzle-grid` - Responsive grid layout

### Animation Classes
- `.wizzle-float` - Floating animation
- `.wizzle-pulse` - Pulsing animation
- `.wizzle-hover-lift` - Hover lift effect

## Examples

### Activity Card
```tsx
const ActivityCard = ({ title, description, icon: Icon, path }) => (
  <Link to={path}>
    <WizzleCard className="group">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-sm font-semibold text-amber-600">
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </WizzleCard>
  </Link>
);
```

### Loading State
```tsx
const LoadingState = () => (
  <div className="wizzle-loading">
    <div className="wizzle-spinner"></div>
  </div>
);
```

## Best Practices

1. **Always use the Wizzle components** instead of raw Tailwind classes
2. **Maintain consistent spacing** using the spacing scale
3. **Use the gradient system** for all colorful elements
4. **Add hover effects** to interactive elements
5. **Test on mobile** - all components are responsive
6. **Use motion sparingly** - subtle animations enhance UX

## File Structure
```
src/
├── components/
│   └── ui/
│       ├── WizzleCard.tsx      # Unified components
│       └── WizzleButton.tsx
├── styles/
│   └── wizzle-theme.css       # CSS variables and utilities
├── pages/
│   ├── WizzlePage.tsx        # New unified landing
│   ├── StoryPage.tsx         # Already consistent
│   └── [other pages]         # To be updated
```

## Next Steps
1. ✅ Create unified design system
2. ✅ Create WizzlePage as new landing
3. ✅ Create reusable components
4. ✅ Add CSS variables
5. 🔄 Update individual pages to use new system
6. 🔄 Test responsiveness
7. 🔄 Add dark mode support

## Color Palette Reference
- **Primary**: Amber (#f59e0b)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Pink (#ec4899)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f97316)
- **Error**: Red (#ef4444)

## Typography Scale
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section titles
- **H3**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Captions
