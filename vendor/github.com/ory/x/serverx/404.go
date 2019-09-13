package serverx

import (
	"mime"
	"net/http"
	"strings"

	"github.com/ory/x/stringslice"
	"github.com/ory/x/stringsx"
)

func matchesContentTypes(r *http.Request, mimetypes []string) bool {
	contentType := stringsx.Coalesce(r.Header.Get("Content-type"), "application/octet-stream")

	for _, v := range strings.Split(contentType, ",") {
		t, _, err := mime.ParseMediaType(v)
		if err != nil {
			break
		}
		if stringslice.Has(mimetypes, t) {
			return true
		}
	}
	return false
}

// DefaultNotFoundHandler is a default handler for handling 404 errors.
var DefaultNotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)

	if matchesContentTypes(r, []string{
		"text/html",
		"application/xhtml+xml",
		"application/xml",
	}) {
		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write([]byte(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>404 - Route not found</title>
    <style>*{transition:all .6s}html{height:100%}body{font-family:sans-serif;color:#888;margin:0}#main{display:table;width:100%;height:100vh;text-align:center}.fof{display:table-cell;vertical-align:middle}.fof h1{font-size:50px;display:inline-block;padding-right:12px;margin-bottom:12px;animation:type .5s alternate infinite}@keyframes type{from{box-shadow:inset -3px 0 0 #888}to{box-shadow:inset -3px 0 0 transparent}}</style>
</head>
<body translate="no">
<div id="main">
    <div class="fof">
        <h1>Error 404</h1>
        <p>The requested route does not exist. Make sure you are using the right path, domain, and port.</p>
    </div>
</div>
</body>
</html>`)) // #nosec
		return
	} else if matchesContentTypes(r, []string{
		"text/plain",
	}) {
		w.Header().Set("Content-Type", "text/plain")
		_, _ = w.Write([]byte(`Error 404 - The requested route does not exist. Make sure you are using the right path, domain, and port.`)) // #nosec
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"error": "Error 404 - The requested route does not exist. Make sure you are using the right path, domain, and port."}`)) // #nosec
})
