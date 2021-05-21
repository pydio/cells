package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"text/template"
	"time"
)

// SchemasRepo is the repository holding NATS Schemas
var SchemasRepo = "https://raw.githubusercontent.com/nats-io/jetstream/master/schemas"

// UnknownMessage is a type returned when parsing an unknown type of event
type UnknownMessage = map[string]interface{}

// Event is a generic NATS Event capable of being converted to CloudEvents format
type Event interface {
	EventType() string
	EventID() string
	EventTime() time.Time
	EventSource() string
	EventSubject() string
	EventTemplate(kind string) (*template.Template, error)
}

// StructValidator is used to validate API structures
type StructValidator interface {
	ValidateStruct(data interface{}, schemaType string) (ok bool, errs []string)
}

// RenderFormat indicates the format to render templates in
type RenderFormat string

const (
	// TextCompactFormat renders a single line view of an event
	TextCompactFormat RenderFormat = "text/compact"
	// TextExtendedFormat renders a multi line full view of an event
	TextExtendedFormat RenderFormat = "text/extended"
	// ApplicationJSONFormat renders as indented JSON
	ApplicationJSONFormat RenderFormat = "application/json"
	// ApplicationCloudEventV1Format renders as a ApplicationCloudEventV1Format v1
	ApplicationCloudEventV1Format RenderFormat = "application/cloudeventv1"
)

// we dont export this since it's not official, but what this produce will be loadable by the official CE
type cloudEvent struct {
	Type        string          `json:"type"`
	Time        time.Time       `json:"time"`
	ID          string          `json:"id"`
	Source      string          `json:"source"`
	DataSchema  string          `json:"dataschema"`
	SpecVersion string          `json:"specversion"`
	Subject     string          `json:"subject"`
	Data        json.RawMessage `json:"data"`
}

type schemaDetector struct {
	Schema string `json:"schema"`
	Type   string `json:"type"`
}

// IsNatsSchemaType determines if a schema type is a valid NATS type.
// The logic here is currently quite naive while we learn what works best
func IsNatsSchemaType(schemaType string) bool {
	return strings.HasPrefix(schemaType, "io.nats.")
}

// SchemaSearch searches all known schemas using a regular expression f
func SchemaSearch(f string) ([]string, error) {
	if f == "" {
		f = "."
	}

	r, err := regexp.Compile(f)
	if err != nil {
		return nil, err
	}

	var found []string
	for s := range schemaTypes {
		if r.MatchString(s) {
			found = append(found, s)
		}
	}

	sort.Strings(found)

	return found, nil
}

// SchemaURL parses a typed message m and determines a http address for the JSON schema describing it rooted in SchemasRepo
func SchemaURL(m []byte) (address string, url *url.URL, err error) {
	schema, err := SchemaTypeForMessage(m)
	if err != nil {
		return "", nil, err
	}

	return SchemaURLForType(schema)
}

// SchemaURLForType determines the path to the JSON Schema document describing a typed message given a token like io.nats.jetstream.metric.v1.consumer_ack
func SchemaURLForType(schemaType string) (address string, url *url.URL, err error) {
	if !IsNatsSchemaType(schemaType) {
		return "", nil, fmt.Errorf("unsupported schema type %q", schemaType)
	}

	token := strings.TrimPrefix(schemaType, "io.nats.")
	address = fmt.Sprintf("%s/%s.json", SchemasRepo, strings.ReplaceAll(token, ".", "/"))
	url, err = url.Parse(address)

	return address, url, err
}

// SchemaTypeForMessage retrieves the schema token from a typed message byte stream
// it does this by doing a small JSON unmarshal and is probably not the fastest.
//
// Returns the schema io.nats.unknown_message for unknown messages
func SchemaTypeForMessage(e []byte) (schemaType string, err error) {
	sd := &schemaDetector{}
	err = json.Unmarshal(e, sd)
	if err != nil {
		return "", err
	}

	if sd.Schema == "" && sd.Type == "" {
		sd.Type = "io.nats.unknown_message"
	}

	if sd.Schema != "" && sd.Type == "" {
		sd.Type = sd.Schema
	}

	return sd.Type, nil
}

// Schema returns the JSON schema for a NATS specific Schema type like io.nats.jetstream.advisory.v1.api_audit
func Schema(schemaType string) (schema []byte, err error) {
	schema, ok := schemas[schemaType]
	if !ok {
		return nil, fmt.Errorf("unknown schema %s", schemaType)
	}

	return schema, nil
}

// NewMessage creates a new instance of the structure matching schema. When unknown creates a UnknownMessage
func NewMessage(schemaType string) (interface{}, bool) {
	gf, ok := schemaTypes[schemaType]
	if !ok {
		gf = schemaTypes["io.nats.unknown_message"]
	}

	return gf(), ok
}

// ParseMessage parses a typed message m and returns event as for example *api.ConsumerAckMetric, all unknown
// event schemas will be of type *UnknownMessage
func ParseMessage(m []byte) (schemaType string, msg interface{}, err error) {
	schemaType, err = SchemaTypeForMessage(m)
	if err != nil {
		return "", nil, err
	}

	msg, _ = NewMessage(schemaType)
	err = json.Unmarshal(m, msg)

	return schemaType, msg, err
}

// ToCloudEventV1 turns a NATS Event into a version 1.0 Cloud Event
func ToCloudEventV1(e Event) ([]byte, error) {
	je, err := json.MarshalIndent(e, "", "  ")
	if err != nil {
		return nil, err
	}

	event := cloudEvent{
		Type:        e.EventType(),
		Time:        e.EventTime(),
		ID:          e.EventID(),
		Source:      e.EventSource(),
		Subject:     e.EventSubject(),
		SpecVersion: "1.0",
		Data:        je,
	}

	address, _, err := SchemaURLForType(e.EventType())
	if err == nil {
		event.DataSchema = address
	}

	return json.MarshalIndent(event, "", "  ")
}

// RenderEvent renders an event in specific format
func RenderEvent(wr io.Writer, e Event, format RenderFormat) error {
	switch format {
	case TextCompactFormat, TextExtendedFormat:
		t, err := e.EventTemplate(string(format))
		if err != nil {
			return err
		}

		return t.Execute(wr, e)

	case ApplicationJSONFormat:
		j, err := json.MarshalIndent(e, "", "  ")
		if err != nil {
			return err
		}

		_, err = wr.Write(j)
		return err

	case ApplicationCloudEventV1Format:
		ce, err := ToCloudEventV1(e)
		if err != nil {
			return err
		}

		_, err = wr.Write(ce)
		return err

	default:
		return fmt.Errorf("unsupported format %q", format)
	}
}
