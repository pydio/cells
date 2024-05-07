package oauth

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/go-jose/go-jose/v3"
	"github.com/ory/hydra/v2/oauth2/trust"
	"github.com/ory/x/sqlcon"
	"github.com/ory/x/stringsx"
	"gorm.io/gorm"
)

var _ trust.GrantManager = new(trustDriver)

type trustDriver struct {
	db *gorm.DB

	r Registry
}

func (t trustDriver) CreateGrant(ctx context.Context, g trust.Grant, publicKey jose.JSONWebKey) error {
	return t.db.Transaction(func(tx *gorm.DB) error {
		if _, err := t.r.KeyManager().GetKey(ctx, g.PublicKey.Set, g.PublicKey.KeyID); err != nil {
			if !errors.Is(err, sqlcon.ErrNoRows) {
				return sqlcon.HandleError(err)
			}

			if err = t.r.KeyManager().AddKey(ctx, g.PublicKey.Set, &publicKey); err != nil {
				return sqlcon.HandleError(err)
			}
		}

		data := t.sqlDataFromJWTGrant(g)

		t.db.Create(&data)
		return nil
	})
}

func (t trustDriver) GetConcreteGrant(ctx context.Context, id string) (trust.Grant, error) {
	data := &trust.SQLData{
		ID: id,
	}

	tx := t.db.First(&data)
	if tx.Error != nil {
		return trust.Grant{}, tx.Error
	}

	return t.jwtGrantFromSQlData(*data), nil
}

func (t trustDriver) DeleteGrant(ctx context.Context, id string) error {
	data := &trust.SQLData{
		ID: id,
	}

	tx := t.db.Delete(&data)
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (t trustDriver) GetGrants(ctx context.Context, limit, offset int, optionalIssuer string) ([]trust.Grant, error) {
	var grantsData []*trust.SQLData
	tx := t.db.Offset(offset).Limit(limit).Find(&grantsData)
	if tx.Error != nil {
		return []trust.Grant{}, tx.Error
	}

	grants := make([]trust.Grant, len(grantsData))
	for _, grantData := range grantsData {
		grants = append(grants, t.jwtGrantFromSQlData(*grantData))
	}

	return grants, nil
}

func (t trustDriver) CountGrants(ctx context.Context) (int, error) {
	var count int64
	tx := t.db.Model(&trust.SQLData{}).Count(&count)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return int(count), nil
}

func (t trustDriver) FlushInactiveGrants(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {

	deleteUntil := time.Now().UTC()
	if deleteUntil.After(notAfter) {
		deleteUntil = notAfter
	}
	tx := t.db.Where("expires_at < ?").Delete(&trust.SQLData{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (t trustDriver) GetPublicKey(ctx context.Context, issuer string, subject string, keyId string) (*jose.JSONWebKey, error) {
	var data trust.SQLData

	tx := t.db.
		Where("issuer = ?", issuer).
		Where("(subject = ? OR allow_any_subject IS TRUE)", subject).
		Where("key_id = ?", keyId).
		First(&data)
	if tx.Error != nil {
		return nil, tx.Error
	}

	keySet, err := t.r.KeyManager().GetKey(ctx, data.KeySet, keyId)
	if err != nil {
		return nil, err
	}

	return &keySet.Keys[0], nil
}

func (t trustDriver) GetPublicKeys(ctx context.Context, issuer string, subject string) (*jose.JSONWebKeySet, error) {
	var grantsData []trust.SQLData

	tx := t.db.
		Where("issuer = ?", issuer).
		Where("(subject = ? OR allow_any_subject IS TRUE)", subject).
		First(&grantsData)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if len(grantsData) == 0 {
		return &jose.JSONWebKeySet{}, nil
	}

	// because keys must be grouped by issuer, we can retrieve set name from first grant
	keySet, err := t.r.KeyManager().GetKeySet(ctx, grantsData[0].KeySet)
	if err != nil {
		return nil, err
	}

	// find keys, that belong to grants
	filteredKeySet := &jose.JSONWebKeySet{}
	for _, data := range grantsData {
		if keys := keySet.Key(data.KeyID); len(keys) > 0 {
			filteredKeySet.Keys = append(filteredKeySet.Keys, keys...)
		}
	}

	return filteredKeySet, nil
}

func (t trustDriver) GetPublicKeyScopes(ctx context.Context, issuer string, subject string, keyId string) ([]string, error) {
	var data trust.SQLData

	tx := t.db.
		Where("issuer = ?", issuer).
		Where("(subject = ? OR allow_any_subject IS TRUE)", subject).
		Where("key_id = ?", keyId).
		First(&data)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return t.jwtGrantFromSQlData(data).Scope, nil
}

func (t trustDriver) IsJWTUsed(ctx context.Context, jti string) (bool, error) {
	err := t.r.OAuth2Storage().ClientAssertionJWTValid(ctx, jti)
	if err != nil {
		return true, nil
	}

	return false, nil
}

func (t trustDriver) MarkJWTUsedForTime(ctx context.Context, jti string, exp time.Time) error {
	return t.r.OAuth2Storage().SetClientAssertionJWT(ctx, jti, exp)
}

func (t trustDriver) sqlDataFromJWTGrant(g trust.Grant) trust.SQLData {
	return trust.SQLData{
		ID:              g.ID,
		Issuer:          g.Issuer,
		Subject:         g.Subject,
		AllowAnySubject: g.AllowAnySubject,
		Scope:           strings.Join(g.Scope, "|"),
		KeySet:          g.PublicKey.Set,
		KeyID:           g.PublicKey.KeyID,
		CreatedAt:       g.CreatedAt,
		ExpiresAt:       g.ExpiresAt,
	}
}

func (t trustDriver) jwtGrantFromSQlData(data trust.SQLData) trust.Grant {
	return trust.Grant{
		ID:              data.ID,
		Issuer:          data.Issuer,
		Subject:         data.Subject,
		AllowAnySubject: data.AllowAnySubject,
		Scope:           stringsx.Splitx(data.Scope, "|"),
		PublicKey: trust.PublicKey{
			Set:   data.KeySet,
			KeyID: data.KeyID,
		},
		CreatedAt: data.CreatedAt,
		ExpiresAt: data.ExpiresAt,
	}
}
