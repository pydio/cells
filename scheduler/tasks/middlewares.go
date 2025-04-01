package tasks

import (
	"context"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	"github.com/pydio/cells/v5/common/utils/cache/gocache"
	"github.com/pydio/cells/v5/common/utils/openurl"
)

const MiddlewareActionPrefix = "middleware."

var (
	mwRegistry *openurl.Pool[cache.Cache]
)

func init() {
	mwRegistry = gocache.MustOpenNonExpirableMemory()
}

// RegisterJobMiddlewares tries to extract defined middlewares and store them in cache
func RegisterJobMiddlewares(ctx context.Context, job *jobs.Job) {
	ka, _ := mwRegistry.Get(ctx)
	_ = ka.Delete(job.GetID())
	if dd := jobToMiddlewareDescriptor(ctx, job); len(dd) > 0 {
		if e := ka.Set(job.GetID(), dd); e != nil {
			log.Logger(ctx).Error("failed to cache middleware descriptor", zap.Error(e))
		}
	}
}

// UnregisterJobMiddlewares removes any defined middlewares for this job
func UnregisterJobMiddlewares(ctx context.Context, jobID string) {
	ka, _ := mwRegistry.Get(ctx)
	_ = ka.Delete(jobID)
}

// ListJobsMiddlewares iterates on cache to return the known middlewares
func ListJobsMiddlewares(ctx context.Context) (dd []*jobs.MiddlewareDescriptor) {
	ka, _ := mwRegistry.Get(ctx)
	_ = ka.Iterate(func(key string, val interface{}) {
		if md, ok := val.([]*jobs.MiddlewareDescriptor); ok {
			dd = append(dd, md...)
		}
	})
	return
}

type filtersProvider interface {
	GetNodesFilter() *jobs.NodesSelector
	GetIdmFilter() *jobs.IdmSelector
	GetDataSourceFilter() *jobs.DataSourceSelector
	GetContextMetaFilter() *jobs.ContextMetaFilter
}

func jobToMiddlewareDescriptor(ctx context.Context, job *jobs.Job) (dd []*jobs.MiddlewareDescriptor) {
	filters := findGenericFilters(job, nil)
	for _, ca := range job.Actions {
		cl := &jobs.MiddlewareDescriptor{
			Filters: filters,
		}
		searchMiddlewareInBranch(ctx, ca, cl, &dd)
	}
	if len(dd) > 0 {
		log.Logger(ctx).Info("Found middlewares defined for job "+job.Label, zap.Int("count", len(dd)))
	}
	return
}

func searchMiddlewareInBranch(ctx context.Context, action *jobs.Action, branchDescriptor *jobs.MiddlewareDescriptor, dd *[]*jobs.MiddlewareDescriptor) {
	branchDescriptor.Filters = append(branchDescriptor.Filters, findGenericFilters(action, action.GetDataFilter())...)
	if strings.HasPrefix(action.ID, MiddlewareActionPrefix) && !action.Bypass {
		// append this action to the current list
		registerAction := &jobs.Action{
			ID:          action.ID,
			Label:       action.Label,
			Description: action.Description,
			Timeout:     action.Timeout,
			Parameters:  action.Parameters,
		}
		branchDescriptor.Actions = append(branchDescriptor.Actions, registerAction)
		*dd = append(*dd, branchDescriptor)
	}
	if action.BreakAfter || len(action.ChainedActions) == 0 {
		// Branch stops now, return
		return
	}

	for _, ca := range action.ChainedActions {
		cl := proto.Clone(branchDescriptor).(*jobs.MiddlewareDescriptor)
		searchMiddlewareInBranch(ctx, ca, cl, dd)
	}
}

func findGenericFilters(provider filtersProvider, dataFilter *jobs.DataSelector) []*jobs.GenericFilter {
	var filters []*jobs.GenericFilter
	if dataFilter != nil {
		filters = append(filters, &jobs.GenericFilter{Filter: &jobs.GenericFilter_DataSelector{DataSelector: dataFilter}})
	}
	if provider.GetNodesFilter() != nil {
		filters = append(filters, &jobs.GenericFilter{Filter: &jobs.GenericFilter_NodeSelector{NodeSelector: provider.GetNodesFilter()}})
	}
	if provider.GetIdmFilter() != nil {
		filters = append(filters, &jobs.GenericFilter{Filter: &jobs.GenericFilter_IdmSelector{IdmSelector: provider.GetIdmFilter()}})
	}
	if provider.GetDataSourceFilter() != nil {
		filters = append(filters, &jobs.GenericFilter{Filter: &jobs.GenericFilter_DataSourceSelector{DataSourceSelector: provider.GetDataSourceFilter()}})
	}
	if provider.GetContextMetaFilter() != nil {
		filters = append(filters, &jobs.GenericFilter{Filter: &jobs.GenericFilter_ContextMetaFilter{ContextMetaFilter: provider.GetContextMetaFilter()}})
	}
	return filters
}
