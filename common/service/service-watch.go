package service

import (
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/x/configx"
)

func registerWatchers(s Service, path string, fs []func(Service, configx.Values)) {
	w, err := config.Watch(configx.StringToKeys(path)...)
	if err != nil {
		log.Fatal(err.Error())
	}

	go func(w configx.Receiver, s Service, fs []func(Service, configx.Values)) {
		defer w.Stop()
	loop:
		for {
			select {
			case <-s.Done():
				break loop
			default:
				res, err := w.Next()
				if err != nil {
					break loop
				}
				for _, f := range fs {
					f(s, res)
				}
			}
		}
	}(w, s, fs)
}
