package cmd

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io"
	"io/ioutil"
	"path/filepath"

	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/proto/tree"
	config2 "github.com/pydio/cells/v4/common/runtime"
)

var (
	extAddr  string
	extToken string
)

var TestExternalGrpc = &cobra.Command{
	Use:   "grpc",
	Short: "Sample GRPC request sent to web-facing interface",
	RunE: func(cmd *cobra.Command, args []string) error {

		creds, err := loadTLSCredentials()
		if err != nil {
			return err
		}
		conn, err := grpc.Dial(extAddr, grpc.WithTransportCredentials(creds))
		if err != nil {
			return err
		}
		cli := tree.NewNodeProviderClient(conn)
		md := metadata.MD{}
		md.Set("x-pydio-bearer", extToken)
		og := metadata.NewOutgoingContext(context.Background(), md)
		stream, e := cli.ListNodes(og, &tree.ListNodesRequest{Node: &tree.Node{Path: "common-files"}})
		if e != nil {
			return e
		}
		for {
			rsp, er := stream.Recv()
			if er != nil {
				if er != io.EOF {
					return er
				}
				break
			}
			fmt.Println(rsp.GetNode().GetPath(), rsp.GetNode().GetType(), rsp.GetNode().GetSize())
		}
		return nil
	},
}

func loadTLSCredentials() (credentials.TransportCredentials, error) {
	// Load certificate of the CA who signed server's certificate
	pemServerCA, err := ioutil.ReadFile(filepath.Join(config2.ApplicationWorkingDir(), "certs", "rootCA.pem"))
	if err != nil {
		return nil, err
	}

	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(pemServerCA) {
		return nil, fmt.Errorf("failed to add server CA's certificate")
	}

	// Create the credentials and return it
	config := &tls.Config{
		RootCAs: certPool,
	}

	return credentials.NewTLS(config), nil
}

func init() {
	TestExternalGrpc.Flags().StringVarP(&extAddr, "addr", "a", "local.pydio:8080", "Server address")
	TestExternalGrpc.Flags().StringVarP(&extToken, "token", "t", "", "User Personal Token")
	RootCmd.AddCommand(TestExternalGrpc)
}
