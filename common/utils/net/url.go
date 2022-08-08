package net

import (
	"net/url"
	"path"
)

func URLJoin(base string, join string) (string, error) {
	u, err := url.Parse(base)
	if err != nil {
		return "", err
	}

	j, err := url.Parse(join)
	if err != nil {
		return "", err
	}

	u.Path = path.Join(u.Path, j.Path)
	q := u.Query()
	for key, val := range j.Query() {
		for _, v := range val {
			q.Add(key, v)
		}
	}

	u.RawQuery = q.Encode()

	return u.String(), nil
}
