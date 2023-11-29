package runtime

import (
	"cmp"
	"fmt"
	"slices"
)

type envVar struct {
	key, description, def string
	isBool                bool
}

var (
	ee []envVar
)

// RegisterEnvVariable can be called by any contributor to declare environment variables for documentation purpose
func RegisterEnvVariable(key, def, description string, isBool ...bool) {
	ib := false
	if len(isBool) > 0 {
		ib = isBool[0]
	}
	ee = append(ee, envVar{
		key:         key,
		def:         def,
		description: description,
		isBool:      ib,
	})
}

func DocRegisteredEnvVariables(excludes ...string) string {
	slices.SortStableFunc(ee, func(a, b envVar) int {
		return cmp.Compare(a.key, b.key)
	})
	s := ""
	for _, v := range ee {
		if slices.Contains(excludes, v.key) {
			continue
		}
		var def string
		if v.def != "" {
			def = " (" + v.def + ")"
		} else if v.isBool {
			def = " (false)"
		}
		s += fmt.Sprintf("  - %s%s: %s\n", v.key, def, v.description)
	}
	return s
}
