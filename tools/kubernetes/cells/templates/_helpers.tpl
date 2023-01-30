{{/*
Expand the name of the chart.
*/}}
{{- define "cells.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "cells.serviceDomain" }}
{{- printf "%s.svc.%s" .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cells.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cells.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cells.labels" -}}
helm.sh/chart: {{ include "cells.chart" . }}
{{ include "cells.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cells.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cells.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "cells.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "cells.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Names
*/}}

{{/*
ETCD HOST
*/}}
{{- define "cells.etcdName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.etcd "Chart" (dict "Name" "etcd")) }}
{{- end }}

{{- define "cells.etcdHost" -}}
{{- printf "%s-etcd.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.etcdPort" -}}
{{ .Values.etcd.service.ports.client | toString }}
{{- end }}

{{- define "cells.etcdURL" -}}
{{- $path := index . 1 }}
{{- with index . 0 }}
{{- $user := "" }}
{{- if .Values.etcd.auth.rbac.create }}
{{- $user = "root:$(ETCD_ROOT_PASSWORD)@" }}
{{- end }}
{{- $tls := "" }}
{{- $tlsParams := "" }}
{{- if .Values.etcd.auth.client.secureTransport }}
{{- $tls = "+tls" }}
{{- $tlsParams = print "?tlsCertUUID=" .Values.etcd.auth.client.certFilename  "&tlsCertKeyUUID=" .Values.etcd.auth.client.certKeyFilename "&tlsCertCAUUID=" .Values.etcd.auth.client.caFilename }}
{{- end }}
{{- printf "etcd%s://%s%s:%s%s%s" $tls $user (include "cells.etcdHost" .) (include "cells.etcdPort" .) $path $tlsParams }}
{{- end }}
{{- end }}

{{/*
NATS HOST
*/}}
{{- define "cells.natsName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.nats "Chart" (dict "Name" "nats")) }}
{{- end }}

{{- define "cells.natsHost" -}}
{{- printf "%s-nats.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.natsPassword" -}}
{{- printf "%s" (include "nats.randomPassword" .) }}
{{- end }}

{{- define "cells.natsPort" -}}
{{ .Values.nats.service.ports.client | toString }}
{{- end }}

{{- define "cells.natsURL" -}}
{{- printf "nats://%s:%s" (include "cells.natsHost" .) (include "cells.natsPort" .) }}
{{- end }}

{{/*
REDIS HOST
*/}}
{{- define "cells.redisName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.redis "Chart" (dict "Name" "redis")) }}
{{- end }}

{{- define "cells.redisHost" -}}
{{- printf "%s-redis-master.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.redisPort" -}}
{{ .Values.redis.master.service.ports.redis | toString }}
{{- end }}

{{- define "cells.redisURL" -}}
{{- if .Values.redis.auth.enabled }}
{{- printf "redis://root:$(REDIS_PASSWORD)@%s:%s" (include "cells.redisHost" .) (include "cells.redisPort" .) }}
{{- else }}
{{- printf "redis://%s:%s" (include "cells.redisHost" .) (include "cells.redisPort" .) }}
{{- end }}
{{- end }}

{{/*
VAULT HOST
*/}}
{{- define "cells.vaultName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.vault "Chart" (dict "Name" "vault")) }}
{{- end }}

{{- define "cells.vaultHost" -}}
{{- printf "%s-vault.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.vaultPort" -}}
{{ .Values.vault.server.service.port | toString }}
{{- end }}

{{- define "cells.vaultURL" -}}
{{- printf "vault://%s:%s" (include "cells.vaultHost" .) (include "cells.vaultPort" .) }}
{{- end }}

{{- define "cells.httpVaultURL" -}}
{{- printf "http://%s:%s" (include "cells.vaultHost" .) (include "cells.vaultPort" .) }}
{{- end }}



{{/*
MARIADB HOST
*/}}
{{- define "cells.mariadbName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.mariadb "Chart" (dict "Name" "mariadb")) }}
{{- end }}

{{- define "cells.mariadbHost" -}}
{{- printf "%s-mariadb.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.mariadbPort" -}}
{{ .Values.mariadb.primary.service.ports.mysql | toString }}
{{- end }}

{{- define "cells.mariadbURL" -}}
{{- printf "mysql://%s:%s" (include "cells.mariadbHost" .) (include "cells.mariadbPort" .) }}
{{- end }}

{{/*
MONGODB HOST
*/}}
{{- define "cells.mongodbName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.mongodb "Chart" (dict "Name" "mongodb")) }}
{{- end }}

{{- define "cells.mongodbHost" -}}
{{- printf "%s-mongodb.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.mongodbPort" -}}
{{ .Values.mongodb.service.ports.mongodb | toString }}
{{- end }}

{{- define "cells.mongodbURL" -}}
{{- printf "mongodb://%s:%s" (include "cells.mongodbHost" .) (include "cells.mongodbPort" .) }}
{{- end }}

{{/*
MINIO HOST
*/}}
{{- define "cells.minioName" -}}
{{ include "cells.fullname" (dict "Release" .Release "Values" .Values.minio "Chart" (dict "Name" "minio")) }}
{{- end }}

{{- define "cells.minioHost" -}}
{{- printf "%s-minio.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- end }}

{{- define "cells.minioPort" -}}
{{ .Values.minio.service.ports.api | toString }}
{{- end }}

{{- define "cells.minioURL" -}}
{{- printf "http://%s:%s" (include "cells.minioHost" .) (include "cells.minioPort" .) }}
{{- end }}

{{/*
Return true if a TLS secret object should be created
*/}}
{{- define "cells.createTlsSecret" -}}
{{- if and .Values.tls.enabled .Values.tls.autoGenerated (not .Values.tls.existingSecret) }}
    {{- true -}}
{{- end -}}
{{- end -}}
