#!/bin/bash

# ShopenUp Ayurveda eCommerce - Private Package Installation Script
# This script installs all 70 private eCommerce packages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TOTAL_PACKAGES=70
INSTALLED_PACKAGES=0
FAILED_PACKAGES=0

# Arrays to track packages
SUCCESSFUL_PACKAGES=()
FAILED_PACKAGES_LIST=()

echo -e "${BLUE}🚀 ShopenUp Ayurveda eCommerce - Package Installation${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found${NC}"
echo -e "${GREEN}✅ package.json found${NC}"
echo ""

# Function to install a package
install_package() {
    local package_name=$1
    local package_category=$2
    
    echo -e "${YELLOW}📦 Installing $package_name ($package_category)...${NC}"
    
    if npm install "$package_name" --save; then
        echo -e "${GREEN}✅ Successfully installed $package_name${NC}"
        SUCCESSFUL_PACKAGES+=("$package_name")
        ((INSTALLED_PACKAGES++))
    else
        echo -e "${RED}❌ Failed to install $package_name${NC}"
        FAILED_PACKAGES_LIST+=("$package_name")
        ((FAILED_PACKAGES++))
    fi
    
    echo ""
}

# Function to show progress
show_progress() {
    local current=$1
    local total=$2
    local percentage=$((current * 100 / total))
    echo -e "${BLUE}📊 Progress: $current/$total packages ($percentage%)${NC}"
    echo ""
}

echo -e "${BLUE}🔧 Installing Core eCommerce Packages (20 packages)${NC}"
echo "=================================================="

# Core eCommerce Packages
install_package "@shopenup/product-catalog" "Core eCommerce"
install_package "@shopenup/inventory-management" "Core eCommerce"
install_package "@shopenup/order-processing" "Core eCommerce"
install_package "@shopenup/payment-gateway" "Core eCommerce"
install_package "@shopenup/customer-management" "Core eCommerce"
install_package "@shopenup/shopping-cart" "Core eCommerce"
install_package "@shopenup/wishlist" "Core eCommerce"
install_package "@shopenup/product-search" "Core eCommerce"
install_package "@shopenup/product-filtering" "Core eCommerce"
install_package "@shopenup/product-reviews" "Core eCommerce"
install_package "@shopenup/product-recommendations" "Core eCommerce"
install_package "@shopenup/subscription-management" "Core eCommerce"
install_package "@shopenup/loyalty-program" "Core eCommerce"
install_package "@shopenup/coupon-management" "Core eCommerce"
install_package "@shopenup/shipping-calculator" "Core eCommerce"
install_package "@shopenup/tax-calculator" "Core eCommerce"
install_package "@shopenup/order-tracking" "Core eCommerce"
install_package "@shopenup/return-management" "Core eCommerce"
install_package "@shopenup/refund-processing" "Core eCommerce"
install_package "@shopenup/gift-card-management" "Core eCommerce"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🌿 Installing Ayurveda-Specific Packages (15 packages)${NC}"
echo "=================================================="

# Ayurveda-Specific Packages
install_package "@shopenup/dosha-assessment" "Ayurveda"
install_package "@shopenup/dosha-calculator" "Ayurveda"
install_package "@shopenup/product-recommendation-engine" "Ayurveda"
install_package "@shopenup/health-consultation" "Ayurveda"
install_package "@shopenup/practitioner-management" "Ayurveda"
install_package "@shopenup/appointment-booking" "Ayurveda"
install_package "@shopenup/dosage-calculator" "Ayurveda"
install_package "@shopenup/seasonal-recommendations" "Ayurveda"
install_package "@shopenup/health-goal-tracking" "Ayurveda"
install_package "@shopenup/wellness-quiz" "Ayurveda"
install_package "@shopenup/ayurvedic-diet-planner" "Ayurveda"
install_package "@shopenup/lifestyle-recommendations" "Ayurveda"
install_package "@shopenup/dosha-balancing" "Ayurveda"
install_package "@shopenup/herb-interactions" "Ayurveda"
install_package "@shopenup/ayurvedic-formulations" "Ayurveda"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🏥 Installing Healthcare Compliance Packages (10 packages)${NC}"
echo "=================================================="

# Healthcare Compliance Packages
install_package "@shopenup/hipaa-compliance" "Healthcare"
install_package "@shopenup/prescription-management" "Healthcare"
install_package "@shopenup/health-data-encryption" "Healthcare"
install_package "@shopenup/audit-logging" "Healthcare"
install_package "@shopenup/patient-consent" "Healthcare"
install_package "@shopenup/medical-history" "Healthcare"
install_package "@shopenup/allergy-tracking" "Healthcare"
install_package "@shopenup/medication-interactions" "Healthcare"
install_package "@shopenup/health-insurance" "Healthcare"
install_package "@shopenup/pharmacy-integration" "Healthcare"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}📊 Installing Analytics Packages (10 packages)${NC}"
echo "=================================================="

# Analytics Packages
install_package "@shopenup/sales-analytics" "Analytics"
install_package "@shopenup/customer-insights" "Analytics"
install_package "@shopenup/product-performance" "Analytics"
install_package "@shopenup/dosha-analytics" "Analytics"
install_package "@shopenup/seasonal-trends" "Analytics"
install_package "@shopenup/health-outcomes" "Analytics"
install_package "@shopenup/practitioner-analytics" "Analytics"
install_package "@shopenup/inventory-analytics" "Analytics"
install_package "@shopenup/revenue-analytics" "Analytics"
install_package "@shopenup/customer-journey" "Analytics"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🔗 Installing Integration Packages (15 packages)${NC}"
echo "=================================================="

# Integration Packages
install_package "@shopenup/notification-system" "Integration"
install_package "@shopenup/email-marketing" "Integration"
install_package "@shopenup/sms-gateway" "Integration"
install_package "@shopenup/push-notifications" "Integration"
install_package "@shopenup/social-media" "Integration"
install_package "@shopenup/crm-integration" "Integration"
install_package "@shopenup/erp-integration" "Integration"
install_package "@shopenup/accounting-integration" "Integration"
install_package "@shopenup/shipping-providers" "Integration"
install_package "@shopenup/payment-processors" "Integration"
install_package "@shopenup/third-party-apis" "Integration"
install_package "@shopenup/webhook-management" "Integration"
install_package "@shopenup/api-gateway" "Integration"
install_package "@shopenup/rate-limiting" "Integration"
install_package "@shopenup/caching-system" "Integration"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

# Final Summary
echo -e "${BLUE}📋 Installation Summary${NC}"
echo "========================"
echo -e "${GREEN}✅ Successfully installed: $INSTALLED_PACKAGES packages${NC}"
echo -e "${RED}❌ Failed to install: $FAILED_PACKAGES packages${NC}"

if [ ${#FAILED_PACKAGES_LIST[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed packages:${NC}"
    for package in "${FAILED_PACKAGES_LIST[@]}"; do
        echo -e "${RED}  - $package${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 Tips for failed packages:${NC}"
    echo "  1. Check your npm registry configuration"
    echo "  2. Ensure you have access to private packages"
    echo "  3. Verify your authentication tokens"
    echo "  4. Try running: npm login"
    echo "  5. Check package names and versions"
fi

if [ $INSTALLED_PACKAGES -eq $TOTAL_PACKAGES ]; then
    echo ""
    echo -e "${GREEN}🎉 All packages installed successfully!${NC}"
    echo -e "${GREEN}🚀 Your Ayurveda eCommerce boilerplate is ready to use.${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some packages failed to install.${NC}"
    echo -e "${YELLOW}   You may need to install them manually or check your access.${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Check the documentation in the docs/ folder"
echo "4. Configure your environment variables"

echo ""
echo -e "${GREEN}✨ Installation script completed!${NC}"
