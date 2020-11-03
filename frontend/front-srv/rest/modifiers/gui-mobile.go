package modifiers

import (
	"context"
	"strings"

	"github.com/mssola/user_agent"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service/frontend"
)

// MobileRegModifier enables or disable gui.mobile depending on User-Agent request Header.
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

	fullDisable := config.Get("frontend", "plugin", "gui.mobile", "GUI_MOBILE_DISABLE").Bool()
	if mobileAgent && !fullDisable {
		p.Attrenabled = "true"
	} else {
		p.Attrenabled = "false"
	}

	return nil

}
