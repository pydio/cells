package micro

import "github.com/pydio/go-os/config"

// wrapper around micro config that rewrites to the source if possible
type writableConfig struct {
	config.Config
}

// Sets internal cached value
func (w *writableConfig) Set(val interface{}, path ...string) {
	w.Config.Set(val, path...)

	b := w.Config.Bytes()

	// Setting data in all sources available if we have write access
	for _, source := range w.Config.Options().Sources {
		sw, ok := source.(Writer)
		if ok {
			sw.Write(&config.ChangeSet{Data: b})
		}
	}
}

// Deletes internal cached value
func (w *writableConfig) Del(path ...string) {
	w.Config.Del(path...)

	b := w.Config.Bytes()

	// Setting data in all sources available if we have write access
	for _, source := range w.Config.Options().Sources {
		sw, ok := source.(Writer)
		if ok {
			sw.Write(&config.ChangeSet{Data: b})
		}
	}
}
