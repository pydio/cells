package sql

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/storage/sql/resources"
)

// NewAbstract initializes a new Abstract to be used by DAO implementation
func NewAbstract(db *gorm.DB) *Abstract {
	return &Abstract{DB: db}
}

func NewAbstractResources(db *gorm.DB) *AbstractResources {
	return &AbstractResources{
		Abstract:  &Abstract{DB: db},
		Resources: resources.NewDAO(db),
	}
}

type Abstract struct {
	*gorm.DB
	migrateModels func() []any
}

type Resources resources.DAO

type AbstractResources struct {
	*Abstract
	Resources
}

// WithModels sets the migrateModels factory for auto migration
func (a *Abstract) WithModels(factory func() []any) *Abstract {
	a.migrateModels = factory
	return a
}

// Session creates a gorm session with given context and default config (SkipDefaultTransaction: true)
func (a *Abstract) Session(ctx context.Context) *gorm.DB {
	return a.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)
}

func (a *Abstract) Migrate(ctx context.Context) error {
	if a.migrateModels == nil {
		return fmt.Errorf("no models factoring given, implement your own Migrate")
	}
	return a.Session(ctx).AutoMigrate(a.migrateModels()...)
}

// MigrateWithCtx triggers AutoMigrate in context
func (a *Abstract) MigrateWithCtx(ctx context.Context, dst ...any) error {
	return a.Session(ctx).AutoMigrate(dst...)
}

func (a *AbstractResources) Migrate(ctx context.Context) error {
	if er := a.Abstract.Migrate(ctx); er != nil {
		return er
	}
	return a.Resources.Migrate(ctx)
}

func (a *AbstractResources) WithModels(factory func() []any) *AbstractResources {
	a.migrateModels = factory
	return a
}
