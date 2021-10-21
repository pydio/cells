/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package resources provides extendable service Handler for managing resource-policy based data.
package resources

import (
	"context"
	"fmt"

	"github.com/micro/go-micro/errors"
	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/proto"
)

// Signature for a function that can load policies from a given resource
type PoliciesLoaderFunc func(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*service.ResourcePolicy, e error)

// "Abstract" class that can be implemented by REST handlers
// to add Policies checking capabilities
type ResourceProviderHandler struct {
	ResourceName   string
	ServiceName    string
	PoliciesLoader PoliciesLoaderFunc
}

// IsAllowed matches a resourceId against a policy Action
// It uses the PoliciesLoader function to first grab the policies associated to this resource,
// then use an in-memory warden to check the policies stack.
func (r *ResourceProviderHandler) IsAllowed(ctx context.Context, resourceId string, action service.ResourcePolicyAction, resourceClient interface{}) (err error) {

	if r.PoliciesLoader == nil {
		return errors.InternalServerError(r.ServiceName, "PoliciesLoader function is not implemented")
	}

	if resourceId == "" {
		return errors.NotFound(r.ServiceName, "Empty resourceId")
	}

	var policies []*service.ResourcePolicy
	if policies, err = r.PoliciesLoader(ctx, resourceId, resourceClient); err != nil {
		return err
	}

	if r.MatchPolicies(ctx, resourceId, policies, action) {
		return nil
	} else {
		return errors.Forbidden(r.ServiceName, fmt.Sprintf("Action %s is not allowed on %s %s", action.String(), r.ResourceName, resourceId))
	}

}

// IsContextEditable can be used for outputting results with a flag telling wether this resource can be edited by the
// currently logged user
func (r *ResourceProviderHandler) IsContextEditable(ctx context.Context, resourceId string, policies []*service.ResourcePolicy) bool {

	return r.MatchPolicies(ctx, resourceId, policies, service.ResourcePolicyAction_WRITE)

}

// RestToServiceResourcePolicy transforms input rest.ResourcePolicy to service.ResourcePolicy that can be used internally
func (r *ResourceProviderHandler) RestToServiceResourcePolicy(ctx context.Context, input *rest.ResourcePolicyQuery) (output *service.ResourcePolicyQuery, e error) {

	var subjects []string
	var err error
	if subjects, err = auth.SubjectsForResourcePolicyQuery(ctx, input); err != nil {
		return output, errors.Forbidden(r.ServiceName, err.Error())
	}

	if input != nil && input.Type == rest.ResourcePolicyQuery_NONE {
		return &service.ResourcePolicyQuery{
			Empty: true,
		}, nil
	} else if input != nil && input.Type == rest.ResourcePolicyQuery_ANY {
		return &service.ResourcePolicyQuery{
			Any: true,
		}, nil
	} else {
		return &service.ResourcePolicyQuery{
			Subjects: subjects,
		}, nil
	}

}

// MatchPolicies creates an memory-based policy stack checker to check if action is allowed or denied.
// It uses a DenyByDefault strategy
func (r *ResourceProviderHandler) MatchPolicies(ctx context.Context, resourceId string, policies []*service.ResourcePolicy, action service.ResourcePolicyAction, subjects ...string) bool {

	warden := &ladon.Ladon{Manager: memory.NewMemoryManager()}
	for i, pol := range policies {
		id := fmt.Sprintf("%v", pol.Id)
		if pol.Id == 0 {
			id = fmt.Sprintf("%d", i)
		}
		// We could add also conditions here
		ladonPol := &ladon.DefaultPolicy{
			ID:        id,
			Resources: []string{pol.Resource},
			Actions:   []string{pol.Action.String()},
			Effect:    pol.Effect.String(),
			Subjects:  []string{pol.Subject},
		}
		warden.Manager.Create(ladonPol)
	}
	if len(subjects) == 0 {
		subjects, _ = auth.SubjectsForResourcePolicyQuery(ctx, nil)
	}
	// check that at least one of the subject is allowed
	var allow bool
	for _, subject := range subjects {
		request := &ladon.Request{
			Resource: resourceId,
			Subject:  subject,
			Action:   action.String(),
		}
		if err := warden.IsAllowed(request); err != nil && err == ladon.ErrRequestForcefullyDenied {
			return false
		} else if err == nil {
			allow = true
		} // Else "default deny" => continue checking
	}

	return allow
}
