package cmd

import (
	"github.com/micro/go-micro/broker"
	"github.com/pydio/cells/common"
	"github.com/spf13/cobra"
)

func init() {
	sitesCmd.AddCommand(sitesCaddy)
}

var sitesCaddy = &cobra.Command{
	Use:   "caddy",
	Short: "Dump content of the caddy file currently served by pydio.gateway.proxy",
	Long:  "This command sends an event recognized by pydio.gateway.proxy to make it dump its caddy file in the logs.",
	Run: func(cmd *cobra.Command, args []string) {
		broker.Publish(common.TopicServiceRegistration, &broker.Message{
			Header: map[string]string{
				common.EventHeaderServiceRegisterService: common.ServiceGatewayProxy,
			},
			Body: []byte(common.EventTypeDebugPrintInternals),
		})
	},
}
