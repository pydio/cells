{{- define "cells.ingress.enabled" -}}
{{- if or .Values.ingress.enabled .Values.externalIngress.enabled }}
{{ true }}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.annotations" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.annotations | toJson -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.annotations | toJson -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.hostname" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.hostname -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.hostname -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.extraPaths" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.extraPaths -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.extraPaths -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.ingressClassName" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.ingressClassName -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.ingressClassName -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.path" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.path -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.path -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.pathType" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.pathType -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.pathType -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.extraHosts" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.extraHosts | toJson -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.extraHosts | toJson -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.extraRules" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.extraRules -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.extraRules -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.tls.enabled" -}}
{{- if .Values.ingress.tls -}}
{{- true -}}
{{- else if .Values.externalIngress.tls.enabled -}}
{{- true -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.tls.selfSigned" -}}
{{- if and .Values.ingress.tls .Values.ingress.selfSigned -}}
{{- true -}}
{{- else if and .Values.externalIngress.tls.enabled .Values.externalIngress.tls.selfSigned -}}
{{- true -}}
{{- end -}}
{{- end -}}

{{- define "cells.ingress.extraTls" -}}
{{- if .Values.ingress.enabled -}}
{{- .Values.ingress.extraTls -}}
{{- else if .Values.externalIngress.enabled -}}
{{- .Values.externalIngress.extraTls -}}
{{- end -}}
{{- end -}}