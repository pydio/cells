package cmd

import (
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"

	"github.com/minio/dsync"
	miniohttp "github.com/pydio/minio-srv/pkg/http"
)

func NewPydioServer(serverAddr string, configDir string, args ...string) {

	// Disallow relative paths, figure out absolute paths.
	configDirAbs, err := filepath.Abs(configDir)
	fatalIf(err, "Unable to fetch absolute path for config directory %s", configDir)

	setConfigDir(configDirAbs)

	var setupType SetupType

	globalMinioAddr, globalEndpoints, setupType, err := CreateEndpoints(serverAddr, args...)
	fatalIf(err, "Invalid command line arguments server=‘%s’, args=%s", serverAddr, args)
	_, globalMinioPort := mustSplitHostPort(globalMinioAddr)
	if runtime.GOOS == "darwin" {
		// On macOS, if a process already listens on LOCALIPADDR:PORT, net.Listen() falls back
		// to IPv6 address ie minio will start listening on IPv6 address whereas another
		// (non-)minio process is listening on IPv4 of given port.
		// To avoid this error sutiation we check for port availability only for macOS.
		fatalIf(checkPortAvailability(globalMinioPort), "Port %d already in use", globalMinioPort)
	}

	globalIsXL = (setupType == XLSetupType)
	globalIsDistXL = (setupType == DistXLSetupType)
	if globalIsDistXL {
		globalIsXL = true
	}

	// Handle all server environment vars.
	serverHandleEnvVars()

	// Create certs path.
	fatalIf(createConfigDir(), "Unable to create configuration directories.")

	// Initialize server config.
	initConfig()

	// Enable loggers as per configuration file.
	enableLoggers()

	// Init the error tracing module.
	initError()

	// Check and load SSL certificates.
	globalPublicCerts, globalRootCAs, globalTLSCertificate, globalIsSSL, err = getSSLConfig()
	fatalIf(err, "Invalid SSL certificate file")

	// Check for new updates from dl.minio.io.
	mode := globalMinioModeFS
	if globalIsDistXL {
		mode = globalMinioModeDistXL
	} else if globalIsXL {
		mode = globalMinioModeXL
	}
	checkUpdate(mode)

	// Set system resources to maximum.
	errorIf(setMaxResources(), "Unable to change resource limit")

	// Set nodes for dsync for distributed setup.
	if globalIsDistXL {
		clnts, myNode := newDsyncNodes(globalEndpoints)
		fatalIf(dsync.Init(clnts, myNode), "Unable to initialize distributed locking clients")
	}

	// Initialize name space lock.
	initNSLock(globalIsDistXL)

	// Configure server.
	// Declare handler to avoid lint errors.
	var handler http.Handler
	handler, err = configureServerHandler(globalEndpoints)
	fatalIf(err, "Unable to configure one of server's RPC services.")

	// Initialize S3 Peers inter-node communication only in distributed setup.
	initGlobalS3Peers(globalEndpoints)

	// Initialize Admin Peers inter-node communication only in distributed setup.
	initGlobalAdminPeers(globalEndpoints)

	globalHTTPServer := miniohttp.NewServer([]string{globalMinioAddr}, handler, globalTLSCertificate)
	globalHTTPServer.ReadTimeout = globalConnReadTimeout
	globalHTTPServer.WriteTimeout = globalConnWriteTimeout
	globalHTTPServer.UpdateBytesReadFunc = globalConnStats.incInputBytes
	globalHTTPServer.UpdateBytesWrittenFunc = globalConnStats.incOutputBytes
	globalHTTPServer.ErrorLogFunc = errorIf
	go func() {
		globalHTTPServerErrorCh <- globalHTTPServer.Start()
	}()

	signal.Notify(globalOSSignalCh, os.Interrupt, syscall.SIGTERM)

	newObject, err := newObjectLayer(globalEndpoints)
	if err != nil {
		errorIf(err, "Initializing object layer failed")
		err = globalHTTPServer.Shutdown()
		errorIf(err, "Unable to shutdown http server")
		os.Exit(1)
	}

	globalObjLayerMutex.Lock()
	globalObjectAPI = newObject
	globalObjLayerMutex.Unlock()

	// Prints the formatted startup message once object layer is initialized.
	apiEndpoints := getAPIEndpoints(globalMinioAddr)
	printStartupMessage(apiEndpoints)

	// Set uptime time after object layer has initialized.
	globalBootTime = UTCNow()

	handleSignals()
}
