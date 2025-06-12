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
{{ .Values.externalS3.secureTransport }}
{{- else -}}
{{ false}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.user" -}}
{{- if and (include "cells.s3.auth.enabled" .) .Values.minio.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.minio.auth.existingSecret "key" .Values.minio.auth.rootUserSecretKey "context" . "defaultValue" .Values.minio.auth.rootUser) | b64dec -}}
{{- else if .Values.externalS3.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.externalS3.auth.existingSecret "key" .Values.externalS3.auth.existingSecretUserKey "context" . "defaultValue" .Values.externalS3.auth.user) | b64dec -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.password" -}}
{{- if .Values.minio.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.minio.auth.existingSecret "key" .Values.minio.auth.rootPasswordSecretKey "context" . "defaultValue" .Values.minio.auth.rootPassword) | b64dec -}}
{{- else if .Values.externalS3.enabled -}}
{{- include "common.secrets.lookup" (dict "secret" .Values.externalS3.auth.existingSecret "key" .Values.externalS3.auth.existingSecretPasswordKey "context" . "defaultValue" .Values.externalS3.auth.password) | b64dec -}}
{{- end -}}
{{- end -}}

{{- define "cells.s3.auth.envvar" -}}
{{- end -}}

{{- define "cells.s3.auth.urlUser" -}}
{{ include "cells.urlUser" (dict "enabled" (include "cells.s3.auth.enabled" .) "user" (include "cells.s3.auth.user" .) "password" (include "cells.s3.auth.password" .)) }}
{{- end -}}

{{- define "cells.s3.url" -}}
{{- $path := index . 1 }}
{{- with index . 0 }}
{{- printf "%s://%s:%s%s%s"
  (include "cells.s3.tls.scheme" .)
  (include "cells.s3.host" .)
  (include "cells.s3.port" .)
  $path
  (include "cells.s3.tls.params" .)
 }}
{{- end }}
{{- end }}