/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cmd

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/pflag"
	"gocloud.dev/pubsub"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

const (
	EnvDisplayHiddenFlags = "CELLS_DISPLAY_HIDDEN_FLAGS"
)

func addRootFlags(flags *pflag.FlagSet) {
	flags.String(runtime.KeyConfig, "file://"+filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultConfigFileName), "Configuration storage URL. Supported schemes: "+strings.Join(config.DefaultURLMux().Schemes(), "|"))
	flags.String(runtime.KeyVault, "detect", "Vault location, automatically detected from config url, unless an URL is provided (same schemes as config)")
	flags.String(runtime.KeyKeyring, "file://"+filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultKeyringFileName)+"?keyring=true", "Keyring URL")
	if os.Getenv(EnvDisplayHiddenFlags) == "" {
		//_ = RootCmd.PersistentFlags().MarkHidden(runtime.KeyVault)
		_ = RootCmd.PersistentFlags().MarkHidden(runtime.KeyKeyring)
	}

}

// addRegistryFlags registers necessary flags to connect to the registry (defaults to memory)
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {

	flags.String(runtime.KeyRegistry, "mem://?cache=shared", "Registry URL used to manage services. Supported schemes: "+strings.Join(registry.DefaultURLMux().Schemes(), "|"))
	flags.String(runtime.KeyBroker, "mem://", "Pub/sub service URL for events broadcast. Supported schemes: "+strings.Join(pubsub.DefaultURLMux().SubscriptionSchemes(), "|"))
	flags.String(runtime.KeyDiscovery, "mem://", "Combine registry, config and pub/sub discovery service")

	if os.Getenv(EnvDisplayHiddenFlags) == "" {
		if len(hideAll) > 0 && hideAll[0] {
			_ = flags.MarkHidden(runtime.KeyDiscovery)
			_ = flags.MarkHidden(runtime.KeyRegistry)
			_ = flags.MarkHidden(runtime.KeyBroker)
		} else {
			_ = flags.MarkHidden(runtime.KeyDiscovery)
		}
	}
}

// addExternalCmdRegistryFlags registers necessary flags to connect to the registry with defaults :8001
func addExternalCmdRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	discoveryAddress := "grpc://:" + runtime.DefaultDiscoveryPort
	flags.String(runtime.KeyDiscovery, discoveryAddress, "Registry and pub/sub")
	flags.String(runtime.KeyRegistry, discoveryAddress, "Registry used to contact services")
	flags.String(runtime.KeyBroker, discoveryAddress, "Pub/sub service for events between services")

	if len(hideAll) > 0 && hideAll[0] && os.Getenv(EnvDisplayHiddenFlags) == "" {
		_ = flags.MarkHidden(runtime.KeyDiscovery)
		_ = flags.MarkHidden(runtime.KeyRegistry)
		_ = flags.MarkHidden(runtime.KeyBroker)
	}
}

func addSiteOverrideFlags(flags *pflag.FlagSet, hideLegacy ...bool) {
	// Dynamic site override and their legacy version below
	flags.String(runtime.KeySiteBind, "", "[Site] The 'site_' flags suite overrides config-defined sites. Bind is the site binding address (IP|DOMAIN:PORT), see other flags for TLS configurations.")
	flags.String(runtime.KeySiteExternal, "", "[Site] External full URL (http[s]://IP|DOMAIN[:PORT]) exposed to the outside")
	flags.Bool(runtime.KeySiteNoTLS, false, "[Site] Use plain HTTP")
	flags.String(runtime.KeySiteTlsCertFile, "", "[Site] Path to custom TLS certificate file")
	flags.String(runtime.KeySiteTlsKeyFile, "", "[Site] Path to custom TLS key file")
	flags.String(runtime.KeySiteLetsEncryptEmail, "", "[Site] Set email to enable Let's Encrypt automatic TLS configuration")
	flags.Bool(runtime.KeySiteLetsEncryptAgree, false, "[Site] Accept Let's Encrypt EULA")
	flags.Bool(runtime.KeySiteLetsEncryptStaging, false, "[Site] Use Let's Encrypt staging CA instead of production to avoid being banned on misconfiguration.")

	flags.String(runtime.KeySiteBindL, "", "[Site - Legacy] Internal IP|DOMAIN:PORT on which the main proxy will bind. Self-signed SSL will be used by default")
	flags.String(runtime.KeySiteExternalL, "", "[Site - Legacy] External full URL (http[s]://IP|DOMAIN[:PORT]) exposed to the outside")
	flags.Bool(runtime.KeySiteNoTLSL, false, "[Site - Legacy] Configure the main gateway to rather use plain HTTP")
	flags.String(runtime.KeySiteTlsCertFileL, "", "[Site - Legacy] TLS cert file path")
	flags.String(runtime.KeySiteTlsKeyFileL, "", "[Site - Legacy] TLS key file path")
	flags.String(runtime.KeySiteLetsEncryptEmailL, "", "[Site - Legacy] Contact e-mail for Let's Encrypt provided certificate")
	flags.Bool(runtime.KeySiteLetsEncryptAgreeL, false, "[Site - Legacy] Accept Let's Encrypt EULA")
	flags.Bool(runtime.KeySiteLetsEncryptStagingL, false, "[Site - Legacy] Rather use staging CA entry point")
	if len(hideLegacy) > 0 && hideLegacy[0] && os.Getenv(EnvDisplayHiddenFlags) == "" {
		_ = flags.MarkHidden(runtime.KeySiteBindL)
		_ = flags.MarkHidden(runtime.KeySiteExternalL)
		_ = flags.MarkHidden(runtime.KeySiteNoTLSL)
		_ = flags.MarkHidden(runtime.KeySiteTlsCertFileL)
		_ = flags.MarkHidden(runtime.KeySiteTlsKeyFileL)
		_ = flags.MarkHidden(runtime.KeySiteLetsEncryptEmailL)
		_ = flags.MarkHidden(runtime.KeySiteLetsEncryptAgreeL)
		_ = flags.MarkHidden(runtime.KeySiteLetsEncryptStagingL)
	}

}
