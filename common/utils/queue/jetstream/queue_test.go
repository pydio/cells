/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

package jetstream

import (
	"testing"

	natsjs "github.com/nats-io/nats.go/jetstream"
)

func TestParseRetentionPolicy(t *testing.T) {
	tests := []struct {
		name    string
		value   string
		want    natsjs.RetentionPolicy
		wantErr bool
	}{
		{name: "default", want: natsjs.InterestPolicy},
		{name: "interest", value: "interest", want: natsjs.InterestPolicy},
		{name: "limits", value: "limits", want: natsjs.LimitsPolicy},
		{name: "workqueue", value: "workqueue", want: natsjs.WorkQueuePolicy},
		{name: "case insensitive", value: "WorkQueue", want: natsjs.WorkQueuePolicy},
		{name: "invalid", value: "unknown", wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseRetentionPolicy(tt.value)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected an error")
				}
				return
			}
			if err != nil {
				t.Fatalf("parseRetentionPolicy() error = %v", err)
			}
			if got != tt.want {
				t.Fatalf("parseRetentionPolicy() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewStreamConfig(t *testing.T) {
	config := newStreamConfig("stream", natsjs.WorkQueuePolicy)

	if config.Name != "stream" {
		t.Fatalf("stream name = %q, want stream", config.Name)
	}
	if len(config.Subjects) != 1 || config.Subjects[0] != "stream.*" {
		t.Fatalf("stream subjects = %v, want [stream.*]", config.Subjects)
	}
	if config.Retention != natsjs.WorkQueuePolicy {
		t.Fatalf("stream retention = %v, want %v", config.Retention, natsjs.WorkQueuePolicy)
	}
}

func TestValidateRetentionUpdate(t *testing.T) {
	tests := []struct {
		name    string
		current natsjs.RetentionPolicy
		desired natsjs.RetentionPolicy
		wantErr bool
	}{
		{name: "unchanged limits", current: natsjs.LimitsPolicy, desired: natsjs.LimitsPolicy},
		{name: "unchanged interest", current: natsjs.InterestPolicy, desired: natsjs.InterestPolicy},
		{name: "unchanged workqueue", current: natsjs.WorkQueuePolicy, desired: natsjs.WorkQueuePolicy},
		{name: "limits to interest", current: natsjs.LimitsPolicy, desired: natsjs.InterestPolicy},
		{name: "interest to limits", current: natsjs.InterestPolicy, desired: natsjs.LimitsPolicy},
		{name: "limits to workqueue", current: natsjs.LimitsPolicy, desired: natsjs.WorkQueuePolicy, wantErr: true},
		{name: "interest to workqueue", current: natsjs.InterestPolicy, desired: natsjs.WorkQueuePolicy, wantErr: true},
		{name: "workqueue to limits", current: natsjs.WorkQueuePolicy, desired: natsjs.LimitsPolicy, wantErr: true},
		{name: "workqueue to interest", current: natsjs.WorkQueuePolicy, desired: natsjs.InterestPolicy, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateRetentionUpdate(tt.current, tt.desired)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validateRetentionUpdate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
