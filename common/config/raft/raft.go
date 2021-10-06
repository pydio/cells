// Copyright 2015 The etcd Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package raft

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/pydio/cells/common/config"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"time"

	"go.etcd.io/etcd/etcdserver/api/membership"
	"go.etcd.io/etcd/etcdserver/api/rafthttp"
	"go.etcd.io/etcd/etcdserver/api/snap"
	stats "go.etcd.io/etcd/etcdserver/api/v2stats"
	"go.etcd.io/etcd/etcdserver/etcdserverpb"
	"go.etcd.io/etcd/pkg/fileutil"
	"go.etcd.io/etcd/pkg/pbutil"
	"go.etcd.io/etcd/pkg/types"
	"go.etcd.io/etcd/raft"
	"go.etcd.io/etcd/raft/raftpb"
	"go.etcd.io/etcd/wal"
	"go.etcd.io/etcd/wal/walpb"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/registry"
)

type commit struct {
	data       []string
	applyDoneC chan<- struct{}
}

type Transporter interface {
	AddPeer(types.ID, []string)
	RemovePeer(types.ID)
	Send([]raftpb.Message)
	Start() error
	Stop()
	ErrorC() chan error
	Handler() http.Handler
}

type rafthttpwitherror struct {
	*rafthttp.Transport
}

func (r *rafthttpwitherror) ErrorC() chan error {
	return r.Transport.ErrorC
}

// A key-value stream backed by raft
type raftNode struct {
	proposeC    <-chan string            // proposed messages (k,v)
	confChangeC <-chan raftpb.ConfChange // proposed cluster config changes
	commitC     chan<- *commit           // entries committed to log (k,v)
	errorC      chan<- error             // errors from raft session

	id          int    // client ID for raft session
	memberID    types.ID
	serviceID   string
	serviceAddress string
	service     string // name of the service to send replication to
	cluster     *membership.RaftCluster
	join        bool   // node is joining an existing cluster
	waldir      string // path to WAL directory
	snapdir     string // path to snapshot directory
	getSnapshot func() ([]byte, error)

	confState     raftpb.ConfState
	snapshotIndex uint64
	appliedIndex  uint64

	// raft backing for the commit/error channel
	node        raft.Node
	raftStorage *raft.MemoryStorage
	wal         *wal.WAL

	snapshotter      *snap.Snapshotter
	snapshotterReady chan *snap.Snapshotter // signals when snapshotter is ready

	snapCount uint64
	transport Transporter
	// transport *rafthttp.Transport
	stopc     chan struct{} // signals proposal channel closed
	httpstopc chan struct{} // signals http server to shutdown
	httpdonec chan struct{} // signals http server shutdown complete

	logger *zap.Logger
}

var defaultSnapshotCount uint64 = 10000

// NewRaftNode initiates a raft instance and returns a committed log entry
// channel and error channel. Proposals for log updates are sent over the
// provided the proposal channel. All log entries are replayed over the
// commit channel, followed by a nil message (to indicate the channel is
// current), then new log entries. To shutdown, close proposeC and read errorC.
func NewRaftNode(id int, name string, address string, service string, join bool, getSnapshot func() ([]byte, error), proposeC <-chan string,
	confChangeC <-chan raftpb.ConfChange) (<-chan *commit, <-chan error, <-chan *snap.Snapshotter) {

	commitC := make(chan *commit)
	errorC := make(chan error)

	defaultLogger := &raft.DefaultLogger{Logger: log.New(os.Stderr, "raft", log.LstdFlags)}
	defaultLogger.EnableDebug()
	raft.SetLogger(defaultLogger)

	services, _ := registry.GetRunningService(service)

	rc := &raftNode{
		proposeC:    proposeC,
		confChangeC: confChangeC,
		commitC:     commitC,
		errorC:      errorC,
		id:          id,
		serviceID:   name,
		serviceAddress: address,
		service:     service,
		join:        len(services) > 0,
		getSnapshot: getSnapshot,
		snapCount:   defaultSnapshotCount,
		stopc:       make(chan struct{}),
		httpstopc:   make(chan struct{}),
		httpdonec:   make(chan struct{}),

		logger: zap.NewExample(),

		snapshotterReady: make(chan *snap.Snapshotter, 1),
		// rest of structure populated after WAL replay
	}
	go rc.startRaft()
	return commitC, errorC, rc.snapshotterReady
}

func (rc *raftNode) saveSnap(snap raftpb.Snapshot) error {
	walSnap := walpb.Snapshot{
		Index: snap.Metadata.Index,
		Term:  snap.Metadata.Term,
	}
	// save the snapshot file before writing the snapshot to the wal.
	// This makes it possible for the snapshot file to become orphaned, but prevents
	// a WAL snapshot entry from having no corresponding snapshot file.
	if err := rc.snapshotter.SaveSnap(snap); err != nil {
		return err
	}
	if err := rc.wal.SaveSnapshot(walSnap); err != nil {
		return err
	}
	return rc.wal.ReleaseLockTo(snap.Metadata.Index)
}

func (rc *raftNode) entriesToApply(ents []raftpb.Entry) (nents []raftpb.Entry) {
	if len(ents) == 0 {
		return ents
	}
	firstIdx := ents[0].Index
	if firstIdx > rc.appliedIndex+1 {
		log.Fatalf("first index of committed entry[%d] should <= progress.appliedIndex[%d]+1", firstIdx, rc.appliedIndex)
	}
	if rc.appliedIndex-firstIdx+1 < uint64(len(ents)) {
		nents = ents[rc.appliedIndex-firstIdx+1:]
	}
	return nents
}

// publishEntries writes committed log entries to commit channel and returns
// whether all entries could be published.
func (rc *raftNode) publishEntries(ents []raftpb.Entry) (<-chan struct{}, bool) {
	if len(ents) == 0 {
		return nil, true
	}

	data := make([]string, 0, len(ents))
	for i := range ents {
		switch ents[i].Type {
		case raftpb.EntryNormal:
			if len(ents[i].Data) == 0 {
				// ignore empty messages
				break
			}
			s := string(ents[i].Data)
			data = append(data, s)
		case raftpb.EntryConfChange:
			var cc raftpb.ConfChange
			cc.Unmarshal(ents[i].Data)
			rc.confState = *rc.node.ApplyConfChange(cc)
			switch cc.Type {
			case raftpb.ConfChangeAddNode:
				if len(cc.Context) > 0 {
					var m *membership.Member
					json.Unmarshal(cc.Context, &m)

					if rc.memberID != m.ID {
						rc.transport.AddPeer(m.ID, m.PeerURLs)
					}
				}
			case raftpb.ConfChangeRemoveNode:
				var m *membership.Member
				if err := json.Unmarshal(cc.Context, &m); err != nil {
					continue
				}

				if m.ID.String() == rc.serviceID {
					log.Println("I've been removed from the cluster! Shutting down.")
					return nil, false
				}

				rc.transport.RemovePeer(m.ID)
			}
		}
	}

	var applyDoneC chan struct{}

	if len(data) > 0 {
		applyDoneC = make(chan struct{}, 1)
		select {
		case rc.commitC <- &commit{data, applyDoneC}:
			// fmt.Println("Committing ", data)
		case <-rc.stopc:
			return nil, false
		}
	}

	// after commit, update appliedIndex
	rc.appliedIndex = ents[len(ents)-1].Index

	return applyDoneC, true
}

func (rc *raftNode) loadSnapshot() *raftpb.Snapshot {
	snapshot, err := rc.snapshotter.Load()
	if err != nil && err != snap.ErrNoSnapshot {
		log.Fatalf("raftexample: error loading snapshot (%v)", err)
	}
	return snapshot
}

// openWAL returns a WAL ready for reading.
func (rc *raftNode) openWAL(snapshot *raftpb.Snapshot) *wal.WAL {
	if !wal.Exist(rc.waldir) {
		if err := os.Mkdir(rc.waldir, 0750); err != nil {
			log.Fatalf("raftexample: cannot create dir for wal (%v)", err)
		}

		w, err := wal.Create(zap.NewExample(), rc.waldir, nil)
		if err != nil {
			log.Fatalf("raftexample: create wal error (%v)", err)
		}
		w.Close()
	}

	walsnap := walpb.Snapshot{}
	if snapshot != nil {
		walsnap.Index, walsnap.Term = snapshot.Metadata.Index, snapshot.Metadata.Term
	}
	log.Printf("loading WAL at term %d and index %d", walsnap.Term, walsnap.Index)
	w, err := wal.Open(zap.NewExample(), rc.waldir, walsnap)
	if err != nil {
		log.Fatalf("raftexample: error loading wal (%v)", err)
	}

	return w
}

// replayWAL replays WAL entries into the raft instance.
func (rc *raftNode) replayWAL() *wal.WAL {
	log.Printf("replaying WAL of member %d", rc.id)

	snapshot := rc.loadSnapshot()

	var walsnap walpb.Snapshot
	if snapshot != nil {
		walsnap.Index, walsnap.Term = snapshot.Metadata.Index, snapshot.Metadata.Term
	}

	w, id, cid, st, ents := readWAL(rc.logger, rc.waldir, walsnap, false)

	// discard the previously uncommitted entries
	//for i, ent := range ents {
	//	if ent.Index > st.Commit {
	//		rc.logger.Info(
	//			"discarding uncommitted WAL entries",
	//			zap.Uint64("entry-index", ent.Index),
	//			zap.Uint64("commit-index-from-wal", st.Commit),
	//			zap.Int("number-of-discarded-entries", len(ents)-i),
	//		)
	//		ents = ents[:i]
	//		break
	//	}
	//}

	// force append the configuration change entries
	//toAppEnts := createConfigChangeEnts(
	//	rc.logger,
	//	getIDs(rc.logger, snapshot, ents),
	//	uint64(id),
	//	st.Term,
	//	st.Commit,
	//)
	//ents = append(ents, toAppEnts...)

	// force commit newly appended entries
	err := w.Save(raftpb.HardState{}, ents)
	if err != nil {
		rc.logger.Fatal("failed to save hard state and entries", zap.Error(err))
	}
	if len(ents) != 0 {
		st.Commit = ents[len(ents)-1].Index
	}

	rc.logger.Info(
		"forcing restart member",
		zap.String("cluster-id", cid.String()),
		zap.String("local-member-id", id.String()),
		zap.Uint64("commit-index", st.Commit),
	)

	s := raft.NewMemoryStorage()
	if snapshot != nil {
		s.ApplySnapshot(*snapshot)
	}
	s.SetHardState(st)
	s.Append(ents)

	rc.raftStorage = s



	return w
}

func (rc *raftNode) writeError(err error) {
	rc.stopHTTP()
	close(rc.commitC)
	rc.errorC <- err
	close(rc.errorC)
	rc.node.Stop()
}

func (rc *raftNode) startRaft() {

	var (
		w  *wal.WAL
		n  raft.Node
		s  *raft.MemoryStorage
		id types.ID
		cl *membership.RaftCluster
	)

	cl = NewClusterFromService(rc.logger, rc.service)

	// Adding self as member
	u, _ := url.Parse(rc.serviceAddress)
	member := membership.NewMember(rc.serviceID, types.URLs([]url.URL{*u}), "cells", nil)
	cl.AddMember(member)

	rc.cluster = cl
	rc.memberID = member.ID

	// Creating snap dir
	rc.snapdir = filepath.Join(config.ApplicationWorkingDir(), "service-" + member.ID.String() + "-snap")
	if !fileutil.Exist(rc.snapdir) {
		if err := os.Mkdir(rc.snapdir, 0750); err != nil {
			log.Fatalf("raftexample: cannot create dir for snapshot (%v)", err)
		}
	}

	rc.snapshotter = snap.New(rc.logger, rc.snapdir)

	// Creating waldir
	rc.waldir = filepath.Join(config.ApplicationWorkingDir(), "service-" + member.ID.String())

	hasWAL := wal.Exist(rc.waldir)

	if hasWAL {
		snapshot := rc.loadSnapshot()

		id, cl, n, s, w = rc.restartNode(snapshot)
	} else {
		id, n, s, w = rc.startNode(rc.serviceID, cl, cl.MemberIDs())
	}

	// signal replay has finished
	rc.snapshotterReady <- rc.snapshotter

	rc.node = n
	rc.wal = w
	rc.raftStorage = s

	rc.transport = &rafthttpwitherror{
		&rafthttp.Transport{
			Logger:      rc.logger,
			ID:          id,
			ClusterID:   0x1000,
			Raft:        rc,
			ServerStats: stats.NewServerStats("", ""),
			LeaderStats: stats.NewLeaderStats(zap.NewExample(), strconv.Itoa(rc.id)),
			ErrorC:      make(chan error),
		},
	}

	rc.transport.Start()

	for _, m := range cl.Members() {
		if m.ID != id {
			rc.transport.AddPeer(m.ID, m.PeerURLs)
		}
	}

	// And watching the registry after that
	go rc.serveRegistry()
	go rc.serveRaft()
	go rc.serveChannels()
}

func (rc *raftNode) startNode(name string, cl *membership.RaftCluster, ids []types.ID) (id types.ID, n raft.Node, s *raft.MemoryStorage, w *wal.WAL) {
	var err error
	member := cl.MemberByName(name)
	metadata := pbutil.MustMarshal(
		&etcdserverpb.Metadata{
			NodeID:    uint64(member.ID),
			ClusterID: uint64(cl.ID()),
		},
	)
	if w, err = wal.Create(rc.logger, rc.waldir, metadata); err != nil {
		rc.logger.Panic("failed to create WAL", zap.Error(err))
	}
	peers := make([]raft.Peer, len(ids))
	for i, id := range ids {
		d, _ := json.Marshal((*cl).Member(id))

		peers[i] = raft.Peer{ID: uint64(id), Context: d}
	}
	id = member.ID
	rc.logger.Info(
		"starting local member",
		zap.String("local-member-id", id.String()),
		zap.String("cluster-id", cl.ID().String()),
	)
	s = raft.NewMemoryStorage()
	c := &raft.Config{
		ID:              uint64(id),
		ElectionTick:    10,
		HeartbeatTick:   1,
		Storage:         s,
		MaxSizePerMsg:             1024 * 1024,
		MaxInflightMsgs:           256,
	}

	if len(peers) > 1 {
		n = raft.RestartNode(c)
	} else {
		n = raft.StartNode(c, peers)
	}

	return id, n, s, w
}

func (rc *raftNode) restartNode(snapshot *raftpb.Snapshot) (types.ID, *membership.RaftCluster, raft.Node, *raft.MemoryStorage, *wal.WAL) {
	var walsnap walpb.Snapshot
	if snapshot != nil {
		walsnap.Index, walsnap.Term = snapshot.Metadata.Index, snapshot.Metadata.Term
	}
	w, id, cid, st, ents := readWAL(rc.logger, rc.waldir, walsnap, false)

	rc.logger.Info(
		"restarting local member",
		zap.String("cluster-id", cid.String()),
		zap.String("local-member-id", id.String()),
		zap.Uint64("commit-index", st.Commit),
	)
	cl := membership.NewCluster(rc.logger, "cells")
	cl.SetID(id, cid)
	s := raft.NewMemoryStorage()
	if snapshot != nil {
		s.ApplySnapshot(*snapshot)
	}
	s.SetHardState(st)
	s.Append(ents)
	c := &raft.Config{
		ID:              uint64(id),
		ElectionTick:    10,
		HeartbeatTick:   1,
		Storage:         s,
		MaxSizePerMsg:   1024 * 1024,
		MaxInflightMsgs: 256,
	}

	n := raft.RestartNode(c)
	return id, cl, n, s, w
}

// stop closes http, closes all channels, and stops raft.
func (rc *raftNode) stop() {
	rc.stopHTTP()
	close(rc.commitC)
	close(rc.errorC)
	rc.node.Stop()
}

func (rc *raftNode) stopHTTP() {
	rc.transport.Stop()
	close(rc.httpstopc)
	<-rc.httpdonec
}

func (rc *raftNode) publishSnapshot(snapshotToSave raftpb.Snapshot) {
	if raft.IsEmptySnap(snapshotToSave) {
		return
	}

	log.Printf("publishing snapshot at index %d", rc.snapshotIndex)
	defer log.Printf("finished publishing snapshot at index %d", rc.snapshotIndex)

	if snapshotToSave.Metadata.Index <= rc.appliedIndex {
		log.Fatalf("snapshot index [%d] should > progress.appliedIndex [%d]", snapshotToSave.Metadata.Index, rc.appliedIndex)
	}
	rc.commitC <- nil // trigger kvstore to load snapshot

	rc.confState = snapshotToSave.Metadata.ConfState
	rc.snapshotIndex = snapshotToSave.Metadata.Index
	rc.appliedIndex = snapshotToSave.Metadata.Index
}

var snapshotCatchUpEntriesN uint64 = 10000

func (rc *raftNode) maybeTriggerSnapshot(applyDoneC <-chan struct{}) {
	if rc.appliedIndex-rc.snapshotIndex <= rc.snapCount {
		return
	}

	// wait until all committed entries are applied (or server is closed)
	if applyDoneC != nil {
		select {
		case <-applyDoneC:
		case <-rc.stopc:
			return
		}
	}

	log.Printf("start snapshot [applied index: %d | last snapshot index: %d]", rc.appliedIndex, rc.snapshotIndex)
	data, err := rc.getSnapshot()
	if err != nil {
		log.Panic(err)
	}
	snap, err := rc.raftStorage.CreateSnapshot(rc.appliedIndex, &rc.confState, data)
	if err != nil {
		panic(err)
	}
	if err := rc.saveSnap(snap); err != nil {
		panic(err)
	}

	compactIndex := uint64(1)
	if rc.appliedIndex > snapshotCatchUpEntriesN {
		compactIndex = rc.appliedIndex - snapshotCatchUpEntriesN
	}
	if err := rc.raftStorage.Compact(compactIndex); err != nil {
		panic(err)
	}

	log.Printf("compacted log at index %d", compactIndex)
	rc.snapshotIndex = rc.appliedIndex
}

func (rc *raftNode) serveRegistry() {
	w, err := registry.Watch()
	if err != nil {
		return
	}
	for {
		res, err := w.Next()
		if err != nil {
			continue
		}

		if res.Service.Name != rc.service {
			continue
		}

		if res.Action == "create" || res.Action == "update" {
			for _, n := range res.Service.Nodes {
				u, _ := url.Parse(n.Metadata["rafttransport"])
				member := membership.NewMember(n.Id, types.URLs([]url.URL{*u}), "cells", nil)

				if member.ID != rc.memberID && rc.cluster.MemberByName(n.Id) == nil {
					rc.cluster.AddMember(member)

					d, _ := json.Marshal(member)
					rc.node.ProposeConfChange(context.TODO(), &raftpb.ConfChange{
						Type:    raftpb.ConfChangeAddNode,
						NodeID:  uint64(member.ID),
						Context: d,
					})
				}
			}
		} else if res.Action == "delete" {
			for _, n := range res.Service.Nodes {
				rc.node.ProposeConfChange(context.TODO(), &raftpb.ConfChange{
					Type: raftpb.ConfChangeRemoveNode,
					Context: []byte(n.Id),
				})
			}
		}
	}
}

func (rc *raftNode) serveChannels() {
	snap, err := rc.raftStorage.Snapshot()
	if err != nil {
		panic(err)
	}
	rc.confState = snap.Metadata.ConfState
	rc.snapshotIndex = snap.Metadata.Index
	rc.appliedIndex = snap.Metadata.Index

	defer rc.wal.Close()

	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	// send proposals over raft
	go func() {
		confChangeCount := uint64(0)

		for rc.proposeC != nil && rc.confChangeC != nil {
			select {
			case prop, ok := <-rc.proposeC:
				if !ok {
					rc.proposeC = nil
				} else {
					// blocks until accepted by raft state machine
					err := rc.node.Propose(context.TODO(), []byte(prop))
					if err != nil {
						fmt.Println("We have an error proposing ", err)
					}
				}

			case cc, ok := <-rc.confChangeC:
				if !ok {
					rc.confChangeC = nil
				} else {
					confChangeCount++
					cc.ID = confChangeCount
					rc.node.ProposeConfChange(context.TODO(), cc)
				}
			}
		}
		// client closed channel; shutdown raft if not already
		close(rc.stopc)
	}()

	// event loop on raft state machine updates
	for {
		select {
		case <-ticker.C:
			rc.node.Tick()

		// store raft entries to wal, then publish over commit channel
		case rd := <-rc.node.Ready():
			rc.wal.Save(rd.HardState, rd.Entries)
			if !raft.IsEmptySnap(rd.Snapshot) {
				rc.saveSnap(rd.Snapshot)
				rc.raftStorage.ApplySnapshot(rd.Snapshot)
				rc.publishSnapshot(rd.Snapshot)
			}
			rc.raftStorage.Append(rd.Entries)
			rc.transport.Send(rd.Messages)
			applyDoneC, ok := rc.publishEntries(rc.entriesToApply(rd.CommittedEntries))
			if !ok {
				rc.stop()
				return
			}
			rc.maybeTriggerSnapshot(applyDoneC)
			rc.node.Advance()

		case err := <-rc.transport.ErrorC():
			rc.writeError(err)
			return

		case <-rc.stopc:
			rc.stop()
			return
		}
	}
}

func (rc *raftNode) serveRaft() {
	url, err := url.Parse(fmt.Sprintf("http://:%d", 21000 + rc.id))
	if err != nil {
		log.Fatalf("raftexample: Failed parsing URL (%v)", err)
	}

	ln, err := newStoppableListener(url.Host, rc.httpstopc)
	if err != nil {
		log.Fatalf("raftexample: Failed to listen rafthttp (%v)", err)
	}

	err = (&http.Server{Handler: rc.transport.Handler()}).Serve(ln)
	select {
	case <-rc.httpstopc:
	default:
		log.Fatalf("raftexample: Failed to serve rafthttp (%v)", err)
	}
	close(rc.httpdonec)
}

func (rc *raftNode) Process(ctx context.Context, m raftpb.Message) error {
	return rc.node.Step(ctx, m)
}
func (rc *raftNode) IsIDRemoved(id uint64) bool  {
	return false
}
func (rc *raftNode) ReportUnreachable(id uint64) {
	rc.node.ReportUnreachable(id)
}
func (rc *raftNode) ReportSnapshot(id uint64, status raft.SnapshotStatus) {
	rc.node.ReportSnapshot(id, status)
}

// getIDs returns an ordered set of IDs included in the given snapshot and
// the entries. The given snapshot/entries can contain three kinds of
// ID-related entry:
// - ConfChangeAddNode, in which case the contained ID will be added into the set.
// - ConfChangeRemoveNode, in which case the contained ID will be removed from the set.
// - ConfChangeAddLearnerNode, in which the contained ID will be added into the set.
func getIDs(lg *zap.Logger, snap *raftpb.Snapshot, ents []raftpb.Entry) []uint64 {
	ids := make(map[uint64]bool)
	if snap != nil {
		for _, id := range snap.Metadata.ConfState.Voters {
			ids[id] = true
		}
	}
	for _, e := range ents {
		if e.Type != raftpb.EntryConfChange {
			continue
		}
		var cc raftpb.ConfChange
		pbutil.MustUnmarshal(&cc, e.Data)
		switch cc.Type {
		case raftpb.ConfChangeAddLearnerNode:
			ids[cc.NodeID] = true
		case raftpb.ConfChangeAddNode:
			ids[cc.NodeID] = true
		case raftpb.ConfChangeRemoveNode:
			delete(ids, cc.NodeID)
		case raftpb.ConfChangeUpdateNode:
			// do nothing
		default:
			lg.Panic("unknown ConfChange Type", zap.String("type", cc.Type.String()))
		}
	}
	sids := make(types.Uint64Slice, 0, len(ids))
	for id := range ids {
		sids = append(sids, id)
	}
	sort.Sort(sids)
	return []uint64(sids)
}

// createConfigChangeEnts creates a series of Raft entries (i.e.
// EntryConfChange) to remove the set of given IDs from the cluster. The ID
// `self` is _not_ removed, even if present in the set.
// If `self` is not inside the given ids, it creates a Raft entry to add a
// default member with the given `self`.
func createConfigChangeEnts(lg *zap.Logger, ids []uint64, self uint64, term, index uint64) []raftpb.Entry {
	found := false
	for _, id := range ids {
		if id == self {
			found = true
		}
	}

	var ents []raftpb.Entry
	next := index + 1

	// NB: always add self first, then remove other nodes. Raft will panic if the
	// set of voters ever becomes empty.
	if !found {
		//m := membership.Member{
		//	ID:             types.ID(self),
		//	RaftAttributes: membership.RaftAttributes{PeerURLs: []string{"http://localhost:2380"}},
		//}
		//ctx, err := json.Marshal(m)
		//if err != nil {
		//	lg.Panic("failed to marshal member", zap.Error(err))
		//}
		cc := &raftpb.ConfChange{
			Type:    raftpb.ConfChangeAddNode,
			NodeID:  self,
			// Context: []byte(fmt.Sprintf("http://%s:%d", "", n.Port+1000)),
		}
		e := raftpb.Entry{
			Type:  raftpb.EntryConfChange,
			Data:  pbutil.MustMarshal(cc),
			Term:  term,
			Index: next,
		}
		ents = append(ents, e)
		next++
	}

	for _, id := range ids {
		if id == self {
			continue
		}
		cc := &raftpb.ConfChange{
			Type:   raftpb.ConfChangeRemoveNode,
			NodeID: id,
		}
		e := raftpb.Entry{
			Type:  raftpb.EntryConfChange,
			Data:  pbutil.MustMarshal(cc),
			Term:  term,
			Index: next,
		}
		ents = append(ents, e)
		next++
	}

	return ents
}

func NewClusterFromService(lg *zap.Logger, service string) *membership.RaftCluster {
	var m []*membership.Member
	services, _ := registry.GetRunningService(service)
	for _, s := range services {
		for _, node := range s.RunningNodes() {
			u, _ := url.Parse(node.Metadata["rafttransport"])
			m = append(m, membership.NewMember(node.Id, types.URLs([]url.URL{*u}), "cells", nil))
		}
	}

	return membership.NewClusterFromMembers(lg, "cells", types.ID(0), m)
}

