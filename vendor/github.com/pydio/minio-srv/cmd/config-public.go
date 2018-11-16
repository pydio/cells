/*
 * Minio Go Library for Amazon S3 Compatible Cloud Storage
 * Copyright 2017, 2018 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cmd

import (
	"github.com/pydio/minio-srv/pkg/auth"
	"github.com/pydio/minio-srv/pkg/event/target"
)

func CreateEmptyMinioConfig() *serverConfigV19 {
	return newServerConfigV19()
}

func newServerConfigV19() *serverConfigV19 {
	srvCfg := &serverConfigV19{
		Version:    "32",
		Credential: auth.Credentials{},
		Region:     globalMinioDefaultRegion,
		Browser:    true,
		Logger:     &loggers{},
		Notify:     &notifierV3{},
	}

	// Enable console logger by default on a fresh run.
	//srvCfg.Logger.Console = NewConsoleLogger()

	// Make sure to initialize notification configs.
	srvCfg.Notify.AMQP = make(map[string]target.AMQPArgs)
	srvCfg.Notify.AMQP["1"] = target.AMQPArgs{}
	srvCfg.Notify.MQTT = make(map[string]target.MQTTArgs)
	srvCfg.Notify.MQTT["1"] = target.MQTTArgs{}
	srvCfg.Notify.Elasticsearch = make(map[string]target.ElasticsearchArgs)
	srvCfg.Notify.Elasticsearch["1"] = target.ElasticsearchArgs{}
	srvCfg.Notify.Redis = make(map[string]target.RedisArgs)
	srvCfg.Notify.Redis["1"] = target.RedisArgs{}
	srvCfg.Notify.NATS = make(map[string]target.NATSArgs)
	srvCfg.Notify.NATS["1"] = target.NATSArgs{}
	srvCfg.Notify.PostgreSQL = make(map[string]target.PostgreSQLArgs)
	srvCfg.Notify.PostgreSQL["1"] = target.PostgreSQLArgs{}
	srvCfg.Notify.MySQL = make(map[string]target.MySQLArgs)
	srvCfg.Notify.MySQL["1"] = target.MySQLArgs{}
	srvCfg.Notify.Kafka = make(map[string]target.KafkaArgs)
	srvCfg.Notify.Kafka["1"] = target.KafkaArgs{}
	srvCfg.Notify.Webhook = make(map[string]target.WebhookArgs)
	srvCfg.Notify.Webhook["1"] = target.WebhookArgs{}

	return srvCfg
}
