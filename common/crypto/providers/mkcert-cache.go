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

package providers

import (
	"crypto/md5"
	"encoding/hex"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/utils/net"
)

var cache *MkCertCache

func init() {
	cache = &MkCertCache{
		data: make(map[string]*pair),
		lock: &sync.Mutex{},
	}
}

type pair struct {
	cert string
	key  string
}

type MkCertCache struct {
	lock *sync.Mutex
	data map[string]*pair
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

func (m *MkCertCache) LoadCertificates(config *install.ProxyConfig) (certFile string, keyFile string, err error) {
	hosts := m.loadHosts(config)
	uuid := cache.Uuid(hosts)
	cache.lock.Lock()
	defer cache.lock.Unlock()
	if p, o := cache.data[uuid]; o {
		return p.cert, p.key, nil
	} else {
		certFile, keyFile, err = cache.findOrGenerate(uuid, hosts)
		if err == nil {
			cache.data[uuid] = &pair{cert: certFile, key: keyFile}
		}
		return
	}
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

func (m *MkCertCache) findOrGenerate(uuid string, hns []string) (certFile, keyFile string, err error) {
	storageLocation := filepath.Join(config.ApplicationWorkingDir(), "certs")
	os.MkdirAll(storageLocation, 0700)
	mk := NewMkCert(storageLocation)
	cn := filepath.Join(storageLocation, uuid+".pem")
	kn := filepath.Join(storageLocation, uuid+"-key.pem")
	_, e1 := os.Stat(cn)
	_, e2 := os.Stat(kn)
	if e1 == nil && e2 == nil {
		certFile = cn
		keyFile = kn
		return
	}

	err = mk.MakeCert(hns, uuid)
	if err != nil {
		return
	}
	certFile, keyFile, _, _ = mk.GeneratedResources()

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
