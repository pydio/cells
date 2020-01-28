package service

import (
	"log"
	"sync"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
)

var (
	watchOnce = &sync.Once{}
	watchers  = make(map[string][]func(common.ConfigValues))
)

func initWatch() {
	watchOnce.Do(func() {
		w, err := config.Watch("services")
		if err != nil {
			log.Fatal(err)
		}

		go func() {
			for {
				res, err := w.Next()
				if err != nil {
					break
				}

				var c map[string]map[string]interface{}
				if err := res.Scan(&c); err != nil {
					continue
				}

				for name, fs := range watchers {
					for _, f := range fs {
						f(config.NewMap(c[name]))
					}
				}
			}
		}()
	})

}

func registerWatchers(serviceName string, fs []func(common.ConfigValues)) {
	initWatch()

	watchers[serviceName] = fs
}
