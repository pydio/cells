package sqlsessions

import (
	"context"
	"encoding/gob"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/service/frontend/sessions/utils"
	"github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
/*
	queries      = map[string]string{
		"insert": "INSERT INTO idm_frontend_sessions (id, session_data, session_url, created_on, modified_on, expires_on) VALUES (NULL,?,?,?,?,?)",
		"update": "UPDATE idm_frontend_sessions SET session_data = ?, created_on = ?, expires_on = ? WHERE id = ?",
		"delete": "DELETE FROM idm_frontend_sessions WHERE id = ?",
		"select": "SELECT id, session_data, created_on, modified_on, expires_on from idm_frontend_sessions WHERE id = ?",
		"clean":  "DELETE FROM idm_frontend_sessions WHERE expires_on < NOW()",
	}
*/
)

type SessionRow struct {
	ID         string    `gorm:"primaryKey; column:id"`
	Data       string    `gorm:"column:session_data"`
	URL        string    `gorm:"column:session_url"`
	CreatedOn  time.Time `gorm:"column:created_on"`
	ModifiedOn time.Time `gorm:"column:modified_on"`
	ExpiresOn  time.Time `gorm:"column:expires_on"`
}

func (r *SessionRow) TableName(namer schema.Namer) string {
	return namer.TableName("sessions")
}

func (r *SessionRow) BeforeCreate(db *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New()
	}
	return nil
}

var expirers *openurl.Pool[*sync.Once]

func init() {
	gob.Register(time.Time{})
	expirers = openurl.MustMemPool[*sync.Once](context.Background(), func(ctx context.Context, url string) *sync.Once {
		return &sync.Once{}
	})
}

type Impl struct {
	*sql.Abstract

	Codecs       []securecookie.Codec
	Options      *sessions.Options
	startExpirer sync.Once
}

func (h *Impl) Migrate(ctx context.Context) error {
	return h.Session(ctx).AutoMigrate(&SessionRow{})
}

// GetSession implements the SessionDAO interface
func (h *Impl) GetSession(r *http.Request) (*sessions.Session, error) {
	// Auto start expirer - we should find a way to send a Done signal
	ctx := r.Context()
	if once, er := expirers.Get(ctx); er == nil {
		once.Do(func() {
			h.DeleteExpired(context.TODO(), log.Logger(r.Context()))
		})
	}
	return h.Get(r, utils.SessionName(r))
}

// Init handler for the SQL DAO
func (h *Impl) Init(ctx context.Context, options configx.Values) error {
	keys, er := utils.LoadKey(ctx)
	if er != nil {
		return er
	}
	h.Codecs = securecookie.CodecsFromPairs(keys)

	return nil
}

func (h *Impl) Get(r *http.Request, name string) (*sessions.Session, error) {
	return sessions.GetRegistry(r).Get(h, name)
}

func (h *Impl) New(r *http.Request, name string) (*sessions.Session, error) {
	crtURL := utils.RequestURL(r)
	session := sessions.NewSession(h, name)
	session.Options = &sessions.Options{
		Path:     h.Options.Path,
		MaxAge:   h.Options.MaxAge,
		HttpOnly: h.Options.HttpOnly,
		Domain:   crtURL.Hostname(),
		Secure:   crtURL.Scheme == "https",
	}
	session.IsNew = true
	if cook, errCookie := r.Cookie(name); errCookie == nil {
		var err error
		err = securecookie.DecodeMulti(name, cook.Value, &session.ID, h.Codecs...)
		if err == nil {
			err = h.load(r.Context(), session)
			if err == nil {
				session.IsNew = false
			} else {
				err = nil
			}
		}
	}
	return session, nil
}

func (h *Impl) Save(r *http.Request, w http.ResponseWriter, session *sessions.Session) error {
	u := utils.RequestURL(r)
	var err error
	if session.ID == "" {
		if err = h.insert(r.Context(), u, session); err != nil {
			return err
		}
	} else if err = h.update(r.Context(), u, session); err != nil {
		return err
	}
	encoded, err := securecookie.EncodeMulti(session.Name(), session.ID, h.Codecs...)
	if err != nil {
		return err
	}
	http.SetCookie(w, sessions.NewCookie(session.Name(), encoded, session.Options))
	return nil
}

func (h *Impl) insert(ctx context.Context, u *url.URL, session *sessions.Session) error {

	var createdOn time.Time
	var modifiedOn time.Time
	var expiresOn time.Time

	crOn := session.Values["created_on"]
	if crOn == nil {
		createdOn = time.Now()
	} else {
		createdOn = crOn.(time.Time)
	}

	modifiedOn = createdOn
	exOn := session.Values["expires_on"]
	if exOn == nil {
		expiresOn = time.Now().Add(time.Second * time.Duration(session.Options.MaxAge))
	} else {
		expiresOn = exOn.(time.Time)
	}
	delete(session.Values, "created_on")
	delete(session.Values, "expires_on")
	delete(session.Values, "modified_on")

	encoded, encErr := securecookie.EncodeMulti(session.Name(), session.Values, h.Codecs...)
	if encErr != nil {
		return encErr
	}

	row := &SessionRow{
		Data:       encoded,
		URL:        fmt.Sprintf("%s://%s", u.Scheme, u.Host),
		CreatedOn:  createdOn,
		ModifiedOn: modifiedOn,
		ExpiresOn:  expiresOn,
	}
	tx := h.Session(ctx).Create(row)
	if err := tx.Error; err != nil {
		return err
	}

	session.ID = row.ID

	return nil
}

func (h *Impl) Delete(r *http.Request, w http.ResponseWriter, session *sessions.Session) error {

	// Set cookie to expire.
	options := *session.Options
	options.MaxAge = -1
	http.SetCookie(w, sessions.NewCookie(session.Name(), "", &options))
	// Clear session values.
	for k := range session.Values {
		delete(session.Values, k)
	}

	tx := h.Session(r.Context()).Delete(&SessionRow{ID: session.ID})
	if err := tx.Error; err != nil {
		return err
	}

	return nil
}

func (h *Impl) DeleteExpired(ctx context.Context, logger log.ZapLogger) {
	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		logger.Info("Starting monitor for expired sessions")
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if del, er := h.deleteExpired(ctx); er != nil {
					logger.Error("Error while running deleteExpired", zap.Error(er))
				} else if del > 0 {
					logger.Info(fmt.Sprintf("Cleaned %d expired sessions", del), zap.Int64("count", del))
				}
			case <-ctx.Done():
				break
			}
		}
	}()
}

func (h *Impl) deleteExpired(ctx context.Context) (int64, error) {
	tx := h.Session(ctx).Where(clause.Lt{Column: "expires_on", Value: time.Now()}).Delete(&SessionRow{})
	if err := tx.Error; err != nil {
		return 0, err
	}

	return tx.RowsAffected, nil
}

func (h *Impl) update(ctx context.Context, u *url.URL, session *sessions.Session) error {
	if session.IsNew == true {
		return h.insert(nil, u, session)
	}
	var createdOn time.Time
	var expiresOn time.Time
	crOn := session.Values["created_on"]
	if crOn == nil {
		createdOn = time.Now()
	} else {
		createdOn = crOn.(time.Time)
	}

	exOn := session.Values["expires_on"]
	if exOn == nil {
		expiresOn = time.Now().Add(time.Second * time.Duration(session.Options.MaxAge))
	} else {
		expiresOn = exOn.(time.Time)
		if expiresOn.Sub(time.Now().Add(time.Second*time.Duration(session.Options.MaxAge))) < 0 {
			expiresOn = time.Now().Add(time.Second * time.Duration(session.Options.MaxAge))
		}
	}

	delete(session.Values, "created_on")
	delete(session.Values, "expires_on")
	delete(session.Values, "modified_on")
	encoded, encErr := securecookie.EncodeMulti(session.Name(), session.Values, h.Codecs...)
	if encErr != nil {
		return encErr
	}

	tx := h.Session(ctx).Where(&SessionRow{ID: session.ID}).Updates(&SessionRow{
		Data:       encoded,
		URL:        fmt.Sprintf("%s://%s", u.Scheme, u.Host),
		CreatedOn:  createdOn,
		ModifiedOn: time.Now(),
		ExpiresOn:  expiresOn,
	})
	if err := tx.Error; err != nil {
		return err
	}
	return nil
}

func (h *Impl) load(ctx context.Context, session *sessions.Session) error {

	var sess SessionRow
	tx := h.Session(ctx).Where(&SessionRow{ID: session.ID}).First(&sess)
	if err := tx.Error; err != nil {
		return err
	}

	if sess.ExpiresOn.Sub(time.Now()) < 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Session expired on %s, but it is %s now.", sess.ExpiresOn, time.Now()))
		return errors.New("session expired")
	}

	if err := securecookie.DecodeMulti(session.Name(), sess.Data, &session.Values, h.Codecs...); err != nil {
		return err
	}
	session.Values["created_on"] = sess.CreatedOn
	session.Values["modified_on"] = sess.ModifiedOn
	session.Values["expires_on"] = sess.ExpiresOn
	return nil
}
