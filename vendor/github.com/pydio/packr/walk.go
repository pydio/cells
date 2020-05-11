package packr

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/gobuffalo/packd"
)

type WalkFunc = packd.WalkFunc

// Walk will traverse the box and call the WalkFunc for each file in the box/folder.
func (b Box) Walk(wf WalkFunc) error {

	if _, o1, _ := GetBox(b.Path); !o1 {
		if l, o2 := loaders[b.Path]; o2 {
			l()
		}
	}

	box, o, lock := GetBox(b.Path)
	if !o {
		base, err := filepath.EvalSymlinks(filepath.Join(b.callingDir, b.Path))
		if err != nil {
			return err
		}
		return filepath.Walk(base, func(path string, info os.FileInfo, err error) error {
			cleanName, err := filepath.Rel(base, path)
			if err != nil {
				cleanName = strings.TrimPrefix(path, base)
			}
			cleanName = filepath.ToSlash(filepath.Clean(cleanName))
			cleanName = strings.TrimPrefix(cleanName, "/")
			cleanName = filepath.FromSlash(cleanName)
			if info == nil || info.IsDir() {
				return nil
			}

			file, err := fileFor(path, cleanName)
			if err != nil {
				return err
			}
			return wf(cleanName, file)
		})
	}
	lock.Lock()
	defer lock.Unlock()
	for n := range box {
		f, err := b.find(n, true)
		if err != nil {
			return err
		}
		err = wf(n, f)
		if err != nil {
			return err
		}
	}
	return nil
}

// WalkPrefix will call box.Walk and call the WalkFunc when it finds paths that have a matching prefix
func (b Box) WalkPrefix(prefix string, wf WalkFunc) error {
	opre := osPath(prefix)
	return b.Walk(func(path string, f File) error {
		if strings.HasPrefix(osPath(path), opre) {
			if err := wf(path, f); err != nil {
				return err
			}
		}
		return nil
	})
}
