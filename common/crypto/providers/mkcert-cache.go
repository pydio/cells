/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package providers

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/caddyserver/certmagic"
	"github.com/pydio/caddyvault"

	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/net"
)

var (
	cache           *MkCertCache
	defaultLocation string
)

func init() {
	cache = &MkCertCache{
		data: make(map[string]*pair),
	}
}

type pair struct {
	cert string
	key  string
}

type MkCertCache struct {
	sync.Mutex
	data    map[string]*pair
	storage certmagic.Storage
}

func GetMkCertCache() *MkCertCache {
	return cache
}

func (m *MkCertCache) Uuid(hosts []string) string {
	sort.Strings(hosts)
	hh := strings.Join(hosts, "##")
	hash := md5.New()
	hash.Write([]byte(hh))
	return hex.EncodeToString(hash.Sum(nil))
}

func (m *MkCertCache) LoadCertificates(config *install.ProxyConfig, storageURL string) (certFile string, keyFile string, err error) {
	hosts := m.loadHosts(config)
	uuid := cache.Uuid(hosts)
	cache.Lock()
	defer cache.Unlock()
	if p, o := cache.data[uuid]; o {
		return p.cert, p.key, nil
	} else {
		certFile, keyFile, err = cache.findOrGenerate(uuid, hosts, storageURL)
		if err == nil {
			cache.data[uuid] = &pair{cert: certFile, key: keyFile}
		}
		return
	}
}

func (m *MkCertCache) runtimeStorage(storageURL string, storageDir string) certmagic.Storage {
	u, e := url.Parse(storageURL)
	if storageURL == "" || e != nil || u.Scheme != "vault" {
		return &certmagic.FileStorage{Path: storageDir}
	}
	if os.Getenv("VAULT_TOKEN") == "" {
		printf("Trying to switch to vault store but VAULT_TOKEN is not set! Fallback to local storage")
		return &certmagic.FileStorage{Path: storageDir}
	}
	u.Path = ""
	u.Scheme = "http"
	printf("Switching to remote cert store:%s", u.String())
	return &caddyvault.VaultStorage{API: u.String()}
}

func (m *MkCertCache) loadHosts(site *install.ProxyConfig) []string {
	hns := site.GetSelfSigned().GetHostnames()
	if len(hns) == 0 {
		bindAll := false
		// get hosts from default
		for _, bind := range site.Binds {
			u, err := url.Parse("https://" + bind)
			if err != nil {
				continue
			}
			bindHost := u.Hostname()
			if bindHost == "0.0.0.0" || bindHost == "" {
				bindAll = true
			} else {
				hns = append(hns, bindHost)
			}
		}
		if bindAll {
			// Special case for 0.0.0.0 => use all interfaces and external
			ii, _ := net.GetAvailableIPs()
			for _, i := range ii {
				hns = append(hns, i.String())
			}
			if other, e := net.HostsFileLookup(); e == nil && len(other) > 0 {
				hns = append(hns, other...)
			}
		}
	}
	return hns
}

func (m *MkCertCache) findOrGenerate(uuid string, hns []string, storageURL string) (certFile, keyFile string, err error) {
	var localLocation string
	if defaultLocation != "" {
		localLocation = defaultLocation
	} else {
		localLocation = runtime.CertsStoreLocalLocation()
	}
	// Look in on-file cache
	certFile = filepath.Join(localLocation, uuid+".pem")
	keyFile = filepath.Join(localLocation, uuid+"-key.pem")
	_, e1 := os.Stat(certFile)
	_, e2 := os.Stat(keyFile)
	if e1 == nil && e2 == nil {
		return
	}

	// Generate new ones using storageURL provider
	s, e := storage.OpenStore(context.Background(), storageURL)
	if e != nil {
		return "", "", e
	}
	mk := NewMkCert(s)
	err = mk.MakeCert(hns, uuid)
	if err != nil {
		return
	}
	cert, key, e := mk.ReadCert()
	// Copy Cert/Key Bytes to local file
	if err != nil {
		return "", "", e
	}
	// For remote storage, copy data locally
	if _, ok := mk.storage.(*certmagic.FileStorage); !ok {
		if err = os.MkdirAll(localLocation, 0755); err != nil {
			return
		}
		if err = os.WriteFile(certFile, cert, 0644); err != nil {
			return
		}
		if err = os.WriteFile(keyFile, key, 0400); err != nil {
			return
		}
	}

	printf("")
	printf("")
	printf("👉 If you are behind a reverse proxy, you can either install the RootCA on the proxy machine " +
		"trust store, or configure your proxy to `insecure_skip_verify` for pointing to Cells.")
	printf("👉 If you are developing locally, you may install the RootCA in your system trust store to " +
		"see a green light in your browser!")
	printf("🗒  To easily install the RootCA in your trust store, use https://github.com/FiloSottile/mkcert. " +
		"Set the $CAROOT environment variable to the rootCA folder then use 'mkcert -install'")
	printf("")

	return
}
