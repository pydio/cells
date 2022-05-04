package sqlsessions

import (
	"context"
	"embed"
	"encoding/gob"
	"errors"
	"fmt"
	"go.uber.org/zap"
	"net/http"
	"net/url"
	"time"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/service/frontend/sessions/utils"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS
	queries      = map[string]string{
		"insert": "INSERT INTO idm_frontend_sessions (id, session_data, session_url, created_on, modified_on, expires_on) VALUES (NULL,?,?,?,?,?)",
		"update": "UPDATE idm_frontend_sessions SET session_data = ?, created_on = ?, expires_on = ? WHERE id = ?",
		"delete": "DELETE FROM idm_frontend_sessions WHERE id = ?",
		"select": "SELECT id, session_data, created_on, modified_on, expires_on from idm_frontend_sessions WHERE id = ?",
		"clean":  "DELETE FROM idm_frontend_sessions WHERE expires_on < NOW()",
	}
)

type sessionRow struct {
	id         string
	data       string
	createdOn  time.Time
	modifiedOn time.Time
	expiresOn  time.Time
}

func init() {
	gob.Register(time.Time{})
}

type Impl struct {
	sql.DAO
	Codecs  []securecookie.Codec
	Options *sessions.Options
}

// GetSession implements the SessionDAO interface
func (h *Impl) GetSession(r *http.Request) (*sessions.Session, error) {
	return h.Get(r, utils.SessionName(r))
}

// Init handler for the SQL DAO
func (h *Impl) Init(ctx context.Context, options configx.Values) error {

	// super
	if e := h.DAO.Init(ctx, options); e != nil {
		return e
	}

	keys, er := utils.LoadKey()
	if er != nil {
		return er
	}
	h.Codecs = securecookie.CodecsFromPairs(keys)

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         h.Driver(),
		TablePrefix: h.Prefix(),
	}

	_, err := sql.ExecMigration(h.DB(), h.Driver(), migrations, migrate.Up, "idm_frontend")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := h.Prepare(key, query); err != nil {
				return err
			}
		}
	}

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
	var err error
	if cook, errCookie := r.Cookie(name); errCookie == nil {
		err = securecookie.DecodeMulti(name, cook.Value, &session.ID, h.Codecs...)
		if err == nil {
			err = h.load(session)
			if err == nil {
				session.IsNew = false
			} else {
				err = nil
			}
		}
	}
	return session, err
}

func (h *Impl) Save(r *http.Request, w http.ResponseWriter, session *sessions.Session) error {
	u := utils.RequestURL(r)
	var err error
	if session.ID == "" {
		if err = h.insert(u, session); err != nil {
			return err
		}
	} else if err = h.update(u, session); err != nil {
		return err
	}
	encoded, err := securecookie.EncodeMulti(session.Name(), session.ID, h.Codecs...)
	if err != nil {
		return err
	}
	http.SetCookie(w, sessions.NewCookie(session.Name(), encoded, session.Options))
	return nil
}

func (h *Impl) insert(u *url.URL, session *sessions.Session) error {
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
	stmt, e := h.GetStmt("insert")
	if e != nil {
		return fmt.Errorf("cannot get dao statement")
	}
	sU := fmt.Sprintf("%s://%s", u.Scheme, u.Host)
	res, insErr := stmt.Exec(encoded, sU, createdOn, modifiedOn, expiresOn)
	if insErr != nil {
		return insErr
	}
	lastInserted, lInsErr := res.LastInsertId()
	if lInsErr != nil {
		return lInsErr
	}
	session.ID = fmt.Sprintf("%d", lastInserted)
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

	stmt, e := h.GetStmt("delete")
	if e != nil {
		return fmt.Errorf("cannot load dao statement")
	}
	_, delErr := stmt.Exec(session.ID)
	if delErr != nil {
		return delErr
	}
	return nil
}

func (h *Impl) DeleteExpired(ctx context.Context, logger log.ZapLogger) {
	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if del, er := h.deleteExpired(); er != nil {
					logger.Error("Error while running deleteExpired", zap.Error(er))
				} else {
					logger.Info(fmt.Sprintf("Successfully cleaned %d sessions", del), zap.Int64("count", del))
				}
			case <-ctx.Done():
				break
			}
		}
	}()
}

func (h *Impl) deleteExpired() (int64, error) {
	stmt, e := h.GetStmt("clean")
	if e != nil {
		return 0, e
	}
	res, e := stmt.Exec()
	if e != nil {
		return 0, e
	}
	return res.RowsAffected()
}

func (h *Impl) update(u *url.URL, session *sessions.Session) error {
	if session.IsNew == true {
		return h.insert(u, session)
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

	stmt, e := h.GetStmt("update")
	if e != nil {
		return fmt.Errorf("cannot load dao statement")
	}
	_, updErr := stmt.Exec(encoded, createdOn, expiresOn, session.ID)
	if updErr != nil {
		return updErr
	}
	return nil
}

func (h *Impl) load(session *sessions.Session) error {
	stmt, e := h.GetStmt("select")
	if e != nil {
		return fmt.Errorf("cannot load dao statement")
	}

	row := stmt.QueryRow(session.ID)
	sess := sessionRow{}
	scanErr := row.Scan(&sess.id, &sess.data, &sess.createdOn, &sess.modifiedOn, &sess.expiresOn)
	if scanErr != nil {
		return scanErr
	}
	if sess.expiresOn.Sub(time.Now()) < 0 {
		log.Logger(context.Background()).Info(fmt.Sprintf("Session expired on %s, but it is %s now.", sess.expiresOn, time.Now()))
		return errors.New("Session expired")
	}
	err := securecookie.DecodeMulti(session.Name(), sess.data, &session.Values, h.Codecs...)
	if err != nil {
		return err
	}
	session.Values["created_on"] = sess.createdOn
	session.Values["modified_on"] = sess.modifiedOn
	session.Values["expires_on"] = sess.expiresOn
	return nil
}
