package service

import (
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/x/configx"
	"time"
)

func registerWatchers(s Service, path string, fs []func(Service, configx.Values)) {
	go func(s Service, fs []func(Service, configx.Values)) {
		for {
			w, err := config.Watch(configx.StringToKeys(path)...)
			if err != nil {
				time.Sleep(1 * time.Second)
				continue
			}

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

			w.Stop()
			time.Sleep(1 * time.Second)
		}
	}(s, fs)
}
