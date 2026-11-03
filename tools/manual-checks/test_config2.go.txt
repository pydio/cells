package main

import (
	"fmt"
	"os"
	"gopkg.in/yaml.v3"
)

func main() {
	// Load OAuth config
	file, err := os.Open("common/config/oauth-config.yaml")
	if err != nil {
		fmt.Println("Error opening config:", err)
		return
	}
	defer file.Close()

	// Read raw YAML
	data, err := os.ReadFile("common/config/oauth-config.yaml")
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}
	fmt.Println("Raw YAML content:")
	fmt.Println(string(data))

	// Try different struct definitions
	var raw map[string]interface{}
	if err := yaml.Unmarshal(data, &raw); err != nil {
		fmt.Println("Error unmarshaling raw:", err)
		return
	}
	fmt.Println("Top-level keys:")
	for k := range raw {
		fmt.Println("  ", k)
	}

	// Check services section
	if services, ok := raw["services"]; ok {
		fmt.Println("Services found!")
		servicesMap, ok := services.(map[string]interface{})
		if ok {
			if oauth, ok := servicesMap["pydio.web.oauth"]; ok {
				oauthMap, ok := oauth.(map[string]interface{})
				if ok {
					fmt.Println("OAuth config found!")
					if connectors, ok := oauthMap["connectors"]; ok {
						fmt.Printf("Connectors: %+v\n", connectors)
					}
				}
			}
		}
	}
}