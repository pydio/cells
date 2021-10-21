package cmd

import (
	"fmt"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
)

func init() {
	AdminCmd.AddCommand(sitesCaddy)
}

var sitesCaddy = &cobra.Command{
	Use:    "caddy",
	Hidden: true,
	Short:  "Dump content of the caddy file currently served by pydio.gateway.proxy",
	Long: `
DESCRIPTION

  Send an event to pydio.gateway.proxy to make it dump the caddy configuration in the logs.

`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Sending a DebugPrintInternals event to service gateway.proxy...")
		broker.Publish(common.TopicServiceRegistration, &broker.Message{
			Header: map[string]string{
				common.EventHeaderServiceRegisterService: common.ServiceGatewayProxy,
			},
			Body: []byte(common.EventTypeDebugPrintInternals),
		})
		<-time.After(1 * time.Second)
		fmt.Println(promptui.IconGood + " Done!")
	},
}
