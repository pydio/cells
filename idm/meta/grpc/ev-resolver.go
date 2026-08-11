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

// EvResolver keeps meta ↔ entity-value links (meta_values_rel) consistent
// with a desired set of labels for a persisted meta row.
//
// Precondition: the meta already exists (real MetaUuid). All operations are idempotent.
type EvResolver interface {
	// Resolve detaches removed labels, creates missing vocabulary, and links
	// desired labels — all in a single pass with one DAO resolution.
	// Used in the PUT path.
	Resolve(ctx context.Context, m *idm.UserMeta, ns *idm.UserMetaNamespace, labels []string) ([]*idm.EntityValue, error)
	// Detach unlinks entity values not present in labels. Empty/nil labels = unlink all.
	// Used standalone in the DELETE path.
	Detach(ctx context.Context, m *idm.UserMeta, labels []string) error

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

// normalizeLabels trims whitespace and deduplicates, dropping empty entries.
func normalizeLabels(labels []string) map[string]struct{} {
	out := make(map[string]struct{}, len(labels))
	for _, l := range labels {
		if l = strings.TrimSpace(l); l != "" {
			out[l] = struct{}{}
		}
	}
	return out
}

func (r *entityBacked) Resolve(ctx context.Context, m *idm.UserMeta, ns *idm.UserMetaNamespace, labels []string) ([]*idm.EntityValue, error) {
	if !r.Applies(ns) {
		return nil, nil
	}

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

	desired := normalizeLabels(labels)

	// Fetch currently linked values once — reused for both detach and link-skip.
	linked, err := evDAO.GetMetaEntityValues(ctx, m.Uuid)
	if err != nil {
		return nil, err
	}

	// Detach: unlink values no longer desired, and record what is still linked.
	alreadyLinked := make(map[string]struct{}, len(linked))
	for _, ev := range linked {
		if _, keep := desired[ev.Label]; !keep {
			if _, err := evDAO.UnlinkMetaValue(ctx, m.Uuid, ev.Uuid); err != nil {
				return nil, err
			}
		} else {
			alreadyLinked[ev.Label] = struct{}{}
		}
	}

	if len(desired) == 0 {
		return nil, nil
	}

	// Fetch existing vocabulary for this entity.
	existing, err := evDAO.GetEntityValues(ctx, entityID)
	if err != nil {
		return nil, err
	}
	byLabel := make(map[string]*idm.EntityValue, len(existing))
	for _, ev := range existing {
		byLabel[ev.Label] = ev
	}

	// Create vocabulary entries that don't exist yet.
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

		for _, ev := range created {
			byLabel[ev.Label] = ev
		}
	}

	// Link desired values, skipping those that are already linked.
	var result []*idm.EntityValue
	for label := range desired {
		ev := byLabel[label]
		if ev == nil || ev.Uuid == "" {
			continue
		}

		if _, linked := alreadyLinked[label]; !linked {
			if _, e := evDAO.LinkMetaValue(ctx, m.Uuid, ev.Uuid); e != nil {
				return nil, e
			}
		}
		result = append(result, ev)
	}

	return result, nil
}

func (r *entityBacked) Detach(ctx context.Context, m *idm.UserMeta, labels []string) error {
	evDAO, err := manager.Resolve[meta.EntityValueDAO](ctx, manager.WithName("meta-entity-values"))
	if err != nil {
		return err
	}

	linked, err := evDAO.GetMetaEntityValues(ctx, m.Uuid)
	if err != nil {
		return err
	}

	// Build the set of labels that should remain linked.
	// An empty/nil labels slice means "keep nothing" — all links are removed.
	keepLabels := normalizeLabels(labels)

	for _, ev := range linked {
		if _, keep := keepLabels[ev.Label]; !keep {
			if _, err := evDAO.UnlinkMetaValue(ctx, m.Uuid, ev.Uuid); err != nil {
				return err
			}
		}
	}

	return nil
}
