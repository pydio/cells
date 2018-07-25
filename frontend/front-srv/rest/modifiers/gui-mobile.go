package modifiers

import (
	"context"
	"strings"

	"github.com/mssola/user_agent"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/frontend"
)

// MobileRegModifier will Enable / Disable gui.mobile depending on User-Agent
func MobileRegModifier(ctx context.Context, status frontend.RequestStatus, plugin frontend.Plugin) error {

	if plugin.GetId() != "gui.mobile" {
		return nil
	}
	mobileAgent := false
	req := status.Request
	if req != nil {
		header := strings.Join(req.Header["User-Agent"], "")
		if header != "" {
			ua := user_agent.New(header)
			mobileAgent = ua.Mobile()
		}
	}
	p := plugin.(*frontend.Cplugin)
	if mobileAgent {
		log.Logger(req.Context()).Info("Enable gui.mobile plugin!")
		p.Attrenabled = "true"
	} else {
		p.Attrenabled = "false"
	}

	return nil

}
