package manager

import (
	"bytes"
	"fmt"
	"strings"

	yaml "gopkg.in/yaml.v3"
)

// patchYaml applies keyPair mods to a yaml, keeping all YAML specific formatting (comments, anchors, etc.)
func patchYaml(yamlStr string, pairs []keyPair) (string, error) {
	n, er := readYAML(yamlStr)
	if er != nil {
		return "", er
	}
	for _, pair := range pairs {
		path := strings.Split(pair.key, "/")
		if er = updateYAML(n.Content[0], path, pair.val); er != nil {
			return "", er
		}
	}
	return writeYAML(n)
}

// Load and parse the YAML data into a yaml.Node
func readYAML(yamlString string) (*yaml.Node, error) {
	decoder := yaml.NewDecoder(strings.NewReader(yamlString))
	var rootNode yaml.Node
	err := decoder.Decode(&rootNode)
	if err != nil {
		return nil, err
	}
	return &rootNode, nil
}

// Traverses the node tree to find and update a specific key
func updateYAML(node *yaml.Node, path []string, newValue string) error {
	// Base case: if we have reached the end of the path
	if len(path) == 0 {
		return fmt.Errorf("path is empty")
	}

	// Iterate over the node content to find the key
	for i := 0; i < len(node.Content)-1; i += 2 {
		keyNode := node.Content[i]
		valueNode := node.Content[i+1]

		// Check if the current key matches the desired path part
		if keyNode.Value == path[0] {
			// If this is the last part of the path, update the value
			if len(path) == 1 {
				// Update the value of the node
				valueNode.Value = newValue
				return nil
			}

			// If it's not the last part, keep traversing into the next level
			if valueNode.Kind == yaml.MappingNode {
				return updateYAML(valueNode, path[1:], newValue)
			}
		}
	}

	return fmt.Errorf("path not found")
}

// Write the modified YAML tree back to a file
func writeYAML(rootNode *yaml.Node) (string, error) {
	out := bytes.NewBuffer(nil)
	encoder := yaml.NewEncoder(out)
	encoder.SetIndent(2) // optional, to set the indentation level
	if err := encoder.Encode(rootNode); err != nil {
		return "", err
	}
	return out.String(), nil
}
