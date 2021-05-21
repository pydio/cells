package metric

import (
	"net/http"
	"time"

	"github.com/nats-io/jsm.go/api/event"
	"github.com/nats-io/jsm.go/api/server/advisory"
)

// ServiceLatencyV1 is the JSON message sent out in response to latency tracking for
// exported services.
//
// NATS Schema Type io.nats.server.metric.v1.service_latency
type ServiceLatencyV1 struct {
	event.NATSEvent

	Status         int                   `json:"status"`
	Error          string                `json:"description,omitempty"`
	Requestor      advisory.ClientInfoV1 `json:"requestor,omitempty"`
	Responder      advisory.ClientInfoV1 `json:"responder,omitempty"`
	RequestHeader  http.Header           `json:"header,omitempty"`
	RequestStart   time.Time             `json:"start"`
	ServiceLatency time.Duration         `json:"service"`
	SystemLatency  time.Duration         `json:"system"`
	TotalLatency   time.Duration         `json:"total"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.server.metric.v1.service_latency", `{{ .Time | ShortTime }} [Svc Latency] {{ if .Error }}{{ .Error }} {{ end }}requestor {{ .Requestor.RTT }} <-> system {{ .SystemLatency }} <- service rtt {{ .Responder.RTT }} -> service {{ .ServiceLatency }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.server.metric.v1.service_latency", `
{{- if .Error }}
[{{ .Time | ShortTime }}] [{{ .ID }}] Service Latency - {{ .Error }}
{{- else }}
[{{ .Time | ShortTime }}] [{{ .ID }}] Service Latency
{{- end }}

   Start Time: {{ .RequestStart | NanoTime }}
{{- if .Error }}
        Error: {{ .Error }}
{{- end }}

   Latencies:

      Request Duration: {{ .TotalLatency }}
{{- if .Requestor }}
             Requestor: {{ .Requestor.RTT }}
{{- end }}
           NATS System: {{ .SystemLatency }}
               Service: {{ .ServiceLatency }}
{{ with .Requestor }}
   Requestor:
     Account: {{ .Account }}
         RTT: {{ .RTT }}
{{- if .User }}
       Start: {{ .Start }}
        User: {{ .User }}
        Name: {{ .Name }}
    Language: {{ .Lang }}
     Version: {{ .Version }}
{{- end }}
{{- if .ID }}
        Host: {{ .Host }}
          ID: {{ .ID }}
      Server: {{ .Server }}
{{- end }}
{{- end }}
{{ with .Responder }}
   Responder:
     Account: {{ .Account }}
         RTT: {{ .RTT }}
{{- if .User }}
       Start: {{ .Start }}
        User: {{ .User }}
        Name: {{ .Name }}
    Language: {{ .Lang }}
     Version: {{ .Version }}
{{- end }}
{{- if .ID }}
        Host: {{ .Host }}
          ID: {{ .ID }}
      Server: {{ .Server }}
{{- end }}
{{- end }}`)
	if err != nil {
		panic(err)
	}
}
