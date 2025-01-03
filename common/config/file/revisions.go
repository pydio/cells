package file

import (
	"path/filepath"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/revisions"
	"github.com/pydio/cells/v5/common/utils/filex"
)

// AsRevisionsStore implements RevisionsProvider interface
func (f *fileStore) AsRevisionsStore(oo ...config.RevisionsStoreOption) (config.Store, revisions.Store) {
	opt := &config.RevisionsStoreOptions{}
	for _, o := range oo {
		o(opt)
	}

	revPath := filepath.Dir(f.path)
	// Create store
	var rs revisions.Store
	if opt.Debounce > 0 {
		rs = filex.NewRevisionsStore(revPath, opt.Debounce)
	} else {
		rs = filex.NewRevisionsStore(revPath)
	}
	// Wrap current store and return
	nf := config.NewVersionStore(rs, f)
	return nf, rs
}
