//go:build storage || sql

package sql

import (
	"context"
	"testing"

	"github.com/ory/hydra/v2/aead"
	"github.com/ory/hydra/v2/jwk"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"

	. "github.com/smartystreets/goconvey/convey"
)

// secrets provides a fixed global secret to the key cipher.
type secrets struct{}

func (secrets) GetGlobalSecret(context.Context) ([]byte, error) {
	return []byte("0123456789abcdef0123456789abcdef"), nil
}

func (secrets) GetRotatedGlobalSecrets(context.Context) ([][]byte, error) { return nil, nil }

// cipherRegistry is the part of jwk.Registry that jwkDriver uses.
type cipherRegistry struct{ jwk.Registry }

func (cipherRegistry) KeyCipher() *aead.AESGCM { return aead.NewAESGCM(secrets{}) }

// testJWK gives the storage test runner a Migrate for the jwk table.
type testJWK struct{ *jwkDriver }

func (t *testJWK) Migrate(context.Context) error { return t.AutoMigrate() }

func newTestJWKDriver(_ context.Context, db *gorm.DB) *testJWK {
	return &testJWK{&jwkDriver{Abstract: sql.NewAbstract(db), r: cipherRegistry{}}}
}

// The JWKS endpoint generates hydra.jwt.access-token when it is missing,
// next to the existing hydra.openid.id-token set: both inserts must work.
func TestJWKSeveralKeySets(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(newTestJWKDriver), t, func(ctx context.Context) {
		Convey("Two key sets can be persisted and read back", t, func() {
			j, err := manager.Resolve[*testJWK](ctx)
			So(err, ShouldBeNil)

			_, err = j.GenerateAndPersistKeySet(ctx, "hydra.openid.id-token", "id-kid", "RS256", "sig")
			So(err, ShouldBeNil)
			_, err = j.GenerateAndPersistKeySet(ctx, "hydra.jwt.access-token", "at-kid", "RS256", "sig")
			So(err, ShouldBeNil)

			idSet, err := j.GetKeySet(ctx, "hydra.openid.id-token")
			So(err, ShouldBeNil)
			So(idSet.Key("id-kid"), ShouldNotBeEmpty)
			atSet, err := j.GetKeySet(ctx, "hydra.jwt.access-token")
			So(err, ShouldBeNil)
			So(atSet.Key("at-kid"), ShouldNotBeEmpty)
		})
	})
}
