module github.com/pydio/cells/v4

go 1.16

require (
	cloud.google.com/go/kms v1.1.0 // indirect
	cloud.google.com/go/storage v1.18.2 // indirect
	github.com/ajvb/kala v0.8.4
	github.com/allegro/bigcache/v3 v3.0.1
	github.com/beevik/ntp v0.3.0
	github.com/bep/debounce v1.2.0
	github.com/blevesearch/bleve/v2 v2.3.0
	github.com/caddyserver/caddy/v2 v2.4.6
	github.com/cskr/pubsub v1.0.2
	github.com/disintegration/imaging v1.6.2
	github.com/docker/docker v20.10.12+incompatible // indirect
	github.com/doug-martin/goqu/v9 v9.18.0
	github.com/dustin/go-humanize v1.0.1-0.20200219035652-afde56e7acac
	github.com/emicklei/go-restful/v3 v3.7.3
	github.com/fatih/color v1.13.0
	github.com/fatih/structs v1.1.0
	github.com/gdamore/tcell/v2 v2.5.1
	github.com/ghodss/yaml v1.0.0
	github.com/go-openapi/errors v0.20.2
	github.com/go-openapi/loads v0.21.1
	github.com/go-openapi/runtime v0.22.0
	github.com/go-openapi/spec v0.20.4
	github.com/go-openapi/strfmt v0.21.1
	github.com/go-openapi/swag v0.21.1
	github.com/go-sql-driver/mysql v1.6.0
	github.com/gobwas/glob v0.2.3
	github.com/golang/protobuf v1.5.2
	github.com/google/go-cmp v0.5.7
	github.com/google/uuid v1.3.0
	github.com/gorilla/mux v1.8.0
	github.com/gorilla/securecookie v1.1.1
	github.com/gorilla/sessions v1.2.1
	github.com/gosimple/slug v1.12.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.6.0
	github.com/h2non/filetype v1.1.3
	github.com/hashicorp/go-version v1.4.0
	github.com/hashicorp/vault/api v1.5.0 // indirect
	github.com/imdario/mergo v0.3.12
	github.com/inconshreveable/go-update v0.0.0-20160112193335-8152e7eb6ccf
	github.com/jaytaylor/go-hostsfile v0.0.0-20211120191712-f53f85d8b98f
	github.com/jcuga/golongpoll v1.3.0
	github.com/jinzhu/copier v0.3.5
	github.com/jmoiron/sqlx v1.3.4
	github.com/json-iterator/go v1.1.12
	github.com/kardianos/osext v0.0.0-20190222173326-2bc1f35cddc0
	github.com/karrick/godirwalk v1.16.1
	github.com/krolaw/zipstream v0.0.0-20180621105154-0a2661891f94
	github.com/kylelemons/godebug v1.1.0
	github.com/livekit/protocol v0.11.11
	github.com/lpar/gzipped v1.1.0
	github.com/lucas-clemente/quic-go v0.24.0 // indirect
	github.com/manifoldco/promptui v0.9.0
	github.com/matcornic/hermes/v2 v2.1.0
	github.com/mattn/go-sqlite3 v2.0.3+incompatible
	github.com/minio/cli v1.22.0
	github.com/minio/madmin-go v1.2.7
	github.com/minio/minio v0.0.0-20220406034617-255116fde7e9
	github.com/minio/minio-go/v7 v7.0.21
	github.com/minio/pkg v1.1.14
	github.com/mitchellh/mapstructure v1.4.3
	github.com/mssola/user_agent v0.5.3
	github.com/mwitkow/go-proto-validators v0.3.2
	github.com/nicksnyder/go-i18n v1.10.0
	github.com/olekukonko/tablewriter v0.0.5
	github.com/ory/fosite v0.42.1
	github.com/ory/hydra v1.11.7
	github.com/ory/ladon v1.2.0
	github.com/ory/x v0.0.344
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/philopon/go-toposort v0.0.0-20170620085441-9be86dbd762f
	github.com/pkg/errors v0.9.1
	github.com/pydio/go v0.0.0-20191211170306-d00ac19450ef
	github.com/pydio/melody v0.0.0-20190928133520-4271c6513fb6
	github.com/pydio/pydio-sdk-go v0.0.0-20190116153840-23ce5c39e65c
	github.com/r3labs/diff/v3 v3.0.0 // indirect
	github.com/rivo/tview v0.0.0-20220307222120-9994674d60a8
	github.com/rjeczalik/notify v0.9.2
	github.com/robertkrimen/otto v0.0.0-20211024170158-b87d35c0b86f
	github.com/rs/cors v1.8.2
	github.com/rs/xid v1.3.0
	github.com/rubenv/sql-migrate v0.0.0-20211023115951-9f02b1e13857
	github.com/rwcarlsen/goexif v0.0.0-20190401172101-9e8deecbddbd
	github.com/schollz/progressbar/v3 v3.8.6
	github.com/scottleedavis/go-exif-remove v0.0.0-20190908021517-58bdbaac8636
	github.com/sendgrid/rest v2.6.5+incompatible // indirect
	github.com/sendgrid/sendgrid-go v3.10.3+incompatible
	github.com/sethvargo/go-limiter v0.7.2
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/sirupsen/logrus v1.8.1
	github.com/smartystreets/goconvey v1.7.2
	github.com/spf13/afero v1.8.0
	github.com/spf13/cast v1.4.1
	github.com/spf13/cobra v1.3.0
	github.com/spf13/pflag v1.0.5
	github.com/spf13/viper v1.10.1
	github.com/stretchr/testify v1.7.0
	github.com/tomwright/dasel v1.24.1
	github.com/twmb/murmur3 v1.1.6 // indirect
	github.com/uber-go/tally/v4 v4.1.1
	github.com/wI2L/jsondiff v0.2.0 // indirect
	github.com/yudai/gojsondiff v1.0.0
	github.com/yudai/golcs v0.0.0-20170316035057-ecda9a501e82 // indirect
	github.com/yudai/pp v2.0.1+incompatible // indirect
	github.com/yvasiyarov/php_session_decoder v0.0.0-20180803065642-a065a3b0b7d1
	github.com/zalando/go-keyring v0.1.1
	go.etcd.io/bbolt v1.3.6
	go.etcd.io/etcd/client/v3 v3.5.0
	go.mongodb.org/mongo-driver v1.8.3
	go.uber.org/zap v1.20.0
	gocloud.dev v0.20.0
	gocloud.dev/pubsub/natspubsub v0.20.0
	gocloud.dev/pubsub/rabbitpubsub v0.20.0
	golang.org/x/crypto v0.0.0-20220427172511-eb4f295cb31f
	golang.org/x/image v0.0.0-20210628002857-a66eb6448b8d
	golang.org/x/net v0.0.0-20211112202133-69e39bad7dc2
	golang.org/x/oauth2 v0.0.0-20211104180415-d3ed0bb246c8
	golang.org/x/sync v0.0.0-20210220032951-036812b2e83c
	golang.org/x/sys v0.0.0-20220429121018-84afa8d3f7b3 // indirect
	golang.org/x/term v0.0.0-20220411215600-e5f449aeb171 // indirect
	golang.org/x/text v0.3.7
	golang.org/x/time v0.0.0-20210723032227-1f47c861a9ac
	google.golang.org/genproto v0.0.0-20211208223120-3a66f561d7aa
	google.golang.org/grpc v1.43.0
	google.golang.org/grpc/cmd/protoc-gen-go-grpc v1.1.0
	google.golang.org/grpc/examples v0.0.0-20211015201449-4757d0249e2d
	google.golang.org/protobuf v1.27.1
	gopkg.in/gomail.v2 v2.0.0-20160411212932-81ebce5c23df
	gopkg.in/gorp.v1 v1.7.2
	gopkg.in/natefinch/lumberjack.v2 v2.0.0
	gopkg.in/yaml.v2 v2.4.0
	k8s.io/apimachinery v0.21.1
	k8s.io/klog/v2 v2.30.0 // indirect
)

//replace github.com/minio/minio => /Users/charles/Sources/go/src/github.com/pydio/minio

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20220406100704-41fdf38e3122
