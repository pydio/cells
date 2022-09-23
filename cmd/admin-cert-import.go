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
	"os"
	"path"
)

var certImportUUID string

// importCertsCmd deletes a configuration
var importCertCmd = &cobra.Command{
	Use:   "import",
	Short: "Import certificate in vault",
	Long: `
DESCRIPTION

  Import a certificate in the vault. 

SYNTAX

  Use uuid to assign a recognizable id to the certificate in the vault. If not present, defaults to the file name (with extension)

EXAMPLE

  Import a certificate file into the vault 
  $ ` + os.Args[0] + ` admin cert import ~/path/to/my/certificate --uuid 123456.pem

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
			if certImportUUID == "" {
				certImportUUID = path.Base(args[i])
			}
			v, err := os.ReadFile(args[i])
			if err != nil {
				return err
			}

			if store.Exists(cmd.Context(), certImportUUID) {
				return errors.New("key " + certImportUUID + " already exists")
			}

			if err := store.Store(cmd.Context(), certImportUUID, v); err != nil {
				return err
			}
		}

		return nil
	},
}

func init() {
	importCertCmd.Flags().StringVar(&certImportUUID, "uuid", "", "Certs Import Namespace")
	CertCmd.AddCommand(importCertCmd)
}
