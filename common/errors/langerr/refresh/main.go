package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
)

type Entry struct {
	Other string `json:"other"`
}

func main() {
	bb, er := os.ReadFile("../box/en-us.all.json")
	if er != nil {
		panic(er)
	}
	var keys map[string]Entry
	if er = json.Unmarshal(bb, &keys); er != nil {
		panic(er)
	}

	cc, er := os.ReadFile("../../api-codes.go")
	if er != nil {
		panic(er)
	}
	scanner := bufio.NewScanner(bytes.NewReader(cc))
	matcher, er := regexp.Compile(`^\s(\w+)\s+ApiCode\s+=\s+"([^"]+)"$`)
	if er != nil {
		panic(er)
	}
	var added int
	for scanner.Scan() {
		line := scanner.Text()
		if matches := matcher.FindStringSubmatch(line); matches != nil {
			//fmt.Println(matches[0])
			//fmt.Println(matches[1])
			varName := "error." + matches[2]
			if _, ok := keys[varName]; !ok {
				keys[varName] = Entry{Other: ""}
				added++
			}
		}
	}
	if added > 0 {
		newBB, _ := json.MarshalIndent(keys, "", "  ")
		if er = os.WriteFile("../box/en-us.all.json", newBB, 0666); er != nil {
			panic(er)
		}
		fmt.Println("Added", added, "new strings")
	} else {
		fmt.Println("No new strings added")
	}
}
