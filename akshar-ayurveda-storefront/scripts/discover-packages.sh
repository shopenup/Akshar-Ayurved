#!/bin/bash

# ShopenUp Package Discovery Script
# This script discovers all available @shopenup packages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Discovering ShopenUp Packages${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Array of package names to test
PACKAGES=(
    # Core eCommerce
    "product" "inventory" "order" "payment" "customer" "cart" "pricing" "currency" "tax"
    "fulfillment" "sales-channel" "store" "region" "stock-location" "promotion" "analytics"
    "user" "auth" "api-key" "file" "notification"
    
    # Infrastructure
    "event-bus-local" "event-bus-redis" "cache-inmemory" "cache-redis"
    "workflow-engine-inmemory" "workflow-engine-redis" "locking" "locking-redis" "locking-postgres"
    "file-local" "file-s3" "auth-emailpass" "auth-github" "auth-google"
    
    # Ayurveda-specific (potential packages)
    "dosha-assessment" "product-recommendations" "health-consultation" "practitioner-management"
    "appointment-booking" "dosage-calculator" "seasonal-recommendations" "health-goal-tracking"
    "wellness-quiz" "ayurvedic-diet-planner" "lifestyle-recommendations" "dosha-balancing"
    "herb-interactions" "ayurvedic-formulations" "health-analytics"
    
    # Healthcare
    "hipaa-compliance" "prescription-management" "health-data-encryption" "audit-logging"
    "patient-consent" "medical-history" "allergy-tracking" "medication-interactions"
    "health-insurance" "pharmacy-integration"
    
    # Additional potential packages
    "core-flows" "link-modules" "telemetry" "admin-bundler" "framework"
    "analytics-local" "analytics-posthog" "notification-local" "notification-sendgrid"
    "fulfillment-manual" "payment-stripe"
)

AVAILABLE_PACKAGES=()
UNAVAILABLE_PACKAGES=()

echo -e "${YELLOW}Testing package availability...${NC}"
echo ""

for package in "${PACKAGES[@]}"; do
    echo -n "Testing @shopenup/$package... "
    
    if npm view "@shopenup/$package" --json > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Available${NC}"
        AVAILABLE_PACKAGES+=("$package")
    else
        echo -e "${RED}❌ Not found${NC}"
        UNAVAILABLE_PACKAGES+=("$package")
    fi
done

echo ""
echo -e "${BLUE}📊 Discovery Results${NC}"
echo "========================"
echo -e "${GREEN}✅ Available packages: ${#AVAILABLE_PACKAGES[@]}${NC}"
echo -e "${RED}❌ Unavailable packages: ${#UNAVAILABLE_PACKAGES[@]}${NC}"
echo ""

if [ ${#AVAILABLE_PACKAGES[@]} -gt 0 ]; then
    echo -e "${GREEN}📦 Available Packages:${NC}"
    echo "========================"
    for package in "${AVAILABLE_PACKAGES[@]}"; do
        echo "  - @shopenup/$package"
    done
    echo ""
fi

if [ ${#UNAVAILABLE_PACKAGES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Unavailable Packages:${NC}"
    echo "========================"
    for package in "${UNAVAILABLE_PACKAGES[@]}"; do
        echo "  - @shopenup/$package"
    done
    echo ""
fi

# Generate updated packages.json
echo -e "${BLUE}🔄 Generating updated packages.json...${NC}"

cat > config/packages-discovered.json << EOF
{
  "discovered": {
    "total": ${#AVAILABLE_PACKAGES[@]},
    "available": [
EOF

for package in "${AVAILABLE_PACKAGES[@]}"; do
    echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
done

cat >> config/packages-discovered.json << EOF
    ],
    "unavailable": [
EOF

for package in "${UNAVAILABLE_PACKAGES[@]}"; do
    echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
done

cat >> config/packages-discovered.json << EOF
    ]
  },
  "categories": {
    "core": [
EOF

# Categorize available packages
CORE_PACKAGES=("product" "inventory" "order" "payment" "customer" "cart" "pricing" "currency" "tax" "fulfillment" "sales-channel" "store" "region" "stock-location" "promotion" "analytics" "user" "auth" "api-key" "file" "notification")

for package in "${CORE_PACKAGES[@]}"; do
    if [[ " ${AVAILABLE_PACKAGES[@]} " =~ " ${package} " ]]; then
        echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
    fi
done

cat >> config/packages-discovered.json << EOF
    ],
    "infrastructure": [
EOF

INFRA_PACKAGES=("event-bus-local" "event-bus-redis" "cache-inmemory" "cache-redis" "workflow-engine-inmemory" "workflow-engine-redis" "locking" "locking-redis" "locking-postgres" "file-local" "file-s3" "auth-emailpass" "auth-github" "auth-google")

for package in "${INFRA_PACKAGES[@]}"; do
    if [[ " ${AVAILABLE_PACKAGES[@]} " =~ " ${package} " ]]; then
        echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
    fi
done

cat >> config/packages-discovered.json << EOF
    ],
    "ayurveda": [
EOF

AYURVEDA_PACKAGES=("dosha-assessment" "product-recommendations" "health-consultation" "practitioner-management" "appointment-booking" "dosage-calculator" "seasonal-recommendations" "health-goal-tracking" "wellness-quiz" "ayurvedic-diet-planner" "lifestyle-recommendations" "dosha-balancing" "herb-interactions" "ayurvedic-formulations" "health-analytics")

for package in "${AYURVEDA_PACKAGES[@]}"; do
    if [[ " ${AVAILABLE_PACKAGES[@]} " =~ " ${package} " ]]; then
        echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
    fi
done

cat >> config/packages-discovered.json << EOF
    ],
    "healthcare": [
EOF

HEALTHCARE_PACKAGES=("hipaa-compliance" "prescription-management" "health-data-encryption" "audit-logging" "patient-consent" "medical-history" "allergy-tracking" "medication-interactions" "health-insurance" "pharmacy-integration")

for package in "${HEALTHCARE_PACKAGES[@]}"; do
    if [[ " ${AVAILABLE_PACKAGES[@]} " =~ " ${package} " ]]; then
        echo "      \"@shopenup/$package\"," >> config/packages-discovered.json
    fi
done

cat >> config/packages-discovered.json << EOF
    ]
  }
}
EOF

echo -e "${GREEN}✅ Generated config/packages-discovered.json${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Review the discovered packages in config/packages-discovered.json"
echo "2. Update the main packages.json with actual available packages"
echo "3. Run the installation script to install the packages"
echo "4. Update the integration code to use the actual packages"
echo ""

echo -e "${GREEN}✨ Package discovery completed!${NC}"
