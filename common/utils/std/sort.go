package std

import (
	"errors"
	"fmt"
	"sort"
)

type nameable interface {
	Name() string
}

type TopologicalObject[T nameable] struct {
	Object T
	After  []string
}

func TopologicalSort[T nameable](objects []TopologicalObject[T]) ([]T, error) {
	// Map for quick lookup
	objMap := make(map[string]*TopologicalObject[T])
	for i := range objects {
		objMap[objects[i].Object.Name()] = &objects[i]
	}

	// States: 0 = unvisited, 1 = visiting, 2 = visited
	visited := make(map[string]int)
	var result []*TopologicalObject[T]

	var visit func(name string) error
	visit = func(name string) error {
		state := visited[name]
		if state == 1 {
			return errors.New("circular dependency detected at " + name)
		}
		if state == 2 {
			return nil
		}

		visited[name] = 1 // mark as visiting

		obj, ok := objMap[name]
		if !ok {
			return fmt.Errorf("missing dependency: %s", name)
		}

		// Sort dependencies for stable output
		sort.Strings(obj.After)
		for _, dep := range obj.After {
			if err := visit(dep); err != nil {
				return err
			}
		}

		visited[name] = 2 // mark as visited
		result = append(result, obj)
		return nil
	}

	for _, obj := range objects {
		if visited[obj.Object.Name()] == 0 {
			if err := visit(obj.Object.Name()); err != nil {
				return nil, err
			}
		}
	}

	// Convert result from []*Object to []Object
	sorted := make([]T, len(result))
	for i, ptr := range result {
		sorted[i] = (*ptr).Object
	}
	return sorted, nil
}
