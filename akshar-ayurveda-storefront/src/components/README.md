# 🏗️ Modular Component Architecture

This document outlines the modular component architecture for the ShopenUp Ayurveda e-commerce application.

## 📁 Component Structure

```
src/components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx        # Button component with variants
│   ├── Card.tsx          # Card container component
│   ├── Input.tsx         # Form input component
│   ├── Modal.tsx         # Modal/dialog component
│   ├── Badge.tsx         # Badge/tag component
│   └── index.ts          # UI components export
├── layout/               # Layout components
│   ├── Layout.tsx        # Main layout wrapper
│   ├── Navigation.tsx    # Navigation component
│   ├── Footer.tsx        # Footer component
│   ├── Hero.tsx          # Hero section component
│   ├── Section.tsx       # Section wrapper component
│   └── index.ts          # Layout components export
├── products/             # Product-related components
│   ├── ProductCard.tsx   # Individual product card
│   ├── ProductGrid.tsx   # Product grid layout
│   └── index.ts          # Product components export
├── forms/                # Form components
│   ├── ContactForm.tsx   # Contact form
│   ├── LoginForm.tsx     # Login form
│   └── index.ts          # Form components export
└── index.ts              # Main components export
```

## 🎨 UI Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '../components';

<Button 
  variant="primary" 
  size="lg" 
  onClick={handleClick}
  fullWidth
>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `disabled`: boolean
- `onClick`: function

### Card
A flexible card container for content display.

```tsx
import { Card } from '../components';

<Card padding="lg" shadow="md" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `padding`: 'sm' | 'md' | 'lg'
- `shadow`: 'sm' | 'md' | 'lg' | 'none'
- `hover`: boolean
- `onClick`: function

### Input
A form input component with validation support.

```tsx
import { Input } from '../components';

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={handleChange}
  error={emailError}
  required
  fullWidth
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `label`: string
- `error`: string
- `required`: boolean
- `fullWidth`: boolean
- `size`: 'sm' | 'md' | 'lg'

### Modal
A modal/dialog component for overlays.

```tsx
import { Modal } from '../components';

<Modal 
  isOpen={isModalOpen} 
  onClose={closeModal}
  title="Modal Title"
  size="lg"
>
  <p>Modal content goes here</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean

### Badge
A badge component for tags and status indicators.

```tsx
import { Badge } from '../components';

<Badge variant="success" size="md">
  Success
</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `onClick`: function

## 🏠 Layout Components

### Hero
A hero section component for page headers.

```tsx
import { Hero } from '../components';

<Hero
  title="Welcome to ShopenUp Ayurveda"
  subtitle="Discover authentic Ayurvedic products"
  backgroundGradient="bg-green-600"
  actions={[
    { label: 'Shop Now', onClick: handleShop, variant: 'primary' },
    { label: 'Learn More', onClick: handleLearn, variant: 'outline' }
  ]}
/>
```

**Props:**
- `title`: string
- `subtitle`: string
- `backgroundImage`: string
- `backgroundGradient`: string
- `textColor`: 'white' | 'dark'
- `actions`: array of action objects

### Section
A section wrapper component for consistent spacing and styling.

```tsx
import { Section } from '../components';

<Section 
  title="Our Products" 
  subtitle="Discover our collection"
  background="gray"
  padding="lg"
>
  <ProductGrid products={products} />
</Section>
```

**Props:**
- `title`: string
- `subtitle`: string
- `background`: 'white' | 'gray' | 'green' | 'transparent'
- `padding`: 'sm' | 'md' | 'lg' | 'xl'
- `container`: boolean
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'

## 🛍️ Product Components

### ProductCard
A comprehensive product card component.

```tsx
import { ProductCard } from '../components';

<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  onAddToFavorites={handleAddToFavorites}
  onProductClick={handleProductClick}
  showActions={true}
/>
```

**Product Interface:**
```tsx
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}
```

### ProductGrid
A responsive product grid component.

```tsx
import { ProductGrid } from '../components';

<ProductGrid
  products={products}
  columns={4}
  onAddToCart={handleAddToCart}
  onAddToFavorites={handleAddToFavorites}
  onProductClick={handleProductClick}
  loading={isLoading}
  emptyMessage="No products found"
/>
```

**Props:**
- `products`: Product[]
- `columns`: 1 | 2 | 3 | 4 | 5 | 6
- `showActions`: boolean
- `loading`: boolean
- `emptyMessage`: string

## 📝 Form Components

### ContactForm
A complete contact form with validation.

```tsx
import { ContactForm } from '../components';

<ContactForm
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

**Form Data Interface:**
```tsx
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
```

### LoginForm
A login form component with validation.

```tsx
import { LoginForm } from '../components';

<LoginForm
  onSubmit={handleLogin}
  loading={isLoggingIn}
  onForgotPassword={handleForgotPassword}
  onSignUp={handleSignUp}
/>
```

**Form Data Interface:**
```tsx
interface LoginFormData {
  email: string;
  password: string;
}
```

## 🎯 Usage Examples

### Creating a New Page
```tsx
import { Layout, Hero, Section, ProductGrid } from '../components';

export default function ProductsPage() {
  return (
    <Layout cartItemCount={3} favouriteCount={5} isLoggedIn={false}>
      <Hero
        title="Our Products"
        subtitle="Discover authentic Ayurvedic medicines"
        backgroundGradient="bg-green-600"
      />
      
      <Section title="Featured Products" background="gray">
        <ProductGrid products={featuredProducts} columns={4} />
      </Section>
      
      <Section title="All Products">
        <ProductGrid products={allProducts} columns={3} />
      </Section>
    </Layout>
  );
}
```

### Creating a Custom Component
```tsx
import { Card, Button, Badge } from '../components';

interface CustomCardProps {
  title: string;
  description: string;
  tags: string[];
  onAction: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({ title, description, tags, onAction }) => {
  return (
    <Card hover>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <Badge key={index} variant="info" size="sm">
            {tag}
          </Badge>
        ))}
      </div>
      
      <Button onClick={onAction} variant="primary" fullWidth>
        Take Action
      </Button>
    </Card>
  );
};
```

## 🔧 Best Practices

1. **Consistent Importing**: Always import components from the main index file
2. **TypeScript**: Use proper TypeScript interfaces for all props
3. **Responsive Design**: All components are mobile-first and responsive
4. **Accessibility**: Components include proper ARIA labels and keyboard navigation
5. **Performance**: Use React.memo for components that don't need frequent re-renders
6. **Testing**: Each component should have corresponding unit tests

## 🎨 Theming

The components use a consistent color scheme based on Tailwind CSS:

- **Primary**: Green (green-600, green-700)
- **Secondary**: Gray (gray-600, gray-700)
- **Success**: Green (green-100, green-800)
- **Warning**: Yellow (yellow-100, yellow-800)
- **Danger**: Red (red-100, red-800)
- **Info**: Blue (blue-100, blue-800)

## 📱 Responsive Design

All components are built with a mobile-first approach:

- **Mobile**: 1 column layouts
- **Tablet**: 2-3 column layouts
- **Desktop**: 4+ column layouts
- **Large Desktop**: Optimized spacing and sizing

## 🚀 Performance Optimization

- **Lazy Loading**: Images use Next.js Image component with lazy loading
- **Code Splitting**: Components are organized for optimal code splitting
- **Bundle Size**: Minimal dependencies, tree-shaking friendly
- **Caching**: Proper cache headers and static generation where possible
