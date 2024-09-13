package config

import (
	"context"
	"net/url"
	"strings"

	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

// ReferencePoolOptionsFromURL returns the options needed to set multiple reference pool
// in a config store based on the store url
//
// eg. for a url mem://?pools=(urlencoded:rp=file:///tmp/example.json)
// it will open the config file:///tmp/example.json every time the reference pool rp is mentionned
// in the mem:// store
func ReferencePoolOptionsFromURL(ctx context.Context, u *url.URL) (opts []configx.Option) {
	if pools := u.Query().Get("pools"); pools != "" {
		rps := strings.Split(pools, "&")
		for _, rp := range rps {
			kv := strings.SplitN(rp, "=", 2)

			rp, _ := openurl.OpenPool(ctx, []string{kv[1]}, func(ctx context.Context, u string) (configx.Values, error) {
				st, err := OpenStore(ctx, u)
				if err != nil {
					return nil, err
				}

				return st.Val(), nil
			})

			opts = append(opts, configx.WithReferencePool(kv[0], rp))
		}
	}

	return opts
}
