package sqlcon

import (
	"fmt"
	"net/url"
	"time"

	"github.com/ory/x/viperx"

	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// SchemaCreator is an interface that allows SQL schemas to be created and migrated.
type SchemaCreator interface {
	// CreateSchemas migrates or creates one or more SQL schemas.
	CreateSchemas(db *sqlx.DB) (int, error)
}

// MigratorSQLCmd returns a *cobra.Command executing SQL schema migrations.
func MigratorSQLCmd(path, name string, logger logrus.FieldLogger, runners map[string]SchemaCreator) *cobra.Command {
	c := &cobra.Command{
		Use:   name + " <database-url>",
		Short: "Creates database schemas and applies SQL migration plans",
		Long: `This command creates SQL schemas and applies migration plans. Running this command will upgrade the database
to the latest schema available in the binary.

It is recommended to run this command close to the SQL instance (e.g. same subnet) instead of over the public internet.
This decreases risk of failure and decreases time required.

We strongly advise to create a back up before running this command against an existing database. The migration command
may lock MySQL databases, depending on table sizes. This is not the case for PostgreSQL and CockroachDB databases.

Examples:

	$ ` + path + ` postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable

	$ export DSN=postgres://hydra:secret@postgresd:5432/hydra?sslmode=disable
	$ ` + path + ` -e
`,
		Run: func(cmd *cobra.Command, args []string) {
			var db string

			if a, b := cmd.Flags().GetBool("read-from-env"); a && b == nil {
				db = viperx.GetString(logger, "DSN", "", "DATABASE_URL")
			} else {
				if len(args) == 0 {
					fmt.Print(cmd.UsageString())
					logger.Fatalf("Argument 1 is missing")
				}
				db = args[0]
			}

			dbu, err := url.Parse(db)
			if err != nil {
				logger.WithError(err).WithField("dsn", db).Fatal(`Unable to parse configuration item "dsn", make sure it has the right format`)
			}

			if dbu.Scheme != "postgres" && dbu.Scheme != "mysql" && dbu.Scheme != "cockroach" {
				logger.WithField("dsn", dbu.Scheme+"://*:*@"+dbu.Host+dbu.Path+"?"+dbu.RawQuery).Fatal("Migrations can only be run against PostgreSQL, MySQL or CockroachDB databases")
			}

			sdb, err := NewSQLConnection(db, logger)
			if err != nil {
				logger.WithError(err).WithField("dsn", dbu.Scheme+"://*:*@"+dbu.Host+dbu.Path+"?"+dbu.RawQuery).Fatal("Unable to initialize database configuration")
			}

			dbx, err := sdb.GetDatabaseRetry(time.Second, time.Minute*5)
			if err != nil {
				logger.WithError(err).WithField("dsn", dbu.Scheme+"://*:*@"+dbu.Host+dbu.Path+"?"+dbu.RawQuery).Fatal("Unable to connect to the SQL database")
			}

			for name, runner := range runners {
				logger.Infof("Applying %s SQL migrations...", name)
				if c, err := runner.CreateSchemas(dbx); err != nil {
					logger.WithError(err).WithField("applied_migrations", c).WithField("migration", "name").Fatal("An error occurred while trying to apply SQL migrations")
				} else {
					logger.WithField("applied_migrations", c).WithField("migration", "name").Print("Successfully applied SQL migrations")
				}
				logger.Infof("Done applying %s SQL migrations", name)
			}
		},
	}
	c.Flags().BoolP("read-from-env", "e", false, `Read Data Source Name from configuration element "dsn"`)
	return c
}
