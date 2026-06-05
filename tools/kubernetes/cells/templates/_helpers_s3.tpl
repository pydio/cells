{{/*
ETCD HOST
*/}}
{{- define "cells.s3.host" -}}
{{- if .Values.minio.enabled -}}
{{- printf "%s-minio.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.host }}
{{- end -}}
{{- end }}

{{- define "cells.s3.port" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.containerPorts.api | toString }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.port | toString }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.enabled" -}}
{{- if or .Values.minio.enabled .Values.externalS3.enabled -}}
{{ true }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.scheme" -}}
{{ ternary "https" "http" (eq (include "cells.s3.tls.enabled" .) "true") }}
{{- end -}}

{{- define "cells.s3.tls.enabled" -}}
{{- if and .Values.minio.enabled .Values.minio.tls.enabled -}}
{{- true -}}
{{- else if and .Values.externalS3.enabled .Values.externalS3.tls.enabled -}}
{{- true -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.ca.existingSecret" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.tls.existingSecret }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.tls.ca.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.client.existingSecret" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.tls.existingSecret }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.tls.client.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.client.cert" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.tls.certFilename | default "tls.crt" }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.tls.client.cert }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.client.key" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.tls.certKeyFilename | default "tls.key" }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.tls.client.key }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.ca.cert" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.minio.tls.caFilename | default "ca.crt" }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.tls.ca.cert }}
{{- end -}}
{{- end -}}

{{- define "cells.s3.tls.params" -}}
{{- include "cells.urlTLSParams" (dict
   "enabled" (include "cells.s3.tls.enabled" .)
   "insecure" (empty (include "cells.s3.tls.client.existingSecret" .))
   "prefix" "s3"
   "certFilename" (include "cells.s3.tls.client.cert" .)
   "certKeyFilename" (include "cells.s3.tls.client.key" .)
   "caFilename" (include "cells.s3.tls.ca.cert" .)
) -}}
{{- end -}}

{{- define "cells.s3.auth.enabled" -}}
{{- if .Values.minio.enabled -}}
{{ .Values.etcd.auth.rbac.create }}
{{- else if .Values.externalS3.enabled -}}
{{ .Values.externalS3.auth.enabled }}
{{- else -}}
{{ false}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.user" -}}
{{- if and (include "cells.s3.auth.enabled" .) .Values.minio.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.minio.auth.existingSecret "key" .Values.minio.auth.rootUserSecretKey "context" . "defaultValue" .Values.minio.auth.rootUser) | b64dec -}}
{{- else if .Values.externalS3.enabled -}}
{{- if .Values.externalS3.auth.existingSecret -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.externalS3.auth.existingSecret "key" .Values.externalS3.auth.existingSecretUsernameKey "context" . "defaultValue" .Values.externalS3.auth.user) | b64dec -}}
{{- else -}}
{{- .Values.externalS3.auth.user | default "root" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.password" -}}
{{- if .Values.minio.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.minio.auth.existingSecret "key" .Values.minio.auth.rootPasswordSecretKey "context" . "defaultValue" .Values.minio.auth.rootPassword) | b64dec -}}
{{- else if .Values.externalS3.enabled -}}
{{- if .Values.externalS3.auth.existingSecret -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.externalS3.auth.existingSecret "key" .Values.externalS3.auth.existingSecretPasswordKey "context" . "defaultValue" .Values.externalS3.auth.password) | b64dec -}}
{{- else -}}
{{- .Values.externalS3.auth.password -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.envvar" -}}
{{- if .Values.minio.enabled -}}
{{- include "cells.tplvalues.renderSecretPassword" (dict "name" "S3_PASSWORD" "value" (dict "secretName" .Values.minio.auth.existingSecret "secretPasswordKey" .Values.minio.auth.rootPasswordSecretKey)) }}
{{- else if .Values.externalS3.auth.enabled -}}
{{- if empty .Values.externalS3.auth.existingSecret -}}
{{ include "cells.tplvalues.renderSecretPassword" (dict "name" "S3_USERNAME" "value" (.Values.externalS3.auth.user | default "root")) }}
{{ include "cells.tplvalues.renderSecretPassword" (dict "name" "S3_PASSWORD" "value" .Values.externalS3.auth.password) }}
{{- else -}}
{{- include "cells.auth.envvar" (dict "auth" .Values.externalS3.auth "prefix" "S3") }}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.urlUser" -}}
{{ include "cells.urlUser" (dict "enabled" (include "cells.s3.auth.enabled" .) "user" (include "cells.s3.auth.user" .) "password" (include "cells.s3.auth.password" .)) }}
{{- end -}}

{{- define "cells.s3.url" -}}
{{- if kindIs "map" . -}}
{{- $path := .path | default "" -}}
{{- $scheme := .scheme | default (include "cells.s3.tls.scheme" .context) -}}
{{- with .context }}
{{- $tlsParams := include "cells.s3.tls.params" . -}}
{{- $query := "" -}}
{{- if $tlsParams -}}
{{- $query = printf "%s%s" (ternary "&" "?" (contains "?" $path)) $tlsParams -}}
{{- end -}}
{{- printf "%s://%s:%s%s%s"
  $scheme
  (include "cells.s3.host" .)
  (include "cells.s3.port" .)
  $path
  $query
 }}
{{- end -}}
{{- else -}}
{{- $path := index . 1 }}
{{- $scheme := "" -}}
{{- if ge (len .) 3 -}}
{{- $scheme = index . 2 -}}
{{- end -}}
{{- with index . 0 }}
{{- $scheme = $scheme | default (include "cells.s3.tls.scheme" .) -}}
{{- $tlsParams := include "cells.s3.tls.params" . -}}
{{- $query := "" -}}
{{- if $tlsParams -}}
{{- $query = printf "%s%s" (ternary "&" "?" (contains "?" $path)) $tlsParams -}}
{{- end -}}
{{- printf "%s://%s:%s%s%s"
  $scheme
  (include "cells.s3.host" .)
  (include "cells.s3.port" .)
  $path
  $query
 }}
{{- end }}
{{- end }}
{{- end }}
