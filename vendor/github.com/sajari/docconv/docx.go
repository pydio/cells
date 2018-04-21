package docconv

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"regexp"
	"time"
)

// ConvertDocx converts an MS Word docx file to text.
func ConvertDocx(r io.Reader) (string, map[string]string, error) {
	meta := make(map[string]string)
	var textHeader, textBody, textFooter string

	b, err := ioutil.ReadAll(r)
	if err != nil {
		return "", nil, err
	}
	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if err != nil {
		return "", nil, fmt.Errorf("error unzipping data: %v", err)
	}

	// Regular expression for XML files to include in the text parsing
	reHeaderFile, _ := regexp.Compile("^word/header[0-9]+.xml$")
	reFooterFile, _ := regexp.Compile("^word/footer[0-9]+.xml$")

	for _, f := range zr.File {
		switch {
		case f.Name == "docProps/core.xml":
			rc, err := f.Open()
			if err != nil {
				return "", nil, fmt.Errorf("error opening '%v' from archive: %v", f.Name, err)
			}
			defer rc.Close()

			meta, err = XMLToMap(rc)
			if err != nil {
				return "", nil, fmt.Errorf("error parsing '%v': %v", f.Name, err)
			}

			if tmp, ok := meta["modified"]; ok {
				if t, err := time.Parse(time.RFC3339, tmp); err == nil {
					meta["ModifiedDate"] = fmt.Sprintf("%d", t.Unix())
				}
			}
			if tmp, ok := meta["created"]; ok {
				if t, err := time.Parse(time.RFC3339, tmp); err == nil {
					meta["CreatedDate"] = fmt.Sprintf("%d", t.Unix())
				}
			}

		case f.Name == "word/document.xml":
			textBody, err = parseDocxText(f)
			if err != nil {
				return "", nil, err
			}

		case reHeaderFile.MatchString(f.Name):
			header, err := parseDocxText(f)
			if err != nil {
				return "", nil, err
			}
			textHeader += header + "\n"

		case reFooterFile.MatchString(f.Name):
			footer, err := parseDocxText(f)
			if err != nil {
				return "", nil, err
			}
			textFooter += footer + "\n"
		}
	}

	return textHeader + "\n" + textBody + "\n" + textFooter, meta, nil
}

func parseDocxText(f *zip.File) (string, error) {
	r, err := f.Open()
	if err != nil {
		return "", fmt.Errorf("error opening '%v' from archive: %v", f.Name, err)
	}
	defer r.Close()

	text, err := DocxXMLToText(r)
	if err != nil {
		return "", fmt.Errorf("error parsing '%v': %v", f.Name, err)
	}
	return text, nil
}

// DocxXMLToText converts Docx XML into plain text.
func DocxXMLToText(r io.Reader) (string, error) {
	return XMLToText(r, []string{"br", "p", "tab"}, []string{"instrText", "script"}, true)
}
