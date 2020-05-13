package jobs

import (
	"context"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/micro/go-micro/metadata"
	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/idm/policy"
)

func (m *ContextMetaFilter) Filter(ctx context.Context, input ActionMessage) (ActionMessage, bool) {
	if len(m.Query.SubQueries) == 0 {
		return input, true
	}
	if m.Type == ContextMetaFilterType_ContextUser {
		// Switch an IdmSelector with ContextUser as input
		return m.filterContextUserQueries(ctx, input)
	} else {
		// Apply Policy filter
		return m.filterPolicyQueries(ctx, input)
	}
}

func (m *ContextMetaFilter) filterPolicyQueries(ctx context.Context, input ActionMessage) (ActionMessage, bool) {

	policyContext := make(map[string]interface{})
	if ctxMeta, has := metadata.FromContext(ctx); has {
		for _, key := range []string{
			servicecontext.HttpMetaRemoteAddress,
			servicecontext.HttpMetaRequestURI,
			servicecontext.HttpMetaRequestMethod,
			servicecontext.HttpMetaUserAgent,
			servicecontext.HttpMetaContentType,
			servicecontext.HttpMetaCookiesString,
			servicecontext.HttpMetaProtocol,
			servicecontext.HttpMetaHostname,
			servicecontext.ServerTime,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				policyContext[key] = val
			} else if val, hasKey := ctxMeta[strings.ToLower(key)]; hasKey {
				policyContext[key] = val
			}
		}
	}
	warden := &ladon.Ladon{Manager: memory.NewMemoryManager()}
	for _, q := range m.Query.SubQueries {
		var c ContextMetaSingleQuery
		if e := ptypes.UnmarshalAny(q, &c); e == nil {
			idPol := &idm.Policy{
				Id:        uuid.New(),
				Subjects:  []string{"ctx"},
				Actions:   []string{"ctx"},
				Resources: []string{"ctx"},
				Effect:    idm.PolicyEffect_allow,
				Conditions: map[string]*idm.PolicyCondition{
					c.FieldName: c.Condition,
				},
			}
			warden.Manager.Create(policy.ProtoToLadonPolicy(idPol))
		}
	}
	if err := warden.IsAllowed(&ladon.Request{
		Subject:  "ctx",
		Action:   "ctx",
		Resource: "ctx",
		Context:  policyContext,
	}); err != nil {
		log.Logger(ctx).Debug("Filter not passing : ", zap.Error(err))
		return input, false
	}
	return input, true
}

func (m *ContextMetaFilter) filterContextUserQueries(ctx context.Context, input ActionMessage) (ActionMessage, bool) {
	selector := &IdmSelector{
		Type:  IdmSelectorType_User,
		Query: m.Query,
	}
	username, _ := permissions.FindUserNameInContext(ctx)
	var user *idm.User
	if username == "" {
		log.Logger(ctx).Debug("Applying filter on ContextUser: return false as user is not found in context")
		return input, false
	}
	if username == common.PYDIO_SYSTEM_USERNAME {
		user = &idm.User{Login: username}
	} else if u, err := permissions.SearchUniqueUser(ctx, username, "", &idm.UserSingleQuery{Login: username}); err == nil {
		user = u
	} else {
		log.Logger(ctx).Debug("Applying filter on ContextUser: return false as user is not found in the system")
		return input, false
	}
	// replace user
	tmpInput := input.WithUser(user)
	_, _, pass := selector.Filter(ctx, tmpInput)
	return input, pass
}
