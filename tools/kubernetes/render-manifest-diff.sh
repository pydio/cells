#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Render a Helm chart and compare it to a saved manifest.

Usage:
  render-manifest-diff.sh [options]

Options:
  --chart PATH        Helm chart directory or archive. Default: ./cells
  --values PATH       Values file to render with. Default: ./values.yaml
  --manifest PATH     Reference manifest to compare against.
                      Default: ~/fulu-manifest.yaml
  --release NAME      Helm release name. Default: cells
  --namespace NAME    Helm namespace. Default: fulu-cells
  --helm PATH         Helm binary. Default: helm
  --include-hooks     Include Helm hooks and tests in the render
  -h, --help          Show this help

The script normalizes CRLF and trailing newlines before diffing so that
whitespace-only file-ending changes do not appear as regressions.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
default_chart="$script_dir/cells"
default_values="$script_dir/values.yaml"
default_manifest="${HOME}/fulu-manifest.yaml"

chart="$default_chart"
values="$default_values"
manifest="$default_manifest"
release="cells"
namespace="fulu-cells"
helm_bin="helm"
include_hooks=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --chart)
      chart="$2"
      shift 2
      ;;
    --values)
      values="$2"
      shift 2
      ;;
    --manifest)
      manifest="$2"
      shift 2
      ;;
    --release)
      release="$2"
      shift 2
      ;;
    --namespace)
      namespace="$2"
      shift 2
      ;;
    --helm)
      helm_bin="$2"
      shift 2
      ;;
    --include-hooks)
      include_hooks=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

expand_path() {
  case "$1" in
    "~") printf '%s\n' "$HOME" ;;
    "~/"*) printf '%s\n' "$HOME/${1#~/}" ;;
    *) printf '%s\n' "$1" ;;
  esac
}

to_abs() {
  case "$1" in
    /*) printf '%s\n' "$1" ;;
    *) printf '%s\n' "$PWD/$1" ;;
  esac
}

chart="$(to_abs "$(expand_path "$chart")")"
values="$(to_abs "$(expand_path "$values")")"
manifest="$(to_abs "$(expand_path "$manifest")")"

if [[ ! -e "$chart" ]]; then
  printf 'Chart not found: %s\n' "$chart" >&2
  exit 1
fi
if [[ ! -f "$values" ]]; then
  printf 'Values file not found: %s\n' "$values" >&2
  exit 1
fi
if [[ ! -f "$manifest" ]]; then
  printf 'Manifest not found: %s\n' "$manifest" >&2
  exit 1
fi

rendered_raw="$(mktemp "${TMPDIR:-/tmp}/cells-rendered.XXXXXX.yaml")"
rendered_norm="$(mktemp "${TMPDIR:-/tmp}/cells-rendered-norm.XXXXXX.yaml")"
manifest_norm="$(mktemp "${TMPDIR:-/tmp}/cells-manifest-norm.XXXXXX.yaml")"
trap 'rm -f "$rendered_raw" "$rendered_norm" "$manifest_norm"' EXIT

helm_args=(template "$release" "$chart" --namespace "$namespace" -f "$values")
if [[ "$include_hooks" -eq 0 ]]; then
  helm_args+=(--no-hooks --skip-tests)
fi

if ! "$helm_bin" "${helm_args[@]}" >"$rendered_raw"; then
  printf 'helm template failed\n\n' >&2
  cat "$rendered_raw" >&2 || true
  exit 1
fi

normalize_file() {
  awk '{ sub(/\r$/, ""); print }' "$1"
}

normalize_file "$rendered_raw" >"$rendered_norm"
normalize_file "$manifest" >"$manifest_norm"

diff_output="$(diff -u -L 'reference manifest' -L 'rendered chart' "$manifest_norm" "$rendered_norm" || true)"

printf 'Helm render comparison\n'
printf '  chart:     %s\n' "$chart"
printf '  values:    %s\n' "$values"
printf '  manifest:  %s\n' "$manifest"
printf '  release:   %s\n' "$release"
printf '  namespace: %s\n' "$namespace"
printf '\n'

if [[ -z "$diff_output" ]]; then
  printf 'No regression: rendered output matches the reference manifest.\n'
  exit 0
fi

adds="$(printf '%s\n' "$diff_output" | awk '
  /^@@/ { next }
  /^\+\+\+/ { next }
  /^---/ { next }
  /^\+/ { adds++ }
  END { print adds + 0 }
')"
dels="$(printf '%s\n' "$diff_output" | awk '
  /^@@/ { next }
  /^\+\+\+/ { next }
  /^---/ { next }
  /^-/ { dels++ }
  END { print dels + 0 }
')"

use_color=0
if [[ -t 1 && -z "${NO_COLOR:-}" && "${TERM:-}" != "dumb" ]]; then
  use_color=1
fi

colorize() {
  local line
  while IFS= read -r line; do
    case "$line" in
      '--- '*|'+++ '*|'@@ '*)
        if [[ "$use_color" -eq 1 ]]; then
          printf '\033[1;36m%s\033[0m\n' "$line"
        else
          printf '%s\n' "$line"
        fi
        ;;
      +*)
        if [[ "$line" == '+++'* ]]; then
          printf '%s\n' "$line"
        elif [[ "$use_color" -eq 1 ]]; then
          printf '\033[32m%s\033[0m\n' "$line"
        else
          printf '%s\n' "$line"
        fi
        ;;
      -*)
        if [[ "$line" == '---'* ]]; then
          printf '%s\n' "$line"
        elif [[ "$use_color" -eq 1 ]]; then
          printf '\033[31m%s\033[0m\n' "$line"
        else
          printf '%s\n' "$line"
        fi
        ;;
      *)
        printf '%s\n' "$line"
        ;;
    esac
  done
}

printf 'Diff\n'
printf '  added lines:   %s\n' "$adds"
printf '  removed lines: %s\n\n' "$dels"

printf '%s\n' "$diff_output" | colorize
exit 1
