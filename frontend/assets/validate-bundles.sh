#!/bin/bash
# Validation script for frontend asset bundles
#
# Purpose: Ensure all required .min.js files are present and valid before Go embedding
# This prevents broken builds where bundles weren't generated.
#
# Usage: ./validate-bundles.sh
#
# Exit codes:
#   0 - All validations passed
#   1 - One or more validations failed

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATION_FAILED=0

# Helper function to print colored output
print_success() {
	echo -e "${GREEN}✓${NC} $1"
}

print_error() {
	echo -e "${RED}✗${NC} $1"
	VALIDATION_FAILED=1
}

print_warning() {
	echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
	echo -e "${YELLOW}ℹ${NC} $1"
}

# Helper function to check file exists and is not empty
check_file() {
	local file_path="$1"
	local file_description="$2"
	local min_size="${3:-1000}" # Default minimum size: 1KB

	if [ ! -f "$file_path" ]; then
		print_error "Missing: $file_description"
		print_info "  Expected at: $file_path"
		return 1
	fi

	local file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")

	if [ "$file_size" -lt "$min_size" ]; then
		print_error "Invalid: $file_description (file is too small: ${file_size} bytes)"
		print_info "  File: $file_path"
		print_info "  Expected minimum size: ${min_size} bytes"
		return 1
	fi

	print_success "$file_description (${file_size} bytes)"
	return 0
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend Bundle Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# Validate meta.user plugin bundles
# ============================================================================

echo "Checking meta.user plugin..."
echo ""

META_USER_DIR="$SCRIPT_DIR/meta.user"

if [ ! -d "$META_USER_DIR" ]; then
	print_error "meta.user plugin directory not found: $META_USER_DIR"
	exit 1
fi

# Check main bundle (ReactMeta.min.js) - Webpack creates this file
if ! check_file "$META_USER_DIR/res/dist/ReactMeta.min.js" "Main bundle (ReactMeta.min.js)" 50000; then
	VALIDATION_FAILED=1
fi

# Check source map (optional but recommended for debugging)
if [ -f "$META_USER_DIR/res/dist/ReactMeta.min.js.map" ]; then
	print_success "Source map (ReactMeta.min.js.map) exists"
else
	print_warning "Source map (ReactMeta.min.js.map) not found (optional)"
fi

# Check gzip version (optional but recommended for production)
if [ -f "$META_USER_DIR/res/dist/ReactMeta.min.js.gz" ]; then
	GZ_SIZE=$(stat -f%z "$META_USER_DIR/res/dist/ReactMeta.min.js.gz" 2>/dev/null || stat -c%s "$META_USER_DIR/res/dist/ReactMeta.min.js.gz" 2>/dev/null || echo "0")
	if [ "$GZ_SIZE" -gt 1000 ]; then
		print_success "Gzip bundle (ReactMeta.min.js.gz) exists (${GZ_SIZE} bytes)"
	else
		print_warning "Gzip bundle (ReactMeta.min.js.gz) is too small (${GZ_SIZE} bytes)"
	fi
else
	print_warning "Gzip bundle (ReactMeta.min.js.gz) not found (optional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $VALIDATION_FAILED -eq 0 ]; then
	echo ""
	print_success "All validations passed!"
	echo ""
	exit 0
else
	echo ""
	print_error "Validation failed!"
	echo ""
	echo "To fix this issue, rebuild the frontend assets:"
	echo ""
	echo "  cd frontend/assets/meta.user"
	echo "  pnpm install"
	echo "  pnpm run build-prod"
	echo ""
	echo "Or use npm:"
	echo ""
	echo "  cd frontend/assets/meta.user"
	echo "  npm install"
	echo "  npm run build-prod"
	echo ""
	exit 1
fi
