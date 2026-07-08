package grpc

import (
	"context"
	"slices"
	"strings"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/idm/meta"
)

// namespaces whose values are backed by entity values
var entityBackedFieldTypes = []string{"tag_cloud", "choice", "auto_complete"}

// EvResolver owns exactly one responsibility:
// keeping meta <-> entity-value links (meta_values_rel) consistent with a
// desired set of labels for a persisted meta row.
//
// Precondition: the meta already exists (real MetaUuid). Idempotent.
type EvResolver interface {
	Resolve(ctx context.Context, m *idm.UserMeta, ns *idm.UserMetaNamespace, labels []string) ([]*idm.EntityValue, error)
	Applies(ns *idm.UserMetaNamespace) bool
}

// entityBacked implements EvResolver using manager-resolved DAOs.
type entityBacked struct{}

// NewEvResolver creates the resolver (DAOs resolved at call time).
func NewEvResolver() EvResolver {
	return &entityBacked{}
}

func (r *entityBacked) Applies(ns *idm.UserMetaNamespace) bool {
	return ns != nil && slices.Contains(entityBackedFieldTypes, ns.FieldType)
}

func (r *entityBacked) Resolve(ctx context.Context, m *idm.UserMeta, ns *idm.UserMetaNamespace, labels []string) ([]*idm.EntityValue, error) {
	if !r.Applies(ns) {
		return nil, nil
	}

	// Resolve EntityValueDAO at call time
	evDAO, err := manager.Resolve[meta.EntityValueDAO](ctx, manager.WithName("meta-entity-values"))
	if err != nil {
		return nil, err
	}

	def, err := ns.UnmarshallDefinition()
	if err != nil || def == nil {
		return nil, err
	}
	entityID := def.GetEntityId()
	if entityID == "" {
		return nil, nil
	}

	// normalize desired set
	desired := map[string]struct{}{}
	for _, l := range labels {
		if l = strings.TrimSpace(l); l != "" {
			desired[l] = struct{}{}
		}
	}

	// 1. existing vocabulary for this entity
	existing, err := evDAO.GetEntityValues(ctx, entityID)
	if err != nil {
		return nil, err
	}
	byLabel := make(map[string]*idm.EntityValue, len(existing))
	for _, ev := range existing {
		byLabel[ev.Label] = ev
	}

	// 2. currently linked values for this meta
	linked, err := evDAO.GetMetaEntityValues(ctx, m.Uuid)
	if err != nil {
		return nil, err
	}
	linkedByLabel := make(map[string]*idm.EntityValue, len(linked))
	for _, ev := range linked {
		linkedByLabel[ev.Label] = ev
	}

	// 3. unlink removed
	for label, ev := range linkedByLabel {
		if _, keep := desired[label]; !keep {
			if _, e := evDAO.UnlinkMetaValue(ctx, m.Uuid, ev.Uuid); e != nil {
				return nil, e
			}
		}
	}

	// 4. create missing vocabulary
	var toCreate []*idm.EntityValue
	for label := range desired {
		if _, ok := byLabel[label]; !ok {
			toCreate = append(toCreate, &idm.EntityValue{EntityUuid: entityID, Label: label})
		}
	}
	if len(toCreate) > 0 {
		created, e := evDAO.CreateEntityValues(ctx, toCreate)
		if e != nil {
			return nil, e
		}
		// Add newly created entity values to byLabel map
		// Use the returned values directly - they have the correct UUIDs
		for _, ev := range created {
			byLabel[ev.Label] = ev
		}
	}

	// 5. link all desired (idempotent via OnConflict DoNothing in LinkMetaValue)
	var result []*idm.EntityValue
	for label := range desired {
		ev := byLabel[label]
		if ev == nil || ev.Uuid == "" {
			// Entity value not in vocabulary or has no UUID - skip
			continue
		}

		if _, e := evDAO.LinkMetaValue(ctx, m.Uuid, ev.Uuid); e != nil {
			return nil, e
		}
		result = append(result, ev)
	}

	return result, nil
}
