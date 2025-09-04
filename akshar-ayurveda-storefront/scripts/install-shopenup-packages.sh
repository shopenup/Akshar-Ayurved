#!/bin/bash

# ShopenUp Ayurveda eCommerce - Package Installation Script
# This script installs all 65 actual ShopenUp packages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TOTAL_PACKAGES=65
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

echo -e "${BLUE}🔧 Installing Core Packages (10 packages)${NC}"
echo "=================================================="

# Core Packages
install_package "@shopenup/workflows-sdk" "Core"
install_package "@shopenup/types" "Core"
install_package "@shopenup/modules-sdk" "Core"
install_package "@shopenup/telemetry" "Core"
install_package "@shopenup/admin-vite-plugin" "Core"
install_package "@shopenup/utils" "Core"
install_package "@shopenup/orchestration" "Core"
install_package "@shopenup/framework" "Core"
install_package "@shopenup/js-sdk" "Core"
install_package "@shopenup/cli" "Core"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🛍️ Installing eCommerce Packages (22 packages)${NC}"
echo "=================================================="

# eCommerce Packages
install_package "@shopenup/shopenup" "eCommerce"
install_package "@shopenup/product" "eCommerce"
install_package "@shopenup/inventory" "eCommerce"
install_package "@shopenup/order" "eCommerce"
install_package "@shopenup/payment" "eCommerce"
install_package "@shopenup/customer" "eCommerce"
install_package "@shopenup/cart" "eCommerce"
install_package "@shopenup/pricing" "eCommerce"
install_package "@shopenup/currency" "eCommerce"
install_package "@shopenup/tax" "eCommerce"
install_package "@shopenup/fulfillment" "eCommerce"
install_package "@shopenup/sales-channel" "eCommerce"
install_package "@shopenup/store" "eCommerce"
install_package "@shopenup/region" "eCommerce"
install_package "@shopenup/stock-location" "eCommerce"
install_package "@shopenup/promotion" "eCommerce"
install_package "@shopenup/analytics" "eCommerce"
install_package "@shopenup/user" "eCommerce"
install_package "@shopenup/auth" "eCommerce"
install_package "@shopenup/api-key" "eCommerce"
install_package "@shopenup/file" "eCommerce"
install_package "@shopenup/notification" "eCommerce"
install_package "@shopenup/core-flows" "eCommerce"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🏗️ Installing Infrastructure Packages (16 packages)${NC}"
echo "=================================================="

# Infrastructure Packages
install_package "@shopenup/event-bus-local" "Infrastructure"
install_package "@shopenup/event-bus-redis" "Infrastructure"
install_package "@shopenup/cache-inmemory" "Infrastructure"
install_package "@shopenup/cache-redis" "Infrastructure"
install_package "@shopenup/workflow-engine-inmemory" "Infrastructure"
install_package "@shopenup/workflow-engine-redis" "Infrastructure"
install_package "@shopenup/locking" "Infrastructure"
install_package "@shopenup/locking-redis" "Infrastructure"
install_package "@shopenup/locking-postgres" "Infrastructure"
install_package "@shopenup/file-local" "Infrastructure"
install_package "@shopenup/file-s3" "Infrastructure"
install_package "@shopenup/auth-emailpass" "Infrastructure"
install_package "@shopenup/auth-github" "Infrastructure"
install_package "@shopenup/auth-google" "Infrastructure"
install_package "@shopenup/link-modules" "Infrastructure"
install_package "@shopenup/index" "Infrastructure"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}📊 Installing Analytics Packages (4 packages)${NC}"
echo "=================================================="

# Analytics Packages
install_package "@shopenup/analytics-local" "Analytics"
install_package "@shopenup/analytics-posthog" "Analytics"
install_package "@shopenup/telemetry" "Analytics"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🎛️ Installing Admin Packages (8 packages)${NC}"
echo "=================================================="

# Admin Packages
install_package "@shopenup/admin-bundler" "Admin"
install_package "@shopenup/admin-sdk" "Admin"
install_package "@shopenup/admin-shared" "Admin"
install_package "@shopenup/dashboard" "Admin"
install_package "@shopenup/ui" "Admin"
install_package "@shopenup/ui-preset" "Admin"
install_package "@shopenup/icons" "Admin"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🔌 Installing Provider Packages (7 packages)${NC}"
echo "=================================================="

# Provider Packages
install_package "@shopenup/payment-stripe" "Providers"
install_package "@shopenup/fulfillment-manual" "Providers"
install_package "@shopenup/notification-local" "Providers"
install_package "@shopenup/notification-sendgrid" "Providers"
install_package "@shopenup/shopenup-oas-cli" "Providers"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🧪 Installing Development Packages (1 package)${NC}"
echo "=================================================="

# Development Packages
install_package "@shopenup/test-utils" "Development"

show_progress $INSTALLED_PACKAGES $TOTAL_PACKAGES

echo -e "${BLUE}🚀 Installing Additional Packages (7 packages)${NC}"
echo "=================================================="

# Additional Packages
install_package "@shopenup/create-shopenup-app" "Additional"
install_package "@shopenup/admin-vite-plugin" "Additional"

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
echo "5. Start building Ayurveda-specific features using your ShopenUp packages!"

echo ""
echo -e "${GREEN}✨ Installation script completed!${NC}"
