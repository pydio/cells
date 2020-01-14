package jobs

import (
	"context"
	"strings"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/golang/protobuf/ptypes"
	"github.com/micro/go-micro/metadata"
	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common/proto/idm"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/policy"
)

func (m *ContextMetaFilter) Filter(ctx context.Context, input ActionMessage) (ActionMessage, bool) {
	if len(m.Query.SubQueries) == 0 {
		return input, true
	}
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
