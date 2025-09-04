# Private Package Integration Guide

This guide explains how to integrate all 70 private eCommerce packages into your Ayurveda eCommerce boilerplate.

## 📦 Package Overview

The boilerplate uses 70 private npm packages organized into 5 categories:

### 1. Core eCommerce (20 packages)
Essential eCommerce functionality for product management, orders, payments, and customer experience.

### 2. Ayurveda-Specific (15 packages)
Specialized packages for dosha assessment, product recommendations, health consultations, and Ayurvedic features.

### 3. Healthcare Compliance (10 packages)
HIPAA compliance, prescription management, health data encryption, and medical record handling.

### 4. Analytics & Insights (10 packages)
Sales analytics, customer insights, product performance tracking, and dosha-based analytics.

### 5. Integration & APIs (15 packages)
Third-party integrations, notification systems, payment processors, and external service connections.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Access to private npm registry
- npm/yarn configured for private packages

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shopenup-healthcare
   ```

2. **Run the installation script**
   ```bash
   ./scripts/install-packages.sh
   ```

3. **Manual installation (if script fails)**
   ```bash
   # Install core eCommerce packages
   npm install @shopenup/product-catalog @shopenup/inventory-management @shopenup/order-processing

   # Install Ayurveda packages
   npm install @shopenup/dosha-assessment @shopenup/product-recommendation-engine

   # Install healthcare packages
   npm install @shopenup/hipaa-compliance @shopenup/prescription-management

   # Continue with remaining packages...
   ```

## 🔧 Package Configuration

### 1. Core eCommerce Packages

#### Product Catalog (`@shopenup/product-catalog`)
```typescript
import { ProductCatalog } from '@shopenup/product-catalog';

const catalog = new ProductCatalog({
  apiKey: process.env.PRODUCT_CATALOG_API_KEY,
  baseUrl: process.env.PRODUCT_CATALOG_URL
});

// Get Ayurvedic products
const products = await catalog.getProducts({
  category: 'herbs',
  doshaCompatibility: 'vata'
});
```

#### Inventory Management (`@shopenup/inventory-management`)
```typescript
import { InventoryManager } from '@shopenup/inventory-management';

const inventory = new InventoryManager({
  database: process.env.INVENTORY_DB_URL,
  batchTracking: true
});

// Check stock for Ayurvedic products
const stockStatus = await inventory.checkStock('ashwagandha-500mg');
```

#### Order Processing (`@shopenup/order-processing`)
```typescript
import { OrderProcessor } from '@shopenup/order-processing';

const orderProcessor = new OrderProcessor({
  paymentGateway: 'stripe',
  shippingProvider: 'fedex'
});

// Process Ayurvedic product order
const order = await orderProcessor.createOrder({
  items: [
    { productId: 'ashwagandha-500mg', quantity: 2 },
    { productId: 'turmeric-capsules', quantity: 1 }
  ],
  customerId: 'user123',
  prescriptionRequired: false
});
```

### 2. Ayurveda-Specific Packages

#### Dosha Assessment (`@shopenup/dosha-assessment`)
```typescript
import { DoshaAssessment } from '@shopenup/dosha-assessment';

const assessment = new DoshaAssessment({
  questionsPerCategory: 5,
  scoringAlgorithm: 'weighted-average'
});

// Evaluate customer dosha
const doshaProfile = await assessment.evaluate([
  { questionId: 'body-frame', answer: 'thin-lean' },
  { questionId: 'appetite', answer: 'variable' },
  { questionId: 'sleep-pattern', answer: 'light-interrupted' }
]);

console.log(doshaProfile);
// Output: { vata: 75, pitta: 15, kapha: 10, primary: 'vata' }
```

#### Product Recommendation Engine (`@shopenup/product-recommendation-engine`)
```typescript
import { RecommendationEngine } from '@shopenup/product-recommendation-engine';

const engine = new RecommendationEngine({
  algorithm: 'collaborative-filtering',
  seasonalWeight: 0.3,
  doshaWeight: 0.5,
  healthGoalWeight: 0.2
});

// Get personalized recommendations
const recommendations = await engine.getRecommendations({
  doshaProfile: doshaProfile,
  healthGoals: ['stress-relief', 'immunity'],
  currentSeason: 'autumn',
  purchaseHistory: customerHistory
});
```

#### Health Consultation (`@shopenup/health-consultation`)
```typescript
import { HealthConsultation } from '@shopenup/health-consultation';

const consultation = new HealthConsultation({
  practitionerApi: process.env.PRACTITIONER_API_URL,
  bookingSystem: 'calendly'
});

// Book consultation with Ayurvedic practitioner
const booking = await consultation.bookAppointment({
  customerId: 'user123',
  practitionerId: 'dr-ayurveda-001',
  appointmentType: 'dosha-assessment',
  preferredDate: '2024-01-15',
  duration: 60
});
```

### 3. Healthcare Compliance Packages

#### HIPAA Compliance (`@shopenup/hipaa-compliance`)
```typescript
import { HIPAACompliance } from '@shopenup/hipaa-compliance';

const hipaa = new HIPAACompliance({
  encryptionKey: process.env.HIPAA_ENCRYPTION_KEY,
  auditLogging: true
});

// Encrypt health data
const encryptedData = await hipaa.encryptHealthData({
  doshaProfile: doshaProfile,
  medicalHistory: customerMedicalHistory,
  prescriptions: customerPrescriptions
});

// Audit log access
await hipaa.auditLog('DATA_ACCESS', 'user123', {
  action: 'view_dosha_profile',
  timestamp: new Date(),
  ipAddress: '192.168.1.1'
});
```

#### Prescription Management (`@shopenup/prescription-management`)
```typescript
import { PrescriptionManager } from '@shopenup/prescription-management';

const prescriptionManager = new PrescriptionManager({
  validationApi: process.env.PRESCRIPTION_VALIDATION_API,
  drugInteractionDb: process.env.DRUG_INTERACTION_DB
});

// Validate prescription
const isValid = await prescriptionManager.validatePrescription({
  practitionerId: 'dr-ayurveda-001',
  licenseNumber: 'AY123456',
  prescription: {
    productId: 'ashwagandha-500mg',
    dosage: '500mg twice daily',
    duration: '30 days'
  }
});

// Check drug interactions
const interactions = await prescriptionManager.checkInteractions([
  'ashwagandha-500mg',
  'turmeric-capsules',
  'current-medication-1'
]);
```

### 4. Analytics Packages

#### Sales Analytics (`@shopenup/sales-analytics`)
```typescript
import { SalesAnalytics } from '@shopenup/sales-analytics';

const analytics = new SalesAnalytics({
  database: process.env.ANALYTICS_DB_URL,
  realTimeTracking: true
});

// Get dosha-based sales insights
const doshaInsights = await analytics.getDoshaAnalytics({
  dateRange: { start: '2024-01-01', end: '2024-01-31' },
  metrics: ['revenue', 'units_sold', 'customer_count']
});

// Get seasonal product performance
const seasonalPerformance = await analytics.getSeasonalPerformance({
  season: 'autumn',
  dosha: 'vata',
  productCategory: 'herbs'
});
```

#### Customer Insights (`@shopenup/customer-insights`)
```typescript
import { CustomerInsights } from '@shopenup/customer-insights';

const insights = new CustomerInsights({
  machineLearning: true,
  predictiveAnalytics: true
});

// Analyze customer health journey
const healthJourney = await insights.getHealthJourney('user123', {
  includeDoshaChanges: true,
  includeProductEfficacy: true,
  includeConsultationHistory: true
});

// Get recommendation effectiveness
const effectiveness = await insights.getRecommendationEffectiveness({
  customerId: 'user123',
  timeRange: 'last_6_months',
  metrics: ['purchase_rate', 'satisfaction_score', 'health_improvement']
});
```

### 5. Integration Packages

#### Notification System (`@shopenup/notification-system`)
```typescript
import { NotificationSystem } from '@shopenup/notification-system';

const notifications = new NotificationSystem({
  emailProvider: 'sendgrid',
  smsProvider: 'twilio',
  pushProvider: 'firebase'
});

// Send personalized Ayurvedic recommendations
await notifications.sendPersonalizedRecommendation({
  userId: 'user123',
  channel: 'email',
  template: 'dosha_recommendations',
  data: {
    doshaProfile: doshaProfile,
    recommendations: productRecommendations,
    seasonalTips: seasonalAdvice
  }
});

// Send refill reminders
await notifications.sendRefillReminder({
  userId: 'user123',
  productId: 'ashwagandha-500mg',
  lastPurchaseDate: '2024-01-01',
  estimatedRefillDate: '2024-01-15'
});
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Core eCommerce
PRODUCT_CATALOG_API_KEY=your_api_key
PRODUCT_CATALOG_URL=https://api.shopenup.com/catalog
INVENTORY_DB_URL=your_inventory_db_url
PAYMENT_GATEWAY_KEY=your_payment_key

# Ayurveda
DOSHA_ASSESSMENT_API_KEY=your_dosha_api_key
RECOMMENDATION_ENGINE_URL=https://api.shopenup.com/recommendations
PRACTITIONER_API_URL=https://api.shopenup.com/practitioners

# Healthcare Compliance
HIPAA_ENCRYPTION_KEY=your_encryption_key
PRESCRIPTION_VALIDATION_API=https://api.shopenup.com/prescriptions
DRUG_INTERACTION_DB=your_interaction_db_url

# Analytics
ANALYTICS_DB_URL=your_analytics_db_url
ML_MODEL_ENDPOINT=https://api.shopenup.com/ml

# Integrations
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
FIREBASE_CONFIG=your_firebase_config
```

## 🧪 Testing Package Integration

### Unit Tests
```typescript
// tests/packages/dosha-assessment.test.ts
import { DoshaAssessment } from '@shopenup/dosha-assessment';

describe('Dosha Assessment', () => {
  it('should evaluate dosha profile correctly', async () => {
    const assessment = new DoshaAssessment();
    const answers = [
      { questionId: 'body-frame', answer: 'thin-lean' },
      { questionId: 'appetite', answer: 'variable' }
    ];
    
    const result = await assessment.evaluate(answers);
    
    expect(result.vata).toBeGreaterThan(0);
    expect(result.primary).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// tests/integration/ayurveda-workflow.test.ts
import { packageManager } from '../../src/lib/packages';

describe('Ayurveda Workflow', () => {
  it('should complete full customer journey', async () => {
    // 1. Assess dosha
    const doshaProfile = await packageManager.assessDosha(testAnswers);
    
    // 2. Get recommendations
    const recommendations = await packageManager.getProductRecommendations(doshaProfile);
    
    // 3. Create order
    const order = await packageManager.createOrder({
      items: recommendations.slice(0, 3).map(r => ({
        productId: r.product.id,
        quantity: 1
      })),
      customerId: 'test-user'
    });
    
    // 4. Process payment
    const payment = await packageManager.processPayment({
      orderId: order.id,
      amount: order.total,
      method: 'card'
    });
    
    expect(payment.status).toBe('successful');
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Package not found**
   ```bash
   npm ERR! 404 Not Found: @shopenup/package-name
   ```
   **Solution**: Check your npm registry configuration and ensure you have access to private packages.

2. **Authentication failed**
   ```bash
   npm ERR! 401 Unauthorized
   ```
   **Solution**: Run `npm login` and authenticate with your private registry.

3. **Version conflicts**
   ```bash
   npm ERR! ERESOLVE unable to resolve dependency tree
   ```
   **Solution**: Check package versions in `package.json` and resolve conflicts.

4. **Import errors**
   ```typescript
   Module not found: Can't resolve '@shopenup/package-name'
   ```
   **Solution**: Ensure the package is installed and the import path is correct.

### Debug Commands

```bash
# Check npm configuration
npm config list

# Check registry
npm config get registry

# List installed packages
npm list --depth=0

# Clear npm cache
npm cache clean --force

# Reinstall packages
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Package API Documentation](./api-documentation.md)
- [Ayurveda Features Guide](./ayurveda-features.md)
- [Healthcare Compliance Guide](./compliance-guide.md)
- [Performance Optimization](./performance-guide.md)

## 🤝 Support

For issues with private package integration:

1. Check the troubleshooting section above
2. Review package-specific documentation
3. Contact the development team
4. Create an issue in the repository

---

**Happy coding with your Ayurveda eCommerce boilerplate! 🌿**
