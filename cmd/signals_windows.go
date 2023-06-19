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
	"os"
	"os/signal"
	"syscall"

	"github.com/pydio/cells/v4/common/log"
)

func handleSignals(args []string) {
	c := make(chan os.Signal, 1)

	// SIGUSR1 does not compile on windows. Use direct value syscall.Signal instead
	signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM)

	go func() {
		for sig := range c {
			switch sig {
			case syscall.SIGTERM:
				fallthrough
			case syscall.SIGINT:
				// Stopping the main context will trigger the stop of all services
				log.Debug("Cancelling main context")
				cancel()

				//log.Info("Disconnecting broker")
				//// Disconnecting the broker so that we are not flooded with messages
				//broker.Disconnect()

			case syscall.SIGHUP:
				// Stop all services
				//for _, service := range allServices {
				//	if service.RequiresFork() && !IsFork {
				//		// Stopping here would kill the command and prevent proper de-registering of service
				//		// Signal will be passed along and the fork will stop by itself.
				//		continue
				//	}
				//
				//	service.Stop()
				//
				//	service.Start(ctx)
				//}
			}
		}
	}()
}
