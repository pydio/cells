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

package runtime

import "path/filepath"

var (
	DefaultKeyDiscovery    = "mem://"
	DefaultKeyRegistry     = "mem://?cache=shared"
	DefaultKeyBroker       = "mem://"
	DefaultKeyConfig       = "file://" + filepath.Join(ApplicationWorkingDir(), DefaultConfigFileName)
	DefaultKeyVault        = "detect"
	DefaultKeyKeyring      = "file://" + filepath.Join(ApplicationWorkingDir(), DefaultKeyringFileName) + "?keyring=true"
	DefaultKeyCertsStore   = "file://" + filepath.Join(ApplicationWorkingDir(), DefaultCertStorePath)
	DefaultKeyCache        = "pm://"
	DefaultKeyShortCache   = "pm://"
	DefaultKeyQueue        = "mem://"
	DefaultKeyPersistQueue = "file://"
)
