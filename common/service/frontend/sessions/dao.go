package sessions

import (
	"context"
	"net/http"
	"net/url"
	"sync"

	"github.com/gorilla/sessions"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/service/frontend/sessions/sqlsessions"
	"github.com/pydio/cells/v5/common/service/frontend/sessions/utils"
	"github.com/pydio/cells/v5/common/storage/sc"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
)

// NewCookieDAO creates an encrypted cookies carried along with requests
func NewCookieDAO(ctx context.Context, some *sc.Conn) DAO {

	restApi := routing.RouteIngressURIContext(ctx, common.RouteApiREST, common.DefaultRouteREST)
	timeout := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "SESSION_TIMEOUT")...).Default(60).Int()
	defaultOptions := &sessions.Options{
		Path:     restApi + "/frontend",
		MaxAge:   60 * timeout,
		HttpOnly: true,
	}

	ci := &cookiesImpl{}
	ci.storeFactory = func(u *url.URL, keyPairs ...[]byte) (sessions.Store, error) {
		cs := sessions.NewCookieStore(keyPairs...)
		cs.Options = &sessions.Options{
			Path:     defaultOptions.Path,
			MaxAge:   defaultOptions.MaxAge,
			HttpOnly: defaultOptions.HttpOnly,
		}
		if u.Scheme == "https" {
			cs.Options.Secure = true
		}
		cs.Options.Domain = u.Hostname()
		return cs, nil
	}

	ci.sessionStores = make(map[string]sessions.Store)
	if k, e := utils.LoadKey(ctx); e == nil {
		ci.secureKeyPairs = k
	}

	return ci
}

// NewSQLDAO stores sessions in DB
func NewSQLDAO(ctx context.Context, db *gorm.DB) DAO {
	restApi := routing.RouteIngressURIContext(ctx, common.RouteApiREST, common.DefaultRouteREST)
	timeout := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "SESSION_TIMEOUT")...).Default(60).Int()
	defaultOptions := &sessions.Options{
		Path:     restApi + "/frontend",
		MaxAge:   60 * timeout,
		HttpOnly: true,
	}

	return &sqlsessions.Impl{
		Abstract: sql.NewAbstract(db).WithModels(func() []any {
			return []any{&sqlsessions.SessionRow{}}
		}),
		Options: defaultOptions,
	}
}

type DAO interface {
	Migrate(ctx context.Context) error
	GetSession(r *http.Request) (*sessions.Session, error)
	DeleteExpired(ctx context.Context, logger log.ZapLogger)
}

type cookiesImpl struct {
	sync.Mutex
	secureKeyPairs []byte
	sessionStores  map[string]sessions.Store
	storeFactory   func(u *url.URL, keyPairs ...[]byte) (sessions.Store, error)
}

func (s *cookiesImpl) Init(ctx context.Context, values configx.Values) error {
	s.sessionStores = make(map[string]sessions.Store)
	if k, e := utils.LoadKey(ctx); e != nil {
		return e
	} else {
		s.secureKeyPairs = k
		return nil
	}
}

func (s *cookiesImpl) Migrate(ctx context.Context) error {
	return nil
}

func (s *cookiesImpl) GetSession(r *http.Request) (*sessions.Session, error) {
	store, er := s.storeForUrl(utils.RequestURL(r))
	if er != nil {
		return nil, er
	}
	return store.Get(r, utils.SessionName(r))
}

func (s *cookiesImpl) DeleteExpired(ctx context.Context, logger log.ZapLogger) {
	return
}

func (s *cookiesImpl) storeForUrl(u *url.URL) (sessions.Store, error) {
	key := u.Scheme + "://" + u.Hostname()
	s.Lock()
	defer s.Unlock()
	if ss, o := s.sessionStores[key]; o {
		return ss, nil
	}
	ss, e := s.storeFactory(u, s.secureKeyPairs)
	if e != nil {
		return nil, e
	}
	s.sessionStores[key] = ss
	return ss, nil
}
