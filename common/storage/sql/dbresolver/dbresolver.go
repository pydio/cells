package dbresolver

import (
	"sync"

	"gorm.io/gorm"
)

const (
	Write Operation = "write"
	Read  Operation = "read"
)

type DBResolver struct {
	*gorm.DB
	configs          []Config
	resolvers        tenantResolver
	global           *resolver
	prepareStmtStore map[gorm.ConnPool]*gorm.PreparedStmtDB
	compileCallbacks []func(gorm.ConnPool) error

	once *sync.Once
}

type tenantResolver map[string]serviceResolver

type serviceResolver map[string]*resolver

type Config struct {
	Sources           []gorm.Dialector
	Replicas          []gorm.Dialector
	Policy            Policy
	Service           string
	Tenant            string
	meta              map[string]string
	TraceResolverMode bool
}

func New() *DBResolver {
	return &DBResolver{}
}

func Register(config Config) *DBResolver {
	return (&DBResolver{}).Register(config)
}

func (dr *DBResolver) Register(config Config) *DBResolver {
	if dr.prepareStmtStore == nil {
		dr.prepareStmtStore = map[gorm.ConnPool]*gorm.PreparedStmtDB{}
	}

	if dr.resolvers == nil {
		dr.resolvers = make(tenantResolver)
	}

	if config.Policy == nil {
		config.Policy = RandomPolicy{}
	}

	dr.configs = append(dr.configs, config)
	if dr.DB != nil {
		dr.compileConfig(config)
	}
	return dr
}

func (dr *DBResolver) Name() string {
	return "cells:db_resolver"
}

func (dr *DBResolver) Initialize(db *gorm.DB) error {
	dr.DB = db

	if dr.once == nil {
		dr.once = &sync.Once{}
	}

	var err error

	dr.once.Do(func() {
		dr.registerCallbacks(db)
		err = dr.compile()
	})

	return err
}

func (dr *DBResolver) compile() error {
	for _, config := range dr.configs {
		if err := dr.compileConfig(config); err != nil {
			return err
		}
	}
	return nil
}

func (dr *DBResolver) compileConfig(config Config) (err error) {
	var (
		connPool = dr.DB.Config.ConnPool
		r        = resolver{
			dbResolver:        dr,
			policy:            config.Policy,
			traceResolverMode: config.TraceResolverMode,
		}
	)

	if preparedStmtDB, ok := connPool.(*gorm.PreparedStmtDB); ok {
		connPool = preparedStmtDB.ConnPool
	}

	if len(config.Sources) == 0 {
		r.sources = []gorm.ConnPool{connPool}
	} else if r.sources, err = dr.convertToConnPool(config.Sources); err != nil {
		return err
	}

	if len(config.Replicas) == 0 {
		r.replicas = r.sources
	} else if r.replicas, err = dr.convertToConnPool(config.Replicas); err != nil {
		return err
	}

	tr, ok := dr.resolvers[config.Tenant]
	if !ok {
		tr = make(serviceResolver)
		dr.resolvers[config.Tenant] = tr
	}

	tr[config.Service] = &r

	for _, fc := range dr.compileCallbacks {
		if err = r.call(fc); err != nil {
			return err
		}
	}

	if config.TraceResolverMode {
		dr.Logger = NewResolverModeLogger(dr.Logger)
	}

	return nil
}

func (dr *DBResolver) convertToConnPool(dialectors []gorm.Dialector) (connPools []gorm.ConnPool, err error) {
	config := *dr.DB.Config
	for _, dialector := range dialectors {
		if db, err := gorm.Open(dialector, &config); err == nil {
			connPool := db.Config.ConnPool
			if preparedStmtDB, ok := connPool.(*gorm.PreparedStmtDB); ok {
				connPool = preparedStmtDB.ConnPool
			}

			dr.prepareStmtStore[connPool] = &gorm.PreparedStmtDB{
				ConnPool:    db.Config.ConnPool,
				Stmts:       map[string]*gorm.Stmt{},
				Mux:         &sync.RWMutex{},
				PreparedSQL: make([]string, 0, 100),
			}

			connPools = append(connPools, connPool)
		} else {
			return nil, err
		}
	}

	return connPools, err
}

func (dr *DBResolver) resolve(stmt *gorm.Statement, op Operation) gorm.ConnPool {
	if r := dr.getResolver(stmt); r != nil {
		return r.resolve(stmt, op)
	}
	return stmt.ConnPool
}

func (dr *DBResolver) getResolver(stmt *gorm.Statement) *resolver {
	var tenant string
	var service string

	t, ok := stmt.Clauses[tenantName].Expression.(usingTenant)
	if ok {
		tenant = t.Use
	}

	tr, ok := dr.resolvers[tenant]
	if !ok {
		return nil
	}

	s, ok := stmt.Clauses[serviceName].Expression.(usingService)
	if ok {
		service = s.Use
	}

	r, ok := tr[service]
	if !ok {
		return nil
	}

	return r
}
