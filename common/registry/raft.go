package registry

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	defaults "github.com/pydio/cells/common/micro"

	"github.com/hashicorp/raft"
	"github.com/nats-io/nats"
	natslog "github.com/pydio/nats-on-a-log"
)

type Cluster interface {
	Join(nodeId string) error
	Leave() error
	Close() error

	LeadershipAcquired() chan bool
}

type NullFSM struct{}
type NullSnapshot struct{}

func (n *NullSnapshot) Persist(sink raft.SnapshotSink) error {
	return nil
}
func (n *NullSnapshot) Release() {}
func (n *NullFSM) Apply(*raft.Log) interface{} {
	return true
}
func (n *NullFSM) Snapshot() (raft.FSMSnapshot, error) {
	return &NullSnapshot{}, nil
}
func (n *NullFSM) Restore(io.ReadCloser) error {
	return nil
}

type joinRequest struct {
	ID    string `json:"id"`
	Leave bool   `json:"leave"`
}

type joinResponse struct {
	OK    bool   `json:"ok"`
	Error string `json:"error"`
}

type pingResponse struct {
	OK bool `json:"ok"`
}

type raftNatsCluster struct {
	ctx         context.Context
	serviceName string
	fsm         raft.FSM
	config      *raft.Config
	localId     string
	leadership  chan bool

	conn *nats.Conn
	raft *raft.Raft

	subs []*nats.Subscription
}

func GetCluster(ctx context.Context, serviceName string, fsm raft.FSM) Cluster {
	return &raftNatsCluster{
		ctx:         ctx,
		serviceName: serviceName,
		fsm:         fsm,
		leadership:  make(chan bool),
		config:      raft.DefaultConfig(),
	}
}

func (r *raftNatsCluster) Join(nodeId string) error {

	r.localId = r.serviceName + "-" + nodeId
	r.config.LocalID = raft.ServerID(r.localId)

	natsOpts := nats.GetDefaultOptions()
	var err error
	r.conn, err = natsOpts.Connect()
	if err != nil {
		return err
	}
	transport, err := natslog.NewNATSTransport(r.localId, r.conn, 2*time.Second, os.Stdout)
	if err != nil {
		return err
	}

	// Create the log store and stable store.
	logStore := raft.NewInmemStore()
	stableStore := raft.NewInmemStore()
	snStore := raft.NewInmemSnapshotStore()

	// Instantiate the Raft cluster.
	ra, err := raft.NewRaft(r.config, r.fsm, logStore, stableStore, snStore, transport)
	if err != nil {
		return fmt.Errorf("cannot init raft cluster: %s", err)
	}
	r.raft = ra
	// create subscriptions
	e := r.subscribe()
	if e != nil {
		return e
	}
	// start ticker for pruning dead nodes
	go func() {
		ticker := time.Tick(30 * time.Second)
		for range ticker {
			if ra.State() == raft.Leader {
				r.prune()
			}
		}
	}()

	nn := r.listExistingNodes()
	// No nodes found, bootstraping now
	if len(nn) == 0 {
		return r.bootstrap(transport)
	}

	// Try to join existing cluster
	var joined bool
	for _, joinId := range nn {
		fmt.Println("Trying to join", joinId)
		req, _ := json.Marshal(&joinRequest{ID: r.localId})
		resp, err := r.conn.Request(fmt.Sprintf("%s.join", joinId), req, 5*time.Second)
		if err != nil {
			continue
		}
		var r joinResponse
		if err := json.Unmarshal(resp.Data, &r); err != nil {
			continue
		}
		if r.OK {
			joined = true
			break
		}
	}

	// Cannot join any nodes, bootstrap
	if !joined {
		return r.bootstrap(transport)
	}

	return nil
}

func (r *raftNatsCluster) LeadershipAcquired() chan bool {
	return r.leadership
}

func (r *raftNatsCluster) Leave() error {
	fmt.Println("Leaving cluster now")
	configFuture := r.raft.GetConfiguration()
	if e := configFuture.Error(); e == nil {
		if r.raft.State() == raft.Leader {
			// For leader, remove from conf directly
			fmt.Println("Removing from configuration")
			f := r.raft.RemoveServer(raft.ServerID(r.localId), configFuture.Index(), 1*time.Second)
			f.Error()
		} else {
			// For follower, call leader
			leader := r.raft.Leader()
			var leaderId raft.ServerID
			for _, s := range configFuture.Configuration().Servers {
				if s.Address == leader {
					leaderId = s.ID
				}
			}
			if leaderId != "" {
				fmt.Println("Informing leader of removal")
				req, _ := json.Marshal(&joinRequest{ID: r.localId, Leave: true})
				_, err := r.conn.Request(fmt.Sprintf("%s.join", leaderId), req, 5*time.Second)
				if err != nil {
					fmt.Println("could not send leave request", err.Error())
				}
			}
		}
	}
	for _, s := range r.subs {
		s.Unsubscribe()
	}
	return nil
}

func (r *raftNatsCluster) Close() error {
	return nil
}

func (r *raftNatsCluster) listExistingNodes() (ids []string) {
	ss, err := defaults.Registry().GetService(r.serviceName)
	if err == nil && len(ss) > 0 {
		for _, n := range ss[0].Nodes {
			ids = append(ids, n.Id)
		}
	}
	return
}

func (r *raftNatsCluster) bootstrap(t raft.Transport) error {
	conf := raft.Configuration{
		Servers: []raft.Server{{
			ID:      r.config.LocalID,
			Address: t.LocalAddr(),
		}},
	}
	return r.raft.BootstrapCluster(conf).Error()
}

func (r *raftNatsCluster) subscribe() error {

	// HANDLE JOIN REQUESTS
	sub, err := r.conn.Subscribe(fmt.Sprintf("%s.join", r.localId), func(msg *nats.Msg) {
		var req joinRequest
		if err := json.Unmarshal(msg.Data, &req); err != nil {
			resp, _ := json.Marshal(&joinResponse{OK: false, Error: err.Error()})
			r.conn.Publish(msg.Reply, resp)
			return
		}
		if r.raft.State() != raft.Leader {
			resp, _ := json.Marshal(&joinResponse{OK: false, Error: raft.ErrNotLeader.Error()})
			r.conn.Publish(msg.Reply, resp)
			return
		}

		configFuture := r.raft.GetConfiguration()
		if err := configFuture.Error(); err != nil {
			fmt.Println("failed to get raft configuration: %v", err)
			resp, _ := json.Marshal(&joinResponse{OK: false, Error: err.Error()})
			r.conn.Publish(msg.Reply, resp)
			return
		}
		for _, srv := range configFuture.Configuration().Servers {
			// However if *both* the ID and the address are the same, then nothing -- not even
			// a join operation -- is needed.
			if !req.Leave && srv.ID == raft.ServerID(req.ID) {
				fmt.Println("node %s already member of cluster, ignoring join request", req.ID)
				return
			}
		}

		resp := &joinResponse{OK: true}
		if !req.Leave {
			fmt.Println("Adding new node to raft cluster", req.ID)
			future := r.raft.AddVoter(raft.ServerID(req.ID), raft.ServerAddress(req.ID), 0, 0)
			if err := future.Error(); err != nil {
				resp.OK = false
				resp.Error = err.Error()
			}
		} else {
			future := r.raft.RemoveServer(raft.ServerID(req.ID), configFuture.Index(), 2*time.Second)
			if err := future.Error(); err != nil {
				resp.OK = false
				resp.Error = err.Error()
			}
		}
		rs, _ := json.Marshal(resp)
		r.conn.Publish(msg.Reply, rs)
	})
	if err != nil {
		return err
	} else {
		r.subs = append(r.subs, sub)
	}

	// HANDLE PING FOR PRUNING DEAD NODES
	sub2, err2 := r.conn.Subscribe(fmt.Sprintf("%s.ping", r.localId), func(msg *nats.Msg) {
		re, _ := json.Marshal(&pingResponse{OK: true})
		r.conn.Publish(msg.Reply, re)
	})
	if err2 != nil {
		return err
	} else {
		r.subs = append(r.subs, sub2)
	}

	// LISTEN TO LEADER ACQUISITION
	go func() {
		for isLeader := range r.raft.LeaderCh() {
			if isLeader {
				fmt.Println("*** LEADERSHIP ACQUIRED ***")
				r.leadership <- true
				r.prune()
			} else {
				fmt.Println("*** LEADERSHIP LOST ***")
			}
		}
	}()

	return nil
}

func (r *raftNatsCluster) prune() {
	// Leader changed, so someone must have been lost, ping cluster and remove dead servers
	configFuture := r.raft.GetConfiguration()
	if err := configFuture.Error(); err != nil {
		fmt.Printf("failed to get raft configuration: %v\n", err)
	} else {
		for _, srv := range configFuture.Configuration().Servers {
			if srv.ID == raft.ServerID(r.localId) {
				continue
			}
			req, _ := json.Marshal(map[string]interface{}{})
			if _, e := r.conn.Request(fmt.Sprintf("%s.ping", srv.ID), req, 1*time.Second); e != nil {
				fmt.Println("Removing server from cluster now", srv.ID)
				f := r.raft.RemoveServer(srv.ID, configFuture.Index(), 1*time.Second)
				if er := f.Error(); er != nil {
					fmt.Println("Error while removing server from cluster", er.Error())
				}
			}
		}
	}
}
