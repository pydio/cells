{{/*
VAULT HOST
*/}}
{{- define "cells.vault.host" -}}
{{- if .Values.vault.enabled -}}
{{- printf "%s-vault.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- else if .Values.externalVault.enabled -}}
{{- .Values.externalVault.host }}
{{- end -}}
{{- end }}

{{/*
VAULT PORT
*/}}
{{- define "cells.vault.port" -}}
{{- if .Values.vault.enabled -}}
{{ .Values.vault.server.service.port | toString }}
{{- else if .Values.externalVault.enabled -}}
{{ .Values.externalVault.port | toString }}
{{- end -}}
{{- end }}

{{/*
VAULT ACTIVATION
*/}}
{{- define "cells.vault.enabled" -}}
{{- if or .Values.vault.enabled .Values.externalVault.enabled -}}
{{ true }}
{{- end -}}
{{- end -}}

{{- define "cells.vault.envvar" -}}
{{- if (include "cells.vault.enabled" .) -}}
{{ include "common.tplvalues.render" (dict "value" (list (dict "name" "CELLS_KEYRING" "value" (include "cells.vault.url" (list . "/secret?key=keyring")))) "context" .) }}
{{ include "common.tplvalues.render" (dict "value" (list (dict "name" "CELLS_CERTS_STORE" "value" (include "cells.vault.url" (list . "/caddycerts")))) "context" .) }}
{{- else -}}
{{ include "common.tplvalues.render" (dict "value" (list (dict "name" "CELLS_CERTS_STORE" "value" "file:///var/cells/certs")) "context" .) }}
{{ include "common.tplvalues.render" (dict "value" (list (dict "name" "CADDYPATH" "value" "/var/cells")) "context" .) }}
{{- end -}}
{{- end -}}

{{/*
VAULT TLS ACTIVATION
*/}}
{{- define "cells.vault.tls.enabled" -}}
{{- end -}}

{{- define "cells.vault.tls.scheme" -}}
{{ "vault" }}
{{- end -}}

{{- define "cells.vault.tls.ca.existingSecret" -}}
{{- end -}}

{{- define "cells.vault.tls.server.existingSecret" -}}
{{- end -}}

{{- define "cells.vault.tls.client.existingSecret" -}}
{{- end -}}

{{- define "cells.vault.tls.ca.cert" -}}
{{- end -}}

{{- define "cells.vault.tls.ca.key" -}}
{{- end -}}

{{- define "cells.vault.tls.client.cert" -}}
{{- end -}}

{{- define "cells.vault.tls.client.key" -}}
{{- end -}}

{{- define "cells.vault.tls.server.cert" -}}
{{- end -}}

{{- define "cells.vault.tls.server.key" -}}
{{- end -}}

{{/*
VAULT TLS PARAMÈTRES
*/}}
{{- define "cells.vault.tls.params" -}}
{{ if (include "cells.vault.tls.enabled" .) }}
{{ include "cells.urlTLSParams" (dict
  "enabled"         (include "cells.vault.tls.enabled" .)
  "prefix"          "vault"
  "certFilename"    (include "cells.vault.tls.client.cert" .)
  "certKeyFilename" (include "cells.vault.tls.client.key" .)
  "caFilename"      (include "cells.vault.tls.ca.cert" .)
) }}
{{- end -}}
{{- end -}}

{{/*
VAULT AUTH (token) ACTIVÉ
*/}}
{{- define "cells.vault.auth.enabled" -}}
{{- if .Values.vault.enabled -}}
{{- false -}}
{{- else if .Values.externalVault.enabled -}}
{{- .Values.externalVault.auth.enabled -}}
{{- else -}}
false
{{- end -}}
{{- end -}}

{{/*
VAULT TOKEN (env)
*/}}
{{- define "cells.vault.auth.envvar" -}}
{{- if and (eq (include "cells.vault.auth.enabled" .) "true") .Values.vault.enabled }}
{{- include "cells.tplvalues.renderSecretPassword" (dict "name" "VAULT_TOKEN" "value" .Values.vault.auth.token) }}
{{- else if and (eq (include "cells.vault.auth.enabled" .) "true") .Values.externalVault.auth.enabled -}}
{{- include "cells.tplvalues.renderSecretPassword" (dict "name" "VAULT_TOKEN" "value" (dict
  "secretName"        .Values.externalVault.auth.existingSecret
  "secretPasswordKey" .Values.externalVault.auth.existingSecretPasswordKey)) }}
{{- end -}}
{{- end -}}

{{/*
VAULT AUTH URL (token@)
*/}}
{{- define "cells.vault.auth.urlToken" -}}
{{ include "cells.urlUser" (dict
  "enabled"  (include "cells.vault.auth.enabled" .)
  "user"     ""
  "password" (printf "%s" (include "cells.vault.auth.envvar" .))
) }}
{{- end -}}

{{/*
VAULT URL COMPLÈTE
*/}}
{{- define "cells.vault.url" -}}
{{- $path := index . 1 }}
{{- with index . 0 }}
{{- printf "%s://%s%s:%s%s%s"
    (include "cells.vault.tls.scheme" .)
    (include "cells.vault.auth.urlToken" .)
    (include "cells.vault.host" .)
    (include "cells.vault.port" .)
    $path
    (include "cells.vault.tls.params" .)
}}
{{- end }}
{{- end }}
