package main

import (
	"fmt"
	"os"
	"strings"

	ownbleve "github.com/pydio/cells/broker/log/blevetest"
)

var (
	dStore, withMapping, boltStore, scorchStore *ownbleve.TestServer
)

const (
	// Enter the path to your audit.bleve db that you want to populate with dummy data
	workingDir = "/home/bsinou/tmp/test/bleve/2018-11-29"
	// workingDir = ""
	// Use "en" or "fr" to generate randome messages in English or French
	lang = "en"
	// Raise this if you want more events: +1 adds 1k new events, but it takes longer to index.
	loopNb = 100
	// set this flag to true to reduce the size of the sample data set
	useSmallSample = false
)

func main() {
	if workingDir == "" {
		fmt.Println("[Error] No path to working directory is defined for the various bleve server instances, aborting tests...")
		return
	}

	// lines := ownbleve.GenerateDummyData(lang, loopNb, useSmallSample)
	logFile, err := os.Open("./pydio.log")
	if err != nil {
		fmt.Println("[Error] Could not open log file: " + err.Error())
		return
	}
	lines, err := ownbleve.ParseFullFile(logFile)
	if err != nil {
		fmt.Println("[Error] Could not parse log file: " + err.Error())
		return
	}

	fmt.Printf("parsed file, nbr of line: %d\n", len(lines))

	fmt.Printf("first line: %s\n", lines[0])

	// slines := lines[0:1023]
	slines := lines

	loopNb := len(slines)/1000 + 1

	err = initialisesStores(loopNb)
	if err != nil {
		fmt.Println("[Error] Could not initialise stores: " + err.Error())
		return
	}

	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", dStore.GetName(), loopNb)
	dStore.BatchIndex(slines, 100)
	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", withMapping.GetName(), loopNb)
	withMapping.BatchIndex(slines, 100)
	// fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", boltStore.GetName(), loopNb)
	// fullPut(boltStore, boltStore.GetName(), lines)
	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", scorchStore.GetName(), loopNb)
	scorchStore.BatchIndex(slines, 100)
	// fullPut(scorchStore, scorchStore.GetName(), lines)
}

func initialisesStores(loopNb int) error {

	var err error
	sname := "defaultStore"
	path := fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, loopNb, sname)
	dStore, err = ownbleve.NewDefaultServer(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	sname = "withMappingStore"
	path = fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, loopNb, sname)
	withMapping, err = ownbleve.NewDefaultServerWithMapping(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	sname = "boltStore"
	path = fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, loopNb, sname)
	boltStore, err = ownbleve.NewServerOnBolt(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	sname = "scorchStore"
	path = fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, loopNb, sname)
	scorchStore, err = ownbleve.NewServerOnScorch(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	return nil
}

func fullPut(index *ownbleve.TestServer, sname string, lines []string) {
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if len(line) == 0 {
			continue
		}
		err := index.PutLog(ownbleve.Json2map(line))
		if err != nil {
			fmt.Printf("[ERROR] failed to put line[%d] - %s : %s \n", i, line, err.Error())
		}
		if (i+1)%100 == 0 {
			fmt.Printf("Indexing events in %s, %d done\n", sname, i+1)
		}
	}
	fmt.Printf("Index done in %s, added %d messages\n", sname, len(lines))
}
