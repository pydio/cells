package main

import (
	"fmt"
	"context"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/utils/kv"
)

func main() {
	// Use the mock store for testing
	store := kv.New(kv.WithJSON())

	// Register the OAuth connectors
	auth.RegisterConnectorType("google", func(_ proto.Message) (auth.Opener, error) {
		return &auth.googleConfig{}, nil
	})
	auth.RegisterConnectorType("github", func(_ proto.Message) (auth.Opener, error) {
		return &auth.githubConfig{}, nil
	})

	// Scan connectors
	connectors, err := auth.ScanConnectors(context.Background(), store)
	if err != nil {
		fmt.Println("Error scanning connectors:", err)
		return
	}

	fmt.Printf("Found %d connectors:\n", len(connectors))
	for _, c := range connectors {
		fmt.Printf("  ID: %s, Name: %s, Type: %s\n", c.ID(), c.Name(), c.Type())
	}
}