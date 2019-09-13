package tracing

import (
	"context"

	opentracing "github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/ext"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

const (
	// BCryptHashOpName is the operation name for bcrypt hashing operations.
	BCryptHashOpName = "bcrypt.hash"

	// BCryptCompareOpName is the operation name for bcrypt comparation operations.
	BCryptCompareOpName = "bcrypt.compare"

	// BCryptWorkFactorTagName is the operation name for bcrypt workfactor settings.
	BCryptWorkFactorTagName = "bcrypt.workfactor"
)

// TracedBCrypt implements the Hasher interface.
type TracedBCrypt struct {
	WorkFactor int
}

// Hash returns the hashed string or an error.
func (b *TracedBCrypt) Hash(ctx context.Context, data []byte) ([]byte, error) {
	span, _ := opentracing.StartSpanFromContext(ctx, BCryptHashOpName)
	defer span.Finish()
	span.SetTag(BCryptWorkFactorTagName, b.WorkFactor)

	s, err := bcrypt.GenerateFromPassword(data, b.WorkFactor)
	if err != nil {
		ext.Error.Set(span, true)
		return nil, errors.WithStack(err)
	}
	return s, nil
}

// Compare returns nil if hash and data match.
func (b *TracedBCrypt) Compare(ctx context.Context, hash, data []byte) error {
	span, _ := opentracing.StartSpanFromContext(ctx, BCryptCompareOpName)
	defer span.Finish()
	span.SetTag(BCryptWorkFactorTagName, b.WorkFactor)

	if err := bcrypt.CompareHashAndPassword(hash, data); err != nil {
		ext.Error.Set(span, true)
		return errors.WithStack(err)
	}
	return nil
}
