module github.com/pydio/cells/v4

go 1.17

require (
	github.com/ajvb/kala v0.8.4
	github.com/allegro/bigcache/v3 v3.0.1
	github.com/beevik/ntp v0.3.0
	github.com/bep/debounce v1.2.0
	github.com/blevesearch/bleve/v2 v2.3.0
	github.com/caddyserver/caddy/v2 v2.4.6
	github.com/cskr/pubsub v1.0.2
	github.com/disintegration/imaging v1.6.2
	github.com/doug-martin/goqu/v9 v9.18.0
	github.com/dustin/go-humanize v1.0.1-0.20200219035652-afde56e7acac
	github.com/emicklei/go-restful/v3 v3.8.0
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
	github.com/hashicorp/vault/api v1.5.0
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
	github.com/r3labs/diff/v3 v3.0.0
	github.com/rivo/tview v0.0.0-20220307222120-9994674d60a8
	github.com/rjeczalik/notify v0.9.2
	github.com/robertkrimen/otto v0.0.0-20211024170158-b87d35c0b86f
	github.com/rs/cors v1.8.2
	github.com/rs/xid v1.3.0
	github.com/rubenv/sql-migrate v0.0.0-20211023115951-9f02b1e13857
	github.com/rwcarlsen/goexif v0.0.0-20190401172101-9e8deecbddbd
	github.com/schollz/progressbar/v3 v3.8.6
	github.com/scottleedavis/go-exif-remove v0.0.0-20190908021517-58bdbaac8636
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
	github.com/uber-go/tally/v4 v4.1.1
	github.com/yudai/gojsondiff v1.0.0
	github.com/yvasiyarov/php_session_decoder v0.0.0-20180803065642-a065a3b0b7d1
	github.com/zalando/go-keyring v0.1.1
	go.etcd.io/bbolt v1.3.6
	go.etcd.io/etcd/api/v3 v3.5.4
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
)

require (
	cloud.google.com/go v0.99.0 // indirect
	cloud.google.com/go/kms v1.1.0 // indirect
	cloud.google.com/go/storage v1.18.2 // indirect
	github.com/AndreasBriese/bbloom v0.0.0-20190825152654-46b345b51c96 // indirect
	github.com/Azure/azure-pipeline-go v0.2.2 // indirect
	github.com/Azure/azure-storage-blob-go v0.10.0 // indirect
	github.com/Azure/go-ntlmssp v0.0.0-20200615164410-66371956d46c // indirect
	github.com/DataDog/datadog-go v4.8.2+incompatible // indirect
	github.com/DataDog/sketches-go v1.2.1 // indirect
	github.com/Masterminds/goutils v1.1.1 // indirect
	github.com/Masterminds/semver v1.5.0 // indirect
	github.com/Masterminds/semver/v3 v3.1.1 // indirect
	github.com/Masterminds/sprig v2.22.0+incompatible // indirect
	github.com/Masterminds/sprig/v3 v3.2.2 // indirect
	github.com/Microsoft/go-winio v0.5.1 // indirect
	github.com/PuerkitoBio/goquery v1.5.0 // indirect
	github.com/PuerkitoBio/purell v1.1.1 // indirect
	github.com/PuerkitoBio/urlesc v0.0.0-20170810143723-de5bf2ad4578 // indirect
	github.com/RoaringBitmap/roaring v0.9.4 // indirect
	github.com/Shopify/sarama v1.27.2 // indirect
	github.com/StackExchange/wmi v1.2.1 // indirect
	github.com/ThalesIgnite/crypto11 v1.2.4 // indirect
	github.com/VividCortex/ewma v1.1.1 // indirect
	github.com/alecthomas/chroma v0.9.2 // indirect
	github.com/alecthomas/participle v0.2.1 // indirect
	github.com/andybalholm/cascadia v1.0.0 // indirect
	github.com/antlr/antlr4 v0.0.0-20200503195918-621b933c7a7f // indirect
	github.com/apache/thrift v0.15.0 // indirect
	github.com/armon/go-metrics v0.3.10 // indirect
	github.com/armon/go-radix v1.0.0 // indirect
	github.com/asaskevich/govalidator v0.0.0-20210307081110-f21760c49a8d // indirect
	github.com/aymerick/douceur v0.2.0 // indirect
	github.com/bcicen/jstream v1.0.1 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/bits-and-blooms/bitset v1.2.0 // indirect
	github.com/bits-and-blooms/bloom/v3 v3.0.1 // indirect
	github.com/blevesearch/bleve_index_api v1.0.1 // indirect
	github.com/blevesearch/go-porterstemmer v1.0.3 // indirect
	github.com/blevesearch/mmap-go v1.0.3 // indirect
	github.com/blevesearch/scorch_segment_api/v2 v2.1.0 // indirect
	github.com/blevesearch/segment v0.9.0 // indirect
	github.com/blevesearch/snowballstem v0.9.0 // indirect
	github.com/blevesearch/upsidedown_store_api v1.0.1 // indirect
	github.com/blevesearch/vellum v1.0.7 // indirect
	github.com/blevesearch/zapx/v11 v11.3.2 // indirect
	github.com/blevesearch/zapx/v12 v12.3.2 // indirect
	github.com/blevesearch/zapx/v13 v13.3.2 // indirect
	github.com/blevesearch/zapx/v14 v14.3.2 // indirect
	github.com/blevesearch/zapx/v15 v15.3.2 // indirect
	github.com/briandowns/spinner v1.16.0 // indirect
	github.com/buger/jsonparser v1.1.1 // indirect
	github.com/caddyserver/certmagic v0.15.2 // indirect
	github.com/cenkalti/backoff/v3 v3.0.0 // indirect
	github.com/cenkalti/backoff/v4 v4.1.2 // indirect
	github.com/census-instrumentation/opencensus-proto v0.3.0 // indirect
	github.com/cespare/xxhash v1.1.0 // indirect
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/cheekybits/genny v1.0.0 // indirect
	github.com/cheggaaa/pb v1.0.29 // indirect
	github.com/chzyer/readline v0.0.0-20180603132655-2972be24d48e // indirect
	github.com/clbanning/mxj/v2 v2.3.3-0.20201214204241-e937bdee5a3e // indirect
	github.com/cncf/udpa/go v0.0.0-20210930031921-04548b0d99d4 // indirect
	github.com/cncf/xds/go v0.0.0-20211130200136-a8f946100490 // indirect
	github.com/cockroachdb/cockroach-go/v2 v2.2.7 // indirect
	github.com/colinmarc/hdfs/v2 v2.2.0 // indirect
	github.com/coredns/coredns v1.4.0 // indirect
	github.com/coreos/go-oidc v2.2.1+incompatible // indirect
	github.com/coreos/go-semver v0.3.0 // indirect
	github.com/coreos/go-systemd/v22 v22.3.2 // indirect
	github.com/cosnicolaou/pbzip2 v1.0.1 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.1 // indirect
	github.com/danieljoos/wincred v1.1.0 // indirect
	github.com/danwakefield/fnmatch v0.0.0-20160403171240-cbb64ac3d964 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dchest/siphash v1.2.1 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.0.0 // indirect
	github.com/dgraph-io/badger v1.6.2 // indirect
	github.com/dgraph-io/badger/v2 v2.2007.4 // indirect
	github.com/dgraph-io/ristretto v0.1.0 // indirect
	github.com/dgryski/go-farm v0.0.0-20200201041132-a6ae2369ad13 // indirect
	github.com/djherbis/atime v1.0.0 // indirect
	github.com/dlclark/regexp2 v1.4.0 // indirect
	github.com/docker/docker v20.10.12+incompatible // indirect
	github.com/docker/go-units v0.4.0 // indirect
	github.com/dsoprea/go-exif v0.0.0-20190901173045-3ce78807c90f // indirect
	github.com/dsoprea/go-jpeg-image-structure v0.0.0-20190422055009-d6f9ba25cf48 // indirect
	github.com/dsoprea/go-logging v0.0.0-20190624164917-c4f10aab7696 // indirect
	github.com/dsoprea/go-png-image-structure v0.0.0-20190624104353-c9b28dcdc5c8 // indirect
	github.com/eapache/go-resiliency v1.2.0 // indirect
	github.com/eapache/go-xerial-snappy v0.0.0-20180814174437-776d5712da21 // indirect
	github.com/eapache/queue v1.1.0 // indirect
	github.com/eclipse/paho.mqtt.golang v1.3.5 // indirect
	github.com/elastic/go-elasticsearch/v7 v7.12.0 // indirect
	github.com/elastic/go-licenser v0.3.1 // indirect
	github.com/elastic/go-sysinfo v1.7.1 // indirect
	github.com/elastic/go-windows v1.0.1 // indirect
	github.com/emicklei/go-restful v2.9.5+incompatible // indirect
	github.com/envoyproxy/go-control-plane v0.10.1 // indirect
	github.com/envoyproxy/protoc-gen-validate v0.6.2 // indirect
	github.com/evanphx/json-patch v4.9.0+incompatible // indirect
	github.com/fsnotify/fsnotify v1.5.1 // indirect
	github.com/gdamore/encoding v1.0.0 // indirect
	github.com/go-asn1-ber/asn1-ber v1.5.1 // indirect
	github.com/go-chi/chi v4.1.2+incompatible // indirect
	github.com/go-errors/errors v1.0.1 // indirect
	github.com/go-kit/kit v0.10.0 // indirect
	github.com/go-ldap/ldap/v3 v3.2.4 // indirect
	github.com/go-logfmt/logfmt v0.5.0 // indirect
	github.com/go-logr/logr v1.2.0 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/go-openapi/analysis v0.21.2 // indirect
	github.com/go-openapi/jsonpointer v0.19.5 // indirect
	github.com/go-openapi/jsonreference v0.19.6 // indirect
	github.com/go-openapi/validate v0.20.3 // indirect
	github.com/go-stack/stack v1.8.1 // indirect
	github.com/go-task/slim-sprig v0.0.0-20210107165309-348f09dbbbc0 // indirect
	github.com/gobuffalo/envy v1.10.1 // indirect
	github.com/gobuffalo/fizz v1.14.0 // indirect
	github.com/gobuffalo/flect v0.2.4 // indirect
	github.com/gobuffalo/github_flavored_markdown v1.1.1 // indirect
	github.com/gobuffalo/helpers v0.6.4 // indirect
	github.com/gobuffalo/nulls v0.4.1 // indirect
	github.com/gobuffalo/plush/v4 v4.1.9 // indirect
	github.com/gobuffalo/pop/v6 v6.0.1 // indirect
	github.com/gobuffalo/tags/v3 v3.1.2 // indirect
	github.com/gobuffalo/validate/v3 v3.3.1 // indirect
	github.com/gobuffalo/x v0.0.0-20181007152206-913e47c59ca7 // indirect
	github.com/goccy/go-json v0.7.9 // indirect
	github.com/godbus/dbus/v5 v5.0.4 // indirect
	github.com/gofrs/uuid v4.1.0+incompatible // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang-jwt/jwt/v4 v4.1.0 // indirect
	github.com/golang/gddo v0.0.0-20190904175337-72a348e765d2 // indirect
	github.com/golang/geo v0.0.0-20190812012225-f41920e961ce // indirect
	github.com/golang/glog v1.0.0 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/gomodule/redigo v1.8.8 // indirect
	github.com/google/cel-go v0.7.3 // indirect
	github.com/google/gofuzz v1.2.0 // indirect
	github.com/googleapis/gax-go v2.0.2+incompatible // indirect
	github.com/googleapis/gax-go/v2 v2.1.1 // indirect
	github.com/googleapis/gnostic v0.5.1 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20220104163920-15ed2e8cf2bd // indirect
	github.com/gorilla/css v1.0.0 // indirect
	github.com/gorilla/websocket v1.4.2 // indirect
	github.com/gosimple/unidecode v1.0.1 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.16.0 // indirect
	github.com/gtank/cryptopasta v0.0.0-20170601214702-1f550f6f2f69 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-cleanhttp v0.5.2 // indirect
	github.com/hashicorp/go-hclog v1.0.0 // indirect
	github.com/hashicorp/go-immutable-radix v1.3.1 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/hashicorp/go-plugin v1.4.3 // indirect
	github.com/hashicorp/go-retryablehttp v0.7.0 // indirect
	github.com/hashicorp/go-rootcerts v1.0.2 // indirect
	github.com/hashicorp/go-secure-stdlib/mlock v0.1.1 // indirect
	github.com/hashicorp/go-secure-stdlib/parseutil v0.1.1 // indirect
	github.com/hashicorp/go-secure-stdlib/strutil v0.1.1 // indirect
	github.com/hashicorp/go-sockaddr v1.0.2 // indirect
	github.com/hashicorp/go-uuid v1.0.2 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/hcl v1.0.0 // indirect
	github.com/hashicorp/vault/sdk v0.4.1 // indirect
	github.com/hashicorp/yamux v0.0.0-20181012175058-2f1d1f20f75d // indirect
	github.com/huandu/xstrings v1.3.2 // indirect
	github.com/inconshreveable/mousetrap v1.0.0 // indirect
	github.com/inhies/go-bytesize v0.0.0-20210819104631-275770b98743 // indirect
	github.com/instana/go-sensor v1.34.0 // indirect
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgconn v1.10.1 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.1.1 // indirect
	github.com/jackc/pgservicefile v0.0.0-20200714003250-2b9c44734f2b // indirect
	github.com/jackc/pgtype v1.8.1 // indirect
	github.com/jackc/pgx/v4 v4.13.0 // indirect
	github.com/jandelgado/gcov2lcov v1.0.5 // indirect
	github.com/jaytaylor/html2text v0.0.0-20180606194806-57d518f124b0 // indirect
	github.com/jcchavezs/porto v0.3.0 // indirect
	github.com/jcmturner/aescts/v2 v2.0.0 // indirect
	github.com/jcmturner/dnsutils/v2 v2.0.0 // indirect
	github.com/jcmturner/gofork v1.0.0 // indirect
	github.com/jcmturner/goidentity/v6 v6.0.1 // indirect
	github.com/jcmturner/gokrb5/v8 v8.4.2 // indirect
	github.com/jcmturner/rpc/v2 v2.0.3 // indirect
	github.com/jessevdk/go-flags v1.4.0 // indirect
	github.com/joeshaw/multierror v0.0.0-20140124173710-69b34d4ec901 // indirect
	github.com/joho/godotenv v1.4.0 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/jtolds/gls v4.20.0+incompatible // indirect
	github.com/julienschmidt/httprouter v1.3.0 // indirect
	github.com/kballard/go-shellquote v0.0.0-20180428030007-95032a82bc51 // indirect
	github.com/klauspost/compress v1.13.6 // indirect
	github.com/klauspost/cpuid/v2 v2.0.9 // indirect
	github.com/klauspost/pgzip v1.2.5 // indirect
	github.com/klauspost/readahead v1.4.0 // indirect
	github.com/klauspost/reedsolomon v1.9.15 // indirect
	github.com/knadh/koanf v1.4.0 // indirect
	github.com/lestrrat-go/backoff/v2 v2.0.8 // indirect
	github.com/lestrrat-go/blackmagic v1.0.0 // indirect
	github.com/lestrrat-go/httpcc v1.0.0 // indirect
	github.com/lestrrat-go/iter v1.0.1 // indirect
	github.com/lestrrat-go/jwx v1.2.7 // indirect
	github.com/lestrrat-go/option v1.0.0 // indirect
	github.com/lib/pq v1.10.4 // indirect
	github.com/libdns/libdns v0.2.1 // indirect
	github.com/looplab/fsm v0.3.0 // indirect
	github.com/lucas-clemente/quic-go v0.24.0 // indirect
	github.com/lucasb-eyer/go-colorful v1.2.0 // indirect
	github.com/luna-duclos/instrumentedsql v1.1.3 // indirect
	github.com/luna-duclos/instrumentedsql/opentracing v0.0.0-20201103091713-40d03108b6f4 // indirect
	github.com/magiconair/properties v1.8.5 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/marten-seemann/qpack v0.2.1 // indirect
	github.com/marten-seemann/qtls-go1-16 v0.1.4 // indirect
	github.com/marten-seemann/qtls-go1-17 v0.1.0 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-ieproxy v0.0.1 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/mattn/go-runewidth v0.0.13 // indirect
	github.com/mattn/goveralls v0.0.6 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.2-0.20181231171920-c182affec369 // indirect
	github.com/mb0/glob v0.0.0-20160210091149-1eb79d2de6c4 // indirect
	github.com/mgutz/ansi v0.0.0-20200706080929-d51e80ef957d // indirect
	github.com/mholt/acmez v1.0.1 // indirect
	github.com/microcosm-cc/bluemonday v1.0.16 // indirect
	github.com/micromdm/scep/v2 v2.1.0 // indirect
	github.com/miekg/dns v1.1.43 // indirect
	github.com/miekg/pkcs11 v1.0.3 // indirect
	github.com/minio/argon2 v1.0.0 // indirect
	github.com/minio/colorjson v1.0.1 // indirect
	github.com/minio/console v0.13.3 // indirect
	github.com/minio/csvparser v1.0.0 // indirect
	github.com/minio/direct-csi v1.3.5-0.20210601185811-f7776f7961bf // indirect
	github.com/minio/filepath v1.0.0 // indirect
	github.com/minio/highwayhash v1.0.2 // indirect
	github.com/minio/kes v0.14.0 // indirect
	github.com/minio/mc v0.0.0-20211207230606-23a05f5a17f2 // indirect
	github.com/minio/md5-simd v1.1.2 // indirect
	github.com/minio/operator v0.0.0-20220110040724-a5d59a342b7f // indirect
	github.com/minio/parquet-go v1.1.0 // indirect
	github.com/minio/selfupdate v0.4.0 // indirect
	github.com/minio/sha256-simd v1.0.0 // indirect
	github.com/minio/simdjson-go v0.2.1 // indirect
	github.com/minio/sio v0.3.0 // indirect
	github.com/minio/zipindex v0.2.1 // indirect
	github.com/mitchellh/colorstring v0.0.0-20190213212951-d06e56a500db // indirect
	github.com/mitchellh/copystructure v1.2.0 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/mitchellh/go-testing-interface v1.0.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.2 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/montanaflynn/stats v0.6.6 // indirect
	github.com/mschoch/smat v0.2.0 // indirect
	github.com/naoina/go-stringutil v0.1.0 // indirect
	github.com/naoina/toml v0.1.1 // indirect
	github.com/nats-io/nats.go v1.11.1-0.20210623165838-4b75fc59ae30 // indirect
	github.com/nats-io/nkeys v0.3.0 // indirect
	github.com/nats-io/nuid v1.0.1 // indirect
	github.com/nats-io/stan.go v0.8.3 // indirect
	github.com/ncw/directio v1.0.5 // indirect
	github.com/nsqio/go-nsq v1.0.8 // indirect
	github.com/nxadm/tail v1.4.8 // indirect
	github.com/nyaruka/phonenumbers v1.0.73 // indirect
	github.com/oklog/run v1.0.0 // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/oleiade/reflections v1.0.1 // indirect
	github.com/onsi/ginkgo v1.16.4 // indirect
	github.com/opentracing-contrib/go-observer v0.0.0-20170622124052-a52f23424492 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/openzipkin-contrib/zipkin-go-opentracing v0.4.5 // indirect
	github.com/openzipkin/zipkin-go v0.2.5 // indirect
	github.com/ory/go-acc v0.2.6 // indirect
	github.com/ory/go-convenience v0.1.0 // indirect
	github.com/ory/herodot v0.9.12 // indirect
	github.com/ory/jsonschema/v3 v3.0.5 // indirect
	github.com/ory/pagination v0.0.1 // indirect
	github.com/ory/viper v1.7.5 // indirect
	github.com/pborman/uuid v1.2.1 // indirect
	github.com/pelletier/go-toml v1.9.5-0.20220105141732-fed146406641 // indirect
	github.com/philhofer/fwd v1.1.2-0.20210722190033-5c56ac6d0bb9 // indirect
	github.com/pierrec/lz4 v2.6.0+incompatible // indirect
	github.com/pkg/profile v1.6.0 // indirect
	github.com/pkg/xattr v0.4.3 // indirect
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/posener/complete v1.2.3 // indirect
	github.com/pquerna/cachecontrol v0.0.0-20200921180117-858c6e7e6b7e // indirect
	github.com/prometheus/client_golang v1.11.0 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/rcrowley/go-metrics v0.0.0-20200313005456-10cdbea86bc0 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/rogpeppe/go-internal v1.8.0 // indirect
	github.com/rs/dnscache v0.0.0-20211102005908-e0241e321417 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/ryanuber/go-glob v1.0.0 // indirect
	github.com/samfoo/ansi v0.0.0-20160124022901-b6bd2ded7189 // indirect
	github.com/santhosh-tekuri/jsonschema v1.2.4 // indirect
	github.com/seatgeek/logrus-gelf-formatter v0.0.0-20210414080842-5b05eb8ff761 // indirect
	github.com/secure-io/sio-go v0.3.1 // indirect
	github.com/sendgrid/rest v2.6.5+incompatible // indirect
	github.com/sergi/go-diff v1.2.0 // indirect
	github.com/shirou/gopsutil/v3 v3.21.9 // indirect
	github.com/shopspring/decimal v1.2.0 // indirect
	github.com/shurcooL/sanitized_anchor_name v1.0.0 // indirect
	github.com/smallstep/certificates v0.17.5-0.20211008195551-04fe3126bebf // indirect
	github.com/smallstep/cli v0.17.6 // indirect
	github.com/smallstep/nosql v0.3.8 // indirect
	github.com/smallstep/truststore v0.9.6 // indirect
	github.com/smartystreets/assertions v1.2.0 // indirect
	github.com/sourcegraph/annotate v0.0.0-20160123013949-f4cad6c6324d // indirect
	github.com/sourcegraph/syntaxhighlight v0.0.0-20170531221838-bd320f5d308e // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/sqs/goreturns v0.0.0-20181028201513-538ac6014518 // indirect
	github.com/ssor/bom v0.0.0-20170718123548-6386211fdfcf // indirect
	github.com/steveyen/gtreap v0.1.0 // indirect
	github.com/stoewer/go-strcase v1.2.0 // indirect
	github.com/streadway/amqp v1.0.0 // indirect
	github.com/subosito/gotenv v1.2.0 // indirect
	github.com/thales-e-security/pool v0.0.2 // indirect
	github.com/tidwall/gjson v1.14.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.0 // indirect
	github.com/tidwall/sjson v1.2.3 // indirect
	github.com/tinylib/msgp v1.1.7-0.20211026165309-e818a1881b0e // indirect
	github.com/tklauser/go-sysconf v0.3.9 // indirect
	github.com/tklauser/numcpus v0.3.0 // indirect
	github.com/twmb/murmur3 v1.1.6 // indirect
	github.com/uber/jaeger-client-go v2.29.1+incompatible // indirect
	github.com/uber/jaeger-lib v2.4.1+incompatible // indirect
	github.com/unrolled/secure v1.0.9 // indirect
	github.com/urfave/cli v1.22.5 // indirect
	github.com/urfave/negroni v1.0.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/vanng822/css v0.0.0-20190504095207-a21e860bcd04 // indirect
	github.com/vanng822/go-premailer v0.0.0-20191214114701-be27abe028fe // indirect
	github.com/vmihailenco/msgpack v4.0.4+incompatible // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.0.2 // indirect
	github.com/xdg-go/stringprep v1.0.2 // indirect
	github.com/xdg/scram v0.0.0-20180814205039-7eeb5667e42c // indirect
	github.com/xdg/stringprep v1.0.0 // indirect
	github.com/yargevad/filepathx v1.0.0 // indirect
	github.com/youmark/pkcs8 v0.0.0-20181117223130-1be2e3e5546d // indirect
	github.com/yudai/golcs v0.0.0-20170316035057-ecda9a501e82 // indirect
	github.com/yudai/pp v2.0.1+incompatible // indirect
	github.com/yuin/goldmark v1.4.1 // indirect
	github.com/yuin/goldmark-highlighting v0.0.0-20210516132338-9216f9c5aa01 // indirect
	github.com/zeebo/xxh3 v1.0.0 // indirect
	go.elastic.co/apm v1.14.0 // indirect
	go.elastic.co/apm/module/apmhttp v1.14.0 // indirect
	go.elastic.co/apm/module/apmot v1.14.0 // indirect
	go.elastic.co/fastjson v1.1.0 // indirect
	go.etcd.io/etcd/client/pkg/v3 v3.5.1 // indirect
	go.mozilla.org/pkcs7 v0.0.0-20210826202110-33d05740a352 // indirect
	go.opencensus.io v0.23.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/httptrace/otelhttptrace v0.25.0 // indirect
	go.opentelemetry.io/otel v1.2.0 // indirect
	go.opentelemetry.io/otel/bridge/opentracing v1.2.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.2.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.2.0 // indirect
	go.opentelemetry.io/otel/sdk v1.2.0 // indirect
	go.opentelemetry.io/otel/trace v1.2.0 // indirect
	go.opentelemetry.io/proto/otlp v0.10.0 // indirect
	go.step.sm/cli-utils v0.6.0 // indirect
	go.step.sm/crypto v0.11.0 // indirect
	go.step.sm/linkedca v0.5.0 // indirect
	go.uber.org/atomic v1.9.0 // indirect
	go.uber.org/multierr v1.7.0 // indirect
	golang.org/x/lint v0.0.0-20210508222113-6edffad5e616 // indirect
	golang.org/x/mod v0.5.1 // indirect
	golang.org/x/sys v0.0.0-20220429121018-84afa8d3f7b3 // indirect
	golang.org/x/term v0.0.0-20220411215600-e5f449aeb171 // indirect
	golang.org/x/tools v0.1.7 // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/api v0.63.0 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	gopkg.in/DataDog/dd-trace-go.v1 v1.33.0 // indirect
	gopkg.in/alexcesaro/quotedprintable.v3 v3.0.0-20150716171945-2caba252f4dc // indirect
	gopkg.in/h2non/filetype.v1 v1.0.5 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/ini.v1 v1.66.2 // indirect
	gopkg.in/jcmturner/aescts.v1 v1.0.1 // indirect
	gopkg.in/jcmturner/dnsutils.v1 v1.0.1 // indirect
	gopkg.in/jcmturner/gokrb5.v7 v7.5.0 // indirect
	gopkg.in/jcmturner/rpc.v1 v1.1.0 // indirect
	gopkg.in/sourcemap.v1 v1.0.5 // indirect
	gopkg.in/square/go-jose.v2 v2.6.0 // indirect
	gopkg.in/tomb.v1 v1.0.0-20141024135613-dd632973f1e7 // indirect
	gopkg.in/yaml.v3 v3.0.0-20210107192922-496545a6307b // indirect
	howett.net/plist v0.0.0-20201203080718-1454fab16a06 // indirect
	k8s.io/api v0.21.1 // indirect
	k8s.io/client-go v0.21.1 // indirect
	k8s.io/klog/v2 v2.30.0 // indirect
	k8s.io/kube-openapi v0.0.0-20210305001622-591a79e4bda7 // indirect
	k8s.io/utils v0.0.0-20201110183641-67b214c5f920 // indirect
	maze.io/x/duration v0.0.0-20160924141736-faac084b6075 // indirect
	sigs.k8s.io/controller-runtime v0.8.0 // indirect
	sigs.k8s.io/structured-merge-diff/v4 v4.1.0 // indirect
	sigs.k8s.io/yaml v1.2.0 // indirect
)

//replace github.com/minio/minio => /Users/charles/Sources/go/src/github.com/pydio/minio

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20220406100704-41fdf38e3122
