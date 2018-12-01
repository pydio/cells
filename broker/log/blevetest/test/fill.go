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
	// Enter the path to your audit.bleve db that you want to populate
	workingDir = "/home/bsinou/tmp/test/bleve/2018-12-01"
	// workingDir = ""

	// Flags for dummy data
	// Use "en" or "fr" to generate random messages in English or French
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

	// Use dummy data
	// lines, err := generateDummyData(lang, loopNb, useSmallSample)

	// use very small log file that is in the code
	// lines, err := parseLogFile("./xs-pydio.log")

	// use legacy large file:
	// WARNING total size of generated indexes is around 3GB
	lines, err := parseLogFile("./pydio.log")

	if err != nil {
		fmt.Println("[Error] could not generated string array data to be indexed: " + err.Error() + ". aborting tests...")
		return
	}

	performIndexing(lines)
}

func parseLogFile(path string) ([]string, error) {

	logFile, err := os.Open(path)
	if err != nil {
		fmt.Println("[Error] Could not open log file: " + err.Error())
		return nil, err
	}
	lines, err := ownbleve.ParseFullFile(logFile)
	if err != nil {
		fmt.Println("[Error] Could not parse log file: " + err.Error())
		return nil, err
	}

	fmt.Printf("parsed file, nbr of line: %d\n", len(lines))
	fmt.Printf("first line: %s\n", lines[0])
	return lines, nil

}

func performIndexing(lines []string) {

	summary := make([]string, 0, 4)
	knb := len(lines)/1000 + 1

	err := initialisesStores(knb)
	if err != nil {
		fmt.Println("[Error] Could not initialise stores: " + err.Error())
		return
	}

	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", dStore.GetName(), knb)
	s, err := dStore.BatchIndex(lines, 100)
	if err != nil {
		fmt.Printf("### [Error] Indexing on %s with %dk lines failed: %s\n", dStore.GetName(), knb, err.Error())
	} else {
		summary = append(summary, s)
	}

	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", withMapping.GetName(), knb)
	s, err = withMapping.BatchIndex(lines, 100)
	if err != nil {
		fmt.Printf("### [Error] Indexing on %s with %dk lines failed: %s\n", withMapping.GetName(), knb, err.Error())
	} else {
		summary = append(summary, s)
	}

	fmt.Printf("### [Info] Launching index on %s with %dk lines.\n", scorchStore.GetName(), knb)
	s, err = scorchStore.BatchIndex(lines, 100)
	if err != nil {
		fmt.Printf("### [Error] Indexing on %s with %dk lines failed: %s\n", scorchStore.GetName(), knb, err.Error())
	} else {
		summary = append(summary, s)
	}

	// Print full summary
	fmt.Printf("\n\t################## Full summary ####################\n")
	fmt.Println("")
	fmt.Println(strings.Join(summary, "\n"))
	fmt.Println("")
}

func initialisesStores(knb int) error {

	var err error
	sname := "defaultStore"
	path := fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, knb, sname)
	dStore, err = ownbleve.NewDefaultServer(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	sname = "withMapping"
	path = fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, knb, sname)
	withMapping, err = ownbleve.NewDefaultServerWithMapping(path, sname)
	if err != nil {
		return fmt.Errorf("fail to create %s index, cause: %s", sname, err.Error())
	}

	sname = "scorchStore"
	path = fmt.Sprintf("%s/test-%dk-%s.bleve", workingDir, knb, sname)
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
