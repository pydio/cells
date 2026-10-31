/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

package wopi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/pydio/cells/v5/common/config"
)

const euroOfficeLaunchPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Opening document editor</title>
</head>
<body>
<p id="status">Opening the document editor…</p>
<script>
(() => {
  const officeOrigin = __OFFICE_ORIGIN__;
  const wopiOrigin = __WOPI_ORIGIN__;
  const status = document.getElementById("status");
  try {
    const encoded = location.hash.slice(1).replace(/-/g, "+").replace(/_/g, "/");
    history.replaceState(null, document.title, location.pathname + location.search);
    if (!encoded) throw new Error("The editor launch information is missing.");
    const padded = encoded + "=".repeat((4 - encoded.length % 4) % 4);
    const raw = atob(padded);
    const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));

    const action = new URL(data.actionUrl);
    const source = new URL(data.wopiSrc);
    if (action.origin !== officeOrigin ||
        !/^\/hosting\/wopi\/[a-z0-9_-]+\/(edit|view)$/i.test(action.pathname)) {
      throw new Error("The editor action URL is not trusted.");
    }
    if (source.origin !== wopiOrigin ||
        !/^\/wopi\/files\/[a-z0-9._~-]+$/i.test(source.pathname) ||
        source.search || source.hash) {
      throw new Error("The WOPI source URL is not trusted.");
    }
    const ttl = Number(data.accessTokenTtl);
    if (typeof data.accessToken !== "string" || !data.accessToken ||
        !Number.isSafeInteger(ttl) || ttl <= 0 || ttl > 86400) {
      throw new Error("The editor access token is invalid.");
    }

    action.searchParams.set("wopisrc", source.toString());
    if (data.lang) action.searchParams.set("lang", String(data.lang));
    if (data.ui) action.searchParams.set("ui", String(data.ui));

    const form = document.createElement("form");
    form.method = "post";
    form.action = action.toString();
    form.autocomplete = "off";
    for (const [name, value] of [
      ["access_token", data.accessToken],
      ["access_token_ttl", String(ttl)]
    ]) {
      const field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      field.value = value;
      form.appendChild(field);
    }
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not open the document editor.";
  }
})();
</script>
</body>
</html>`

func configuredOrigin(raw, name string) (string, error) {
	parsed, err := url.Parse(strings.TrimRight(strings.TrimSpace(raw), "/"))
	if err != nil || parsed.Host == "" || (parsed.Scheme != "https" && parsed.Scheme != "http") ||
		parsed.User != nil || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" {
		return "", fmt.Errorf("%s must be an absolute HTTP(S) origin without a path, credentials, query, or fragment", name)
	}
	return parsed.Scheme + "://" + parsed.Host, nil
}

func wopiLaunch(w http.ResponseWriter, r *http.Request) {
	officeURL := strings.TrimSpace(config.Get(r.Context(), "frontend/plugin/editor.eurooffice").Val("EUROOFFICE_PUBLIC_URL").String())
	if officeURL == "" {
		officeURL = strings.TrimSpace(os.Getenv("CELLS_EUROOFFICE_PUBLIC_URL"))
	}
	officeOrigin, err := configuredOrigin(officeURL, "EUROOFFICE_PUBLIC_URL")
	if err != nil {
		http.Error(w, "Euro-Office launch is not configured", http.StatusServiceUnavailable)
		return
	}
	wopiURL := strings.TrimSpace(config.Get(r.Context(), "frontend/plugin/editor.eurooffice").Val("WOPI_HOST_BASE_URL").String())
	if wopiURL == "" {
		wopiURL = strings.TrimSpace(os.Getenv("CELLS_EUROOFFICE_WOPI_HOST_BASE_URL"))
	}
	wopiOrigin, err := configuredOrigin(wopiURL, "WOPI_HOST_BASE_URL")
	if err != nil {
		http.Error(w, "WOPI host URL is not configured", http.StatusServiceUnavailable)
		return
	}

	officeJSON, _ := json.Marshal(officeOrigin)
	wopiJSON, _ := json.Marshal(wopiOrigin)
	page := strings.Replace(euroOfficeLaunchPage, "__OFFICE_ORIGIN__", string(officeJSON), 1)
	page = strings.Replace(page, "__WOPI_ORIGIN__", string(wopiJSON), 1)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; form-action "+officeOrigin+"; base-uri 'none'; object-src 'none'; frame-ancestors 'self'")
	_, _ = w.Write([]byte(page))
}
