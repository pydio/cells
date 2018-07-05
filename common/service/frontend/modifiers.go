package frontend

import "context"

type RegistryModifier func(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error

var (
	modifiers []RegistryModifier
)

func RegisterRegModifier(modifier RegistryModifier) {
	modifiers = append(modifiers, modifier)
}

func ApplyRegModifiers(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error {

	for _, m := range modifiers {
		if e := m(ctx, status, registry); e != nil {
			return e
		}
	}

	return nil
}
