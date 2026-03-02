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
PLUGINS_VALIDATED=0
PLUGINS_PASSED=0
PLUGINS_FAILED=0
PLUGINS_SKIPPED=0
TOTAL_BUNDLES=0
BUNDLES_PASSED=0
BUNDLES_FAILED=0

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
	local min_size="${3:-50000}" # Default minimum size: 50KB as mentioned in requirements

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
echo "Frontend Bundle Validation - Dynamic Bundle Extraction"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# Validate all plugins with webpack.config.js
# ============================================================================

# Find all plugins with webpack.config.js (excluding .gwt directories and node_modules)
plugins_with_config=$(find . -maxdepth 2 -name "webpack.config.js" -type f | grep -v ".gwt" | grep -v "node_modules" | sort)

if [ -z "$plugins_with_config" ]; then
	print_error "No webpack.config.js files found in plugin directories"
	exit 1
fi

for config_file in $plugins_with_config; do
	plugin_dir=$(dirname "$config_file")
	plugin_name=$(basename "$plugin_dir")

	echo "Checking plugin: $plugin_name"
	echo ""

	# Check if config has entries object (multiple bundles) or single bundle
	if grep -q "const entries = {" "$config_file"; then
		# Multiple bundles case - extract from entries object
		bundle_names=$(sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP "^\s*'\K[^']+" || sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP '^\s*"\K[^"]+')
	elif grep -q "configLoader({" "$config_file"; then
		# Check if it's multiple bundles in configLoader
		if grep -A 10 "configLoader({" "$config_file" | grep -q ","; then
			# Multiple bundles in inline object - extract all
			bundle_names=$(sed -n '/configLoader({/,/},/p' "$config_file" | grep ":" | grep -oP "^\s*'?\K[^':]+" | head -20)
		else
			# Single bundle case - extract from inline object
			bundle_names=$(grep -oP "configLoader\(\{\K[^:]*" "$config_file")
		fi
	else
		print_warning "No bundle configuration found in webpack.config.js"
		print_info "  File: $config_file"
		PLUGINS_SKIPPED=$((PLUGINS_SKIPPED + 1))
		echo ""
		continue
	fi

	if [ -z "$bundle_names" ]; then
		print_warning "No bundle names found in webpack.config.js"
		print_info "  File: $config_file"
		PLUGINS_SKIPPED=$((PLUGINS_SKIPPED + 1))
		echo ""
		continue
	fi

	PLUGINS_VALIDATED=$((PLUGINS_VALIDATED + 1))
	plugin_passed=true

	# Validate each bundle
	for bundle_name in $bundle_names; do
		TOTAL_BUNDLES=$((TOTAL_BUNDLES + 1))

		# Check main bundle file (.min.js)
		bundle_file="$plugin_dir/res/dist/${bundle_name}.min.js"
		if check_file "$bundle_file" "Main bundle (${bundle_name}.min.js)" 50000; then
			# Check source map (optional)
			source_map_file="$plugin_dir/res/dist/${bundle_name}.min.js.map"
			if [ -f "$source_map_file" ]; then
				map_size=$(stat -f%z "$source_map_file" 2>/dev/null || stat -c%s "$source_map_file" 2>/dev/null || echo "0")
				print_success "Source map (${bundle_name}.min.js.map) exists (${map_size} bytes)"
			else
				print_warning "Source map (${bundle_name}.min.js.map) not found (optional)"
			fi

			# Check gzip version
			gzip_file="$plugin_dir/res/dist/${bundle_name}.min.js.gz"
			if [ -f "$gzip_file" ]; then
				gz_size=$(stat -f%z "$gzip_file" 2>/dev/null || stat -c%s "$gzip_file" 2>/dev/null || echo "0")
				if [ "$gz_size" -gt 1000 ]; then
					print_success "Gzip bundle (${bundle_name}.min.js.gz) exists (${gz_size} bytes)"
				else
					print_warning "Gzip bundle (${bundle_name}.min.js.gz) is too small (${gz_size} bytes)"
				fi
			else
				print_warning "Gzip bundle (${bundle_name}.min.js.gz) not found (optional)"
			fi

			BUNDLES_PASSED=$((BUNDLES_PASSED + 1))
		else
			# Even if gzip exists, if main bundle is missing/invalid, count as failed
			gzip_file="$plugin_dir/res/dist/${bundle_name}.min.js.gz"
			if [ -f "$gzip_file" ]; then
				gz_size=$(stat -f%z "$gzip_file" 2>/dev/null || stat -c%s "$gzip_file" 2>/dev/null || echo "0")
				print_warning "Gzip bundle (${bundle_name}.min.js.gz) exists (${gz_size} bytes) but main bundle is invalid"
			else
				print_warning "Gzip bundle (${bundle_name}.min.js.gz) also missing"
			fi
			BUNDLES_FAILED=$((BUNDLES_FAILED + 1))
			plugin_passed=false
		fi
		echo ""
	done

	# Track plugin result
	if [ "$plugin_passed" = true ]; then
		PLUGINS_PASSED=$((PLUGINS_PASSED + 1))
	else
		PLUGINS_FAILED=$((PLUGINS_FAILED + 1))
	fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Total plugins with webpack.config.js: $PLUGINS_VALIDATED"
print_info "Plugins passed: $PLUGINS_PASSED"
print_info "Plugins failed: $PLUGINS_FAILED"
print_info "Plugins skipped (no bundle config): $PLUGINS_SKIPPED"
echo ""
print_info "Total bundles found: $TOTAL_BUNDLES"
print_info "Bundles passed: $BUNDLES_PASSED"
print_info "Bundles failed: $BUNDLES_FAILED"
echo ""

if [ $VALIDATION_FAILED -eq 0 ]; then
	echo ""
	print_success "All validations passed!"
	echo ""
	exit 0
else
	echo ""
	print_error "Validation failed for $PLUGINS_FAILED plugin(s) with $BUNDLES_FAILED failed bundle(s)!"
	echo ""
	echo "To fix failed plugins, rebuild the frontend assets:"
	echo ""
	for config_file in $plugins_with_config; do
		plugin_dir=$(dirname "$config_file")
		plugin_name=$(basename "$plugin_dir")

		# Check what bundles this plugin has
		if grep -q "const entries = {" "$config_file"; then
			bundle_names=$(sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP "^\s*'\K[^']+" || sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP '^\s*"\K[^"]+')
		elif grep -q "configLoader({" "$config_file"; then
			bundle_names=$(grep -oP "configLoader\(\{\K[^:]*" "$config_file")
		fi

		plugin_needs_rebuild=false
		for bundle_name in $bundle_names; do
			bundle_file="$plugin_dir/res/dist/${bundle_name}.min.js"
			if [ ! -f "$bundle_file" ] || [ $(stat -f%z "$bundle_file" 2>/dev/null || stat -c%s "$bundle_file" 2>/dev/null || echo "0") -lt 50000 ]; then
				plugin_needs_rebuild=true
				break
			fi
		done

		if [ "$plugin_needs_rebuild" = true ]; then
			echo "  cd $plugin_dir"
			echo "  pnpm install"
			echo "  pnpm run build-prod"
			echo ""
		fi
	done
	echo "Or use npm:"
	echo ""
	for config_file in $plugins_with_config; do
		plugin_dir=$(dirname "$config_file")
		plugin_name=$(basename "$plugin_dir")

		# Check what bundles this plugin has
		if grep -q "const entries = {" "$config_file"; then
			bundle_names=$(sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP "^\s*'\K[^']+" || sed -n '/const entries = {/,/}/p' "$config_file" | grep -oP '^\s*"\K[^"]+')
		elif grep -q "configLoader({" "$config_file"; then
			bundle_names=$(grep -oP "configLoader\(\{\K[^:]*" "$config_file")
		fi

		plugin_needs_rebuild=false
		for bundle_name in $bundle_names; do
			bundle_file="$plugin_dir/res/dist/${bundle_name}.min.js"
			if [ ! -f "$bundle_file" ] || [ $(stat -f%z "$bundle_file" 2>/dev/null || stat -c%s "$bundle_file" 2>/dev/null || echo "0") -lt 50000 ]; then
				plugin_needs_rebuild=true
				break
			fi
		done

		if [ "$plugin_needs_rebuild" = true ]; then
			echo "  cd $plugin_dir"
			echo "  npm install"
			echo "  npm run build-prod"
			echo ""
		fi
	done
	exit 1
fi
