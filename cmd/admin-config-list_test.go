package cmd

import (
	"bytes"
	"strings"
	"testing"

	"github.com/olekukonko/tablewriter"
)

func TestDisplayMapHandlesMixedDepthAndValueTypes(t *testing.T) {
	var out bytes.Buffer
	table := tablewriter.NewWriter(&out)
	table.SetHeader([]string{"Path", "Value"})

	displayMap(table, map[string]interface{}{
		"bool": true,
		"nested": map[string]interface{}{
			"value": "configured",
		},
		"number": float64(42),
		"slice":  []interface{}{"a", float64(1)},
	}, "root")

	table.Render()
	rendered := out.String()

	for _, expected := range []string{
		"root/bool",
		"true",
		"root/nested/value",
		"configured",
		"root/number",
		"42",
		"root/slice",
		`["a",1]`,
	} {
		if !strings.Contains(rendered, expected) {
			t.Fatalf("expected rendered table to contain %q, got:\n%s", expected, rendered)
		}
	}
}
