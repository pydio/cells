package main

import (
	"log"

	"github.com/pydio/go-phpfpm-detect/fpm"
	"github.com/kardianos/osext"
)

func main() {

	configs, e := fpm.DetectFpmInfos()
	if e != nil {
		log.Fatal(e)
	}
	folder, _ := osext.ExecutableFolder()
	fpm.DetectPhpInfos(configs, folder)
	log.Println("Detected Configs")
	log.Println(configs)

}