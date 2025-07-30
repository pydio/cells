module github.com/pydio/cells/v5

go 1.24.0

toolchain go1.24.5

require (
	buf.build/gen/go/bufbuild/protovalidate/protocolbuffers/go v1.36.1-20241127180247-a33202765966.1
	github.com/DATA-DOG/go-sqlmock v1.5.2
	github.com/Masterminds/sprig/v3 v3.3.0
	github.com/PaesslerAG/gval v1.2.4
	github.com/PaesslerAG/jsonpath v0.1.1
	github.com/ajvb/kala v0.8.4
	github.com/allegro/bigcache/v3 v3.1.0
	github.com/beeker1121/goque v2.1.0+incompatible
	github.com/beevik/ntp v1.4.3
	github.com/bep/debounce v1.2.1
	github.com/blevesearch/bleve/v2 v2.5.0
	github.com/blevesearch/bleve_index_api v1.2.7
	github.com/bufbuild/protovalidate-go v0.8.0
	github.com/caddyserver/caddy/v2 v2.9.1
	github.com/caddyserver/certmagic v0.21.6
	github.com/cskr/pubsub v1.0.2
	github.com/disintegration/imaging v1.6.2
	github.com/dsoprea/go-exif/v3 v3.0.1
	github.com/dsoprea/go-jpeg-image-structure v0.0.0-20221012074422-4f3f7e934102
	github.com/dsoprea/go-png-image-structure v0.0.0-20210512210324-29b889a6093d
	github.com/dustin/go-humanize v1.0.1
	github.com/emicklei/go-restful/v3 v3.12.1
	github.com/envoyproxy/go-control-plane v0.13.1
	github.com/fatih/color v1.18.0
	github.com/fsnotify/fsnotify v1.7.0
	github.com/gdamore/tcell/v2 v2.7.4
	github.com/glebarez/go-sqlite v1.22.0
	github.com/glebarez/sqlite v1.11.0
	github.com/go-gorm/caches v1.0.1
	github.com/go-jose/go-jose/v3 v3.0.3
	github.com/go-openapi/loads v0.22.0
	github.com/go-openapi/spec v0.21.0
	github.com/go-redis/cache/v8 v8.4.4
	github.com/go-redis/redis/v8 v8.11.5
	github.com/go-sql-driver/mysql v1.9.2
	github.com/go-viper/mapstructure/v2 v2.4.0
	github.com/gobuffalo/pop/v6 v6.1.2-0.20230318123913-c85387acc9a0
	github.com/gobwas/glob v0.2.3
	github.com/gofrs/uuid v4.4.0+incompatible
	github.com/google/go-cmp v0.7.0
	github.com/google/uuid v1.6.0
	github.com/gorilla/handlers v1.5.2
	github.com/gorilla/mux v1.8.1
	github.com/gorilla/securecookie v1.1.2
	github.com/gorilla/sessions v1.4.0
	github.com/gosimple/slug v1.15.0
	github.com/grafana/pyroscope-go v1.2.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.4.0
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.25.1
	github.com/h2non/filetype v1.1.3
	github.com/hashicorp/go-retryablehttp v0.7.7
	github.com/hashicorp/go-version v1.7.0
	github.com/hashicorp/vault/api v1.14.0
	github.com/imdario/mergo v0.3.16
	github.com/inconshreveable/go-update v0.0.0-20160112193335-8152e7eb6ccf
	github.com/jackc/pgx/v5 v5.7.5
	github.com/jaytaylor/go-hostsfile v0.0.0-20220426042432-61485ac1fa6c
	github.com/jcuga/golongpoll v1.3.1
	github.com/jinzhu/copier v0.4.0
	github.com/json-iterator/go v1.1.12
	github.com/kardianos/osext v0.0.0-20190222173326-2bc1f35cddc0
	github.com/karrick/godirwalk v1.17.0
	github.com/krolaw/zipstream v0.0.0-20180621105154-0a2661891f94
	github.com/kylelemons/godebug v1.1.0
	github.com/lpar/gzipped v1.1.0
	github.com/manifoldco/promptui v0.9.0
	github.com/matcornic/hermes/v2 v2.1.0
	github.com/mattn/go-sqlite3 v2.0.3+incompatible
	github.com/microcosm-cc/bluemonday v1.0.27
	github.com/minio/cli v1.24.2
	github.com/minio/md5-simd v1.1.2
	github.com/minio/minio v0.0.0-20230809141052-8bd460a77d09
	github.com/minio/minio-go/v7 v7.0.82
	github.com/mitchellh/mapstructure v1.5.0
	github.com/mssola/user_agent v0.6.0
	github.com/nats-io/nats-server v1.4.1
	github.com/nats-io/nats.go v1.34.1
	github.com/nicksnyder/go-i18n/v2 v2.4.1
	github.com/odigos-io/opentelemetry-zap-bridge v0.0.5
	github.com/olahol/melody v1.2.1
	github.com/olekukonko/tablewriter v0.0.5
	github.com/ory/fosite v0.44.1-0.20231218095112-ac9ae4bd99d7
	github.com/ory/herodot v0.10.3-0.20230626083119-d7e5192f0d88
	github.com/ory/hydra/v2 v2.2.0-rc.3.0.20240122114848-c9f4b5f3fbd7
	github.com/ory/ladon v1.2.0
	github.com/ory/x v0.0.613
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/pborman/uuid v1.2.1
	github.com/philopon/go-toposort v0.0.0-20170620085441-9be86dbd762f
	github.com/pkg/errors v0.9.1
	github.com/prometheus/client_golang v1.20.5
	github.com/pydio/caddyvault v1.0.3
	github.com/pydio/go v0.0.0-20191211170306-d00ac19450ef
	github.com/r3labs/diff/v3 v3.0.1
	github.com/rivo/tview v0.0.0-20220307222120-9994674d60a8
	github.com/rjeczalik/notify v0.9.3
	github.com/robertkrimen/otto v0.5.1
	github.com/rs/cors v1.11.1
	github.com/rs/xid v1.6.0
	github.com/rwcarlsen/goexif v0.0.0-20190401172101-9e8deecbddbd
	github.com/schollz/progressbar/v3 v3.17.1
	github.com/sendgrid/sendgrid-go v3.16.0+incompatible
	github.com/sethvargo/go-limiter v1.0.0
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/smartystreets/goconvey v1.8.1
	github.com/spf13/afero v1.11.0
	github.com/spf13/cast v1.7.1
	github.com/spf13/cobra v1.9.1
	github.com/spf13/pflag v1.0.6
	github.com/spf13/viper v1.19.0
	github.com/stretchr/testify v1.10.0
	github.com/tidwall/gjson v1.18.0
	github.com/tomwright/dasel v1.27.3
	github.com/valyala/fasttemplate v1.2.2
	github.com/yudai/gojsondiff v1.0.0
	github.com/yvasiyarov/php_session_decoder v0.0.0-20180803065642-a065a3b0b7d1
	github.com/zalando/go-keyring v0.2.6
	gitlab.com/tozd/go/errors v0.10.0
	go.etcd.io/bbolt v1.4.2
	go.etcd.io/etcd/client/v3 v3.5.16
	go.mongodb.org/mongo-driver v1.17.1
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.58.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.58.0
	go.opentelemetry.io/contrib/instrumentation/runtime v0.58.0
	go.opentelemetry.io/otel v1.33.0
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc v1.33.0
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp v1.33.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.33.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.33.0
	go.opentelemetry.io/otel/exporters/prometheus v0.55.0
	go.opentelemetry.io/otel/exporters/stdout/stdouttrace v1.33.0
	go.opentelemetry.io/otel/metric v1.33.0
	go.opentelemetry.io/otel/sdk v1.33.0
	go.opentelemetry.io/otel/sdk/metric v1.33.0
	go.opentelemetry.io/otel/trace v1.33.0
	go.uber.org/multierr v1.11.0
	go.uber.org/zap v1.27.0
	gocloud.dev v0.30.0
	gocloud.dev/pubsub/rabbitpubsub v0.20.0
	golang.org/x/crypto v0.39.0
	golang.org/x/exp v0.0.0-20241217172543-b2144cdd0a67
	golang.org/x/image v0.23.0
	golang.org/x/net v0.41.0
	golang.org/x/oauth2 v0.24.0
	golang.org/x/sync v0.16.0
	golang.org/x/text v0.27.0
	golang.org/x/time v0.9.0
	google.golang.org/genproto/googleapis/api v0.0.0-20241223144023-3abc09e42ca8
	google.golang.org/grpc v1.69.2
	google.golang.org/grpc/cmd/protoc-gen-go-grpc v1.1.0
	google.golang.org/grpc/examples v0.0.0-20220706173102-a6dcb714b2fe
	google.golang.org/protobuf v1.36.6
	gopkg.in/gomail.v2 v2.0.0-20160411212932-81ebce5c23df
	gopkg.in/natefinch/lumberjack.v2 v2.2.1
	gopkg.in/yaml.v2 v2.4.0
	gopkg.in/yaml.v3 v3.0.1
	gorm.io/driver/mysql v1.6.0
	gorm.io/driver/postgres v1.6.0
	gorm.io/driver/sqlite v1.6.0
	gorm.io/gen v0.3.26
	gorm.io/gorm v1.30.0
	gorm.io/plugin/dbresolver v1.6.0
	gorm.io/plugin/opentelemetry v0.1.11
	istio.io/api v1.24.2
	istio.io/client-go v1.24.2
	k8s.io/apimachinery v0.33.3
	k8s.io/client-go v0.32.1
)

require (
	al.essio.dev/pkg/shellescape v1.5.1 // indirect
	cel.dev/expr v0.19.1 // indirect
	cloud.google.com/go/compute/metadata v0.5.2 // indirect
	cloud.google.com/go/pubsub v1.38.0 // indirect
	code.dny.dev/ssrf v0.2.0 // indirect
	dario.cat/mergo v1.0.1 // indirect
	filippo.io/edwards25519 v1.1.0 // indirect
	git.apache.org/thrift.git v0.13.0 // indirect
	github.com/AndreasBriese/bbloom v0.0.0-20190825152654-46b345b51c96 // indirect
	github.com/BurntSushi/toml v1.4.0 // indirect
	github.com/Masterminds/goutils v1.1.1 // indirect
	github.com/Masterminds/semver v1.5.0 // indirect
	github.com/Masterminds/semver/v3 v3.3.1 // indirect
	github.com/Masterminds/sprig v2.22.0+incompatible // indirect
	github.com/Microsoft/go-winio v0.6.1 // indirect
	github.com/PuerkitoBio/goquery v1.8.1 // indirect
	github.com/RoaringBitmap/roaring/v2 v2.4.5 // indirect
	github.com/agoda-com/opentelemetry-logs-go v0.5.0 // indirect
	github.com/alecthomas/chroma v0.10.0 // indirect
	github.com/alecthomas/chroma/v2 v2.14.0 // indirect
	github.com/alecthomas/participle v0.2.1 // indirect
	github.com/andybalholm/cascadia v1.3.2 // indirect
	github.com/antlr4-go/antlr/v4 v4.13.1 // indirect
	github.com/aryann/difflib v0.0.0-20210328193216-ff5ff6dc229b // indirect
	github.com/asaskevich/govalidator v0.0.0-20230301143203-a9d515a09cc2 // indirect
	github.com/avast/retry-go/v4 v4.5.0 // indirect
	github.com/aymerick/douceur v0.2.0 // indirect
	github.com/bcicen/jstream v1.0.1 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/bits-and-blooms/bitset v1.22.0 // indirect
	github.com/blevesearch/geo v0.1.20 // indirect
	github.com/blevesearch/go-faiss v1.0.25 // indirect
	github.com/blevesearch/go-porterstemmer v1.0.3 // indirect
	github.com/blevesearch/gtreap v0.1.1 // indirect
	github.com/blevesearch/mmap-go v1.0.4 // indirect
	github.com/blevesearch/scorch_segment_api/v2 v2.3.9 // indirect
	github.com/blevesearch/segment v0.9.1 // indirect
	github.com/blevesearch/snowballstem v0.9.0 // indirect
	github.com/blevesearch/upsidedown_store_api v1.0.2 // indirect
	github.com/blevesearch/vellum v1.1.0 // indirect
	github.com/blevesearch/zapx/v11 v11.4.1 // indirect
	github.com/blevesearch/zapx/v12 v12.4.1 // indirect
	github.com/blevesearch/zapx/v13 v13.4.1 // indirect
	github.com/blevesearch/zapx/v14 v14.4.1 // indirect
	github.com/blevesearch/zapx/v15 v15.4.1 // indirect
	github.com/blevesearch/zapx/v16 v16.2.2 // indirect
	github.com/caddyserver/zerossl v0.1.3 // indirect
	github.com/cenkalti/backoff/v3 v3.2.2 // indirect
	github.com/cenkalti/backoff/v4 v4.3.0 // indirect
	github.com/census-instrumentation/opencensus-proto v0.4.1 // indirect
	github.com/cespare/xxhash v1.1.0 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/cheggaaa/pb v1.0.29 // indirect
	github.com/chzyer/readline v1.5.1 // indirect
	github.com/clbanning/mxj/v2 v2.7.0 // indirect
	github.com/cncf/xds/go v0.0.0-20240905190251-b4127c9b8d78 // indirect
	github.com/cockroachdb/cockroach-go/v2 v2.3.5 // indirect
	github.com/colinmarc/hdfs/v2 v2.2.0 // indirect
	github.com/containerd/errdefs v1.0.0 // indirect
	github.com/containerd/errdefs/pkg v0.3.0 // indirect
	github.com/coreos/go-semver v0.3.1 // indirect
	github.com/coreos/go-systemd/v22 v22.5.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.6 // indirect
	github.com/creasty/defaults v1.7.0 // indirect
	github.com/cristalhq/jwt/v4 v4.0.2 // indirect
	github.com/danieljoos/wincred v1.2.2 // indirect
	github.com/dave/jennifer v1.7.0 // indirect
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/dgraph-io/badger v1.6.2 // indirect
	github.com/dgraph-io/badger/v2 v2.2007.4 // indirect
	github.com/dgraph-io/ristretto v0.1.1 // indirect
	github.com/dgryski/go-farm v0.0.0-20200201041132-a6ae2369ad13 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/distribution/reference v0.6.0 // indirect
	github.com/djherbis/atime v1.0.0 // indirect
	github.com/dlclark/regexp2 v1.11.0 // indirect
	github.com/docker/docker v28.3.2+incompatible // indirect
	github.com/dsoprea/go-exif/v2 v2.0.0-20200604193436-ca8584a0e1c4 // indirect
	github.com/dsoprea/go-iptc v0.0.0-20200609062250-162ae6b44feb // indirect
	github.com/dsoprea/go-logging v0.0.0-20200710184922-b02d349568dd // indirect
	github.com/dsoprea/go-photoshop-info-format v0.0.0-20200609050348-3db9b63b202c // indirect
	github.com/dsoprea/go-utility v0.0.0-20200711062821-fab8125e9bdf // indirect
	github.com/dsoprea/go-utility/v2 v2.0.0-20221003172846-a3e1774ef349 // indirect
	github.com/dswarbrick/smart v0.0.0-20190505152634-909a45200d6d // indirect
	github.com/ecordell/optgen v0.0.9 // indirect
	github.com/envoyproxy/protoc-gen-validate v1.1.0 // indirect
	github.com/evanphx/json-patch/v5 v5.9.0 // indirect
	github.com/fatih/structs v1.1.0 // indirect
	github.com/fatih/structtag v1.2.0 // indirect
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/francoispqt/gojay v1.2.13 // indirect
	github.com/fxamacker/cbor/v2 v2.7.0 // indirect
	github.com/gdamore/encoding v1.0.1 // indirect
	github.com/go-chi/chi/v5 v5.2.2 // indirect
	github.com/go-errors/errors v1.4.2 // indirect
	github.com/go-faker/faker/v4 v4.1.1 // indirect
	github.com/go-ini/ini v1.67.0 // indirect
	github.com/go-jose/go-jose/v4 v4.0.2 // indirect
	github.com/go-kit/kit v0.13.0 // indirect
	github.com/go-kit/log v0.2.1 // indirect
	github.com/go-logfmt/logfmt v0.6.0 // indirect
	github.com/go-logr/logr v1.4.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/go-openapi/analysis v0.23.0 // indirect
	github.com/go-openapi/errors v0.22.0 // indirect
	github.com/go-openapi/jsonpointer v0.21.1 // indirect
	github.com/go-openapi/jsonreference v0.21.0 // indirect
	github.com/go-openapi/strfmt v0.23.0 // indirect
	github.com/go-openapi/swag v0.23.1 // indirect
	github.com/go-task/slim-sprig/v3 v3.0.0 // indirect
	github.com/go-xmlfmt/xmlfmt v0.0.0-20191208150333-d5b6f63a941b // indirect
	github.com/gobuffalo/envy v1.10.2 // indirect
	github.com/gobuffalo/fizz v1.14.4 // indirect
	github.com/gobuffalo/flect v1.0.2 // indirect
	github.com/gobuffalo/github_flavored_markdown v1.1.4 // indirect
	github.com/gobuffalo/helpers v0.6.7 // indirect
	github.com/gobuffalo/nulls v0.4.2 // indirect
	github.com/gobuffalo/plush/v4 v4.1.19 // indirect
	github.com/gobuffalo/tags/v3 v3.1.4 // indirect
	github.com/gobuffalo/validate/v3 v3.3.3 // indirect
	github.com/goccy/go-json v0.10.4 // indirect
	github.com/goccy/go-yaml v1.11.0 // indirect
	github.com/godbus/dbus/v5 v5.1.0 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt/v4 v4.5.1 // indirect
	github.com/golang-jwt/jwt/v5 v5.2.3 // indirect
	github.com/golang/gddo v0.0.0-20190904175337-72a348e765d2 // indirect
	github.com/golang/geo v0.0.0-20230421003525-6adc56603217 // indirect
	github.com/golang/glog v1.2.5 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/mock v1.6.0 // indirect
	github.com/golang/protobuf v1.5.4 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/google/btree v1.1.3 // indirect
	github.com/google/cel-go v0.22.1 // indirect
	github.com/google/certificate-transparency-go v1.1.8-0.20240110162603-74a5dd331745 // indirect
	github.com/google/gnostic-models v0.6.9 // indirect
	github.com/google/go-tpm v0.9.0 // indirect
	github.com/google/go-tspi v0.3.0 // indirect
	github.com/google/pprof v0.0.0-20241029153458-d1b30febd7db // indirect
	github.com/googleapis/gax-go/v2 v2.12.4 // indirect
	github.com/gopherjs/gopherjs v1.17.2 // indirect
	github.com/gorilla/css v1.0.1 // indirect
	github.com/gorilla/websocket v1.5.1 // indirect
	github.com/gosimple/unidecode v1.0.1 // indirect
	github.com/grafana/pyroscope-go/godeltaprof v0.1.8 // indirect
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-cleanhttp v0.5.2 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/hashicorp/go-rootcerts v1.0.2 // indirect
	github.com/hashicorp/go-secure-stdlib/parseutil v0.1.8 // indirect
	github.com/hashicorp/go-secure-stdlib/strutil v0.1.2 // indirect
	github.com/hashicorp/go-sockaddr v1.0.6 // indirect
	github.com/hashicorp/go-uuid v1.0.3 // indirect
	github.com/hashicorp/golang-lru v1.0.2 // indirect
	github.com/hashicorp/hcl v1.0.0 // indirect
	github.com/huandu/xstrings v1.5.0 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/inhies/go-bytesize v0.0.0-20220417184213-4913239db9cf // indirect
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgconn v1.14.3 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.3.3 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgtype v1.14.0 // indirect
	github.com/jackc/pgx/v4 v4.18.3 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jandelgado/gcov2lcov v1.0.5 // indirect
	github.com/jaytaylor/html2text v0.0.0-20180606194806-57d518f124b0 // indirect
	github.com/jcmturner/aescts/v2 v2.0.0 // indirect
	github.com/jcmturner/dnsutils/v2 v2.0.0 // indirect
	github.com/jcmturner/gofork v1.7.6 // indirect
	github.com/jcmturner/goidentity/v6 v6.0.1 // indirect
	github.com/jcmturner/gokrb5/v8 v8.4.3 // indirect
	github.com/jcmturner/rpc/v2 v2.0.3 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/jmoiron/sqlx v1.3.5 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/jtolds/gls v4.20.0+incompatible // indirect
	github.com/julienschmidt/httprouter v1.3.0 // indirect
	github.com/kballard/go-shellquote v0.0.0-20180428030007-95032a82bc51 // indirect
	github.com/klauspost/compress v1.17.11 // indirect
	github.com/klauspost/cpuid/v2 v2.2.9 // indirect
	github.com/klauspost/pgzip v1.2.5 // indirect
	github.com/klauspost/readahead v1.4.0 // indirect
	github.com/knadh/koanf/maps v0.1.1 // indirect
	github.com/knadh/koanf/parsers/json v0.1.0 // indirect
	github.com/knadh/koanf/parsers/toml v0.1.0 // indirect
	github.com/knadh/koanf/parsers/yaml v0.1.0 // indirect
	github.com/knadh/koanf/providers/posflag v0.1.0 // indirect
	github.com/knadh/koanf/v2 v2.1.1 // indirect
	github.com/lib/pq v1.10.9 // indirect
	github.com/libdns/libdns v0.2.2 // indirect
	github.com/lucasb-eyer/go-colorful v1.2.0 // indirect
	github.com/lufia/plan9stats v0.0.0-20211012122336-39d0f177ccd0 // indirect
	github.com/luna-duclos/instrumentedsql v1.1.3 // indirect
	github.com/magiconair/properties v1.8.7 // indirect
	github.com/mailru/easyjson v0.9.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.16 // indirect
	github.com/mattn/goveralls v0.0.12 // indirect
	github.com/mgutz/ansi v0.0.0-20200706080929-d51e80ef957d // indirect
	github.com/mholt/acmez/v3 v3.0.0 // indirect
	github.com/miekg/dns v1.1.62 // indirect
	github.com/minio/highwayhash v1.0.2 // indirect
	github.com/minio/sha256-simd v1.0.1 // indirect
	github.com/minio/simdjson-go v0.2.1 // indirect
	github.com/minio/sio v0.3.0 // indirect
	github.com/mitchellh/colorstring v0.0.0-20190213212951-d06e56a500db // indirect
	github.com/mitchellh/copystructure v1.2.0 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/mitchellh/go-ps v1.0.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.2 // indirect
	github.com/moby/docker-image-spec v1.3.1 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/montanaflynn/stats v0.7.1 // indirect
	github.com/mschoch/smat v0.2.0 // indirect
	github.com/munnerz/goautoneg v0.0.0-20191010083416-a7dc8b61c822 // indirect
	github.com/nats-io/nkeys v0.4.7 // indirect
	github.com/nats-io/nuid v1.0.1 // indirect
	github.com/ncruces/go-strftime v0.1.9 // indirect
	github.com/ncw/directio v1.0.5 // indirect
	github.com/nyaruka/phonenumbers v1.1.7 // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/oleiade/reflections v1.0.1 // indirect
	github.com/onsi/ginkgo/v2 v2.21.0 // indirect
	github.com/openzipkin/zipkin-go v0.4.2 // indirect
	github.com/ory/go-acc v0.2.9-0.20230103102148-6b1c9a70dbbe // indirect
	github.com/ory/go-convenience v0.1.0 // indirect
	github.com/ory/hydra-client-go/v2 v2.1.1 // indirect
	github.com/ory/jsonschema/v3 v3.0.8 // indirect
	github.com/ory/kratos-client-go v0.13.1 // indirect
	github.com/ory/pagination v0.0.1 // indirect
	github.com/pelletier/go-toml v1.9.5 // indirect
	github.com/pelletier/go-toml/v2 v2.2.3 // indirect
	github.com/philhofer/fwd v1.1.2-0.20210722190033-5c56ac6d0bb9 // indirect
	github.com/pierrec/lz4 v2.6.1+incompatible // indirect
	github.com/pires/go-proxyproto v0.7.1-0.20240628150027-b718e7ce4964 // indirect
	github.com/planetscale/vtprotobuf v0.6.1-0.20240319094008-0393e58bdf10 // indirect
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/power-devops/perfstat v0.0.0-20210106213030-5aafc221ea8c // indirect
	github.com/prometheus/client_model v0.6.1 // indirect
	github.com/prometheus/common v0.61.0 // indirect
	github.com/prometheus/procfs v0.15.1 // indirect
	github.com/quic-go/qpack v0.5.1 // indirect
	github.com/quic-go/quic-go v0.48.2 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	github.com/rivo/uniseg v0.4.7 // indirect
	github.com/rogpeppe/go-internal v1.13.1 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/ryanuber/go-glob v1.0.0 // indirect
	github.com/sagikazarmark/locafero v0.6.0 // indirect
	github.com/sagikazarmark/slog-shim v0.1.0 // indirect
	github.com/seatgeek/logrus-gelf-formatter v0.0.0-20210414080842-5b05eb8ff761 // indirect
	github.com/secure-io/sio-go v0.3.1 // indirect
	github.com/sendgrid/rest v2.6.9+incompatible // indirect
	github.com/sergi/go-diff v1.3.1 // indirect
	github.com/shirou/gopsutil/v3 v3.23.7 // indirect
	github.com/shoenig/go-m1cpu v0.1.6 // indirect
	github.com/shopspring/decimal v1.4.0 // indirect
	github.com/shurcooL/sanitized_anchor_name v1.0.0 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	github.com/slackhq/nebula v1.6.1 // indirect
	github.com/smallstep/certificates v0.26.1 // indirect
	github.com/smallstep/go-attestation v0.4.4-0.20240109183208-413678f90935 // indirect
	github.com/smallstep/nosql v0.6.1 // indirect
	github.com/smallstep/pkcs7 v0.0.0-20231024181729-3b98ecc1ca81 // indirect
	github.com/smallstep/scep v0.0.0-20231024192529-aee96d7ad34d // indirect
	github.com/smallstep/truststore v0.13.0 // indirect
	github.com/smarty/assertions v1.15.0 // indirect
	github.com/sourcegraph/annotate v0.0.0-20160123013949-f4cad6c6324d // indirect
	github.com/sourcegraph/conc v0.3.0 // indirect
	github.com/sourcegraph/syntaxhighlight v0.0.0-20170531221838-bd320f5d308e // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	github.com/ssor/bom v0.0.0-20170718123548-6386211fdfcf // indirect
	github.com/stoewer/go-strcase v1.3.0 // indirect
	github.com/streadway/amqp v1.0.0 // indirect
	github.com/subosito/gotenv v1.6.0 // indirect
	github.com/syndtr/goleveldb v1.0.0 // indirect
	github.com/tailscale/tscert v0.0.0-20240608151842-d3f834017e53 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
	github.com/tidwall/sjson v1.2.5 // indirect
	github.com/tinylib/msgp v1.1.7-0.20211026165309-e818a1881b0e // indirect
	github.com/tklauser/go-sysconf v0.3.11 // indirect
	github.com/tklauser/numcpus v0.6.0 // indirect
	github.com/twmb/murmur3 v1.1.8 // indirect
	github.com/urfave/cli v1.22.14 // indirect
	github.com/urfave/negroni v1.0.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	github.com/vanng822/css v0.0.0-20190504095207-a21e860bcd04 // indirect
	github.com/vanng822/go-premailer v0.0.0-20191214114701-be27abe028fe // indirect
	github.com/vmihailenco/go-tinylfu v0.2.2 // indirect
	github.com/vmihailenco/msgpack/v5 v5.4.1 // indirect
	github.com/vmihailenco/tagparser/v2 v2.0.0 // indirect
	github.com/willf/bitset v1.1.11 // indirect
	github.com/willf/bloom v2.0.3+incompatible // indirect
	github.com/x448/float16 v0.8.4 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/youmark/pkcs8 v0.0.0-20240726163527-a2c0da244d78 // indirect
	github.com/yudai/golcs v0.0.0-20170316035057-ecda9a501e82 // indirect
	github.com/yudai/pp v2.0.1+incompatible // indirect
	github.com/yuin/goldmark v1.7.8 // indirect
	github.com/yuin/goldmark-highlighting/v2 v2.0.0-20230729083705-37449abec8cc // indirect
	github.com/yusufpapurcu/wmi v1.2.3 // indirect
	github.com/zeebo/blake3 v0.2.4 // indirect
	go.etcd.io/etcd/api/v3 v3.5.16 // indirect
	go.etcd.io/etcd/client/pkg/v3 v3.5.16 // indirect
	go.opencensus.io v0.24.0 // indirect
	go.opentelemetry.io/auto/sdk v1.1.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace v0.46.1 // indirect
	go.opentelemetry.io/contrib/propagators/autoprop v0.42.0 // indirect
	go.opentelemetry.io/contrib/propagators/aws v1.17.0 // indirect
	go.opentelemetry.io/contrib/propagators/b3 v1.21.0 // indirect
	go.opentelemetry.io/contrib/propagators/jaeger v1.21.1 // indirect
	go.opentelemetry.io/contrib/propagators/ot v1.19.0 // indirect
	go.opentelemetry.io/contrib/samplers/jaegerremote v0.15.1 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.17.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.33.0 // indirect
	go.opentelemetry.io/otel/exporters/zipkin v1.21.0 // indirect
	go.opentelemetry.io/proto/otlp v1.4.0 // indirect
	go.step.sm/cli-utils v0.9.0 // indirect
	go.step.sm/crypto v0.45.0 // indirect
	go.step.sm/linkedca v0.20.1 // indirect
	go.uber.org/automaxprocs v1.6.0 // indirect
	go.uber.org/mock v0.4.0 // indirect
	go.uber.org/zap/exp v0.3.0 // indirect
	golang.org/x/crypto/x509roots/fallback v0.0.0-20241104001025-71ed71b4faf9 // indirect
	golang.org/x/mod v0.25.0 // indirect
	golang.org/x/sys v0.34.0 // indirect
	golang.org/x/term v0.32.0 // indirect
	golang.org/x/tools v0.34.0 // indirect
	golang.org/x/xerrors v0.0.0-20231012003039-104605ab7028 // indirect
	google.golang.org/api v0.180.0 // indirect
	google.golang.org/genproto v0.0.0-20240515191416-fc5f0ca64291 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20241223144023-3abc09e42ca8 // indirect
	gopkg.in/alexcesaro/quotedprintable.v3 v3.0.0-20150716171945-2caba252f4dc // indirect
	gopkg.in/evanphx/json-patch.v4 v4.12.0 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/ini.v1 v1.67.0 // indirect
	gopkg.in/sourcemap.v1 v1.0.5 // indirect
	gorm.io/datatypes v1.2.0 // indirect
	gorm.io/hints v1.1.2 // indirect
	howett.net/plist v1.0.0 // indirect
	k8s.io/api v0.32.1 // indirect
	k8s.io/klog/v2 v2.130.1 // indirect
	k8s.io/kube-openapi v0.0.0-20250318190949-c8a335a9a2ff // indirect
	k8s.io/utils v0.0.0-20241104100929-3ea5e8cea738 // indirect
	modernc.org/libc v1.61.5 // indirect
	modernc.org/mathutil v1.7.1 // indirect
	modernc.org/memory v1.8.0 // indirect
	modernc.org/sqlite v1.34.4 // indirect
	sigs.k8s.io/json v0.0.0-20241010143419-9aa6b5e7a4b3 // indirect
	sigs.k8s.io/randfill v1.0.0 // indirect
	sigs.k8s.io/structured-merge-diff/v4 v4.6.0 // indirect
	sigs.k8s.io/yaml v1.4.0 // indirect
)

//replace github.com/pydio/caddyvault => ../caddyvault

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20250526175410-0b3908e74845

// replace github.com/minio/minio => ../minio

//replace github.com/mattn/go-sqlite3 => github.com/mattn/go-sqlite3 v1.14.16
