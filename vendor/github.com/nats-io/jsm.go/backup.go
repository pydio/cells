// Copyright 2020 The NATS Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package jsm

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/nats-io/jsm.go/api"
)

type BackupData struct {
	Type          string `json:"type"`
	Time          string `json:"time"`
	Configuration []byte `json:"configuration"`
	Checksum      string `json:"checksum"`
}

type ConsumerBackup struct {
	Name   string             `json:"name"`
	Stream string             `json:"stream"`
	Config api.ConsumerConfig `json:"config"`
}

// BackupJetStreamConfiguration creates a backup of all configuration for Streams, Consumers and Stream Templates.
//
// Stream data can optionally be backed up
func (m *Manager) BackupJetStreamConfiguration(backupDir string, data bool) error {
	_, err := os.Stat(backupDir)
	if err == nil || !os.IsNotExist(err) {
		return fmt.Errorf("%s already exist", backupDir)
	}

	err = os.MkdirAll(backupDir, 0750)
	if err != nil {
		return err
	}

	log.Printf("Creating JetStream backup into %s", backupDir)
	err = m.EachStream(func(stream *Stream) {
		err = m.backupStream(stream, backupDir, data)
		if err != nil {
			log.Fatalf("Could not backup Stream %s: %s", stream.Name(), err)
		}
	})
	if err != nil {
		return err
	}

	err = m.EachStreamTemplate(func(template *StreamTemplate) {
		err = m.backupStreamTemplate(template, backupDir)
		if err != nil {
			log.Fatalf("Could not backup Stream Template %s: %s", template.Name(), err)
		}
	})

	log.Printf("Configuration backup complete")

	return nil
}

// RestoreJetStreamConfiguration restores the configuration from a backup made by BackupJetStreamConfiguration
func (m *Manager) RestoreJetStreamConfiguration(backupDir string, update bool) error {
	backups := []*BackupData{}

	// load all backups files since we have to do them in a specific order
	err := filepath.Walk(backupDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		if !strings.HasSuffix(info.Name(), ".json") {
			return nil
		}

		log.Printf("Reading file %s", path)
		b, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		bd := &BackupData{}
		err = json.Unmarshal(b, bd)
		if err != nil {
			return err
		}

		if !m.verifySum(bd.Configuration, bd.Checksum) {
			return fmt.Errorf("data checksum failed for  %s", path)
		}

		backups = append(backups, bd)

		return nil
	})
	if err != nil {
		return err
	}

	eachOfType := func(bt string, cb func(*BackupData) error) error {
		for _, b := range backups {
			if b.Type == bt {
				err := cb(b)
				if err != nil {
					return err
				}
			}
		}

		return nil
	}

	err = eachOfType("stream", func(d *BackupData) error { return m.restoreStream(d, update) })
	if err != nil {
		return err
	}

	err = eachOfType("stream_template", m.restoreStreamTemplate)
	if err != nil {
		return err
	}

	err = eachOfType("consumer", m.restoreConsumer)
	if err != nil {
		return err
	}

	return err
}

// RestoreJetStreamConfigurationFile restores a single file from a backup made by BackupJetStreamConfiguration
func (m *Manager) RestoreJetStreamConfigurationFile(path string, update bool) error {
	log.Printf("Reading file %s", path)
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}

	bd := &BackupData{}
	err = json.Unmarshal(b, bd)
	if err != nil {
		return err
	}

	if !m.verifySum(bd.Configuration, bd.Checksum) {
		return fmt.Errorf("data checksum failed for %s", path)
	}

	switch bd.Type {
	case "stream":
		err = m.restoreStream(bd, update)
	case "consumer":
		err = m.restoreConsumer(bd)
	case "stream_template":
		err = m.restoreStreamTemplate(bd)
	default:
		err = fmt.Errorf("unknown backup type %q", bd.Type)
	}

	return err
}

func (m *Manager) restoreStream(backup *BackupData, update bool) error {
	if backup.Type != "stream" {
		return fmt.Errorf("cannot restore backup of type %q as Stream", backup.Type)
	}

	sc := api.StreamConfig{}
	err := json.Unmarshal([]byte(backup.Configuration), &sc)
	if err != nil {
		return err
	}

	if sc.Template != "" {
		log.Printf("Skipping Template managed Stream %s", sc.Name)
		return nil
	}

	known, err := m.IsKnownStream(sc.Name)
	if err != nil {
		return err
	}

	switch {
	case known && !update:
		err = fmt.Errorf("stream %s exists and update was not specified", sc.Name)

	case known && update:
		var stream *Stream
		stream, err = m.LoadStream(sc.Name)
		if err != nil {
			return err
		}

		log.Printf("Updating Stream %s configuration", sc.Name)
		err = stream.UpdateConfiguration(sc)

	default:
		log.Printf("Restoring Stream %s", sc.Name)
		_, err = m.NewStreamFromDefault(sc.Name, sc)
	}

	return err
}

func (m *Manager) restoreStreamTemplate(backup *BackupData) error {
	if backup.Type != "stream_template" {
		return fmt.Errorf("cannot restore backup of type %q as Stream Template", backup.Type)
	}

	tc := api.StreamTemplateConfig{}
	err := json.Unmarshal([]byte(backup.Configuration), &tc)
	if err != nil {
		return err
	}

	tc.Config.Name = ""

	log.Printf("Restoring Stream Template %s", tc.Name)
	_, err = m.NewStreamTemplate(tc.Name, tc.MaxStreams, *tc.Config)
	return err
}

func (m *Manager) restoreConsumer(backup *BackupData) error {
	if backup.Type != "consumer" {
		return fmt.Errorf("cannot restore backup of type %q as Consumer", backup.Type)
	}

	cc := ConsumerBackup{}
	err := json.Unmarshal([]byte(backup.Configuration), &cc)
	if err != nil {
		return err
	}

	known, err := m.IsKnownStream(cc.Stream)
	if err != nil {
		return err
	}

	if !known {
		log.Printf("Restoring Consumer %s > %s skipped - stream does not exist, possibly managed by a Stream Template", cc.Stream, cc.Name)
		return nil
	}

	log.Printf("Restoring Consumer %s > %s", cc.Stream, cc.Name)
	_, err = m.NewConsumerFromDefault(cc.Stream, cc.Config)
	return err
}

func (m *Manager) backupStream(stream *Stream, backupDir string, data bool) error {
	path := filepath.Join(backupDir, fmt.Sprintf("stream_%s.json", stream.Name()))
	log.Printf("Stream %s to %s", stream.Name(), path)

	bupj, err := m.backupSerialize(stream.Configuration(), "stream")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(path, bupj, 0640)
	if err != nil {
		return err
	}

	err = stream.EachConsumer(func(consumer *Consumer) {
		err = m.backupConsumer(consumer, backupDir)
		if err != nil {
			return
		}
	})

	if data {
		if stream.Storage() == api.FileStorage {
			_, err := stream.SnapshotToDirectory(context.Background(), backupDir, SnapshotConsumers(), SnapshotDebug())
			if err != nil {
				return err
			}
		} else {
			log.Printf("Skipping data backup for Stream %q, only file store backed data can be backed up", stream.Name())
		}
	}

	return err
}

func (m *Manager) backupStreamTemplate(template *StreamTemplate, backupDir string) error {
	path := filepath.Join(backupDir, fmt.Sprintf("stream_template_%s.json", template.Name()))
	log.Printf("Stream Template %s to %s", template.Name(), path)

	bupj, err := m.backupSerialize(template.Configuration(), "stream_template")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(path, bupj, 0640)
}

func (m *Manager) backupConsumer(consumer *Consumer, backupDir string) error {
	if consumer.IsEphemeral() {
		log.Printf("Consumer %s > %s skipped", consumer.StreamName(), consumer.Name())
		return nil
	}

	path := filepath.Join(backupDir, fmt.Sprintf("stream_%s_consumer_%s.json", consumer.StreamName(), consumer.Name()))
	log.Printf("Consumer %s > %s to %s", consumer.StreamName(), consumer.Name(), path)

	cb := &ConsumerBackup{
		Name:   consumer.Name(),
		Stream: consumer.StreamName(),
		Config: consumer.Configuration(),
	}

	bupj, err := m.backupSerialize(cb, "consumer")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(path, bupj, 0640)
}

func (m *Manager) verifySum(data []byte, csum string) bool {
	sum := sha256.New()
	sum.Write(data)

	return fmt.Sprintf("%x", sum.Sum(nil)) == csum
}

func (m *Manager) backupSerialize(data interface{}, btype string) ([]byte, error) {
	dj, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil, err
	}

	sum := sha256.New()
	sum.Write(dj)

	backup := &BackupData{
		Type:          btype,
		Time:          time.Now().UTC().Format(time.RFC3339),
		Configuration: dj,
		Checksum:      fmt.Sprintf("%x", sum.Sum(nil)),
	}

	return json.MarshalIndent(backup, "", "  ")
}
