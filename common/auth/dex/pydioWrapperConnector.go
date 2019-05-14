/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package dex

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"

	"github.com/coreos/dex/connector"
	"github.com/micro/go-micro/errors"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
)

type WrapperConfig struct {
	Connectors []ConnectorConfig `json:"pydioconnectors"`
}

type ConnectorConfig struct {
	Type   string          `json:"type"`
	ID     int16           `json:"id"`
	Name   string          `json:"name"`
	IsLast bool            `json:islast`
	Config json.RawMessage `json:"config"`
}

func (c *WrapperConfig) Open(logger logrus.FieldLogger) (connector.Connector, error) {
	return c.OpenConnector(logger)
}

func (c *WrapperConfig) OpenConnector(logger logrus.FieldLogger) (interface {
	connector.Connector
	connector.PasswordConnector
	connector.RefreshConnector
}, error) {
	return c.openConnector(logger)
}

func (c *WrapperConfig) openConnector(logger logrus.FieldLogger) (*pydioWrapperConnector, error) {
	return &pydioWrapperConnector{*c, logger}, nil
}

type pydioWrapperConnector struct {
	WrapperConfig
	logger logrus.FieldLogger
}

var (
	_ connector.PasswordConnector = (*pydioWrapperConnector)(nil)
	_ connector.RefreshConnector  = (*pydioWrapperConnector)(nil)
)

/////////////////////////////////
// Connector Interface Methods
/////////////////////////////////

// Login binds a user by name / password, trying on various connectors.
func (p *pydioWrapperConnector) Login(ctx context.Context, s connector.Scopes, username, password string) (identity connector.Identity, validPassword bool, err error) {

	in := &WrapperConnectorOperation{
		OperationType: "Login",
		Login:         username,
		Password:      password,
		Scopes:        s,
	}
	out, err := ApplyWrapperConnectorMiddlewares(ctx, in, p.performLoginOnConnectors)
	if err != nil {
		return connector.Identity{}, !out.LoginError, err
	}
	return out.Identity, true, nil
}

// Refresh reloads user info and checks pydio internal services for possible revokations.
// It does not list on connectors.
func (p *pydioWrapperConnector) Refresh(ctx context.Context, s connector.Scopes, ident connector.Identity) (connector.Identity, error) {

	in := &WrapperConnectorOperation{
		OperationType: "Refresh",
		Identity:      ident,
		Scopes:        s,
	}
	out, err := ApplyWrapperConnectorMiddlewares(ctx, in, nil)
	if err != nil {
		out.Identity = connector.Identity{}
	}
	return out.Identity, err

}

///////////////////////
// Pydio API Methods
///////////////////////

func ConvertUserApiToIdentity(idmUser *idm.User, authSourceName string) (ident connector.Identity) {

	email, ok := idmUser.Attributes["email"]
	if !ok {
		email = ""
	}

	return connector.Identity{
		UserID:        idmUser.Uuid,
		Username:      idmUser.Login,
		Email:         email,
		EmailVerified: true,
		Groups:        []string{},
	}
}

///////////////////////
// Configs Methods
///////////////////////

func (p *pydioWrapperConnector) performLoginOnConnectors(ctx context.Context, op *WrapperConnectorOperation) (*WrapperConnectorOperation, error) {

	listConnector, err := p.getConnectorList(p.logger)
	if err != nil {
		return op, err
	}
	for _, pydioConnector := range listConnector {
		if _, ok, err := pydioConnector.Connector.Login(ctx, op.Scopes, op.Login, op.Password); !ok || err != nil {
			log.Logger(ctx).Debug("Login request failed on sub-connector", zap.String(common.KEY_USERNAME, op.Login), zap.String(common.KEY_CONNECTOR, pydioConnector.Name), zap.Error(err))
			continue
		}
		// Success
		op.ValidUsername = op.Login
		op.AuthSource = pydioConnector.Name
		return op, nil
	}
	// No login succeeded
	op.LoginError = true
	return op, errors.Unauthorized(common.SERVICE_AUTH, "cannot find username or password")

}

// Lists connectors from config.
func (p *pydioWrapperConnector) getConnectorList(logger logrus.FieldLogger) (connectorList []ConnectorList, err error) {
	// Sort
	sort.Sort(byID(p.Connectors))
	// end sort
	for _, connConfig := range p.Connectors {
		connConnector, er := createConnector(logger, connConfig.Type, connConfig)
		if er != nil {
			logger.Errorf(er.Error())
			continue
		}
		connConnectorFull := ConnectorList{
			Type: connConfig.Type,
			Name: connConfig.Name,
			ID:   connConfig.ID,
			Connector: connConnector.(interface {
				connector.Connector
				connector.PasswordConnector
				connector.RefreshConnector
			}),
		}
		connectorList = append(connectorList, connConnectorFull)
	}
	return connectorList, nil
}

type ConnectorList struct {
	Type      string `json:"type"`
	Name      string `json:"name"`
	ID        int16  `json:"id"`
	IsLast    bool   `json:islast`
	Connector interface {
		connector.Connector
		connector.PasswordConnector
		connector.RefreshConnector
	}
}

// PydioConnector is a magical type that can unmarshal YAML dynamically. The
// Type field determines the connector type, which is then customized for Config.
type PydioConnector struct {
	Type   string               `json:"type"`
	Name   string               `json:"name"`
	ID     int16                `json:"id"`
	IsLast bool                 `json:islast`
	Config PydioConnectorConfig `json:"config"`
}

// createConnector parses the connector config and open the connector.
func createConnector(logger logrus.FieldLogger, connectorType string, connectorConfig ConnectorConfig) (connector.Connector, error) {
	var c connector.Connector

	if connectorConfig.Type == connectorType {
		//logger.Info("parse connector config: Type: Name == %s:%s", connectorConfig.Type, connectorConfig.Name)
		f, ok := PydioConnectorsConfig[connectorType]
		if !ok {
			return c, fmt.Errorf("unknown connector type %q", connectorType)
		}

		connConfig := f()
		if connectorConfig.Config != nil {
			//data := []byte(connectorConfig.Config)
			if err := json.Unmarshal(connectorConfig.Config, connConfig); err != nil {
				logger.Errorf("parse connector config: %v", err)
				return c, fmt.Errorf("parse connector config: %v", err)
			}
		}

		c, err := connConfig.Open(logger)
		if err != nil {
			logger.Errorf("failed to create connector %d - %s: %v", connectorConfig.ID, connectorConfig.Name, err)
			return c, fmt.Errorf("failed to create connector %d - %s: %v", connectorConfig.ID, connectorConfig.Name, err)
		}

		return c, nil
	}

	return nil, fmt.Errorf("unknown connector type %q", connectorType)
}

type byID []ConnectorConfig

func (n byID) Len() int           { return len(n) }
func (n byID) Less(i, j int) bool { return n[i].ID > n[j].ID }
func (n byID) Swap(i, j int)      { n[i], n[j] = n[j], n[i] }
