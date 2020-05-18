package models

type MergeOptions struct {
	SyncType   MergeSyncType
	Origin     string
	AuthSource string
	RolePrefix string
}

type MergeSyncType int

const (
	FULLSYNC MergeSyncType = iota
	CREATEONLYSYNC
	NODELETESYNC
)

func (m *MergeOptions) ToMap() map[string]string {
	// Transform options to map[string]string
	options := make(map[string]string)
	if m.Origin != "" {
		options["Origin"] = m.Origin
	}
	if m.AuthSource != "" {
		options["AuthSource"] = m.AuthSource
	}
	if m.RolePrefix != "" {
		options["RolePrefix"] = m.RolePrefix
	}
	return options
}
