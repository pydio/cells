package main

import (
	"fmt"
	"os"
	"gopkg.in/yaml.v3"
)

type OAuthConfig struct {
	Connectors    []struct {
		ID   string `yaml:"id"`
		Name string `yaml:"name"`
		Type string `yaml:"type"`
	} `yaml:"connectors"`
	StaticClients []struct {
		ClientID string `yaml:"client_id"`
	} `yaml:"staticClients"`
}

func main() {
	// Load OAuth config
	file, err := os.Open("common/config/oauth-config.yaml")
	if err != nil {
		fmt.Println("Error opening config:", err)
		return
	}
	defer file.Close()

	var cfg OAuthConfig
	if err := yaml.NewDecoder(file).Decode(&cfg); err != nil {
		fmt.Println("Error decoding YAML:", err)
		return
	}

	fmt.Printf("Loaded %d connectors:\n", len(cfg.Connectors))
	for _, c := range cfg.Connectors {
		fmt.Printf("  - %s (%s) - type: %s\n", c.ID, c.Name, c.Type)
	}

	fmt.Printf("Loaded %d OAuth clients:\n", len(cfg.StaticClients))
	for _, c := range cfg.StaticClients {
		fmt.Printf("  - %s\n", c.ClientID)
	}
}