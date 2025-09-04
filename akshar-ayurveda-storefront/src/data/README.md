# Homepage Data Structure

This directory contains centralized JSON data for the homepage components. All data has been extracted from the individual page components and organized into a single, maintainable structure.

## File Structure

- `homepage-data.json` - Main data file containing all homepage content
- `README.md` - This documentation file

## Data Organization

The `homepage-data.json` file is organized into the following sections:

### 1. Banners (`banners`)
Hero banner carousel data with images, titles, descriptions, and call-to-action buttons.

### 2. Categories (`categories`)
Popular product categories with images, names, and product counts.

### 3. Collections (`collections`)
Product collections with images, names, and descriptions.

### 4. Products (`products`)
Organized by product type:
- `newArrivals` - Latest products
- `weightGainer` - Weight gain supplements
- `ayurvedicMedicines` - Traditional Ayurvedic medicines

### 5. Blog Posts (`blogPosts`)
Blog content with titles, excerpts, images, and metadata.

### 6. Testimonials (`testimonials`)
Customer testimonials with ratings, avatars, and content.

### 7. Certifications (`certifications`)
Company certifications and quality badges.

### 8. Feature Highlights (`featureHighlights`)
Key selling points with icon references.

### 9. Promotional Banners (`promotionalBanners`)
Special promotional content for specific products.

### 10. Product Categories (`productCategories`)
Category-specific information and descriptions.

### 11. Trust Stats (`trustStats`)
Company statistics for trust building.

### 12. Newsletter (`newsletter`)
Newsletter signup configuration.

## Image References

All images are stored as URLs pointing to external sources (currently using Unsplash for demonstration). In a production environment, these should be replaced with:

1. Local image files in the `public/images/` directory
2. CDN-hosted images
3. CMS-managed images

## Usage

To use this data in your components:

```typescript
import homepageData from '../data/homepage-data.json';
import { Category, Collection, Product } from '../types/homepage';

// Access specific data
const categories = homepageData.categories;
const newProducts = homepageData.products.newArrivals;
const testimonials = homepageData.testimonials;
```

## Type Safety

TypeScript interfaces are defined in `src/types/homepage.ts` to ensure type safety when using the data.

## Benefits

1. **Centralized Management**: All homepage data in one place
2. **Easy Updates**: Modify content without touching component code
3. **Type Safety**: TypeScript interfaces prevent errors
4. **Reusability**: Data can be used across multiple components
5. **Maintainability**: Clear separation of data and presentation logic

## Future Enhancements

- Add support for dynamic data loading from APIs
- Implement data validation schemas
- Add support for multiple languages
- Create admin interface for content management
