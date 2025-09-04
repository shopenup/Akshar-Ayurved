# 🛒 Generic E-commerce Template - Complete Component Library

This is a comprehensive, industry-agnostic e-commerce template with reusable components that can be used for any online store.

## 🏗️ **Component Architecture**

### **📁 Directory Structure**
```
src/components/
├── ui/                    # Core UI components
│   ├── Button.tsx        # Button with variants
│   ├── Card.tsx          # Card container
│   ├── Input.tsx         # Form input
│   ├── Select.tsx        # Dropdown select
│   ├── Checkbox.tsx      # Checkbox input
│   ├── Radio.tsx         # Radio button group
│   ├── Textarea.tsx      # Multi-line text input
│   ├── Modal.tsx         # Modal/dialog
│   ├── Badge.tsx         # Status badges/tags
│   ├── Alert.tsx         # Notifications
│   ├── Spinner.tsx       # Loading spinner
│   ├── Tooltip.tsx       # Tooltip component
│   └── index.ts          # UI exports
├── layout/               # Layout components
│   ├── Layout.tsx        # Main layout wrapper
│   ├── Navigation.tsx    # Navigation bar
│   ├── Footer.tsx        # Footer
│   ├── Hero.tsx          # Hero sections
│   ├── Section.tsx       # Section wrapper
│   └── index.ts          # Layout exports
├── products/             # Product components
│   ├── ProductCard.tsx   # Product display card
│   ├── ProductGrid.tsx   # Product grid layout
│   └── index.ts          # Product exports
├── ecommerce/            # E-commerce specific
│   ├── CartItem.tsx      # Shopping cart item
│   ├── CartSummary.tsx   # Order summary
│   ├── ProductFilter.tsx # Product filtering
│   ├── ProductSearch.tsx # Search functionality
│   ├── ReviewCard.tsx    # Product reviews
│   └── index.ts          # E-commerce exports
├── forms/                # Form components
│   ├── ContactForm.tsx   # Contact form
│   ├── LoginForm.tsx     # Login form
│   ├── RegistrationForm.tsx # Registration form
│   └── index.ts          # Form exports
└── index.ts              # Main exports
```

## 🎨 **UI Components**

### **Button**
Versatile button with multiple variants and sizes.

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

**Variants:** `primary`, `secondary`, `outline`, `ghost`
**Sizes:** `sm`, `md`, `lg`

### **Input**
Form input with validation and error handling.

```tsx
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

**Types:** `text`, `email`, `password`, `number`, `tel`, `url`
**Sizes:** `sm`, `md`, `lg`

### **Select**
Dropdown select component.

```tsx
<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={handleChange}
  placeholder="Select an option"
  fullWidth
/>
```

### **Checkbox & Radio**
Form controls for selections.

```tsx
<Checkbox
  checked={isChecked}
  onChange={handleChange}
  label="Accept terms and conditions"
/>

<Radio
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={handleChange}
  name="radio-group"
/>
```

### **Modal**
Modal dialog component.

```tsx
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title="Modal Title"
  size="lg"
>
  <p>Modal content goes here</p>
</Modal>
```

**Sizes:** `sm`, `md`, `lg`, `xl`

### **Alert**
Notification component.

```tsx
<Alert
  type="success"
  title="Success!"
  message="Your action was completed successfully."
  onClose={closeAlert}
/>
```

**Types:** `success`, `error`, `warning`, `info`

### **Spinner**
Loading spinner component.

```tsx
<Spinner size="lg" color="primary" />
```

**Sizes:** `sm`, `md`, `lg`, `xl`
**Colors:** `primary`, `white`, `gray`

### **Tooltip**
Tooltip component with positioning.

```tsx
<Tooltip content="This is a helpful tip" position="top">
  <span>Hover me</span>
</Tooltip>
```

**Positions:** `top`, `bottom`, `left`, `right`

## 🏠 **Layout Components**

### **Hero**
Hero section for page headers.

```tsx
<Hero
  title="Welcome to Our Store"
  subtitle="Discover amazing products"
  backgroundGradient="bg-blue-600"
  actions={[
    { label: 'Shop Now', onClick: handleShop, variant: 'primary' },
    { label: 'Learn More', onClick: handleLearn, variant: 'outline' }
  ]}
/>
```

### **Section**
Section wrapper for consistent spacing.

```tsx
<Section 
  title="Featured Products" 
  subtitle="Handpicked for you"
  background="gray"
  padding="lg"
>
  <ProductGrid products={products} />
</Section>
```

**Backgrounds:** `white`, `gray`, `green`, `transparent`
**Padding:** `sm`, `md`, `lg`, `xl`

## 🛍️ **E-commerce Components**

### **ProductCard**
Comprehensive product display card.

```tsx
<ProductCard
  product={{
    id: '1',
    name: 'Product Name',
    description: 'Product description',
    price: 99.99,
    originalPrice: 129.99,
    image: '/product-image.jpg',
    category: 'Electronics',
    tags: ['New', 'Popular'],
    rating: 4.5,
    reviewCount: 128,
    inStock: true
  }}
  onAddToCart={handleAddToCart}
  onAddToFavorites={handleAddToFavorites}
  onProductClick={handleProductClick}
/>
```

### **ProductGrid**
Responsive product grid layout.

```tsx
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

**Columns:** 1-6 (responsive)

### **CartItem**
Shopping cart item component.

```tsx
<CartItem
  item={{
    id: '1',
    name: 'Product Name',
    price: 99.99,
    originalPrice: 129.99,
    image: '/product-image.jpg',
    quantity: 2,
    maxQuantity: 10,
    inStock: true
  }}
  onUpdateQuantity={handleUpdateQuantity}
  onRemove={handleRemove}
  onMoveToWishlist={handleMoveToWishlist}
/>
```

### **CartSummary**
Order summary component.

```tsx
<CartSummary
  subtotal={299.97}
  shipping={9.99}
  tax={30.00}
  discount={50.00}
  total={289.96}
  itemCount={3}
  onCheckout={handleCheckout}
  onContinueShopping={handleContinueShopping}
  loading={isProcessing}
/>
```

### **ProductFilter**
Advanced product filtering.

```tsx
<ProductFilter
  categories={categories}
  brands={brands}
  priceRanges={[
    { min: 0, max: 50 },
    { min: 50, max: 100 },
    { min: 100, max: 200 }
  ]}
  ratings={ratings}
  selectedCategories={selectedCategories}
  selectedBrands={selectedBrands}
  selectedPriceRange={selectedPriceRange}
  selectedRating={selectedRating}
  onCategoryChange={handleCategoryChange}
  onBrandChange={handleBrandChange}
  onPriceRangeChange={handlePriceRangeChange}
  onRatingChange={handleRatingChange}
  onClearAll={handleClearAll}
/>
```

### **ProductSearch**
Search functionality with filters.

```tsx
<ProductSearch
  onSearch={handleSearch}
  categories={categories}
  sortOptions={sortOptions}
  placeholder="Search products..."
  showFilters={true}
  loading={isSearching}
/>
```

### **ReviewCard**
Product review display.

```tsx
<ReviewCard
  review={{
    id: '1',
    author: 'John Doe',
    rating: 5,
    title: 'Great Product!',
    comment: 'This product exceeded my expectations...',
    date: '2024-01-15',
    verified: true,
    helpful: 12,
    images: ['/review1.jpg', '/review2.jpg']
  }}
  onHelpful={handleHelpful}
  onReport={handleReport}
/>
```

## 📝 **Form Components**

### **ContactForm**
Complete contact form with validation.

```tsx
<ContactForm
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

### **LoginForm**
User login form.

```tsx
<LoginForm
  onSubmit={handleLogin}
  loading={isLoggingIn}
  onForgotPassword={handleForgotPassword}
  onSignUp={handleSignUp}
/>
```

### **RegistrationForm**
User registration form.

```tsx
<RegistrationForm
  onSubmit={handleRegistration}
  loading={isRegistering}
  onLogin={handleLogin}
/>
```

## 🎯 **Usage Examples**

### **Creating a Product Listing Page**
```tsx
import { Layout, Hero, Section, ProductGrid, ProductSearch, ProductFilter } from '../components';

export default function ProductsPage() {
  return (
    <Layout cartItemCount={3} favouriteCount={5} isLoggedIn={false}>
      <Hero
        title="Our Products"
        subtitle="Discover amazing products for every need"
        backgroundGradient="bg-blue-600"
      />
      
      <Section>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <ProductFilter
              categories={categories}
              brands={brands}
              priceRanges={priceRanges}
              ratings={ratings}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              onClearAll={handleClearAll}
            />
          </div>
          
          {/* Products */}
          <div className="lg:col-span-3">
            <ProductSearch
              onSearch={handleSearch}
              categories={categories}
              className="mb-6"
            />
            
            <ProductGrid
              products={filteredProducts}
              columns={3}
              onAddToCart={handleAddToCart}
              onAddToFavorites={handleAddToFavorites}
              onProductClick={handleProductClick}
              loading={isLoading}
            />
          </div>
        </div>
      </Section>
    </Layout>
  );
}
```

### **Creating a Shopping Cart Page**
```tsx
import { Layout, Section, CartItem, CartSummary } from '../components';

export default function CartPage() {
  return (
    <Layout cartItemCount={cartItems.length} favouriteCount={5} isLoggedIn={true}>
      <Section title="Shopping Cart" subtitle="Review your items">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onMoveToWishlist={handleMoveToWishlist}
                />
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              total={total}
              itemCount={cartItems.length}
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
            />
          </div>
        </div>
      </Section>
    </Layout>
  );
}
```

### **Creating a Product Detail Page**
```tsx
import { Layout, Section, ProductCard, ReviewCard, Alert } from '../components';

export default function ProductDetailPage() {
  return (
    <Layout cartItemCount={3} favouriteCount={5} isLoggedIn={false}>
      <Section>
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <img src={product.images[0]} alt={product.name} className="w-full rounded-lg" />
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="space-y-4">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                Add to Cart
              </button>
              <button className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
        
        {/* Reviews */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
                onReport={handleReport}
              />
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
```

## 🎨 **Theming & Customization**

### **Color Scheme**
The template uses a flexible color system that can be easily customized:

```css
/* Primary colors */
--primary-50: #f0fdf4;
--primary-500: #22c55e;
--primary-600: #16a34a;
--primary-700: #15803d;

/* Secondary colors */
--secondary-50: #f8fafc;
--secondary-500: #64748b;
--secondary-600: #475569;
--secondary-700: #334155;
```

### **Customizing Colors**
To customize for your brand, update the Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Add your brand colors
      }
    }
  }
}
```

## 📱 **Responsive Design**

All components are built with a mobile-first approach:

- **Mobile (< 640px):** Single column layouts, stacked elements
- **Tablet (640px - 1024px):** 2-3 column layouts
- **Desktop (> 1024px):** 4+ column layouts, sidebars
- **Large Desktop (> 1280px):** Optimized spacing and sizing

## 🚀 **Performance Features**

- **Lazy Loading:** Images use Next.js Image component
- **Code Splitting:** Components organized for optimal splitting
- **Bundle Optimization:** Minimal dependencies, tree-shaking friendly
- **Caching:** Proper cache headers and static generation
- **Accessibility:** WCAG compliant components

## 🔧 **Best Practices**

1. **Consistent Importing:** Always import from main index files
2. **TypeScript:** Full type safety with proper interfaces
3. **Responsive Design:** Mobile-first approach
4. **Accessibility:** ARIA labels and keyboard navigation
5. **Performance:** Optimized rendering and loading
6. **Testing:** Unit tests for all components

## 📦 **Industry Agnostic**

This template is designed to work for any e-commerce industry:

- **Fashion & Apparel**
- **Electronics & Gadgets**
- **Home & Garden**
- **Health & Beauty**
- **Food & Beverages**
- **Books & Media**
- **Sports & Outdoor**
- **Automotive**
- **Jewelry & Accessories**
- **Toys & Games**

Simply customize the colors, content, and product categories to match your specific industry needs.

## 🎯 **Getting Started**

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Customize Theme:**
   Update `tailwind.config.js` with your brand colors

3. **Add Your Content:**
   Replace placeholder content with your actual products and information

4. **Deploy:**
   ```bash
   npm run build
   npm start
   ```

This template provides everything you need to build a professional e-commerce website for any industry!
