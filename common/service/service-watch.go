package service

import (
	"sync"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/x/configx"
)

var (
	watchOnce = &sync.Once{}
	watchers  = make(map[string][]func(configx.Values))
)

// func initWatch() {
// 	for name, fs := range watchers {
// 		fmt.Println("Watching service ", name)
// 		w, err := config.Watch("services", name)
// 		if err != nil {
// 			log.Fatal(err.Error())
// 		}

// 		go func(w configx.Receiver, fs []func(configx.Values), name string) {

// 			defer w.Stop()
// 			for {
// 				res, err := w.Next()
// 				if err != nil {
// 					break
// 				}
// 				fmt.Println(name)
// 				for _, f := range fs {
// 					f(res)
// 				}
// 			}
// 		}(w, fs, name)
// 	}
// }

func registerWatchers(serviceName string, fs []func(configx.Values)) {
	w, err := config.Watch("services", serviceName)
	if err != nil {
		log.Fatal(err.Error())
	}

	go func(w configx.Receiver, fs []func(configx.Values), name string) {

		defer w.Stop()
		for {
			res, err := w.Next()
			if err != nil {
				break
			}
			for _, f := range fs {
				f(res)
			}
		}
	}(w, fs, serviceName)
}
