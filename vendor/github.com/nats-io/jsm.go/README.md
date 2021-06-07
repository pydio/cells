## Overview

This is a Go based library to manage and interact with JetStream.

This package is the underlying library for the `nats` CLI, our Terraform provider, GitHub Actions and Kubernetes CRDs.

**NOTE**: This package is under development, while JetStream is in Preview we make no promises about the API stability of this package.

[![Go Doc](https://pkg.go.dev/badge/github.com/nats-io/jsm.go)](https://pkg.go.dev/github.com/nats-io/jsm.go)

## Features

 * Manage and interact with Streams
 * Manage and interact with Consumers
 * Perform Backup and Restore operations of configuration and data
 * Schema registry of many standard NATS events and APIs that supports validation using JSON Schema
 * Process, validate and render NATS server events and advisories
 
## Initialization

This package is modeled as a `Manager` instance that receives a NATS Connection and sets default timeouts and validation for
all interaction with JetStream.

Multiple Managers can be used in your application each with own timeouts and connection.

```go
mgr, _ := jsm.New(nc, jsm.WithTimeout(10*time.Second))
```

This creates a Manager with a 10 second timeout when accessing the JetStream API. All examples below assume a manager
was created as above.

## Managing Streams

A Stream stores data, this package allow you to Read messages from , Create, Delete, List and Update Streams.

### Creating Streams

Before anything you have to create a stream, the basic pattern is:

```go
mgr, _ := jsm.New(nc)
stream, _ := mgr.NewStream("ORDERS", jsm.Subjects("ORDERS.*"), jsm.MaxAge(24*365*time.Hour), jsm.FileStorage())
```

The `mgr.NewStream` uses `jsm.DefaultStream` as starting defaults.  

This can get quite verbose, so you might have a template configuration of your own choosing to create many similar Streams.

```go
template, _ := jsm.NewStreamConfiguration(jsm.DefaultStream, jsm.MaxAge(24 * 365 * time.Hour), jsm.FileStorage())

orders, _ := mgr.NewStreamFromDefault("ORDERS", template,  jsm.Subjects("ORDERS.*"))
archive, _ := mgr.NewStreamFromDefault("ARCHIVE", template, jsm.Subjects("ARCHIVE"), jsm.MaxAge(5*template.MaxAge))
```

We have 2 pre-defined configurations that you might use instead of your own template - `jsm.DefaultStream` and `jsm.DefaultWorkQueue`.

You can even copy Stream configurations this way (not content, just configuration), this creates `STAGING` using `ORDERS` config with a different set of subjects:

```go
orders, err := mgr.NewStream("ORDERS", jsm.Subjects("ORDERS.*"), jsm.MaxAge(24*365*time.Hour), jsm.FileStorage())
staging, err := mgr.NewStreamFromDefault("STAGING", orders.Configuration(), jsm.Subjects("STAGINGORDERS.*"))
```

### Loading references to existing streams

Once a Stream exist you can load it later:

```go
orders, err := mgr.LoadStream("ORDERS")
```

This will fail if the stream does not exist, create and load can be combined:

```go
orders, err := mgr.LoadOrNewFromDefault("ORDERS", template, jsm.Subjects("ORDERS.*"))
```

This will create the Stream if it doesn't exist, else load the existing one - though no effort is made to ensure the loaded one matches the desired configuration in that case.

### Associated Consumers

With a stream handle you can get lists of known Consumers using `stream.ConsumerNames()`, or create new Consumers within the stream using `stream.NewConsumer` and `stream.NewConsumerFromDefault`. Consumers can also be loaded using `stream.LoadConsumer` and you can combine load and create using `stream.LoadOrNewConsumer` and `stream.LoadOrNewConsumerFromDefault`.

These methods just proxy to the Consumer specific ones which will be discussed below. When creating new Consumer instances this way the connection information from the Stream is passed into the Consumer.

### Other actions

There are a number of other functions allowing you to purge messages, read individual messages, get statistics and access the configuration. Review the godoc for details.

## Consumers

### Creating

Above you saw that once you have a handle to a stream you can create and load consumers, you can access the consumer directly though, lets create one:

```go
consumer, err := mgr.NewConsumer("ORDERS", "NEW", jsm.FilterSubject("ORDERS.received"), jsm.SampleFrequency("100"))
```

Like with Streams we have `NewConsumerFromDefault`, `LoadOrNewConsumer` and `LoadOrNewConsumerFromDefault` and we supply 2 default configurations to help you `DefaultConsumer` and `SampledDefaultConsumer`.

When using `LoadOrNewConsumer` and `LoadOrNewConsumerFromDefault` if a durable name is given then that has to match the name supplied.

Many options exist to set starting points, durability and more - everything that you will find in the `jsm` utility, review the godoc for full details.

### Consuming

Push-based Consumers are accessed using the normal NATS subscribe approach:

```go
ib := nats.NewInbox()

sub, _ := nc.Subscribe(ib, func(m *nats.Msg){ // process messages })

consumer, _ := mgr.NewConsumer("ORDERS", "NEW", jsm.FilterSubject("ORDERS.received"), jsm.SampleFrequency("100"), jsm.DeliverySubject(ib))
```

For Pull-based Consumers we have a helper to fetch the next message:

```go
// 1 message
msg, err := consumer.NextMsg()
```

When consuming these messages they have metadata attached that you can parse:

```go
msg, _ := consumer.NextMsg(jsm.WithTimeout(60*time.Second))
meta, _ := jsm.ParseJSMsgMetadata(msg)
```

At this point you have access to `meta.Stream`, `meta.Consumer` for the names and `meta.StreamSequence`, `meta.ConsumerSequence` to determine which exact message and `meta.Delivered` for how many times it was redelivered.

If using the latest `nats.go` branch the `nats.Msg` instance will have a `JetStreamMetaData()` function that performs the same parsing and it also have helpers to acknowledge messages and more.

```go
sub, _ := nc.Subscribe(ib, func(m *nats.Msg){
  meta, _ := m.JetStreamMetaData()
  fmt.Printf("Received message from %s > %s\n", meta.Stream, meta.Consumer)
  m.Ack()
})
```
### Other Actions

There are a number of other functions to help you determine if its Pull or Push, is it Durable, Sampled and to access the full configuration.

## Schema Registry

All the JetStream API messages and some events and advisories produced by the NATS Server have JSON Schemas associated with them, the `api` package has a Schema Registry and helpers to discover and interact with these.

The Schema Registry can be accessed on the cli in the `nats schemas` command where you can list, search and view schemas and validate data based on schemas.

### Example Message

To retrieve the Stream State for a specific Stream one accesses the `$JS.API.STREAM.INFO.<stream>` API, this will respond with data like below:

```json
{
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "config": {
    "name": "TESTING",
    "subjects": [
      "js.in.testing"
    ],
    "retention": "limits",
    "max_consumers": -1,
    "max_msgs": -1,
    "max_bytes": -1,
    "discard": "old",
    "max_age": 0,
    "max_msg_size": -1,
    "storage": "file",
    "num_replicas": 1,
    "duplicate_window": 120000000000
  },
  "created": "2020-10-09T12:40:07.648216464Z",
  "state": {
    "messages": 1,
    "bytes": 81,
    "first_seq": 1017,
    "first_ts": "2020-10-09T19:43:40.867729419Z",
    "last_seq": 1017,
    "last_ts": "2020-10-09T19:43:40.867729419Z",
    "consumer_count": 1
  }
}
```

Here the type of the message is `io.nats.jetstream.api.v1.stream_info_response`, the API package can help parse this into the correct format.

### Message Schemas

Given a message kind one can retrieve the full JSON Schema as bytes:

```go
schema, _ := api.Schema("io.nats.jetstream.api.v1.stream_info_response")
```

Once can also retrieve it based on a specific message content:

```go
schemaType, _ := api.SchemaTypeForMessage(m.Data)
schema, _ := api.Schema(schemaType)
```

Several other Schema related helpers exist to search Schemas, fine URLs and more.  See the `api` [![Reference](https://pkg.go.dev/badge/github.com/nats.io/jsm.go/api)](https://pkg.go.dev/github.com/nats-io/jsm.go/api).

### Parsing Message Content

JetStream will produce metrics about message Acknowledgments, API audits and more, here we subscribe to the metric subject and print a specific received message type.

```go
nc.Subscribe("$JS.EVENT.ADVISORY.>", func(m *nats.Msg){
    kind, msg, _ := api.ParseMessage(m.Data)
    log.Printf("Received message of type %s", kind) // io.nats.jetstream.advisory.v1.api_audit
    
    switch e := event.(type){
    case advisory.JetStreamAPIAuditV1:
        fmt.Printf("Audit event on subject %s from %s\n", e.Subject, e.Client.Name)                
    }
})
```

Above we gain full access to all contents of the message in it's native format, but we need to know in advance what we will get, we can render the messages as text in a generic way though:

```go
nc.Subscribe("$JS.EVENT.ADVISORY.>", func(m *nats.Msg){
    kind, msg, _ := api.ParseMessage(m.Data)

    if kind == "io.nats.unknown_message" {
        return // a message without metadata or of a unknown format was received
    }

    ne, ok := event.(api.Event)
    if !ok {
        return fmt.Errorf("event %q does not implement the Event interface", kind)
    }

    err = api.RenderEvent(os.Stdout, ne, api.TextCompactFormat)
    if err != nil {
        return fmt.Errorf("display failed: %s", err)
    }
})
```

This will produce output like:

```
11:25:49 [JS API] $JS.API.STREAM.INFO.TESTING $G
11:25:52 [JS API] $JS.API.STREAM.NAMES $G
11:25:52 [JS API] $JS.API.STREAM.NAMES $G
11:25:53 [JS API] $JS.API.STREAM.INFO.TESTING $G
```

The `api.TextCompactFormat` is one of a few we support, also `api.TextExtendedFormat` for a full multi line format, `api.ApplicationCloudEventV1Format` for CloudEvents v1 format and `api.ApplicationJSONFormat` for JSON.

## API Validation

The data structures sent to JetStream can be validated before submission to NATS which can speed up user feedback and
provide better errors.

```go
type SchemaValidator struct{}

func (v SchemaValidator) ValidateStruct(data interface{}, schemaType string) (ok bool, errs []string) {
	s, err := api.Schema(schemaType)
	if err != nil {
		return false, []string{"unknown schema type %s", schemaType}
	}

	ls := gojsonschema.NewBytesLoader(s)
	ld := gojsonschema.NewGoLoader(data)
	result, err := gojsonschema.Validate(ls, ld)
	if err != nil {
		return false, []string{fmt.Sprintf("validation failed: %s", err)}
	}

	if result.Valid() {
		return true, nil
	}

	errors := make([]string, len(result.Errors()))
	for i, verr := range result.Errors() {
		errors[i] = verr.String()
	}

	return false, errors
}
```

This is a `api.StructValidator` implementation that uses JSON Schema to do deep validation of the structures sent to JetStream.

This can be used by the `Manager` to validate all API access.

```go
mgr, _ := jsm.New(nc, jsm.WithAPIValidation(new(SchemaValidator)))
```
