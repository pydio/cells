package event

import (
	"fmt"
	"net"
	"strconv"
	"strings"
	"sync"
	"text/template"
	"time"

	"github.com/dustin/go-humanize"
)

var (
	sTemplateBodies = map[string]string{}
	sTemplates      = map[string]*template.Template{}
	lTemplateBodies = map[string]string{}
	lTemplates      = map[string]*template.Template{}
)

var mu sync.Mutex

const (
	textCompact  = "text/compact"
	textExtended = "text/extended"
)

type NATSEvent struct {
	Type string    `json:"type"`
	ID   string    `json:"id"`
	Time time.Time `json:"timestamp"`
}

func (e NATSEvent) EventType() string {
	return e.Type
}

func (e NATSEvent) EventID() string {
	return e.ID
}

func (e NATSEvent) EventTime() time.Time {
	return e.Time
}

func (e NATSEvent) EventSubject() string {
	parts := strings.Split(e.Type, ".")
	return parts[3]
}

func (e NATSEvent) EventSource() string {
	parts := strings.Split(e.Type, ".")
	return fmt.Sprintf("urn:nats:%s", parts[2])
}

func (e NATSEvent) EventTemplate(kind string) (*template.Template, error) {
	switch kind {
	case textCompact:
		return e.textCompactTemplate()

	case textExtended:
		return e.textExtendedTemplate()

	default:
		return nil, fmt.Errorf("unknown template type %q", kind)
	}
}
func (e NATSEvent) textExtendedTemplate() (*template.Template, error) {
	mu.Lock()
	defer mu.Unlock()

	t, ok := lTemplates[e.Type]
	if !ok {
		return nil, fmt.Errorf("no template registered for %q", e.Type)
	}

	return t, nil
}

func (e NATSEvent) textCompactTemplate() (*template.Template, error) {
	mu.Lock()
	defer mu.Unlock()

	t, ok := sTemplates[e.Type]
	if !ok {
		return nil, fmt.Errorf("no template registered for %q", e.Type)
	}

	return t, nil
}

func RegisterTextCompactTemplate(schema string, body string) error {
	parsed, err := compileTemplate(schema, body)
	if err != nil {
		return fmt.Errorf("invalid short text template for schema %q: %s", schema, err)
	}

	mu.Lock()
	defer mu.Unlock()

	_, ok := sTemplateBodies[schema]
	if ok {
		return fmt.Errorf("text/compact template for %q already registered", schema)
	}

	sTemplateBodies[schema] = body
	sTemplates[schema] = parsed

	return nil
}

func RegisterTextExtendedTemplate(schema string, body string) error {
	parsed, err := compileTemplate(schema, body)
	if err != nil {
		return fmt.Errorf("invalid long text template for schema %q: %s", schema, err)
	}

	mu.Lock()
	defer mu.Unlock()

	_, ok := lTemplateBodies[schema]
	if ok {
		return fmt.Errorf("text/extended template for %q already registered", schema)
	}

	lTemplateBodies[schema] = body
	lTemplates[schema] = parsed

	return nil
}

type stringer interface {
	String() string
}

func compileTemplate(schema string, body string) (*template.Template, error) {
	return template.New(schema).Funcs(map[string]interface{}{
		"ShortTime":   func(v time.Time) string { return v.Format("15:04:05") },
		"NanoTime":    func(v time.Time) string { return v.Format("15:04:05.000") },
		"IBytes":      func(v int64) string { return humanize.IBytes(uint64(v)) },
		"IntCommas":   func(v int) string { return humanize.Comma(int64(v)) },
		"Int64Commas": func(v int64) string { return humanize.Comma(v) },
		"HostPort":    func(h string, p int) string { return net.JoinHostPort(h, strconv.Itoa(p)) },
		"LeftPad":     func(indent int, v string) string { return leftPad(v, indent) },
		"ToString":    func(v stringer) string { return v.String() },
		"TitleString": func(v string) string { return strings.Title(v) },
		"JoinStrings": func(v []string) string { return strings.Join(v, ",") },
	}).Parse(body)
}

func leftPad(s string, indent int) string {
	var out []string
	format := fmt.Sprintf("%%%ds", indent)

	for _, l := range strings.Split(s, "\n") {
		out = append(out, fmt.Sprintf(format, " ")+l)
	}

	return strings.Join(out, "\n")
}
