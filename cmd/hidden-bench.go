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
	"crypto/rand"
	"fmt"
	"os"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"
)

var (
	benchSplit string
	benchBytes int
)

// runCmd represents the run command
var benchBrokerCmd = &cobra.Command{
	Use:    "benchbroker",
	Short:  "Utilitary tool for publishing/subscribing to the broker",
	Long:   `#Dev #Experimental #DoNotUse`,
	Hidden: true,
	PreRun: func(cmd *cobra.Command, args []string) {
		bindViperFlags(cmd.Flags(), map[string]string{})
	},
	Run: func(cmd *cobra.Command, args []string) {

		// Initialise the default broker
		handleBroker()

		var count, count2, count3, count4, count5, count6 uint64
		if benchSplit == "" || benchSplit == "sub" {

			subDuration := 0 * time.Millisecond

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count, 1)
				<-time.After(subDuration)
				return nil
			})

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count2, 1)
				<-time.After(subDuration)
				return nil
			})

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count3, 1)
				<-time.After(subDuration)
				return nil
			})

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count4, 1)
				<-time.After(subDuration)
				return nil
			})

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count5, 1)
				<-time.After(subDuration)
				return nil
			})

			broker.Subscribe("test", func(broker.Publication) error {
				atomic.AddUint64(&count6, 1)
				<-time.After(subDuration)
				return nil
			})
		}

		if benchSplit == "" || benchSplit == "pub" {
			max, _ := strconv.Atoi(os.Getenv("NUM_GOROUTINES"))
			wg := &sync.WaitGroup{}
			wg.Add(max)
			b, _ := GenerateRandomBytes(benchBytes)
			for i := 0; i < max; i++ {
				go func(i int) {
					defer wg.Done()
					err := broker.Publish("test", &broker.Message{Body: b})
					if err != nil {
						fmt.Println("Error publishing ", err)
					}
				}(i)
			}
			wg.Wait()
			fmt.Println("Finished publishing", max)
			<-time.After(10 * time.Second)
		}

		if benchSplit == "" {
			//<-time.After(10 * time.Second)
			fmt.Println("And the count we have is", count, count2, count3, count4, count5, count6)
		} else if benchSplit == "sub" {
			ticker := time.NewTicker(5 * time.Second)
			for {
				select {
				case <-ticker.C:
					fmt.Println("Current count", count, count2, count3, count4, count5, count6)
				}
			}
		}
	},
}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}

	return b, nil
}

func init() {
	addRegistryFlags(benchBrokerCmd.Flags())
	benchBrokerCmd.Flags().StringVarP(&benchSplit, "split", "s", "", "Split publish and subscribes")
	benchBrokerCmd.Flags().IntVarP(&benchBytes, "bytes", "b", 1000, "Number of bytes to send")
	RootCmd.AddCommand(benchBrokerCmd)
}
