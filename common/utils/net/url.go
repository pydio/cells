package net

import (
	"github.com/pydio/cells/v4/common/utils/configx"
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

func URLToConfig(u *url.URL) (configx.Values, error) {
	c := configx.New()

	c.Val("server").Set(u.Hostname())
	c.Val("port").Set(u.Port())
	c.Val("path").Set(u.EscapedPath())
	c.Val("scheme").Set(u.Scheme)
	if u.User != nil {
		auth := c.Val("auth")
		auth.Val("user").Set(u.User.Username())
		if pwd, ok := u.User.Password(); ok {
			auth.Val("password").Set(pwd)
		}
	}

	// TODO ? TLS

	return c, nil
}
