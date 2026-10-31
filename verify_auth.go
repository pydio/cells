// verify_auth.go - Simple verification of OAuth connector registration
// This program parses the mock OAuth configuration JSON and lists connectors.
package main

import (
    "encoding/json"
    "fmt"
)

type ConnectorConfig struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Type string `json:"type"`
}

type ServiceConfig struct {
    Connectors []ConnectorConfig `json:"connectors"`
    // other fields omitted for simplicity
}

type OAuthConfig struct {
    Services map[string]ServiceConfig `json:"services"`
}

func main() {
    // Mock configuration JSON (extracted from common/config/mock/mock.go)
    data := `{
        "services": {
            "pydio.web.oauth": {
                "connectors": [
                    {"id": "pydio", "name": "Pydio Cells", "type": "pydio"},
                    {"id": "google", "name": "Google", "type": "google"},
                    {"id": "github", "name": "GitHub", "type": "github"}
                ],
                "cors": {"public": {"allowedOrigins": "*"}},
                "insecureRedirects": ["#insecure_binds...#/auth/callback"],
                "staticClients": [
                    {"client_id": "cells-frontend", "client_name": "CellsFrontend Application", "grant_types": ["authorization_code", "refresh_token"], "post_logout_redirect_uris": ["#default_bind#/auth/logout"], "redirect_uris": ["#default_bind#/auth/callback"], "response_types": ["code", "token", "id_token"], "revokeRefreshTokenAfterInactivity": "2h", "scope": "openid email profile offline"},
                    {"client_id": "cells-sync", "client_name": "CellsSync Application", "grant_types": ["authorization_code", "refresh_token"], "redirect_uris": ["http://localhost:3000/servers/callback", "http://localhost:[3636-3666]/servers/callback"], "response_types": ["code", "token", "id_token"], "scope": "openid email profile offline"},
                    {"client_id": "cells-client", "client_name": "Cells Client CLI Tool", "grant_types": ["authorization_code", "refresh_token"], "redirect_uris": ["http://localhost:3000/servers/callback", "#binds...#/oauth2/oob"], "response_types": ["code", "token", "id_token"], "scope": "openid email profile offline"},
                    {"client_id": "cells-mobile", "client_name": "Mobile Applications", "grant_types": ["authorization_code", "refresh_token"], "redirect_uris": ["cellsauth://callback"], "response_types": ["code", "token", "id_token"], "scope": "openid email profile offline"},
                    {"client_id": "github-oauth", "client_name": "GitHub OAuth", "grant_types": ["authorization_code", "refresh_token"], "redirect_uris": ["http://localhost:3000/servers/callback", "http://localhost:[3636-3666]/servers/callback"], "response_types": ["code", "token", "id_token"], "scope": "openid email profile repo", "revokeRefreshTokenAfterInactivity": "2h"},
                    {"client_id": "google-oauth", "client_name": "Google OAuth", "grant_types": ["authorization_code", "refresh_token"], "redirect_uris": ["#default_bind#/auth/callback"], "response_types": ["code", "token", "id_token"], "scope": "openid email profile https://www.googleapis.com/auth/drive", "revokeRefreshTokenAfterInactivity": "2h"}
                ],
                "secret": "vbM9vRkjJsUtm0C.WryJl_c-eFAYYQCC"
            }
        },
        "version": "4.0.0-dev"
    }`
    var cfg OAuthConfig
    if err := json.Unmarshal([]byte(data), &cfg); err != nil {
        fmt.Println("Failed to parse JSON:", err)
        return
    }
    // Extract connectors from the pydio.web.oauth service
    var connectors []ConnectorConfig
    for _, svc := range cfg.Services {
        connectors = svc.Connectors
        break
    }
    fmt.Printf("Found %d connectors:\n", len(connectors))
    for _, c := range connectors {
        fmt.Printf("  ID: %s, Name: %s, Type: %s\n", c.ID, c.Name, c.Type)
    }
}
