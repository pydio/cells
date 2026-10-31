package main

import (
	"fmt"
	"github.com/pydio/cells/v5/common/auth"
	"golang.org/x/net/context"
)

func main() {
	// Test connector registration
	connectors := auth.ScanConnectors(context.Background())
	fmt.Printf("Found %d connectors:\n", len(connectors))
	for _, c := range connectors {
		fmt.Printf("  - %s (%s)\n", c.ID(), c.Name())
	}
}