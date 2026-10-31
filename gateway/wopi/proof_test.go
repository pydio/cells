package wopi

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"testing"
	"time"
)

func signWOPIProof(t *testing.T, key *rsa.PrivateKey, message []byte) string {
	t.Helper()
	digest := sha256.Sum256(message)
	signature, err := rsa.SignPKCS1v15(rand.Reader, key, crypto.SHA256, digest[:])
	if err != nil {
		t.Fatal(err)
	}
	return base64.StdEncoding.EncodeToString(signature)
}

func TestWOPIProofKeyRotationCombinations(t *testing.T) {
	current, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	old, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	keys := wopiProofKeys{current: &current.PublicKey, old: &old.PublicKey}
	message := []byte("WOPI proof test")
	currentProof := signWOPIProof(t, current, message)
	oldProof := signWOPIProof(t, old, message)

	if !verifyWOPIProof(currentProof, "", keys, message) {
		t.Fatal("current proof signed by current key should be accepted")
	}
	if !verifyWOPIProof("", currentProof, keys, message) {
		t.Fatal("old proof header signed by current key should be accepted during rotation")
	}
	if !verifyWOPIProof(oldProof, "", keys, message) {
		t.Fatal("current proof signed by old key should be accepted during rotation")
	}
	if verifyWOPIProof("", oldProof, keys, message) {
		t.Fatal("old proof signed only by old key must be rejected")
	}
}

func TestWOPITimestampFreshness(t *testing.T) {
	now := time.Date(2026, 10, 31, 12, 0, 0, 0, time.UTC)
	timestamp := uint64(now.UnixNano()/100) + wopiTimestampEpochTicks
	if !wopiTimestampIsFresh(timestamp, now) {
		t.Fatal("current timestamp should be accepted")
	}
	oldTimestamp := timestamp - uint64((21*time.Minute)/(100*time.Nanosecond))
	if wopiTimestampIsFresh(oldTimestamp, now) {
		t.Fatal("timestamp older than 20 minutes should be rejected")
	}
	futureTimestamp := timestamp + uint64((21*time.Minute)/(100*time.Nanosecond))
	if wopiTimestampIsFresh(futureTimestamp, now) {
		t.Fatal("timestamp too far in the future should be rejected")
	}
}
