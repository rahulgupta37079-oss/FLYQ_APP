#!/bin/bash

# FLYQ Drone Controller - Build Script
# This script automates the build process for Android APK and iOS IPA

set -e  # Exit on error

echo "
╔══════════════════════════════════════════════════════════════╗
║         🚁 FLYQ Drone Controller - Build Script             ║
╚══════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    echo "Current directory: $(pwd)"
    exit 1
fi

cd frontend

# Function to print step
print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 20.x or higher${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Check if EAS CLI is installed
if ! command_exists eas; then
    echo -e "${YELLOW}⚠ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
else
    echo -e "${GREEN}✓ EAS CLI: $(eas --version)${NC}"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > .env << EOF
# Backend URL - Update this before building!
# For local testing, use your computer's IP address
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# For production, use your deployed backend URL
# EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app
EOF
    echo -e "${YELLOW}⚠ Please edit frontend/.env and set EXPO_PUBLIC_BACKEND_URL${NC}"
    echo -e "${YELLOW}  Then run this script again${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"
echo -e "${BLUE}Backend URL: $(grep EXPO_PUBLIC_BACKEND_URL .env | cut -d '=' -f2)${NC}"

# Show menu
echo ""
echo "What would you like to build?"
echo ""
echo "  1) Android APK (for testing)"
echo "  2) Android AAB (for Google Play Store)"
echo "  3) iOS IPA (for testing)"
echo "  4) iOS IPA (for App Store)"
echo "  5) Both Android & iOS (testing)"
echo "  6) Configure EAS only"
echo "  7) Exit"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        print_step "Building Android APK (Preview)..."
        echo -e "${YELLOW}This will take about 15-20 minutes${NC}"
        echo -e "${YELLOW}You can close this terminal and check status at https://expo.dev${NC}"
        echo ""
        eas build --platform android --profile preview
        echo ""
        echo -e "${GREEN}✓ Build complete!${NC}"
        echo -e "${BLUE}Download your APK from the URL above${NC}"
        ;;
    2)
        print_step "Building Android AAB (Production)..."
        echo -e "${YELLOW}This will take about 15-20 minutes${NC}"
        echo ""
        eas build --platform android --profile production
        echo ""
        echo -e "${GREEN}✓ Build complete!${NC}"
        echo -e "${BLUE}Upload the AAB to Google Play Console${NC}"
        ;;
    3)
        print_step "Building iOS IPA (Preview)..."
        echo -e "${YELLOW}This will take about 20-25 minutes${NC}"
        echo -e "${YELLOW}You may need to register device UDIDs${NC}"
        echo ""
        eas build --platform ios --profile preview
        echo ""
        echo -e "${GREEN}✓ Build complete!${NC}"
        echo -e "${BLUE}Download your IPA from the URL above${NC}"
        ;;
    4)
        print_step "Building iOS IPA (Production)..."
        echo -e "${YELLOW}This will take about 20-25 minutes${NC}"
        echo -e "${YELLOW}You need an Apple Developer account${NC}"
        echo ""
        eas build --platform ios --profile production
        echo ""
        echo -e "${GREEN}✓ Build complete!${NC}"
        echo -e "${BLUE}Submit to App Store Connect${NC}"
        ;;
    5)
        print_step "Building Android & iOS (Preview)..."
        echo -e "${YELLOW}This will take about 30-40 minutes${NC}"
        echo ""
        eas build --platform all --profile preview
        echo ""
        echo -e "${GREEN}✓ Both builds complete!${NC}"
        ;;
    6)
        print_step "Configuring EAS..."
        eas build:configure
        echo ""
        echo -e "${GREEN}✓ EAS configured!${NC}"
        echo -e "${BLUE}Now you can run this script again to build${NC}"
        ;;
    7)
        echo -e "${BLUE}Goodbye! 👋${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Script completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  1. Download your build from Expo dashboard"
echo "  2. Install on your device"
echo "  3. Test all features"
echo "  4. Deploy backend to cloud if not already done"
echo ""
echo -e "${BLUE}For detailed instructions, see: BUILD_APK_IPA_GUIDE.md${NC}"
echo ""
