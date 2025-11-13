{{/*
COLLABORA HOST
*/}}
{{- define "cells.collabora.host" -}}
{{- if .Values.collabora.enabled -}}
{{- printf "%s-collabora-online.%s.svc.%s" .Release.Name .Release.Namespace .Values.clusterDomain }}
{{- else if .Values.externalCollabora.enabled -}}
{{- .Values.externalCollabora.host }}
{{- end -}}
{{- end }}

{{/*
COLLABORA PORT
*/}}
{{- define "cells.collabora.port" -}}
{{- if .Values.collabora.enabled -}}
{{ .Values.collabora.service.port | default 9980 | toString }}
{{- else if .Values.externalCollabora.enabled -}}
{{ .Values.externalCollabora.port | toString }}
{{- end -}}
{{- end }}

{{/*
COLLABORA SCHEME
*/}}
{{- define "cells.collabora.scheme" -}}
{{- if .Values.collabora.enabled -}}
{{- if .Values.collabora.ssl.enabled -}}
{{- "https" -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- else if .Values.externalCollabora.enabled -}}
{{- if .Values.externalCollabora.ssl -}}
{{- "https" -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/*
COLLABORA SSL SKIP VERIFY
*/}}
{{- define "cells.collabora.sslSkipVerify" -}}
{{- if .Values.collabora.enabled -}}
{{- .Values.collabora.ssl.skipVerify | default false | toString }}
{{- else if .Values.externalCollabora.enabled -}}
{{- .Values.externalCollabora.skipTLSVerify | default false | toString }}
{{- end -}}
{{- end }}

{{/*
COLLABORA CODE VERSION
*/}}
{{- define "cells.collabora.codeVersion" -}}
{{- if .Values.collabora.enabled -}}
{{- .Values.collabora.codeVersion | default "v21" }}
{{- else if .Values.externalCollabora.enabled -}}
{{- .Values.externalCollabora.codeVersion | default "v21" }}
{{- end -}}
{{- end }}

{{/*
COLLABORA ACTIVATION
*/}}
{{- define "cells.collabora.enabled" -}}
{{- if or .Values.collabora.enabled .Values.externalCollabora.enabled -}}
{{ true }}
{{- end -}}
{{- end -}}

{{/*
COLLABORA CUSTOMCONFIGS
Generates the customconfigs map for Cells to connect to Collabora
Returns a YAML map that can be merged with existing customconfigs
*/}}
{{- define "cells.collabora.customconfigs" -}}
{{- if (include "cells.collabora.enabled" .) -}}
{{- $pluginEnabled := true }}
{{- if .Values.collabora.enabled }}
{{- $pluginEnabled = .Values.collabora.pluginEnabled | default true }}
{{- else if .Values.externalCollabora.enabled }}
{{- $pluginEnabled = .Values.externalCollabora.pluginEnabled | default true }}
{{- end }}
{{- $collaboraConfigs := dict
  "frontend/plugin/editor.libreoffice/LIBREOFFICE_CODE_VERSION" (include "cells.collabora.codeVersion" .)
  "frontend/plugin/editor.libreoffice/LIBREOFFICE_HOST" (include "cells.collabora.host" .)
  "frontend/plugin/editor.libreoffice/LIBREOFFICE_PORT" (include "cells.collabora.port" .)
  "frontend/plugin/editor.libreoffice/LIBREOFFICE_SSL" (eq (include "cells.collabora.scheme" .) "https")
  "frontend/plugin/editor.libreoffice/LIBREOFFICE_SSL_SKIP_VERIFY" (include "cells.collabora.sslSkipVerify" .)
  "frontend/plugin/editor.libreoffice/PYDIO_PLUGIN_ENABLED" ($pluginEnabled | toString)
-}}
{{- toYaml $collaboraConfigs -}}
{{- end -}}
{{- end }}
