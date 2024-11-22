/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package sql

import (
	"context"
	"time"

	pop "github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	foauth2 "github.com/ory/fosite/handler/oauth2"
	"github.com/ory/hydra/v2/client"
	"github.com/ory/x/networkx"
	"github.com/ory/x/popx"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/idm/oauth"
)

var _ foauth2.TokenRevocationStorage = (*sqlPersister)(nil)

func newPersister(ctx context.Context, db *gorm.DB, r oauth.Registry) *sqlPersister {
	return &sqlPersister{
		Manager:       oauth.NewClientConfigDriver(ctx),
		consentDriver: &consentDriver{sql.NewAbstract(db), r},
		oauth2Driver:  &oauth2Driver{sql.NewAbstract(db), r},
		jwkDriver:     &jwkDriver{sql.NewAbstract(db), r},
		trustDriver:   &trustDriver{},
	}
}

type sqlPersister struct {
	client.Manager
	*consentDriver
	*oauth2Driver
	*jwkDriver
	*trustDriver
}

func (c *sqlPersister) NewNonce(ctx context.Context, accessToken string, expiresAt time.Time) (string, error) {
	//TODO implement me
	panic("implement me")
}

func (c *sqlPersister) IsNonceValid(ctx context.Context, accessToken string, nonce string) error {
	//TODO implement me
	panic("implement me")
}

func (c *sqlPersister) Authenticate(ctx context.Context, name string, secret string) error {
	//TODO implement me
	panic("implement me")
}

func (c *sqlPersister) NetworkID(ctx context.Context) uuid.UUID {
	//TODO implement me
	panic("implement me")
}

func (c *sqlPersister) DetermineNetwork(ctx context.Context) (*networkx.Network, error) {
	//TODO implement me
	panic("implement me")
}

func (c *sqlPersister) MigrationStatus(ctx context.Context) (popx.MigrationStatuses, error) {
	return popx.MigrationStatuses{}, nil
}

func (c *sqlPersister) MigrateDown(ctx context.Context, i int) error {
	if err := c.consentDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.jwkDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.oauth2Driver.Migrate(ctx); err != nil {
		return err
	}

	return nil
}

func (c *sqlPersister) MigrateUp(ctx context.Context) error {
	if err := c.consentDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.jwkDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.oauth2Driver.Migrate(ctx); err != nil {
		return err
	}

	return nil
}

func (c *sqlPersister) PrepareMigration(ctx context.Context) error {
	if err := c.consentDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.jwkDriver.AutoMigrate(); err != nil {
		return err
	}
	if err := c.oauth2Driver.Migrate(ctx); err != nil {
		return err
	}

	return nil
}

func (c *sqlPersister) Connection(ctx context.Context) *pop.Connection {
	// Not used
	return &pop.Connection{}
}

func (c *sqlPersister) Ping() error {
	// Not used
	return nil
}
