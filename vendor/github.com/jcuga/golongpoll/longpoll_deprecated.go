package golongpoll

import (
	"log"
)

// DEPRECATED.  Use StartLongpoll or StartLongpoll instead.
func CreateManager() (*LongpollManager, error) {
	log.Printf("WARNING: the function golongpoll.CreateManager is deprectated and should no longer be used.\n")
	return StartLongpoll(Options{
		LoggingEnabled:            true,
		MaxLongpollTimeoutSeconds: 180,
		MaxEventBufferSize:        250,
		// Original behavior maintained, events are never deleted unless they're
		// pushed out by max buffer size exceeded.
		EventTimeToLiveSeconds:         FOREVER,
		DeleteEventAfterFirstRetrieval: false,
	})
}

// DEPRECATED.  Use StartLongpoll or StartLongpoll instead.
func CreateCustomManager(maxTimeoutSeconds, eventBufferSize int,
	loggingEnabled bool) (*LongpollManager, error) {
	log.Printf("WARNING: the function golongpoll.CreateCustomManager is deprectated and should no longer be used.\n")
	return StartLongpoll(Options{
		LoggingEnabled:            loggingEnabled,
		MaxLongpollTimeoutSeconds: maxTimeoutSeconds,
		MaxEventBufferSize:        eventBufferSize,
		// Original behavior maintained, events are never deleted unless they're
		// pushed out by max buffer size exceeded.
		EventTimeToLiveSeconds:         FOREVER,
		DeleteEventAfterFirstRetrieval: false,
	})
}
