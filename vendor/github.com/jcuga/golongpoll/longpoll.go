package golongpoll

import (
	"container/heap"
	"container/list"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/nu7hatch/gouuid"
)

const (
	// Magic number to represent 'Forever' in
	// LongpollOptions.EventTimeToLiveSeconds
	FOREVER = -1001
)

// LongpollManager provides an interface to interact with the internal
// longpolling pup-sub goroutine.
//
// This allows you to publish events via Publish()
// If for some reason you want to stop the pub-sub goroutine at any time
// you can call Shutdown() and all longpolling will be disabled.  Note that the
// pub-sub goroutine will exit on program exit, so for most simple programs,
// calling Shutdown() is not necessary.
//
// A LongpollManager is created with each subscriptionManager that gets created
// by calls to manager := StartLongpoll(options)
// This interface also exposes the HTTP handler that client code can attach to
// a URL like so:
//		mux := http.NewServeMux()
//		mux.HandleFunc("/custom/path/to/events", manager.SubscriptionHandler)
// Note, this http handler can be wrapped by another function (try capturing the
// manager in a closure) to add additional validation, access control, or other
// functionality on top of the subscription handler.
//
// You can have another http handler publish events by capturing the manager in
// a closure and calling manager.Publish() from inside a http handler.  See the
// advanced example (examples/advanced/advanced.go)
//
// If for some reason you want multiple goroutines handling different pub-sub
// channels, you can simply create multiple LongpollManagers.
type LongpollManager struct {
	subManager          *subscriptionManager
	eventsIn            chan<- lpEvent
	stopSignal          chan<- bool
	SubscriptionHandler func(w http.ResponseWriter, r *http.Request)
}

// Publish an event for a given subscription category.  This event can have any
// arbitrary data that is convert-able to JSON via the standard's json.Marshal()
// the category param must be a non-empty string no longer than 1024,
// otherwise you get an error.
func (m *LongpollManager) Publish(category string, data interface{}) error {
	if len(category) == 0 {
		return errors.New("empty category")
	}
	if len(category) > 1024 {
		return errors.New("category cannot be longer than 1024")
	}
	m.eventsIn <- lpEvent{timeToEpochMilliseconds(time.Now()), category, data}
	return nil
}

// Shutdown allows the internal goroutine that handles the longpull pup-sub
// to be stopped.  This may be useful if you want to turn off longpolling
// without terminating your program.  After a shutdown, you can't call Publish()
// or get any new results from the SubscriptionHandler.  Multiple calls to
// this function on the same manager will result in a panic.
func (m *LongpollManager) Shutdown() {
	close(m.stopSignal)
}

// Options for LongpollManager that get sent to StartLongpoll(options)
type Options struct {
	// Whether or not to print logs about longpolling
	LoggingEnabled bool

	// Max client timeout seconds  to be accepted by the SubscriptionHandler
	// (The 'timeout' HTTP query param).  Defaults to 120.
	MaxLongpollTimeoutSeconds int

	// How many events to buffer per subscriptoin category before discarding
	// oldest events due to buffer being exhausted.  Larger buffer sizes are
	// useful for high volumes of events in the same categories.  But for
	// low-volumes, smaller buffer sizes are more efficient.  Defaults to 250.
	MaxEventBufferSize int

	// How long (seconds) events remain in their respective category's
	// eventBuffer before being deleted. Deletes old events even if buffer has
	// the room.  Useful to save space if you don't need old events.
	// You can use a large MaxEventBufferSize to handle spikes in event volumes
	// in a single category but have a relatively short EventTimeToLiveSeconds
	// value to save space in the more common low-volume case.
	// If you want events to remain in the buffer as long as there is room per
	// MaxEventBufferSize, then use the magic value longpoll.FOREVER here.
	// Defaults to FOREVER.
	EventTimeToLiveSeconds int

	// Whether or not to delete an event as soon as it is retrieved via an
	// HTTP longpoll.  Saves on space if clients only interested in seing an
	// event once and never again.  Meant mostly for scenarios where events
	// act as a sort of notification and each subscription category is assigned
	// to a single client.  As soon as any client(s) pull down this event, it's
	// gone forever.  Notice how multiple clients can get the event if there
	// are multiple clients actively in the middle of a longpoll when a new
	// event occurs.  This event gets sent to all listening clients and then
	// the event skips being placed in a buffer and is gone forever.
	DeleteEventAfterFirstRetrieval bool
}

// Creates a LongpollManager, starts the internal pub-sub goroutine and returns
// the manager reference which you can use anywhere to Publish() events or
// attach a URL to the manager's SubscriptionHandler member.  This function
// takes an Options struct that configures the longpoll behavior.
// If Options.EventTimeToLiveSeconds is omitted, the default is forever.
func StartLongpoll(opts Options) (*LongpollManager, error) {
	// default if not specified (likely struct skipped defining this field)
	if opts.MaxLongpollTimeoutSeconds == 0 {
		opts.MaxLongpollTimeoutSeconds = 120
	}
	// default if not specified (likely struct skipped defining this field)
	if opts.MaxEventBufferSize == 0 {
		opts.MaxEventBufferSize = 250
	}
	// If TTL is zero, default to FOREVER
	if opts.EventTimeToLiveSeconds == 0 {
		opts.EventTimeToLiveSeconds = FOREVER
	}
	if opts.MaxEventBufferSize < 1 {
		return nil, errors.New("Options.MaxEventBufferSize must be at least 1")
	}
	if opts.MaxLongpollTimeoutSeconds < 1 {
		return nil, errors.New("Options.MaxLongpollTimeoutSeconds must be at least 1")
	}
	// TTL must be positive, non-zero, or the magic FOREVER value (a negative const)
	if opts.EventTimeToLiveSeconds < 1 && opts.EventTimeToLiveSeconds != FOREVER {
		return nil, errors.New("options.EventTimeToLiveSeconds must be at least 1 or the constant longpoll.FOREVER")
	}
	channelSize := 100
	clientRequestChan := make(chan clientSubscription, channelSize)
	clientTimeoutChan := make(chan clientCategoryPair, channelSize)
	events := make(chan lpEvent, channelSize)
	// never has a send, only a close, so no larger capacity needed:
	quit := make(chan bool, 1)
	subManager := subscriptionManager{
		clientSubscriptions:            clientRequestChan,
		ClientTimeouts:                 clientTimeoutChan,
		Events:                         events,
		ClientSubChannels:              make(map[string]map[uuid.UUID]chan<- []lpEvent),
		SubEventBuffer:                 make(map[string]*expiringBuffer),
		Quit:                           quit,
		LoggingEnabled:                 opts.LoggingEnabled,
		MaxLongpollTimeoutSeconds:      opts.MaxLongpollTimeoutSeconds,
		MaxEventBufferSize:             opts.MaxEventBufferSize,
		EventTimeToLiveSeconds:         opts.EventTimeToLiveSeconds,
		DeleteEventAfterFirstRetrieval: opts.DeleteEventAfterFirstRetrieval,
		// check for stale categories every 3 minutes.
		// remember we do expiration/cleanup on individual buffers whenever
		// activity occurs on that buffer's category (client request, event published)
		// so this periodic purge check is only needed to remove events on
		// categories that have been inactive for a while.
		staleCategoryPurgePeriodSeconds: 60 * 3,
		// set last purge time to present so we wait a full period before puring
		// if this defaulted to zero then we'd immediately do a purge which is unecessary
		lastStaleCategoryPurgeTime: timeToEpochMilliseconds(time.Now()),
		// A priority queue (min heap) that keeps track of event buffers by their
		// last event time.  Used to know when to delete inactive categories/buffers.
		bufferPriorityQueue: make(priorityQueue, 0),
	}
	heap.Init(&subManager.bufferPriorityQueue)
	// Start subscription manager
	go subManager.run()
	LongpollManager := LongpollManager{
		&subManager,
		events,
		quit,
		getLongPollSubscriptionHandler(opts.MaxLongpollTimeoutSeconds, clientRequestChan, clientTimeoutChan, opts.LoggingEnabled),
	}
	return &LongpollManager, nil
}

type clientSubscription struct {
	clientCategoryPair
	// used to ensure no events skipped between long polls:
	LastEventTime time.Time
	// we channel arrays of events since we need to send everything a client
	// cares about in a single channel send.  This makes channel receives a
	// one shot deal.
	Events chan []lpEvent
}

func newclientSubscription(subscriptionCategory string, lastEventTime time.Time) (*clientSubscription, error) {
	u, err := uuid.NewV4()
	if err != nil {
		return nil, err
	}
	subscription := clientSubscription{
		clientCategoryPair{*u, subscriptionCategory},
		lastEventTime,
		make(chan []lpEvent, 1),
	}
	return &subscription, nil
}

// get web handler that has closure around sub chanel and clientTimeout channnel
func getLongPollSubscriptionHandler(maxTimeoutSeconds int, subscriptionRequests chan clientSubscription,
	clientTimeouts chan<- clientCategoryPair, loggingEnabled bool) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		timeout, err := strconv.Atoi(r.URL.Query().Get("timeout"))
		if loggingEnabled {
			log.Println("Handling HTTP request at ", r.URL)
		}
		// We are going to return json no matter what:
		w.Header().Set("Content-Type", "application/json")
		// Don't cache response:
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate") // HTTP 1.1.
		w.Header().Set("Pragma", "no-cache")                                   // HTTP 1.0.
		w.Header().Set("Expires", "0")                                         // Proxies.
		if err != nil || timeout > maxTimeoutSeconds || timeout < 1 {
			if loggingEnabled {
				log.Printf("Error: Invalid timeout param.  Must be 1-%d. Got: %q.\n",
					maxTimeoutSeconds, r.URL.Query().Get("timeout"))
			}
			io.WriteString(w, fmt.Sprintf("{\"error\": \"Invalid timeout arg.  Must be 1-%d.\"}", maxTimeoutSeconds))
			return
		}
		category := r.URL.Query().Get("category")
		if len(category) == 0 || len(category) > 1024 {
			if loggingEnabled {
				log.Printf("Error: Invalid subscription category, must be 1-1024 characters long.\n")
			}
			io.WriteString(w, "{\"error\": \"Invalid subscription category, must be 1-1024 characters long.\"}")
			return
		}
		// Default to only looking for current events
		lastEventTime := time.Now()
		// since_time is string of milliseconds since epoch
		lastEventTimeParam := r.URL.Query().Get("since_time")
		if len(lastEventTimeParam) > 0 {
			// Client is requesting any event from given timestamp
			// parse time
			var parseError error
			lastEventTime, parseError = millisecondStringToTime(lastEventTimeParam)
			if parseError != nil {
				if loggingEnabled {
					log.Printf("Error parsing last_event_time arg. Parm Value: %s, Error: %s.\n",
						lastEventTimeParam, err)
				}
				io.WriteString(w, "{\"error\": \"Invalid last_event_time arg.\"}")
				return
			}
		}
		subscription, err := newclientSubscription(category, lastEventTime)
		if err != nil {
			if loggingEnabled {
				log.Printf("Error creating new Subscription: %s.\n", err)
			}
			io.WriteString(w, "{\"error\": \"Error creating new Subscription.\"}")
			return
		}
		subscriptionRequests <- *subscription
		// Listens for connection close and un-register subscription in the
		// event that a client crashes or the connection goes down.  We don't
		// need to wait around to fulfill a subscription if no one is going to
		// receive it
		disconnectNotify := w.(http.CloseNotifier).CloseNotify()
		select {
		case <-time.After(time.Duration(timeout) * time.Second):
			// Lets the subscription manager know it can discard this request's
			// channel.
			clientTimeouts <- subscription.clientCategoryPair
			timeout_resp := makeTimeoutResponse(time.Now())
			if jsonData, err := json.Marshal(timeout_resp); err == nil {
				io.WriteString(w, string(jsonData))
			} else {
				io.WriteString(w, "{\"error\": \"json marshaller failed\"}")
			}
		case events := <-subscription.Events:
			// Consume event.  Subscription manager will automatically discard
			// this client's channel upon sending event
			// NOTE: event is actually []Event
			if jsonData, err := json.Marshal(eventResponse{&events}); err == nil {
				io.WriteString(w, string(jsonData))
			} else {
				io.WriteString(w, "{\"error\": \"json marshaller failed\"}")
			}
		case <-disconnectNotify:
			// Client connection closed before any events occurred and before
			// the timeout was exceeded.  Tell manager to forget about this
			// client.
			clientTimeouts <- subscription.clientCategoryPair
		}
	}
}

// eventResponse is the json response that carries longpoll events.
type timeoutResponse struct {
	TimeoutMessage string `json:"timeout"`
	Timestamp      int64  `json:"timestamp"`
}

func makeTimeoutResponse(t time.Time) *timeoutResponse {
	return &timeoutResponse{"no events before timeout",
		timeToEpochMilliseconds(t)}
}

type clientCategoryPair struct {
	ClientUUID           uuid.UUID
	SubscriptionCategory string
}

type subscriptionManager struct {
	clientSubscriptions chan clientSubscription
	ClientTimeouts      <-chan clientCategoryPair
	Events              <-chan lpEvent
	// Contains all client sub channels grouped first by sub id then by
	// client uuid
	ClientSubChannels map[string]map[uuid.UUID]chan<- []lpEvent
	SubEventBuffer    map[string]*expiringBuffer
	// channel to inform manager to stop running
	Quit           <-chan bool
	LoggingEnabled bool
	// Max allowed timeout seconds when clients requesting a longpoll
	// This is to validate the 'timeout' query param
	MaxLongpollTimeoutSeconds int
	// How big the buffers are (1-n) before events are discareded FIFO
	MaxEventBufferSize int
	// How long events can stay in their eventBuffer
	EventTimeToLiveSeconds int
	// Whether or not to delete an event after the first time it is served via
	// HTTP
	DeleteEventAfterFirstRetrieval bool
	// How often we check for stale event buffers and delete them
	staleCategoryPurgePeriodSeconds int
	// Last time in millisecondss since epoch that performed a stale category purge
	lastStaleCategoryPurgeTime int64
	// PriorityQueue/heap that keeps event buffers in oldest-first order
	// so we can easily delete eventBuffer/categories that have expired data
	bufferPriorityQueue priorityQueue
}

// This should be fired off in its own goroutine
func (sm *subscriptionManager) run() error {
	if sm.LoggingEnabled {
		log.Println("SubscriptionManager: Starting run.")
	}
	for {
		// NOTE: we check to see if its time to purge old buffers whenever
		// something happens or a period of inactivity has occurred.
		// An alternative would be to have another goroutine with a
		// select case time.After() but then you'd have concurrency issues
		// with access to the sm.SubEventBuffer and sm.bufferPriorityQueue objs
		// So instead of introducing mutexes we have this uglier manual time check calls
		select {
		case newClient := <-sm.clientSubscriptions:
			sm.handleNewClient(&newClient)
			sm.seeIfTimeToPurgeStaleCategories()
		case disconnected := <-sm.ClientTimeouts:
			sm.handleClientDisconnect(&disconnected)
			sm.seeIfTimeToPurgeStaleCategories()
		case event := <-sm.Events:
			sm.handleNewEvent(&event)
			sm.seeIfTimeToPurgeStaleCategories()
		case <-time.After(time.Duration(5) * time.Second):
			sm.seeIfTimeToPurgeStaleCategories()
		case _ = <-sm.Quit:
			if sm.LoggingEnabled {
				log.Println("SubscriptionManager: received quit signal, stopping.")
			}
			// break out of our infinite loop/select
			return nil
		}
	}
}

func (sm *subscriptionManager) seeIfTimeToPurgeStaleCategories() error {
	now_ms := timeToEpochMilliseconds(time.Now())
	if now_ms > (sm.lastStaleCategoryPurgeTime + int64(1000*sm.staleCategoryPurgePeriodSeconds)) {
		sm.lastStaleCategoryPurgeTime = now_ms
		return sm.purgeStaleCategories()
	}
	return nil
}

func (sm *subscriptionManager) handleNewClient(newClient *clientSubscription) error {
	var funcErr error
	// before storing client sub request, see if we already have data in
	// the corresponding event buffer that we can use to fufil request
	// without storing it
	doQueueRequest := true
	if expiringBuf, found := sm.SubEventBuffer[newClient.SubscriptionCategory]; found {
		// First clean up anything that expired
		sm.checkExpiredEvents(expiringBuf)
		// We have a buffer for this sub category, check for buffered events
		if events, err := expiringBuf.eventBuffer_ptr.GetEventsSince(newClient.LastEventTime,
			sm.DeleteEventAfterFirstRetrieval); err == nil && len(events) > 0 {
			doQueueRequest = false
			if sm.LoggingEnabled {
				log.Printf("SubscriptionManager: Skip adding client, sending %d events. (Category: %q Client: %s)\n",
					len(events), newClient.SubscriptionCategory, newClient.ClientUUID.String())
			}
			// Send client buffered events.  Client will immediately consume
			// and end long poll request, so no need to have manager store
			newClient.Events <- events
		} else if err != nil {
			funcErr = fmt.Errorf("Error getting events from event buffer: %s.\n", err)
			if sm.LoggingEnabled {
				log.Printf("Error getting events from event buffer: %s.\n", err)
			}
		}
		// Buffer Could have been emptied due to the  DeleteEventAfterFirstRetrieval
		// or EventTimeToLiveSeconds options.
		sm.deleteBufferIfEmpty(expiringBuf, newClient.SubscriptionCategory)
		// NOTE: expiringBuf may now be invalidated (if it was empty/deleted),
		// don't use ref anymore.
	}
	if doQueueRequest {
		// Couldn't find any immediate events, store for future:
		categoryClients, found := sm.ClientSubChannels[newClient.SubscriptionCategory]
		if !found {
			// first request for this sub category, add client chan map entry
			categoryClients = make(map[uuid.UUID]chan<- []lpEvent)
			sm.ClientSubChannels[newClient.SubscriptionCategory] = categoryClients
		}
		if sm.LoggingEnabled {
			log.Printf("SubscriptionManager: Adding Client (Category: %q Client: %s)\n",
				newClient.SubscriptionCategory, newClient.ClientUUID.String())
		}
		categoryClients[newClient.ClientUUID] = newClient.Events
	}
	return funcErr
}

func (sm *subscriptionManager) handleClientDisconnect(disconnected *clientCategoryPair) error {
	var funcErr error
	if subCategoryClients, found := sm.ClientSubChannels[disconnected.SubscriptionCategory]; found {
		// NOTE:  The delete function doesn't return anything, and will do nothing if the
		// specified key doesn't exist.
		delete(subCategoryClients, disconnected.ClientUUID)
		if sm.LoggingEnabled {
			log.Printf("SubscriptionManager: Removing Client (Category: %q Client: %s)\n",
				disconnected.SubscriptionCategory, disconnected.ClientUUID.String())
		}
		// Remove the client sub map entry for this category if there are
		// zero clients.  This keeps the ClientSubChannels map lean in
		// the event that there are many categories over time and we
		// would otherwise keep a bunch of empty sub maps
		if len(subCategoryClients) == 0 {
			delete(sm.ClientSubChannels, disconnected.SubscriptionCategory)
		}
	} else {
		// Sub category entry not found.  Weird.  Log this!
		if sm.LoggingEnabled {
			log.Printf("Warning: client disconnect for non-existing subscription category: %q\n",
				disconnected.SubscriptionCategory)
		}
		funcErr = fmt.Errorf("Client disconnect for non-existing subscription category: %q\n",
			disconnected.SubscriptionCategory)
	}
	return funcErr
}

func (sm *subscriptionManager) handleNewEvent(newEvent *lpEvent) error {
	var funcErr error
	doBufferEvents := true
	// Send event to any listening client's channels
	if clients, found := sm.ClientSubChannels[newEvent.Category]; found && len(clients) > 0 {
		if sm.DeleteEventAfterFirstRetrieval {
			// Configured to delete events from buffer after first retrieval by clients.
			// Now that we already have clients receiving, don't bother
			// buffering the event.
			// NOTE: this is wrapped by condition that clients are found
			// if no clients are found, we queue the event even when we have
			// the delete-on-first option set because no-one has recieved
			// the event yet.
			doBufferEvents = false
		}
		if sm.LoggingEnabled {
			log.Printf("SubscriptionManager: forwarding event to %d clients. (event: %v)\n", len(clients), newEvent)
		}
		for clientUUID, clientChan := range clients {
			if sm.LoggingEnabled {
				log.Printf("SubscriptionManager: sending event to client: %s\n", clientUUID.String())
			}
			clientChan <- []lpEvent{*newEvent}
		}
		// Remove all client subscriptions since we just sent all the
		// clients an event.  In longpolling, subscriptions only last
		// until there is data (which just got sent) or a timeout
		// (which is handled by the disconnect case).
		// Doing this also keeps the subscription map lean in the event
		// of many different subscription categories, we don't keep the
		// trivial/empty map entries.
		if sm.LoggingEnabled {
			log.Printf("SubscriptionManager: Removing %d client subscriptions for: %s\n",
				len(clients), newEvent.Category)
		}
		delete(sm.ClientSubChannels, newEvent.Category)
	} // else no client subscriptions

	expiringBuf, bufFound := sm.SubEventBuffer[newEvent.Category]
	if doBufferEvents {
		// Add event buffer for this event's subscription category if doesn't exist
		if !bufFound {
			now_ms := timeToEpochMilliseconds(time.Now())
			buf := &eventBuffer{
				list.New(),
				sm.MaxEventBufferSize,
				now_ms,
			}
			expiringBuf = &expiringBuffer{
				eventBuffer_ptr: buf,
				category:        newEvent.Category,
				priority:        now_ms,
			}
			if sm.LoggingEnabled {
				log.Printf("Creating new eventBuffer for category: %v",
					newEvent.Category)
			}
			sm.SubEventBuffer[newEvent.Category] = expiringBuf
			sm.priorityQueueUpdateBufferCreated(expiringBuf)
		}
		// queue event in event buffer
		if qErr := expiringBuf.eventBuffer_ptr.QueueEvent(newEvent); qErr != nil {
			if sm.LoggingEnabled {
				log.Printf("Error: failed to queue event.  err: %s\n", qErr)
			}
			funcErr = fmt.Errorf("Error: failed to queue event.  err: %s\n", qErr)
		} else {
			if sm.LoggingEnabled {
				log.Printf("SubscriptionManager: queued event: %v.\n", newEvent)
			}
			// Queued event successfully
			sm.priorityQueueUpdateNewEvent(expiringBuf, newEvent)
		}
	} else {
		if sm.LoggingEnabled {
			log.Printf("SubscriptionManager: DeleteEventAfterFirstRetrieval: SKIP queue event: %v.\n", newEvent)
		}
	}
	// Perform Event TTL check and empty buffer cleanup:
	if bufFound && expiringBuf != nil {
		sm.checkExpiredEvents(expiringBuf)
		sm.deleteBufferIfEmpty(expiringBuf, newEvent.Category)
		// NOTE: expiringBuf may now be invalidated if it was deleted
	}
	return funcErr
}

func (sm *subscriptionManager) checkExpiredEvents(expiringBuf *expiringBuffer) error {
	if sm.EventTimeToLiveSeconds == FOREVER {
		// Events can never expire. bail out early instead of wasting time.
		return nil
	}
	// determine what time is considered the threshold for expiration
	now_ms := timeToEpochMilliseconds(time.Now())
	expiration_time := now_ms - int64(sm.EventTimeToLiveSeconds*1000)
	return expiringBuf.eventBuffer_ptr.DeleteEventsOlderThan(expiration_time)
}

func (sm *subscriptionManager) deleteBufferIfEmpty(expiringBuf *expiringBuffer, category string) error {
	if expiringBuf.eventBuffer_ptr.List.Len() == 0 { // TODO: nil check?  or is never possible
		if sm.LoggingEnabled {
			log.Printf("Deleting empty eventBuffer for category: %s\n", category)
		}
		delete(sm.SubEventBuffer, category)
		sm.priorityQueueUpdateDeletedBuffer(expiringBuf)
	}
	return nil
}

func (sm *subscriptionManager) purgeStaleCategories() error {
	if sm.EventTimeToLiveSeconds == FOREVER {
		// Events never expire, don't bother checking here
		return nil
	}
	if sm.LoggingEnabled {
		log.Println("SubscriptionManager: performing stale category purge.")
	}
	now_ms := timeToEpochMilliseconds(time.Now())
	expiration_time := now_ms - int64(sm.EventTimeToLiveSeconds*1000)
	for sm.bufferPriorityQueue.Len() > 0 {
		topPriority, err := sm.bufferPriorityQueue.peakTopPriority()
		if err != nil {
			// queue is empty (threw empty buffer error) nothing to purge
			break
		}
		if topPriority > expiration_time {
			// The eventBuffer with the oldest most-recent-event-Timestamp is
			// still too recent to be expired, nothing to purge.
			break
		} else { // topPriority <= expiration_time
			// This buffer's most recent event is older than our TTL, so remove
			// the entire buffer.
			if item, ok := heap.Pop(&sm.bufferPriorityQueue).(*expiringBuffer); ok {
				if sm.LoggingEnabled {
					log.Printf("SubscriptionManager: purging expired eventBuffer for category: %v.\n",
						item.category)
				}
				// remove from our category-to-buffer map:
				delete(sm.SubEventBuffer, item.category)
				// invalidate references
				item.eventBuffer_ptr = nil
			} else {
				log.Printf("ERROR: found item in bufferPriorityQueue of unexpected type when attempting a TTL purge.\n")
			}
		}
		// will continue until we either run out of heap/queue items or we found
		// a buffer that has events more recent than our TTL window which
		// means we will never find any older buffers.
	}
	return nil
}

// Wraps updates to SubscriptionManager.bufferPriorityQueue when a new
// eventBuffer is created for a given category.  In the event that we don't
// expire events (TTL == FOREVER), we don't bother paying the price of keeping
// the priority queue.
func (sm *subscriptionManager) priorityQueueUpdateBufferCreated(expiringBuf *expiringBuffer) error {
	if sm.EventTimeToLiveSeconds == FOREVER {
		// don't bother keeping track
		return nil
	}
	// NOTE: this call has a complexity of O(log(n)) where n is len of heap
	heap.Push(&sm.bufferPriorityQueue, expiringBuf)
	return nil
}

// Wraps updates to SubscriptionManager.bufferPriorityQueue when a new lpEvent
// is added to an eventBuffer.  In the event that we don't expire events
// (TTL == FOREVER), we don't bother paying the price of keeping the priority
// queue.
func (sm *subscriptionManager) priorityQueueUpdateNewEvent(expiringBuf *expiringBuffer, newEvent *lpEvent) error {
	if sm.EventTimeToLiveSeconds == FOREVER {
		// don't bother keeping track
		return nil
	}
	// Update the priority to be the new event's timestmap.
	// we keep the buffers in order of oldest last-event-timestamp
	// so we can fetch the most stale buffers first when we do
	// purgeStaleCategories()
	//
	// NOTE: this call is O(log(n)) where n is len of heap/priority queue
	sm.bufferPriorityQueue.updatePriority(expiringBuf, newEvent.Timestamp)
	return nil
}

// Wraps updates to SubscriptionManager.bufferPriorityQueue when an eventBuffer
// is deleted after becoming empty.  In the event that we don't
// expire events (TTL == FOREVER), we don't bother paying the price of keeping
// the priority queue.
// NOTE: This is called after an eventBuffer is deleted from sm.SubEventBuffer
// and we want to remove the corresponding buffer item from our priority queue
func (sm *subscriptionManager) priorityQueueUpdateDeletedBuffer(expiringBuf *expiringBuffer) error {
	if sm.EventTimeToLiveSeconds == FOREVER {
		// don't bother keeping track
		return nil
	}
	// NOTE: this call is O(log(n)) where n is len of heap (queue)
	heap.Remove(&sm.bufferPriorityQueue, expiringBuf.index)
	expiringBuf.eventBuffer_ptr = nil // remove reference to eventBuffer
	return nil
}
