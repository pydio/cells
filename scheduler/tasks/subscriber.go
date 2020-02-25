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

package tasks

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/cskr/pubsub"
	"github.com/golang/protobuf/ptypes"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/metadata"
	"github.com/micro/go-micro/server"
	context2 "github.com/pydio/cells/common/utils/context"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/common/utils/permissions"
)

const (
	PubSubTopicTaskStatuses = "tasks"
	PubSubTopicControl      = "control"
)

var (
	PubSub *pubsub.PubSub
)

// Subscriber handles incoming events, applies selectors if any
// and generates all ActionMessage to trigger actions
type Subscriber struct {
	Client          client.Client
	MainQueue       chan Runnable
	UpdateTasksChan chan *jobs.Task

	JobsDefinitions map[string]*jobs.Job
	Dispatchers     map[string]*Dispatcher

	jobsLock    *sync.RWMutex
	RootContext context.Context
	batcher     *cache.EventsBatcher
}

// NewSubscriber creates a multiplexer for tasks managements and messages
// by maintaining a map of dispacher, one for each job definition.
func NewSubscriber(parentContext context.Context, client client.Client, srv server.Server) *Subscriber {

	s := &Subscriber{
		Client:          client,
		JobsDefinitions: make(map[string]*jobs.Job),
		MainQueue:       make(chan Runnable),
		UpdateTasksChan: make(chan *jobs.Task),
		Dispatchers:     make(map[string]*Dispatcher),
		jobsLock:        &sync.RWMutex{},
	}

	PubSub = pubsub.New(0)

	s.RootContext = context.WithValue(parentContext, common.PYDIO_CONTEXT_USER_KEY, common.PYDIO_SYSTEM_USERNAME)

	s.batcher = cache.NewEventsBatcher(s.RootContext, 2*time.Second, 20*time.Second, 2000, s.processNodeEvent)

	// Use a "Queue" mechanism to make sure events are distributed accross tasks instances
	opts := func(o *server.SubscriberOptions) {
		o.Queue = "tasks"
	}
	srv.Subscribe(srv.NewSubscriber(common.TOPIC_JOB_CONFIG_EVENT, s.jobsChangeEvent, opts))
	srv.Subscribe(srv.NewSubscriber(common.TOPIC_TREE_CHANGES, s.nodeEvent, opts))
	srv.Subscribe(srv.NewSubscriber(common.TOPIC_META_CHANGES, func(ctx context.Context, e *tree.NodeChangeEvent) error {
		if e.Type == tree.NodeChangeEvent_UPDATE_META || e.Type == tree.NodeChangeEvent_UPDATE_USER_META {
			return s.nodeEvent(ctx, e)
		} else {
			return nil
		}
	}, opts))
	srv.Subscribe(srv.NewSubscriber(common.TOPIC_TIMER_EVENT, s.timerEvent, opts))
	srv.Subscribe(srv.NewSubscriber(common.TOPIC_IDM_EVENT, s.idmEvent, opts))

	s.ListenToMainQueue()
	s.TaskChannelSubscription()

	return s
}

// Init subscriber with current list of jobs from Jobs service
func (s *Subscriber) Init() error {

	go service.Retry(func() error {
		// Load Jobs Definitions
		jobClients := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, s.Client)
		streamer, e := jobClients.ListJobs(s.RootContext, &jobs.ListJobsRequest{})
		if e != nil {
			return e
		}

		s.jobsLock.Lock()
		defer s.jobsLock.Unlock()
		for {
			resp, er := streamer.Recv()
			if er != nil {
				break
			}
			if resp == nil {
				continue
			}
			if resp.Job.Inactive {
				continue
			}
			s.JobsDefinitions[resp.Job.ID] = resp.Job
			s.GetDispatcherForJob(resp.Job)
		}
		return nil
	}, 3*time.Second, 20*time.Second)

	return nil
}

// Stop closes internal EventsBatcher
func (s *Subscriber) Stop() {
	s.batcher.Done <- true
}

// ListenToMainQueue starts a go routine that listens to the Event Bus
func (s *Subscriber) ListenToMainQueue() {

	go func() {
		for {
			select {
			case runnable := <-s.MainQueue:
				dispatcher := s.GetDispatcherForJob(runnable.Task.Job)
				dispatcher.JobQueue <- runnable
			}
		}
	}()

}

// TaskChannelSubscription uses PubSub library to receive update messages from tasks
func (s *Subscriber) TaskChannelSubscription() {
	ch := PubSub.Sub(PubSubTopicTaskStatuses)
	cli := NewTaskReconnectingClient(s.RootContext)
	cli.StartListening(ch)
	//	s.chanToStream(ch)
}

// GetDispatcherForJob creates a new dispatcher for a job
func (s *Subscriber) GetDispatcherForJob(job *jobs.Job) *Dispatcher {

	if d, exists := s.Dispatchers[job.ID]; exists {
		return d
	}
	maxWorkers := DefaultMaximumWorkers
	if job.MaxConcurrency > 0 {
		maxWorkers = int(job.MaxConcurrency)
	}
	tags := map[string]string{
		"service": common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_TASKS,
		"jobID":   job.ID,
	}
	dispatcher := NewDispatcher(maxWorkers, tags)
	s.Dispatchers[job.ID] = dispatcher
	dispatcher.Run()
	return dispatcher
}

// Job Configuration was updated, react accordingly
func (s *Subscriber) jobsChangeEvent(ctx context.Context, msg *jobs.JobChangeEvent) error {
	s.jobsLock.Lock()
	defer s.jobsLock.Unlock()
	// Update config
	if msg.JobRemoved != "" {
		if _, ok := s.JobsDefinitions[msg.JobRemoved]; ok {
			delete(s.JobsDefinitions, msg.JobRemoved)
		}
		if dispatcher, ok := s.Dispatchers[msg.JobRemoved]; ok {
			dispatcher.Stop()
			delete(s.Dispatchers, msg.JobRemoved)
		}
	}
	if msg.JobUpdated != nil {
		s.JobsDefinitions[msg.JobUpdated.ID] = msg.JobUpdated
		if dispatcher, ok := s.Dispatchers[msg.JobUpdated.ID]; ok {
			dispatcher.Stop()
			delete(s.Dispatchers, msg.JobUpdated.ID)
			if !msg.JobUpdated.Inactive {
				s.GetDispatcherForJob(msg.JobUpdated)
			}
		}
	}

	return nil
}

// Reacts to a trigger sent by the timer service
func (s *Subscriber) timerEvent(ctx context.Context, event *jobs.JobTriggerEvent) error {
	jobId := event.JobID
	// Load Job Data, build selectors
	s.jobsLock.Lock()
	defer s.jobsLock.Unlock()
	j, ok := s.JobsDefinitions[jobId]
	if !ok {
		// Try to load definition directly for JobsService
		jobClients := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, s.Client)
		resp, e := jobClients.GetJob(ctx, &jobs.GetJobRequest{JobID: jobId})
		if e != nil || resp.Job == nil {
			return nil
		}
		j = resp.Job
	}
	if j.Inactive {
		return nil
	}
	// This timer event probably comes without user in context at that point
	if u, _ := permissions.FindUserNameInContext(ctx); u == "" {
		ctx = metadata.NewContext(ctx, metadata.Metadata{common.PYDIO_CONTEXT_USER_KEY: common.PYDIO_SYSTEM_USERNAME})
		ctx = context.WithValue(ctx, common.PYDIO_CONTEXT_USER_KEY, common.PYDIO_SYSTEM_USERNAME)
	}
	ctx = servicecontext.WithServiceName(ctx, servicecontext.GetServiceName(s.RootContext))
	ctx = servicecontext.WithServiceColor(ctx, servicecontext.GetServiceColor(s.RootContext))
	log.Logger(ctx).Info("Run Job " + jobId + " on timer event " + event.Schedule.String())

	task := NewTaskFromEvent(ctx, j, event)

	go task.EnqueueRunnables(s.Client, s.MainQueue)

	return nil
}

// Reacts to a trigger linked to a nodeChange event.
func (s *Subscriber) nodeEvent(ctx context.Context, event *tree.NodeChangeEvent) error {

	if event.Optimistic {
		return nil
	}

	// Always ignore events on Temporary nodes
	if event.Target != nil && event.Target.Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		return nil
	}

	ctx = servicecontext.WithServiceName(ctx, servicecontext.GetServiceName(s.RootContext))
	ctx = servicecontext.WithServiceColor(ctx, servicecontext.GetServiceColor(s.RootContext))

	s.batcher.Events <- &cache.EventWithContext{
		NodeChangeEvent: *event,
		Ctx:             ctx,
	}

	return nil
}

func (s *Subscriber) processNodeEvent(ctx context.Context, event *tree.NodeChangeEvent) {

	s.jobsLock.Lock()
	defer s.jobsLock.Unlock()

	for jobId, jobData := range s.JobsDefinitions {
		if jobData.Inactive {
			continue
		}
		if jobData.ContextMetaFilter != nil && !s.jobLevelContextFilterPass(ctx, jobData.ContextMetaFilter) {
			continue
		}
		if jobData.NodeEventFilter != nil && !s.jobLevelFilterPass(ctx, event, jobData.NodeEventFilter) {
			continue
		}
		if jobData.IdmFilter != nil && !s.jobLevelIdmFilterPass(ctx, createMessageFromEvent(event), jobData.IdmFilter) {
			continue
		}
		for _, eName := range jobData.EventNames {
			if eType, ok := jobs.ParseNodeChangeEventName(eName); ok {
				if event.Type == eType {
					log.Logger(ctx).Debug("Run Job " + jobId + " on event " + eName)
					task := NewTaskFromEvent(ctx, jobData, event)
					go task.EnqueueRunnables(s.Client, s.MainQueue)
				}
			}
		}
	}

}

// Reacts to a trigger linked to a nodeChange event.
func (s *Subscriber) idmEvent(ctx context.Context, event *idm.ChangeEvent) error {

	s.jobsLock.Lock()
	defer s.jobsLock.Unlock()

	ctx = servicecontext.WithServiceName(ctx, servicecontext.GetServiceName(s.RootContext))
	ctx = servicecontext.WithServiceColor(ctx, servicecontext.GetServiceColor(s.RootContext))

	for jobId, jobData := range s.JobsDefinitions {
		if jobData.Inactive {
			continue
		}
		if jobData.ContextMetaFilter != nil && !s.jobLevelContextFilterPass(ctx, jobData.ContextMetaFilter) {
			continue
		}
		if jobData.IdmFilter != nil && !s.jobLevelIdmFilterPass(ctx, createMessageFromEvent(event), jobData.IdmFilter) {
			continue
		}
		for _, eName := range jobData.EventNames {
			if jobs.MatchesIdmChangeEvent(eName, event) {
				log.Logger(ctx).Debug("Run Job " + jobId + " on event " + eName)
				task := NewTaskFromEvent(ctx, jobData, event)
				go task.EnqueueRunnables(s.Client, s.MainQueue)
			}
		}
	}
	return nil
}

// Check if a node must go through jobs at all (if there is a NodesSelector at the job level)
func (s *Subscriber) jobLevelFilterPass(ctx context.Context, event *tree.NodeChangeEvent, filter *jobs.NodesSelector) bool {
	var refNode *tree.Node
	if event.Target != nil {
		refNode = event.Target
	} else if event.Source != nil {
		refNode = event.Source
	}
	if refNode == nil {
		return true // Ignore
	}
	input := jobs.ActionMessage{Nodes: []*tree.Node{refNode}}
	_, _, pass := filter.Filter(ctx, input)
	return pass
}

// Test filter and return false if all input IDM slots are empty
func (s *Subscriber) jobLevelIdmFilterPass(ctx context.Context, input jobs.ActionMessage, filter *jobs.IdmSelector) bool {
	_, _, pass := filter.Filter(ctx, input)
	return pass
}

// Test filter and return false if context is filtered out
func (s *Subscriber) jobLevelContextFilterPass(ctx context.Context, filter *jobs.ContextMetaFilter) bool {
	_, pass := filter.Filter(ctx, jobs.ActionMessage{})
	return pass
}

func createMessageFromEvent(event interface{}) jobs.ActionMessage {
	initialInput := jobs.ActionMessage{}

	if nodeChange, ok := event.(*tree.NodeChangeEvent); ok {
		any, _ := ptypes.MarshalAny(nodeChange)
		initialInput.Event = any
		if nodeChange.Target != nil {

			initialInput = initialInput.WithNode(nodeChange.Target)

		} else if nodeChange.Source != nil {

			initialInput = initialInput.WithNode(nodeChange.Source)

		}

	} else if triggerEvent, ok := event.(*jobs.JobTriggerEvent); ok {

		any, _ := ptypes.MarshalAny(triggerEvent)
		initialInput.Event = any

	} else if idmEvent, ok := event.(*idm.ChangeEvent); ok {

		any, _ := ptypes.MarshalAny(idmEvent)
		initialInput.Event = any
		if idmEvent.User != nil {
			initialInput = initialInput.WithUser(idmEvent.User)
		}
		if idmEvent.Role != nil {
			initialInput = initialInput.WithRole(idmEvent.Role)
		}
		if idmEvent.Workspace != nil {
			initialInput = initialInput.WithWorkspace(idmEvent.Workspace)
		}
		if idmEvent.Acl != nil {
			initialInput = initialInput.WithAcl(idmEvent.Acl)
		}

	}

	return initialInput
}

func logStartMessageFromEvent(ctx context.Context, task *Task, event interface{}) {
	var msg string
	if triggerEvent, ok := event.(*jobs.JobTriggerEvent); ok {
		if triggerEvent.Schedule == nil {
			msg = "Starting job manually"
		} else {
			msg = "Starting job on schedule " + strings.ReplaceAll(triggerEvent.Schedule.String(), "Iso8601Schedule:", "")
		}
	} else if idmEvent, ok := event.(*idm.ChangeEvent); ok {
		eT := strings.ToLower(idmEvent.GetType().String())
		var oT string
		if idmEvent.User != nil {
			oT = "user"
		} else if idmEvent.Role != nil {
			oT = "role"
		} else if idmEvent.Workspace != nil {
			oT = "workspace"
		} else if idmEvent.Acl != nil {
			oT = "acl"
		}
		msg = fmt.Sprintf("Starting job on %s %s event", oT, eT)
	} else if nodeEvent, ok := event.(*tree.NodeChangeEvent); ok {
		eT := strings.ToLower(nodeEvent.GetType().String())
		msg = fmt.Sprintf("Starting job on %s node event", eT)
	}
	// Append user login
	user, _ := permissions.FindUserNameInContext(ctx)
	if user != "" && user != common.PYDIO_SYSTEM_USERNAME {
		msg += " (triggered by user " + user + ")"
	}
	ctx = context2.WithAdditionalMetadata(ctx, map[string]string{
		servicecontext.ContextMetaJobUuid:        task.Job.ID,
		servicecontext.ContextMetaTaskUuid:       task.RunUUID,
		servicecontext.ContextMetaTaskActionPath: "ROOT",
	})
	log.TasksLogger(ctx).Info(msg)
}
