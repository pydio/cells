// +build ignore

package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

// tool to generate the go generate commands

var excludeAlgorithms = map[string]struct{}{
	"german2":         struct{}{},
	"kraaij_pohlmann": struct{}{},
	"lovins":          struct{}{},
}

func main() {
	flag.Parse()

	if flag.NArg() < 1 {
		log.Fatal("must specify algorithms directory")
	}

	files, err := ioutil.ReadDir(flag.Arg(0))
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		if _, ok := excludeAlgorithms[file.Name()]; ok {
			continue
		}
		if _, err = os.Stat(filepath.Join(flag.Arg(0), file.Name(), "stem_Unicode.sbl")); err == nil {
			fmt.Printf("//go:generate $SNOWBALL/snowball $SNOWBALL/algorithms/%s/stem_Unicode.sbl -go -o %s/%s_stemmer -gop %s -gor github.com/blevesearch/snowballstem\n",
				file.Name(), file.Name(), file.Name(), file.Name())
		} else if _, err = os.Stat(filepath.Join(flag.Arg(0), file.Name(), "stem_ISO_8859_1.sbl")); err == nil {
			fmt.Printf("//go:generate $SNOWBALL/snowball $SNOWBALL/algorithms/%s/stem_ISO_8859_1.sbl -go -o %s/%s_stemmer -gop %s -gor github.com/blevesearch/snowballstem\n",
				file.Name(), file.Name(), file.Name(), file.Name())
		}
		fmt.Printf("//go:generate gofmt -s -w %s/%s_stemmer.go\n",
			file.Name(), file.Name())
		fmt.Println()
	}
}
