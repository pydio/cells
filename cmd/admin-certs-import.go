/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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
	"errors"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/spf13/cobra"
	"io/ioutil"
	"os"
	"path"
)

var certsImportUUID string

// importCertsCmd deletes a configuration
var importCertsCmd = &cobra.Command{
	Use:   "import",
	Short: "Import certificates in vault",
	Long: `
DESCRIPTION

  Import certificate in vault. 

SYNTAX

  Use configurations URLs schemes for --from and --to parameters.
  If store supports versioning 

EXAMPLE

  Copy config from local config file to ETCD 
  $ ` + os.Args[0] + ` admin config copy --from file:/// --to etcd://:2379/ --type config

`,
	RunE: func(cmd *cobra.Command, args []string) error {
		store, err := storage.OpenStore(cmd.Context(), runtime.CertsStoreURL())
		if err != nil {
			return err
		}

		if len(args) == 0 {
			return errors.New("nothing to import")
		}

		if len(args) > 1 {
			return errors.New("wrong number of args")
		}

		for i := 0; i < len(args); i++ {
			if certsImportUUID == "" {
				certsImportUUID = path.Base(args[i])
			}
			v, err := ioutil.ReadFile(args[i])
			if err != nil {
				return err
			}

			if store.Exists(cmd.Context(), certsImportUUID) {
				return errors.New("key " + certsImportUUID + " already exists")
			}

			if err := store.Store(cmd.Context(), certsImportUUID, v); err != nil {
				return err
			}
		}

		return nil
	},
}

func init() {
	importCertsCmd.Flags().StringVar(&certsImportUUID, "uuid", "", "Certs Import Namespace")
	CertsCmd.AddCommand(importCertsCmd)
}
