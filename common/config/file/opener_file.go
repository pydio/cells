package file

import (
	"context"
	"errors"
	"net/url"
	"os"
	"path/filepath"

	"github.com/spf13/afero"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/filex"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

const (
	fileScheme = "file"
)

func init() {
	config.DefaultURLMux().Register(fileScheme, &FileOpener{})
}

type FileOpener struct{}

func (o *FileOpener) Open(ctx context.Context, urlstr string, base config.Store) (config.Store, error) {

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	var a any
	b, err := filex.Read(u.Path)
	if err != nil {
		return nil, err
	}

	if len(b) > 0 {
		if err := json.Unmarshal(b, &a); err != nil {
			return nil, err
		}

		if err := base.Set(a); err != nil {
			return nil, err
		}
	}

	clone := func(config.Store) config.Store {
		return base
	}

	return &fileStore{
		fs:    afero.NewOsFs(),
		path:  u.Path,
		Store: base,
		clone: clone,
	}, nil
}

type fileStore struct {
	fs   afero.Fs
	path string
	config.Store

	clone func(config.Store) config.Store
}

func (f *fileStore) Save(a string, b string) error {
	v := f.Store.Val().Get()

	c, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}

	if err := f.fs.MkdirAll(filepath.Dir(f.path), os.ModePerm); err != nil {
		return err
	}

	fh, err := f.fs.OpenFile(f.path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}

	n, err := fh.Write(c)
	if err != nil {
		return err
	}

	if n == 0 {
		return errors.New("no bytes written")
	}

	return nil
}
