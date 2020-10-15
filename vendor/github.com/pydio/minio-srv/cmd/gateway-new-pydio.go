package cmd

import (
	"context"
	"flag"

	"github.com/minio/cli"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/minio-srv/cmd/logger"
	"github.com/pydio/minio-srv/pkg/auth"
)

func StartPydioGateway(ctx context.Context, gw Gateway, gatewayAddr string, accessKey string, secretKey string, log logger.PydioLogger, certFile string, certKey string) {

	target := logger.NewPydioTarget(log)
	logger.AddTarget(target)

	set := &flag.FlagSet{}
	set.String("address", gatewayAddr, "")
	set.Bool("quiet", true, "")
	cliContext := cli.NewContext(cli.NewApp(), set, nil)

	cred, _ := auth.CreateCredentials(accessKey, secretKey)
	globalIsEnvCreds = true
	globalActiveCred = cred

	globalHandlers = append(globalHandlers,
		getPydioAuthHandlerFunc(true),
		servicecontext.HttpSpanHandlerWrapper,
	)

	StartGateway(cliContext, gw, true)

	globalIAMSys = NewJwtIAMSys()
	globalPolicySys = NewMemoryPolicySys()

	stopProcess := func() bool {
		var err error
		log.Info("Shutting down Minio Server")
		err = globalHTTPServer.Shutdown()
		if err != nil {
			log.Info("Unable to shutdown http server:" + err.Error())
		}
		return true
	}

	select {
	case e := <-globalHTTPServerErrorCh:
		logger.Info("Received Error on globalHTTPServerErrorCh", e)
		stopProcess()
		return
	case <-globalOSSignalCh:
		log.Info("Received globalOSSignalCh")
		stopProcess()
		return
	case <-ctx.Done():
		log.Info("Received ctx.Done()")
		stopProcess()
		return
	}
}
