{{/* vim: set filetype=mustache: */}}
{{/*
Renders a value that contains template.
Usage:
{{ include "common.tplvalues.render" ( dict "value" .Values.path.to.the.Value "context" $) }}
*/}}
{{- define "common.tplvalues.render" -}}
    {{- if typeIs "string" .value }}
        {{- tpl .value .context }}
    {{- else }}
        {{- tpl (.value | toYaml) .context }}
    {{- end }}
{{- end -}}

{{/*
Renders a value that contains template.
Usage:
{{ include "common.tplvalues.render" ( dict "value" .Values.path.to.the.Value "context" $) }}
*/}}
{{- define "cells.tplvalues.renderSecretPassword" -}}
{{- if typeIs "string" .value }}
    {{- include "common.tplvalues.render" (dict "value" (list (dict "name" .name "value" .value)) "context" .) -}}
{{- else }}
    {{- include "common.tplvalues.render" (dict "value" (list (dict "name" .name "valueFrom" (dict "secretKeyRef" (dict "name" .value.secretName "key" .value.secretPasswordKey)))) "context" .) -}}
{{- end }}
{{- end -}}