package rest

import (
	"net/url"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
)

const coreAuthConfigPath = "frontend/plugin/core.auth"

func init() {
	config.RegisterProxy(coreAuthConfigPath, config.ProxySetter(func(s config.Store, val interface{}, pa ...string) error {
		if err := validateCoreAuthConfig(val); err != nil {
			return err
		}
		return s.Val(pa...).Set(val)
	}))
}

func validateCoreAuthConfig(value interface{}) error {
	parsed, ok := value.(map[string]interface{})
	if !ok {
		return nil
	}

	linkValue, ok := parsed["FORGOT_PASSWORD_EXTERNAL_LINK"]
	if !ok {
		return nil
	}

	link, ok := linkValue.(string)
	if !ok {
		return errors.WithMessage(errors.InvalidParameters, "FORGOT_PASSWORD_EXTERNAL_LINK must be a string")
	}
	if link == "" {
		return nil
	}

	parsedURL, err := url.ParseRequestURI(link)
	if err != nil {
		return errors.WithMessage(errors.InvalidParameters, "FORGOT_PASSWORD_EXTERNAL_LINK must be a valid http(s) URL")
	}
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return errors.WithMessage(errors.InvalidParameters, "FORGOT_PASSWORD_EXTERNAL_LINK only supports http and https URLs")
	}
	if parsedURL.Host == "" {
		return errors.WithMessage(errors.InvalidParameters, "FORGOT_PASSWORD_EXTERNAL_LINK must include a host")
	}

	return nil
}
