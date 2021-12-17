module github.com/pydio/cells

go 1.14

replace github.com/pydio/packr v1.30.1 => github.com/gobuffalo/packr v1.30.1

replace github.com/nats-io/nats v1.1.10 => github.com/nats-io/nats.go v1.1.10

require (
	github.com/allegro/bigcache v1.2.1
	github.com/beevik/ntp v0.2.0
	github.com/blevesearch/bleve v1.0.14
	github.com/caddyserver/caddy v1.0.5
	github.com/coreos/etcd v3.3.25+incompatible // indirect
	github.com/dchest/uniuri v0.0.0-20200228104902-7aecb25e1fe5
	github.com/emicklei/go-restful v2.15.0+incompatible
	github.com/go-log/log v0.2.0 // indirect
	github.com/go-sql-driver/mysql v1.5.0
	github.com/gobwas/glob v0.2.3
	github.com/gogo/protobuf v1.3.1
	github.com/golang/protobuf v1.4.3
	github.com/google/uuid v1.1.2
	github.com/gorilla/securecookie v1.1.1
	github.com/gorilla/sessions v1.2.0
	github.com/grpc-ecosystem/grpc-gateway v1.9.5
	github.com/gyuho/goraph v0.0.0-20171001060514-a7a4454fd3eb
	github.com/hashicorp/go-version v1.2.1
	github.com/hashicorp/raft v1.2.0
	github.com/jaytaylor/go-hostsfile v0.0.0-20201026230151-f581673a59cf
	github.com/jinzhu/copier v0.1.0
	github.com/jmoiron/sqlx v1.2.0
	github.com/json-iterator/go v1.1.10
	github.com/krolaw/zipstream v0.0.0-20180621105154-0a2661891f94
	github.com/lucas-clemente/quic-go v0.19.3 // indirect
	github.com/magiconair/properties v1.8.4 // indirect
	github.com/micro/go-log v0.1.0
	github.com/micro/go-micro v1.18.0
	github.com/micro/go-plugins/broker/nats v0.0.0-20200119172437-4fe21aa238fd
	github.com/micro/go-plugins/registry/nats v0.0.0-20200119172437-4fe21aa238fd
	github.com/micro/go-plugins/transport/grpc v0.0.0-20200119172437-4fe21aa238fd
	github.com/micro/go-web v1.0.0 // indirect
	github.com/micro/protobuf v0.0.0-20180321161605-ebd3be6d4fdb
	github.com/micro/util v0.2.0
	github.com/miekg/dns v1.1.35 // indirect
	github.com/minio/minio-go v6.0.14+incompatible // indirect
	github.com/mitchellh/hashstructure v1.1.0 // indirect
	github.com/mitchellh/mapstructure v1.4.0
	github.com/mwitkow/go-proto-validators v0.3.2
	github.com/nats-io/gnatsd v1.4.1
	github.com/nats-io/jwt v1.2.2 // indirect
	github.com/nats-io/nats.go v1.10.0 // indirect
	github.com/nicksnyder/go-i18n v1.10.1
	github.com/ory/fosite v0.36.0
	github.com/ory/hydra v1.8.5
	github.com/ory/ladon v1.2.0
	github.com/ory/x v0.0.171
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/pborman/uuid v1.2.1
	github.com/pelletier/go-toml v1.8.1 // indirect
	github.com/philopon/go-toposort v0.0.0-20170620085441-9be86dbd762f
	github.com/pkg/errors v0.9.1
	github.com/pydio/config-srv v0.0.0-20180410161705-64a62c922b84 // indirect
	github.com/pydio/go-os v0.0.0-20180410161642-493f22970962
	github.com/pydio/minio-go v3.0.1+incompatible
	github.com/pydio/nats-on-a-log v0.0.0-20200504124635-5cacfa523576
	github.com/pydio/packr v1.30.1
	github.com/robertkrimen/otto v0.0.0-20200922221731-ef014fd054ac
	github.com/rs/cors v1.7.0
	github.com/rubenv/sql-migrate v0.0.0-20200616145509-8d140a17f351
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/sirupsen/logrus v1.6.0
	github.com/spf13/afero v1.5.1 // indirect
	github.com/spf13/cast v1.3.2-0.20200723214538-8d17101741c8
	github.com/spf13/cobra v1.1.1
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5
	github.com/spf13/viper v1.7.1
	github.com/uber-go/tally v3.3.17+incompatible
	github.com/zalando/go-keyring v0.1.0
	go.etcd.io/bbolt v1.3.5
	go.uber.org/multierr v1.6.0 // indirect
	go.uber.org/zap v1.16.0
	golang.org/x/crypto v0.0.0-20201221181555-eec23a3978ad
	golang.org/x/net v0.0.0-20201224014010-6772e930b67b
	golang.org/x/oauth2 v0.0.0-20200107190931-bf48bf16ab8d
	golang.org/x/sys v0.0.0-20201223074533-0d417f636930 // indirect
	golang.org/x/text v0.3.4
	google.golang.org/genproto v0.0.0-20201214200347-8c77b98c765d
	google.golang.org/grpc v1.34.0
	gopkg.in/doug-martin/goqu.v4 v4.2.0
	gopkg.in/gorp.v1 v1.7.2
	gopkg.in/ini.v1 v1.62.0 // indirect
	gopkg.in/natefinch/lumberjack.v2 v2.0.0
	gopkg.in/sourcemap.v1 v1.0.5 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)
