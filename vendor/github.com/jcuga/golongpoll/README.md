# golongpoll [![Build Status](https://travis-ci.org/jcuga/golongpoll.svg?branch=master)](https://travis-ci.org/jcuga/golongpoll) [![Coverage Status](https://coveralls.io/repos/jcuga/golongpoll/badge.svg?branch=master&service=github)](https://coveralls.io/github/jcuga/golongpoll?branch=master) [![GoDoc](https://godoc.org/github.com/jcuga/golongpoll?status.svg)](https://godoc.org/github.com/jcuga/golongpoll) [![Go Report Card](https://goreportcard.com/badge/jcuga/golongpoll)](https://goreportcard.com/report/jcuga/golongpoll)
Golang long polling library. Makes web pub-sub easy via an HTTP long-poll server.

Table of contents
=================
  * [New in v1.1](#new-in-v11)
  * [Basic Usage](#basic-usage)
    * [HTTP Subscription Handler](#http-subscription-handler)
    * [Options] (#options)
  * [What is longpolling?](#what-is-longpolling)
  * [Included examples](#included-examples)
    * [Basic](#basic)
    * [Advanced](#advanced)
  * [More advanced use](#more-advanced-use)
    * [Events with JSON payloads](#events-with-json-payloads)
    * [Wrapping subscriptions](#wrapping-subscriptions)
    * [Publishing events via the web](#publishing-events-via-the-web)

New in v1.1
=================
- Deprecated ```CreateManager``` and ```CreateCustomManager``` in favor of ```StartLongpoll```
  -  The deprecated functions still work but they log warnings when called.
  -  ```StartLongpoll``` takes an ```Options``` struct that allows you to configure more behavior.  See [Options] (#options)
- Event expiration via the ```EventTimeToLiveSeconds``` option.  
- Bug fixes for client disconnects

Basic usage
=================
To use, create a ```LongpollManager``` and then use it to publish events and expose an HTTP handler to subscribe to events.
```go
import	"github.com/jcuga/golongpoll"

// This launches a goroutine and creates channels for all the plumbing
manager, err := golongpoll.StartLongpoll(golongpoll.Options{})  // default options

// Pass the manager around or create closures and publish:
manager.Publish("subscription-category", "Some data.  Can be string or any obj convertable to JSON")
manager.Publish("different-category", "More data")

// Expose events to browsers
// See subsection on how to interact with the subscription handler
http.HandleFunc("/events", manager.SubscriptionHandler)
http.ListenAndServe("127.0.0.1:8081", nil)
```
For a working demo, see [basic.go](examples/basic/basic.go).

Note that you can add extra access-control, validation, or other behavior on top of the manager's SubscriptionHandler.  See the [advanced example](#advanced).  This example also shows how to publish a more complicated payload JSON object.

You can also configure the ```LongpollManager``` by defining values in the ```golongpoll.Options``` param passed to ```StartLongpoll(opts)```

Options
-----
The default options should work for most people's needs.  However, if you are worried about old events sitting around taking up space and want to fine tune how long events last inside the internal buffers you can roll up your sleeves and configure the ```LongpollManager```.  This applies most to programs that are going to deal with a 'large' number of events over a 'long' period of time. 

The following options are now available.
- ```LoggingEnabled bool```: Whether or not to output logs about events, subscriptions, and clients.  Defaults to false.
- ```MaxLongpollTimeoutSeconds int```: Max amount of time clients are allowed to keep a longpoll connection.  This is used against the ```timeout```: Query param sent to the ```SubscriptionHandler```.  Defaults to 120.
- ```MaxEventBufferSize int```: The max number of events kept in a given subscription category before the oldest events are discarded even if they're not expired yet.  Buffering is important if you want to let clients request events from the past, or if you have high-volume events that occur in spurts and you don't clients to miss anything.  Defaults to 250.
- ```EventTimeToLiveSeconds int```: How long events can remain in the internal buffer before they're discarded for being too old.  This determines how long in the past clients can see events (they can provide a ```since_time``` query param to request old events).  Defaults to the constant ```golongpoll.FOREVER``` which means they never expire.  If you're concerned about old events sitting around in the internal buffers wasting space (especially if you're generating a large number of events and running the program for long periods of time), you can set a reasonable expiration and they automatically be removed once expired.
- ```DeleteEventAfterFirstRetrieval bool```:  Whether or not an event is immediately deleted as soon as it is retrieved by a client (via the ```SubscriptionHandler```).  This is useful if you only have one client per subscription category and you only care to see event's once.  This may be useful for a notification type scenario where each client has a subscription category and you only see events once.  Alternatively, clients could just update their ```since_time``` param in their longpoll request to be that of the timestamp of their most recent notification, thus causing previously seen notifications to not be retrieved.  But there may be other scenarios where this option is more desirable since people have asked for this.  Defaults to false.

These are set on the ```golongpoll.Options``` struct that gets passed to ```golongpoll.StartLongpoll```.  For example:
```go
	manager, err := golongpoll.StartLongpoll(golongpoll.Options{
		LoggingEnabled:                 true,
		MaxLongpollTimeoutSeconds:      60,
		MaxEventBufferSize:             100,
		EventTimeToLiveSeconds:         60 * 2, // Event's stick around for 2 minutes
		DeleteEventAfterFirstRetrieval: false,
	})
```
Or if you want the defauls, just provide an empty struct, or a struct that only defines the options you want to override.
```go
// all default options:
manager, err := golongpoll.StartLongpoll(golongpoll.Options{})

// Default options with EventTimeToLiveSeconds override:
manager, err := golongpoll.StartLongpoll(golongpoll.Options{
			EventTimeToLiveSeconds:         60 * 2,
	})
```

HTTP Subscription Handler
-----
The ```LongpollManager``` has a field called ```SubscriptionHandler``` that you can attach as an ```http.HandleFunc```.

This HTTP handler has the following URL query params as input.

* ```timeout``` number of seconds the server should wait until issuing a timeout response in the event there are no new events during the client's longpoll.  The default manager has a max timeout of 120 seconds, but you can customize this by using ```Options.MaxLongpollTimeoutSeconds```
* ```category``` the subscription category to subscribe to.  When you publish an event, you publish it on a specific category.
* ```since_time``` optional.  the number of milliseconds since epoch.  If not provided, defaults to current time.  This tells the longpoll server to only give you events that have occurred since this time.  

The response from this HTTP handler is one of the following ```application/json``` responses:

* error response: ```{"error": "error message as to why request failed."}```
  * Perhaps you forgot to include a query param?  Or an invalid timeout? 
* timeout response: ```{"timeout":"no events before timeout","timestamp":1450827183289}``` 
  * This means no events occurred within the timeout window.  (also given your ```since_time``` param) 
  * The timestamp is the server time when it issued a timeout response, so you can use this value as since_time in your next request.
* event(s) response: ```{"events":[{"timestamp":1447218359843,"category":"farm","data":"Pig went 'Oink! Oink!'"}]}```
  * includes one or more event object.  If no events occurred, you should get a timeout instead. 

To receive a continuous stream of chronological events, you should keep hitting the http handler after each response, but with an updated ```since_time``` value equal to that of the last event's timestamp. 

You can see how to make these longpoll requests using jquery by viewing the example programs' code.

What is longpolling
=================
Longpolling is a way to get events/data "pushed" to the browser as soon as they occur* (with a usually very small delay).  Longpolling is an option to consider when you want updates to be sent from the webserver to a browser as they occur.  This is a one-way communication path.  If you need full-duplex communication, consider an alternative like websockets.  

To better understand longpolling, let's consider what it improves upon.  A naive way to get updates as soon as possible from a webserver is to continuously make AJAX requests from a webpage asking the server if there is anything new.

![polling diagram](https://raw.githubusercontent.com/jcuga/golongpoll/master/readme-images/polling.png)

The problem with this approach is that when there are no updates, you are continuously spamming the webserver with new requests.  An alternative approach is to have the webserver wait until there is actually data before responding to your request.

![longpolling diagram](https://raw.githubusercontent.com/jcuga/golongpoll/master/readme-images/longpoll.png)

This is an improvement since both the client and the server aren't setting up and tearing down connections so quickly.  But you can't just wait forever to hear from the server.  So longpolling has the concept of a timeout.  If the server waits too long and there are no new events, the server responds to the client that there's nothing new.  The client can then initiate a new longpoll request.

![longpolling diagram](https://raw.githubusercontent.com/jcuga/golongpoll/master/readme-images/longpoll-timeout.png)

Essentially, longpolling is a much more sane version of spamming the server with a bunch of requests asking for new data.  

**Why not just use websockets instead?**
Websockets are great if you need to push data in both directions.  But if you're really interested in pushing data from the server to the client and not vice-versa, then longpolling may be a viable option for a number of reasons.  

* longpolling is just simple, plain old HTTP.  The server is just... slow to respond at times.
  * This means much wider range of browser support, especially the older ones
  * Will work over infrastructure that uses proxies that only allow port 80/443
  * Also works well through VPN webclient type products that do "magic" to web traffic
    * As a general rule, the closer to traditional HTTP you are, the wider support you have. 

*Why does everyone run to websockets even when they only need server-to-client pushing?*
Probably because it's difficult to get longpolling right.  By this I mean handling the subtleties on the server end to make sure that any events that occur in the small window between the time that a client gets a response and before they make a new request, handling disconnects, and buffering older events in case clients went offline.  There is a plethora of posts on the internet to make a half-baked longpoll server, but few if any posts outline how to make a robust one.  (that's why you should use golongpoll--it will do this for you!).

Also, depending on what language you're writing the webserver in, longpolling might be more difficult.  Think python running in a WSGI container.  Without the flexibility of golang and it's channels, such implementations could be quite the headache.

Included examples
=================
There are two fully-functional example programs provided. 
Basic
-----
This program creates a default ```LongpollManager```, shows how a goroutine can generate some events, and how to subscribe from a webpage.  See [basic.go](examples/basic/basic.go)

To run this example
```bash
go build examples/basic/basic.go
./basic
OR: ./basic.exe
```
Then visit:
```
http://127.0.0.1:8081/basic
```
And observe the events appearing every 0-5 seconds.

Advanced
-----
This program creates a custom ```LongpollManager```, shows how an http handler can publish events, and how to subscribe from a webpage.  See [advanced.go](examples/advanced/advanced.go)

To run this example
```bash
go build examples/advanced/advanced.go
./advanced
OR: ./advanced.exe
```
Then visit:
```
http://127.0.0.1:8081/advanced
```
Try clicking around and notice the events showing up in the tables.  Try opening multiple windows as different users and observe events.  Toggle whether user's events are public or private.

More advanced use
=================
All of the below topics are demonstrated in the advanced example:
Events with JSON payloads
-----
Try passing any type that is convertible to JSON to ```Publish()```. If the type can be passed to encoding/json.Marshal(), it will work.

Wrapping subscriptions
-----
You can create your own HTTP handler that calls ```LongpollManager.SubscriptionHandler``` to add your own layer of logic on top of the subscription handler.  Uses include: user authentication/access-control and limiting subscriptions to a known set of categories.

Publishing events via the web
-----
You can create a closure that captures the LongpollManager and attach it as an http handler function.  Within that function, simply call Publish(). 
