/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package jaeger

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

const (
	keyError         = "error"
	keySpanKind      = "span.kind"
	keyStatusCode    = "otel.status_code"
	keyStatusMessage = "otel.status_description"
)

func init() {
	tracing.DefaultURLMux().Register("jaeger-dump", &Opener{})
}

type Opener struct {
	json bool
}

type JsonExporter struct {
	filePath    string
	processId   string
	serviceName string
	processes   map[attribute.Distinct]Process
	traces      map[string][]Span
}

type Full struct {
	Data []Trace `json:"data"`
}

type Trace struct {
	TraceID   string             `json:"traceID"`
	Spans     []Span             `json:"spans"`
	Processes map[string]Process `json:"processes"`
}

type Reference struct {
	RefType string `json:"refType"`
	TraceID string `json:"traceID"`
	SpanID  string `json:"spanID"`
}

type Span struct {
	TraceID       string      `json:"traceID"`
	SpanID        string      `json:"spanID"`
	OperationName string      `json:"operationName"`
	References    []Reference `json:"references"`
	StartTime     int64       `json:"startTime"`
	Duration      int64       `json:"duration"`
	Flags         int32       `json:"flags"`
	Tags          []Tag       `json:"tags"`
	Logs          []Log       `json:"logs"`
	ProcessID     string      `json:"processID"`
}

type Tag struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Log struct {
	Timestamp int64 `json:"timestamp"`
	Fields    []Tag `json:"fields"`
}

type Process struct {
	id          string
	ServiceName string `json:"serviceName"`
	Tags        []Tag  `json:"tags"`
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (tracesdk.SpanExporter, error) {

	je := &JsonExporter{
		filePath:    u.Path,
		serviceName: "cells-dump",
		processId:   fmt.Sprintf("pid-%d", os.Getpid()),
	}
	if u.Query().Has("service") {
		je.serviceName = u.Query().Get("service")
	}
	return je, nil

}

func (j *JsonExporter) ExportSpans(ctx context.Context, spans []tracesdk.ReadOnlySpan) error {
	if j.processes == nil {
		j.processes = make(map[attribute.Distinct]Process)
	}
	if j.traces == nil {
		j.traces = make(map[string][]Span)
	}

	for _, sp := range spans {
		procAtt := sp.Resource().Equivalent()
		var process Process
		if proc, ok := j.processes[procAtt]; ok {
			process = proc
		} else {
			process = Process{
				id: uuid.New(),
			}
			serviceName := j.serviceName
			for iter := sp.Resource().Iter(); iter.Next(); {
				attr := iter.Attribute()
				if attr.Key == semconv.ServiceNameKey {
					serviceName = attr.Value.AsString()
					continue
				}
				process.Tags = append(process.Tags, Tag{Key: string(attr.Key), Value: attr.Value.AsString()})
			}
			process.ServiceName = serviceName
			j.processes[procAtt] = process
		}
		tID := sp.SpanContext().TraceID().String()
		j.traces[tID] = append(j.traces[tID], spanToJaeger(process.id, tID, sp))
	}

	return nil
}

func (j *JsonExporter) Shutdown(ctx context.Context) error {
	// Dump to file and flush collected spans
	defer func() {
		j.processes = nil
		j.traces = nil
	}()

	procs := make(map[string]Process, len(j.processes))
	for _, p := range j.processes {
		procs[p.id] = p
	}

	full := Full{}
	for tId, spans := range j.traces {
		full.Data = append(full.Data, Trace{
			TraceID:   tId,
			Spans:     spans,
			Processes: procs,
		})
	}

	bb, er := json.MarshalIndent(full, "", "  ")
	if er != nil {
		fmt.Println(er)
		return er
	}
	return os.WriteFile(j.filePath, bb, 0644)
}

func spanToJaeger(processID string, traceID string, span tracesdk.ReadOnlySpan) Span {
	refs := []Reference{} // Force empty [] instead of null in json
	if p := span.Parent(); p.IsValid() {
		refs = append(refs, Reference{
			RefType: "CHILD_OF",
			SpanID:  p.SpanID().String(),
			TraceID: p.TraceID().String(),
		})
	}
	for _, l := range span.Links() {
		refs = append(refs, Reference{
			RefType: "FOLLOW_FROM",
			TraceID: l.SpanContext.TraceID().String(),
			SpanID:  l.SpanContext.SpanID().String(),
		})
	}
	var tags []Tag
	for _, att := range span.Attributes() {
		tags = append(tags, Tag{Key: string(att.Key), Value: att.Value.AsString()})
	}

	if span.SpanKind() != trace.SpanKindInternal {
		tags = append(tags, Tag{Key: keySpanKind, Value: span.SpanKind().String()})
	}

	if span.Status().Code != codes.Unset {
		switch span.Status().Code {
		case codes.Ok:
			tags = append(tags, Tag{Key: keyStatusCode, Value: "OK"})
		case codes.Error:
			tags = append(tags, Tag{Key: keyError, Value: "true"})
			tags = append(tags, Tag{Key: keyStatusCode, Value: "ERROR"})
		}
		if span.Status().Description != "" {
			tags = append(tags, Tag{Key: keyStatusMessage, Value: span.Status().Description})
		}
	}

	return Span{
		TraceID:       traceID,
		SpanID:        span.SpanContext().SpanID().String(),
		OperationName: span.Name(),
		StartTime:     span.StartTime().UnixNano() / 1e3, // convert to microseconds
		Duration:      span.EndTime().UnixNano()/1e3 - span.StartTime().UnixNano()/1e3,
		Flags:         int32(span.SpanContext().TraceFlags()),
		References:    refs,
		Tags:          tags,
		Logs:          []Log{},
		ProcessID:     processID,
	}
}
