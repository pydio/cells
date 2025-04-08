package file

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/bep/debounce"
	"github.com/fsnotify/fsnotify"
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

	clone := func(config.Store) config.Store {
		return base
	}

	/* Create new watcher.
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}*/

	f := &fileStore{
		fs:    afero.NewOsFs(),
		path:  u.Path,
		Store: base,
		clone: clone,
		// watcher: watcher,
	}

	if err := f.reload(); err != nil {
		return nil, err
	}

	/*if err := f.watch(); err != nil {
		return nil, err
	}*/

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
	watcher *fsnotify.Watcher

	clone func(config.Store) config.Store
}

func (f *fileStore) watch() error {

	db := debounce.New(1 * time.Second)
	// Start listening for events.
	go func() {
		for {
			select {
			case event, ok := <-f.watcher.Events:
				if !ok {
					fmt.Println("Returning")
					return
				}
				if event.Has(fsnotify.Create) && event.Name == f.path {
					db(func() {
						f.reload()
					})
				}
			case err, ok := <-f.watcher.Errors:
				if !ok {
					fmt.Println("Returning")

					return
				}
				log.Println("error:", err)
			}
		}
	}()

	return f.watcher.Add(filepath.Dir(f.path))
}

func (f *fileStore) reload() error {
	var a any
	b, err := filex.Read(f.path)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return err
	}

	if len(b) > 0 {
		if err := json.Unmarshal(b, &a); err != nil {
			fmt.Println("Error unmarshalling file:", err)
			return err
		}

		if err := f.Store.Set(nil); err != nil {
			return err
		}

		if err := f.Store.Set(a); err != nil {
			return err
		}
	}

	return nil
}

func (f *fileStore) Close(ctx context.Context) error {
	if err := f.watcher.Close(); err != nil {
		return err
	}
	return f.Store.Close(ctx)
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
