#!/bin/bash

# FLYQ App - Quick Build & Test Script
# Version: 2.1.3 Enhanced
# Usage: Run this on your computer in the project directory

echo "=================================="
echo "FLYQ Drone Controller - Build Tool"
echo "Version 2.1.3 Enhanced"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check EAS login
echo -e "${YELLOW}[1/5]${NC} Checking EAS login status..."
if eas whoami | grep -q "Not logged in"; then
    echo -e "${RED}❌ Not logged in to EAS${NC}"
    echo ""
    echo "Please run: eas login"
    echo "Username: professorhulk0"
    echo "Password: Kali@2864#"
    exit 1
else
    echo -e "${GREEN}✅ Logged in to EAS${NC}"
    eas whoami
fi

echo ""

# Step 2: Check git status
echo -e "${YELLOW}[2/5]${NC} Checking git status..."
if git status | grep -q "nothing to commit"; then
    echo -e "${GREEN}✅ All changes committed${NC}"
else
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

echo ""

# Step 3: Pull latest changes
echo -e "${YELLOW}[3/5]${NC} Pulling latest changes from GitHub..."
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Up to date with remote${NC}"
else
    echo -e "${RED}❌ Failed to pull changes${NC}"
    exit 1
fi

echo ""

# Step 4: Show current version
echo -e "${YELLOW}[4/5]${NC} Current app version:"
grep '"version"' app.json | head -1
grep '"versionCode"' app.json | head -1

echo ""

# Step 5: Build APK
echo -e "${YELLOW}[5/5]${NC} Building APK..."
echo ""
echo "This will take 10-15 minutes."
echo "You can monitor progress at: https://expo.dev/accounts/professorhulk0/projects/flyq-drone-controller/builds"
echo ""
read -p "Start build now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}🚀 Starting EAS build...${NC}"
    eas build --platform android --profile preview
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Build completed successfully!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Download APK from the link above"
        echo "2. Transfer to your Android device"
        echo "3. Install the APK"
        echo "4. Connect to drone WiFi (ESP_DRONE_xxx)"
        echo "5. Open FLYQ app and tap 'Connect to Drone'"
        echo ""
        echo "📖 Debugging guide: See WIFI_DEBUG_GUIDE.md"
    else
        echo ""
        echo -e "${RED}❌ Build failed${NC}"
        echo "Check the error message above"
        exit 1
    fi
else
    echo ""
    echo "Build cancelled."
    echo ""
    echo "To build later, run:"
    echo "  eas build --platform android --profile preview"
fi

echo ""
echo "=================================="
echo "Done!"
echo "=================================="
