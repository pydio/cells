package redis

import (
	"net/url"

	"github.com/go-redis/redis/v8"
)

var (
	clients = make(map[string]*redis.Client)
)

func NewClient(u *url.URL) *redis.Client {
	str := u.User.String() + "@" + u.Host
	cli, ok := clients[str]
	if ok {
		return cli
	}

	pwd, _ := u.User.Password()
	cli = redis.NewClient(&redis.Options{
		Addr:     u.Host,
		Username: u.User.Username(),
		Password: pwd,
	})

	clients[str] = cli
	return cli
}
