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

package cmd

import (
	"context"
	"fmt"
	"log"
	"strings"
	"text/template"
	"time"

	"github.com/manifoldco/promptui"
	progressbar "github.com/schollz/progressbar/v3"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/discovery/install/lib"
)

var (
	dbMoveDryRun  bool
	dbMoveFromURL string
	dbMoveToURL   string

	moveYAML = `
caches:
  short:
    uri: pm://
  shared:
    uri: pm://
storages:
  {{- range $idx, $dsn := . }}
  storage{{ $idx }}: 
    uri: {{ $dsn }}
  {{- end }}
services:
  {{- range $idx, $dsn := . }}
  {{$idx}}:
    storages:
      main:
        - type: storage{{ $idx }}
  {{- end }}
`

	tmpl *template.Template
)

type flatOptions struct {
	service.StorageOptions
	storageKey     string
	serviceName    string
	serviceOptions *service.ServiceOptions
}

/*
func configDbMoveOne(cmd *cobra.Command, dry, promptConfig bool, migOption *flatOptions, from, to *configDatabase) error {
	cmd.Printf("Migrate service %s from %s to %s\n", migOption.serviceName, from.driver, to.driver)
	prefix := migOption.Prefix(migOption.serviceOptions)
	fromDao, e := initDAO(cmd.Context(), from.driver, from.dsn, prefix, migOption.StorageKey)
	if e != nil {
		return e
	}
	toDao, e := initDAO(cmd.Context(), to.driver, to.dsn, prefix, migOption.StorageKey)
	if e != nil {
		return e
	}

	if dry {
		cmd.Println("Running migration in dry-run mode - Nothing will be modified")
	} else {
		cmd.Println("Running migration in real mode - Data will be copied to target")
	}
	sChan := make(chan dao.MigratorStatus, 1000)
	var bar *progressbar.ProgressBar
	go func() {
		for status := range sChan {
			if status.Total > 0 {
				if bar == nil {
					bar = progressbar.Default(status.Total)
				}
				_ = bar.Set64(status.Count)
			}
		}
	}()
	if result, e := migOption.Migrator(fromDao, toDao, dry, sChan); e != nil {
		return e
	} else {
		for name, count := range result {
			cmd.Printf("Copied %d %s\n", count, name)
		}
	}
	close(sChan)

	if to.id != "" && !dry && promptConfig {
		assignNow := promptui.Prompt{Label: "Do you want to assign now the new storage to the service?", IsConfirm: true}
		if _, e := assignNow.Run(); e == nil {
			cp := []string{"services", migOption.serviceName, migOption.StorageKey}
			cmd.Println("Setting configuration ", strings.Join(cp, "/"), "to", to.id)
			return config.Set(to.id, cp...)
		}
	}
	return nil
}
*/

func configDbMoveOne(cmd *cobra.Command, dry, promptConfig bool, migOption *flatOptions, from, to string) error {

	var err error
	tmpl, err = template.New("test").Parse(moveYAML)
	if err != nil {

		return err
	}

	// read template
	b := &strings.Builder{}
	dsn := map[string]string{
		"From": from,
		"To":   to,
	}
	err = tmpl.Execute(b, dsn)
	if err != nil {
		panic(err)
	}
	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set("yaml", b.String())

	store, er := config.OpenStore(cmd.Context(), "mem://")
	if er != nil {
		panic(er)
	}
	ctx = propagator.With(cmd.Context(), config.ContextKey, store)

	runtime.SetRuntime(v)

	var svcFrom service.Service
	var svcTo service.Service
	runtime.Register("test", func(ctx context.Context) {
		svcFrom = service.NewService(
			service.Name("From"),
			service.Context(ctx),
			service.WithStorageDrivers(migOption.SupportedDrivers[migOption.storageKey]...),
		)
		svcTo = service.NewService(
			service.Name("To"),
			service.Context(ctx),
			service.WithStorageDrivers(migOption.SupportedDrivers[migOption.storageKey]...),
		)
	})
	mgr, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		return err
	}
	ctx = mgr.Context()

	sChan := make(chan service.MigratorStatus, 1000)
	var bar *progressbar.ProgressBar
	go func() {
		for status := range sChan {
			if status.Total > 0 {
				if bar == nil {
					bar = progressbar.Default(status.Total)
				}
				_ = bar.Set64(status.Count)
			}
		}
	}()

	fromCtx := propagator.With(ctx, service.ContextKey, svcFrom)
	toCtx := propagator.With(ctx, service.ContextKey, svcTo)
	data, er := migOption.StorageOptions.Migrator(cmd.Context(), fromCtx, toCtx, dry, sChan)
	if er == nil {
		for k, info := range data {
			fmt.Println("Migration INFO", k, info)
		}
	}

	return nil
}

// configDatabaseListCmd lists all database connections.
var configDatabaseMoveCmd = &cobra.Command{
	Use:   "move",
	Short: "Move service data from one database to another",
	Long: `
DESCRIPTION

  Migrate existing data to a new storage type
`,
	RunE: func(cmd *cobra.Command, args []string) error {

		if dbMoveDryRun {
			cmd.Println("------------------------------------------------------------------------------------")
			cmd.Println(promptui.IconWarn + " This command has dry-run enabled by default. No real operations will be performed")
			cmd.Println("  If you are migrating from/to BoltDB storages, make sure to stop the server first.")
			cmd.Println("------------------------------------------------------------------------------------")
		}

		ss, e := lib.ListServicesWithStorage()
		if e != nil {
			log.Fatal(e.Error())
		}
		var migratorsOptions []*flatOptions

		for _, s := range ss {
			if s.Options().StorageOptions.Migrator != nil {
				for key := range s.Options().StorageOptions.SupportedDrivers {
					migratorsOptions = append(migratorsOptions, &flatOptions{
						StorageOptions: s.Options().StorageOptions,
						storageKey:     key,
						serviceName:    s.Name(),
						serviceOptions: s.Options(),
					})
				}
			}
		}

		var services []string
		for _, m := range migratorsOptions {
			services = append(services, m.serviceName+" ("+m.storageKey+")")
		}
		pl := &promptui.Select{
			Label: "Which service do you want to migrate?",
			Items: services,
		}
		serviceIndex, _, er := pl.Run()
		if er != nil {
			return er
		}
		selectedMig := migratorsOptions[serviceIndex]

		fromURL, er := (&promptui.Prompt{
			Label:    "Provide source URL",
			Validate: notEmpty,
			Default:  dbMoveFromURL,
		}).Run()
		if er != nil {
			return er
		}

		toURL, er := (&promptui.Prompt{
			Label:    "Provide target URL",
			Validate: notEmpty,
			Default:  dbMoveToURL,
		}).Run()
		if er != nil {
			return er
		}

		return configDbMoveOne(cmd, dbMoveDryRun, true, selectedMig, fromURL, toURL)

		/*
			// List all databases value
			dd := configDatabaseList()
			var driversItems []string
			var drivers []*configDatabase
			for _, driver := range dd {
				supported := false
				for _, s := range driver.services {
					if s.serviceName == selectedMig.serviceName && s.storageKey == selectedMig.StorageKey {
						supported = true
						break
					}
				}
				if supported {
					drivers = append(drivers, driver)
					driversItems = append(driversItems, fmt.Sprintf("%s - %s", driver.driver, driver.dsn))
				}
			}
			dl := &promptui.Select{
				Label: "Select storage source for " + serviceName,
				Items: driversItems,
			}
			fromIndex, _, er := dl.Run()
			if er != nil {
				return er
			}
			from := drivers[fromIndex]

			var toIndex int
			var toIndexSet bool
			if len(driversItems) == 2 {
				toIndex = (fromIndex + 1) % 2
				cmd.Println("Selecting other other storage for target:", drivers[toIndex].driver)
				conf := &promptui.Prompt{Label: "Is this correct?", IsConfirm: true}
				if _, e := conf.Run(); e == nil {
					toIndexSet = true
				}
			}

			if !toIndexSet {
				dl.Label = "Select storage target for " + serviceName
				toIndex, _, er = dl.Run()
				if er != nil {
					return er
				}
			}
			to := drivers[toIndex]

			sOptions := migratorsOptions[serviceIndex]

			return configDbMoveOne(cmd, dbMoveDryRun, true, sOptions, from, to)

		*/

	},
	PostRun: func(cmd *cobra.Command, args []string) {
		cmd.Println("Delaying exit to make sure write operations are committed.")
		<-time.After(1 * time.Second)
	},
}

/*
func initDAO(ctx context.Context, driver, dsn, prefix, storageKey string) (dao.DAO, error) {
	var d dao.DAO
	var e error
	switch driver {
	case boltdb.Driver:
		d, e = boltdb.NewDAO(ctx, driver, dsn, prefix)
	case bleve.Driver:
		d, e = bleve.NewDAO(ctx, driver, dsn, prefix)
	case mongodb.Driver:
		d, e = mongodb.NewDAO(ctx, driver, dsn, prefix)
	default:
		return nil, fmt.Errorf("unsupported driver type")
	}
	if e != nil {
		return nil, e
	}
	if e := d.Init(ctx, configx.New()); e != nil {
		return nil, e
	}
	if storageKey == "indexer" {
		switch driver {
		case bleve.Driver:
			d, e = bleve.NewIndexer(ctx, d)
		case mongodb.Driver:
			d, e = mongodb.NewIndexer(ctx, d)
		}
	}
	return d, e
}

*/

func init() {
	configDatabaseMoveCmd.Flags().BoolVar(&dbMoveDryRun, "dry-run", true, "Enable/disable dry-run mode")
	configDatabaseMoveCmd.Flags().StringVar(&dbMoveFromURL, "from", "", "From URL")
	configDatabaseMoveCmd.Flags().StringVar(&dbMoveToURL, "to", "", "To URL")

	configDatabaseCmd.AddCommand(configDatabaseMoveCmd)
}
