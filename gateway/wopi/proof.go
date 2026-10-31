/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

package wopi

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"encoding/xml"
	"fmt"
	"io"
	"math/big"
	"os"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v5/common/config"
)

const (
	wopiTimestampEpochTicks = uint64(621355968000000000)
	wopiProofMaxAge         = 20 * time.Minute
	wopiProofCacheTTL       = time.Hour
)

type wopiProofKeyXML struct {
	Modulus    string `xml:"modulus,attr"`
	Exponent   string `xml:"exponent,attr"`
	OldModulus string `xml:"oldmodulus,attr"`
	OldExponent string `xml:"oldexponent,attr"`
}

type wopiProofKeys struct {
	current *rsa.PublicKey
	old     *rsa.PublicKey
}

type cachedWOPIProofKeys struct {
	serverURL string
	keys      wopiProofKeys
	expiresAt time.Time
}

var euroOfficeProofKeyCache struct {
	sync.Mutex
	cached cachedWOPIProofKeys
}

func parseWOPIProofPublicKey(modulus, exponent string) (*rsa.PublicKey, error) {
	modulusBytes, err := base64.StdEncoding.DecodeString(modulus)
	if err != nil {
		return nil, fmt.Errorf("decode WOPI RSA modulus: %w", err)
	}
	exponentBytes, err := base64.StdEncoding.DecodeString(exponent)
	if err != nil {
		return nil, fmt.Errorf("decode WOPI RSA exponent: %w", err)
	}
	n := new(big.Int).SetBytes(modulusBytes)
	e := new(big.Int).SetBytes(exponentBytes)
	if n.BitLen() < 2048 || e.Sign() <= 0 || !e.IsInt64() {
		return nil, fmt.Errorf("invalid WOPI RSA public key")
	}
	exponentInt := e.Int64()
	if exponentInt < 3 || exponentInt%2 == 0 || exponentInt > int64(^uint(0)>>1) {
		return nil, fmt.Errorf("invalid WOPI RSA public exponent")
	}
	return &rsa.PublicKey{N: n, E: int(exponentInt)}, nil
}

func parseWOPIProofKeys(discovery io.Reader) (wopiProofKeys, error) {
	decoder := xml.NewDecoder(discovery)
	var keyXML wopiProofKeyXML
	found := false
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return wopiProofKeys{}, fmt.Errorf("parse WOPI discovery XML: %w", err)
		}
		if element, ok := token.(xml.StartElement); ok && element.Name.Local == "proof-key" {
			if err := decoder.DecodeElement(&keyXML, &element); err != nil {
				return wopiProofKeys{}, fmt.Errorf("decode WOPI proof-key element: %w", err)
			}
			found = true
			break
		}
	}
	if !found {
		return wopiProofKeys{}, fmt.Errorf("WOPI discovery has no proof-key element")
	}
	current, err := parseWOPIProofPublicKey(keyXML.Modulus, keyXML.Exponent)
	if err != nil {
		return wopiProofKeys{}, fmt.Errorf("parse current WOPI proof key: %w", err)
	}
	old, err := parseWOPIProofPublicKey(keyXML.OldModulus, keyXML.OldExponent)
	if err != nil {
		return wopiProofKeys{}, fmt.Errorf("parse previous WOPI proof key: %w", err)
	}
	return wopiProofKeys{current: current, old: old}, nil
}

func euroOfficeWOPISetting(ctx context.Context, key, env string) string {
	value := strings.TrimSpace(config.Get(ctx, "frontend/plugin/editor.eurooffice").Val(key).String())
	if value == "" {
		value = strings.TrimSpace(os.Getenv(env))
	}
	return value
}

func euroOfficeInternalURL(ctx context.Context) (string, error) {
	serverURL := strings.TrimRight(euroOfficeWOPISetting(ctx, "EUROOFFICE_INTERNAL_URL", "CELLS_EUROOFFICE_INTERNAL_URL"), "/")
	parsed, err := url.Parse(serverURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "https" && parsed.Scheme != "http") ||
		parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return "", fmt.Errorf("EUROOFFICE_INTERNAL_URL must be an absolute HTTP(S) URL without credentials, query, or fragment")
	}
	return serverURL, nil
}

func loadEuroOfficeWOPIProofKeys(ctx context.Context) (wopiProofKeys, error) {
	serverURL, err := euroOfficeInternalURL(ctx)
	if err != nil {
		return wopiProofKeys{}, err
	}

	euroOfficeProofKeyCache.Lock()
	defer euroOfficeProofKeyCache.Unlock()
	if euroOfficeProofKeyCache.cached.serverURL == serverURL &&
		time.Now().Before(euroOfficeProofKeyCache.cached.expiresAt) {
		return euroOfficeProofKeyCache.cached.keys, nil
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, serverURL+"/hosting/discovery", nil)
	if err != nil {
		return wopiProofKeys{}, err
	}
	response, err := client.Do(request)
	if err != nil {
		return wopiProofKeys{}, fmt.Errorf("fetch Euro-Office WOPI discovery: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return wopiProofKeys{}, fmt.Errorf("Euro-Office WOPI discovery returned HTTP %d", response.StatusCode)
	}

	keys, err := parseWOPIProofKeys(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return wopiProofKeys{}, err
	}
	euroOfficeProofKeyCache.cached = cachedWOPIProofKeys{
		serverURL: serverURL,
		keys:      keys,
		expiresAt: time.Now().Add(wopiProofCacheTTL),
	}
	return keys, nil
}

func wopiProofBuffer(accessToken, requestURL string, timestamp uint64) []byte {
	tokenBytes := []byte(accessToken)
	urlBytes := []byte(strings.ToUpper(requestURL))
	proof := make([]byte, 0, 4+len(tokenBytes)+4+len(urlBytes)+4+8)
	length := make([]byte, 4)

	binary.BigEndian.PutUint32(length, uint32(len(tokenBytes)))
	proof = append(proof, length...)
	proof = append(proof, tokenBytes...)

	binary.BigEndian.PutUint32(length, uint32(len(urlBytes)))
	proof = append(proof, length...)
	proof = append(proof, urlBytes...)

	binary.BigEndian.PutUint32(length, 8)
	proof = append(proof, length...)
	timestampBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(timestampBytes, timestamp)
	proof = append(proof, timestampBytes...)
	return proof
}

func wopiTimestampIsFresh(timestamp uint64, now time.Time) bool {
	nowTicks := uint64(now.UTC().UnixNano()/100) + wopiTimestampEpochTicks
	maxAgeTicks := uint64(wopiProofMaxAge / (100 * time.Nanosecond))
	if timestamp > nowTicks {
		return timestamp-nowTicks <= maxAgeTicks
	}
	return nowTicks-timestamp <= maxAgeTicks
}

func verifyWOPIProofSignature(proof string, key *rsa.PublicKey, expected []byte) bool {
	if proof == "" || key == nil {
		return false
	}
	signature, err := base64.StdEncoding.DecodeString(proof)
	if err != nil {
		return false
	}
	digest := sha256.Sum256(expected)
	return rsa.VerifyPKCS1v15(key, crypto.SHA256, digest[:], signature) == nil
}

func verifyWOPIProof(proof, proofOld string, keys wopiProofKeys, expected []byte) bool {
	// These three combinations are required to tolerate key rotation while
	// discovery caches are being refreshed.
	return verifyWOPIProofSignature(proof, keys.current, expected) ||
		verifyWOPIProofSignature(proofOld, keys.current, expected) ||
		verifyWOPIProofSignature(proof, keys.old, expected)
}

func euroOfficeWOPIRequestURL(ctx context.Context, r *http.Request) (string, error) {
	base := strings.TrimRight(euroOfficeWOPISetting(ctx, "WOPI_HOST_BASE_URL", "CELLS_EUROOFFICE_WOPI_HOST_BASE_URL"), "/")
	parsed, err := url.Parse(base)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "https" && parsed.Scheme != "http") ||
		parsed.User != nil || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" {
		return "", fmt.Errorf("WOPI_HOST_BASE_URL must be an absolute HTTP(S) origin without a path, credentials, query, or fragment")
	}
	requestURI := r.URL.RequestURI()
	if !strings.HasPrefix(requestURI, "/") {
		return "", fmt.Errorf("invalid WOPI request URI")
	}
	return base + "/wopi" + requestURI, nil
}

func validateEuroOfficeWOPIRequest(ctx context.Context, r *http.Request, accessToken string) error {
	timestampText := r.Header.Get("X-WOPI-TimeStamp")
	if timestampText == "" {
		return fmt.Errorf("missing X-WOPI-TimeStamp header")
	}
	timestamp, err := strconv.ParseUint(strings.TrimSpace(timestampText), 10, 64)
	if err != nil {
		return fmt.Errorf("invalid X-WOPI-TimeStamp header: %w", err)
	}
	if !wopiTimestampIsFresh(timestamp, time.Now()) {
		return fmt.Errorf("WOPI proof timestamp is outside the allowed time window")
	}

	requestURL, err := euroOfficeWOPIRequestURL(ctx, r)
	if err != nil {
		return err
	}
	keys, err := loadEuroOfficeWOPIProofKeys(ctx)
	if err != nil {
		return err
	}
	expected := wopiProofBuffer(accessToken, requestURL, timestamp)
	if !verifyWOPIProof(r.Header.Get("X-WOPI-Proof"), r.Header.Get("X-WOPI-ProofOld"), keys, expected) {
		return fmt.Errorf("WOPI proof signature is invalid")
	}
	return nil
}
