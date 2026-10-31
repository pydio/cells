/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

package wopi

import (
	"encoding/json"
	"net/http"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	commonauth "github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/gateway/restv2"
)

func euroOfficeEditorURL(w http.ResponseWriter, r *http.Request) {
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		http.Error(w, "Bearer authentication is required", http.StatusUnauthorized)
		return
	}

	ctx, claims, err := commonauth.DefaultJWTVerifier().Verify(r.Context(), parts[1])
	if err != nil || claims.Name == "" || claims.Subject == "" {
		http.Error(w, "Invalid Cells access token", http.StatusUnauthorized)
		return
	}
	if _, ok := claim.FromContext(ctx); !ok {
		http.Error(w, "Invalid Cells token claims", http.StatusUnauthorized)
		return
	}

	authenticatedRequest := r.WithContext(ctx)
	node, err := findNodeFromRequest(authenticatedRequest)
	if err != nil {
		http.Error(w, "Document not found or not accessible", http.StatusNotFound)
		return
	}

	provider, enabled := restv2.GetEuroOfficeProvider(ctx, restful.NewRequest(authenticatedRequest))
	if !enabled || provider == nil {
		http.Error(w, "Euro-Office integration is not configured or available", http.StatusServiceUnavailable)
		return
	}
	presigned, err := provider.Get(ctx, node)
	if err != nil {
		log.Logger(ctx).Error("cannot create Euro-Office editor URL", zap.Error(err))
		http.Error(w, "Cannot open document in Euro-Office", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"url":       presigned.Url,
		"expiresAt": presigned.ExpiresAt,
	}); err != nil {
		log.Logger(ctx).Error("cannot write Euro-Office editor URL", zap.Error(err))
	}
}
