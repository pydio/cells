package sql

import (
	"database/sql"
	"fmt"
)

func (c *conn) migrate() (int, error) {
	_, err := c.Exec(`
		create table if not exists dex_migrations (
			num integer not null,
			at timestamptz not null
		);
	`)
	if err != nil {
		return 0, fmt.Errorf("creating dex_migration table: %v", err)
	}

	i := 0
	done := false
	for {
		err := c.ExecTx(func(tx *trans) error {
			// Within a transaction, perform a single migration.
			var (
				num sql.NullInt64
				n   int
			)
			if err := tx.QueryRow(`select max(num) from dex_migrations;`).Scan(&num); err != nil {
				return fmt.Errorf("select max migration: %v", err)
			}
			if num.Valid {
				n = int(num.Int64)
			}
			if n >= len(migrations) {
				done = true
				return nil
			}

			migrationNum := n + 1
			m := migrations[n]

			if _, err := tx.Exec(m.stmt); err != nil {
				return fmt.Errorf("migration %d failed: %v", migrationNum, err)
			}

			q := `insert into dex_migrations (num, at) values ($1, now());`
			if _, err := tx.Exec(q, migrationNum); err != nil {
				return fmt.Errorf("update dex_migration table: %v", err)
			}
			return nil
		})
		if err != nil {
			return i, err
		}
		if done {
			break
		}
		i++
	}

	return i, nil
}

type migration struct {
	stmt string
	// TODO(ericchiang): consider adding additional fields like "forDrivers"
}

// All SQL flavors share migration strategies.
var migrations = []migration{
	{
		stmt: `
			create table dex_client (
				id text not null primary key,
				secret text not null,
				redirect_uris bytea not null,
				trusted_peers bytea not null,
				public boolean not null,
				name text not null,
				logo_url text not null
			);

			create table dex_auth_request (
				id text not null primary key,
				client_id text not null,
				response_types bytea not null,
				scopes bytea not null,
				redirect_uri text not null,
				nonce text not null,
				state text not null,
				force_approval_prompt boolean not null,

				logged_in boolean not null,

				claims_user_id text not null,
				claims_username text not null,
				claims_email text not null,
				claims_email_verified boolean not null,
				claims_groups bytea not null,
				claims_pydio bytea,					-- JSON object

				connector_id text not null,
				connector_data bytea,

				expiry timestamptz not null
			);

			create table dex_auth_code (
				id text not null primary key,
				client_id text not null,
				scopes bytea not null,
				nonce text not null,
				redirect_uri text not null,

				claims_user_id text not null,
				claims_username text not null,
				claims_email text not null,
				claims_email_verified boolean not null,
				claims_groups bytea not null,
				claims_pydio bytea,					-- JSON object

				connector_id text not null,
				connector_data bytea,

				expiry timestamptz not null
			);

			create table dex_refresh_token (
				id text not null primary key,
				client_id text not null,
				scopes bytea not null,
				nonce text not null,

				claims_user_id text not null,
				claims_username text not null,
				claims_email text not null,
				claims_email_verified boolean not null,
				claims_groups bytea not null,
				claims_pydio bytea,					-- JSON object

				connector_id text not null,
				connector_data bytea
			);

			create table dex_password (
				email text not null primary key,
				hash bytea not null,
				username text not null,
				user_id text not null
			);

			create table dex_keys (
				id text not null primary key,
				verification_keys bytea not null, -- JSON array
				signing_key bytea not null,       -- JSON object
				signing_key_pub bytea not null,   -- JSON object
				next_rotation timestamptz not null
			);

		`,
	},
	{
		stmt: `
			alter table dex_refresh_token
				add column token text not null default '';
			alter table dex_refresh_token
				add column created_at timestamptz not null default '0001-01-01 00:00:00 UTC';
			alter table dex_refresh_token
				add column last_used timestamptz not null default '0001-01-01 00:00:00 UTC';
		`,
	},
	{
		stmt: `
			create table dex_offline_session (
				user_id text not null,
				conn_id text not null,
				refresh bytea not null,
				PRIMARY KEY (user_id(255), conn_id(255))
			);
		`,
	},
	{
		stmt: `
			create table dex_connector (
				id text not null primary key,
				type text not null,
				name text not null,
				resource_version text not null,
				config bytea
			);
		`,
	},
}
