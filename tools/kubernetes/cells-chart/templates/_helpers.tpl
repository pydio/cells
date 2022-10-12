{{/*
Expand the name of the chart.
*/}}
{{- define "cells-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cells-chart.fullname" -}}
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
{{- define "cells-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cells-chart.labels" -}}
helm.sh/chart: {{ include "cells-chart.chart" . }}
{{ include "cells-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cells-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cells-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "cells-chart.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "cells-chart.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}



{{/*
ETCD HOST
*/}}
{{- define "cells-chart.etcdHost" -}}
{{- printf "%s-etcd.%s.svc.cluster.local" .Release.Name .Release.Namespace }}
{{- end }}

{{- define "cells-chart.etcdPort" -}}
{{ .Values.etcd.service.ports.client | toString }}
{{- end }}

{{- define "cells-chart.etcdURL" -}}
{{- printf "etcd://%s:%s" (include "cells-chart.etcdHost" .) (include "cells-chart.etcdPort" .) }}
{{- end }}

{{/*
NATS HOST
*/}}
{{- define "cells-chart.natsHost" -}}
{{- printf "nats://%s-nats.%s.svc.cluster.local:%s" .Release.Name .Release.Namespace (.Values.nats.service.ports.client | toString) }}
{{- end }}

{{/*
REDIS HOST
*/}}
{{- define "cells-chart.redisHost" -}}
{{- printf "redis://%s-redis.%s.svc.cluster.local:%s" .Release.Name .Release.Namespace (.Values.redis.master.service.ports.redis | toString) }}
{{- end }}

{{/*
VAULT HOST
*/}}
{{- define "cells-chart.vaultHost" -}}
{{- printf "vault://%s-vault.%s.svc.cluster.local:%s" .Release.Name .Release.Namespace (.Values.vault.server.service.port | toString) }}
{{- end }}

{{/*
MARIADB HOST
*/}}
{{- define "cells-chart.mariadbHost" -}}
{{- printf "%s-mariadb.%s.svc.cluster.local" .Release.Name .Release.Namespace }}
{{- end }}

{{- define "cells-chart.mariadbPort" -}}
{{ .Values.mariadb.primary.service.ports.mysql | toString }}
{{- end }}

{{- define "cells-chart.mariadbURL" -}}
{{- printf "mysql://%s:%s" (include "cells-chart.mariadbHost" .) (include "cells-chart.mariadbPort" .) }}
{{- end }}

{{/*
MONGODB HOST
*/}}
{{- define "cells-chart.mongodbHost" -}}
{{- printf "%s-mongodb.%s.svc.cluster.local" .Release.Name .Release.Namespace }}
{{- end }}

{{- define "cells-chart.mongodbPort" -}}
{{ .Values.mongodb.service.ports.mongodb | toString }}
{{- end }}

{{- define "cells-chart.mongodbURL" -}}
{{- printf "mongodb://%s:%s" (include "cells-chart.mongodbHost" .) (include "cells-chart.mongodbPort" .) }}
{{- end }}


{{/*
MINIO HOST
*/}}
{{- define "cells-chart.minioHost" -}}
{{- printf "%s-minio.%s.svc.cluster.local" .Release.Name .Release.Namespace }}
{{- end }}

{{- define "cells-chart.minioPort" -}}
{{ .Values.minio.service.ports.api | toString }}
{{- end }}

{{- define "cells-chart.minioURL" -}}
{{- printf "http://%s:%s" (include "cells-chart.minioHost" .) (include "cells-chart.minioPort" .) }}
{{- end }}
