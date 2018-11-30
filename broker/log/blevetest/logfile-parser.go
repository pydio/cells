package blevetest

import (
	"bufio"
	"bytes"
	"io"
	"os"
)

func ParseFullFile(file *os.File) ([]string, error) {

	// reader := bufio.NewReader(file)
	// lineNb, err := lineCounter(reader)
	// if err != nil {
	// 	return nil, err
	// }

	lines := make([]string, 0, 1024)
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		lines = append(lines, line)
	}
	err := scanner.Err()
	return lines, err
}

// Fast count of file lines, thanks to https://stackoverflow.com/questions/25677235/golang-create-a-io-reader-from-a-local-file
func lineCounter(r io.Reader) (int, error) {
	buf := make([]byte, 32*1024)
	count := 0
	lineSep := []byte{'\n'}

	for {
		c, err := r.Read(buf)
		count += bytes.Count(buf[:c], lineSep)

		switch {
		case err == io.EOF:
			return count, nil

		case err != nil:
			return count, err
		}
	}
}
