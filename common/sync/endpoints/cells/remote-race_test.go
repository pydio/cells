package cells

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
)

// Several remotes connect at once (task endpoints and browsing share the discovery and certificate
// caches), while their tokens are refreshed: run with -race.
func TestRemotesConnectConcurrently(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/a/config/discovery" {
			_, _ = w.Write([]byte(`{"Endpoints":{"grpc":"8081"}}`))
			return
		}
		http.NotFound(w, r)
	}))
	defer srv.Close()

	var remotes []*Remote
	for i := 0; i < 8; i++ {
		remotes = append(remotes, NewRemote(RemoteConfig{Url: srv.URL, IdToken: "token", ExpiresAt: 1 << 40}, "ws", Options{}))
	}
	var wg sync.WaitGroup
	for _, r := range remotes {
		f := r.Factory.(*remoteClientFactory)
		for j := 0; j < 4; j++ {
			wg.Add(3)
			go func() {
				defer wg.Done()
				if _, _, err := f.getClient(context.Background()); err != nil {
					t.Error(err)
				}
			}()
			go func() {
				defer wg.Done()
				if _, err := f.bearerContext(context.Background()); err != nil {
					t.Error(err)
				}
			}()
			go func() {
				defer wg.Done()
				r.RefreshRemoteConfig(RemoteConfig{IdToken: "token2", RefreshToken: "refresh", ExpiresAt: 1 << 40})
			}()
		}
	}
	wg.Wait()

	// One connection per remote
	for _, r := range remotes {
		f := r.Factory.(*remoteClientFactory)
		_, c1, _ := f.getClient(context.Background())
		_, c2, _ := f.getClient(context.Background())
		if c1 != c2 {
			t.Fatal("a remote opened two connections")
		}
	}
}
