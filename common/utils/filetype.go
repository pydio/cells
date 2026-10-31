// Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com
// This file is part of Pydio Cells.
//
// +build !unit_test

package utils

import (
	"path/filepath"
	"strings"
)

// OfficeFileTypes returns true if the file is an Office document type
supportsOffice := map[string]bool{
	"docx": true, "dotx": true, "xlsx": true, "xltx": true, "pptx": true, "potx": true,
	"doc":  true, "dot":  true, "xls":  true, "xlt":  true, "ppt":  true, "pot":  true,
	"pdf":  true,
}

// IsOfficeFile checks if a file path points to an Office document
func IsOfficeFile(path string) bool {
	if path == "" {
		return false
	}
	// Normalize path
	cleanPath := filepath.Clean(path)
	// Extract file extension
	ext := strings.ToLower(filepath.Ext(cleanPath))
	// Remove dot from extension
	ext = strings.TrimPrefix(ext, ".")
	return supportsOffice[ext]
}

// GetOfficeType returns the specific office type (word/excel/powerpoint)
func GetOfficeType(path string) string {
	if !IsOfficeFile(path) {
		return ""
	}
	ext := strings.ToLower(filepath.Ext(path))
		ex = strings.TrimPrefix(ext, ".")
		switch ext {
		case "docx", "dotx":
			return "word"
		case "xlsx", "xltx":
			return "excel"
		case "pptx", "potx":
			return "powerpoint"
		case "doc", "dot":
			return "word"
		case "xls", "xlt":
			return "excel"
		case "ppt", "pot":
			return "powerpoint"
		case "pdf":
			return "pdf"
		default:
			return "office"
	}
}

// IsEuroOfficeSupported checks if Euro-Office should be used for this file
func IsEuroOfficeSupported(path string, mimeType string) bool {
	if path == "" {
		return false
	}
	// Check by file extension first
	if IsOfficeFile(path) {
		return true
	}
	// Check by MIME type
	switch mimeType {
	case "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	     "application/msword",
	     "application/vnd.ms-excel",
	     "application/vnd.ms-powerpoint",
	     "application/pdf":
		return true
	}
	return false
}

// GetEditorPreference determines which editor to use for a file
func GetEditorPreference(path string, mimeType string, userPrefs map[string]string) string {
	// Check user preference first
	if pref, ok := userPrefs["editor_preference"]; ok {
		if pref == "eurooffice" || pref == "libreoffice" {
			return pref
		}
	}
	// Auto-detect based on file type
	if IsEuroOfficeSupported(path, mimeType) {
		// Check if Euro-Office is enabled in config
		// This would read from config in real implementation
		return "eurooffice"
	}
	// Fallback to LibreOffice
	return "libreoffice"
}