package transport

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"

	sdk "github.com/pydio/cells-sdk-go"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/minio-go"
)

type S3Client struct {
	config   *sdk.SdkConfig
	s3config *sdk.S3Config
	s3client *s3.S3
}

func NewS3Client(config *sdk.SdkConfig) *S3Client {
	return &S3Client{
		config: config,
		s3config: &sdk.S3Config{
			Bucket:                 "data",
			ApiKey:                 "gateway",
			ApiSecret:              "gatewaysecret",
			UsePydioSpecificHeader: false,
			IsDebug:                false,
			Region:                 "us-east-1",
			Endpoint:               config.Url,
		},
	}
}

func (g *S3Client) GetObject(ctx context.Context, node *tree.Node, requestData *views.GetRequestData) (io.ReadCloser, error) {
	jwt, err := retrieveToken(g.config)
	if err != nil {
		return nil, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	mc, e := minio.NewCore(u.Host, jwt, g.s3config.ApiSecret, u.Scheme == "https")
	if e != nil {
		return nil, e
	}
	r, _, e := mc.GetObject(g.s3config.Bucket, node.Path, minio.GetObjectOptions{})
	return r, e
}

func (g *S3Client) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *views.PutRequestData) (int64, error) {

	jwt, err := retrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	mc, e := minio.NewCore(u.Host, jwt, g.s3config.ApiSecret, u.Scheme == "https")
	if e != nil {
		return 0, e
	}
	return mc.PutObjectWithContext(ctx, g.s3config.Bucket, node.Path, reader, requestData.Size, minio.PutObjectOptions{
		UserMetadata: requestData.Metadata,
	})
}

func (g *S3Client) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *views.CopyRequestData) (int64, error) {
	jwt, err := retrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	mc, e := minio.New(g.s3config.Endpoint, g.s3config.ApiKey, jwt, false)
	if e != nil {
		return 0, e
	}
	dst, e := minio.NewDestinationInfo(g.s3config.Bucket, to.Path, nil, requestData.Metadata)
	if e != nil {
		return 0, e
	}
	src := minio.NewSourceInfo(g.s3config.Bucket, from.Path, nil)
	return 0, mc.CopyObject(dst, src)
}

// GetS3CLient creates and configure a new S3 client at each request.
// TODO optimize
func GetS3CLient(sdc *sdk.SdkConfig, s3c *sdk.S3Config) (*s3.S3, error) {

	var apiKey string
	var err error

	if s3c.UsePydioSpecificHeader { // Legacy
		apiKey = s3c.ApiKey
	} else {
		apiKey, err = retrieveToken(sdc)
		if err != nil {
			return nil, fmt.Errorf("cannot retrieve token from config, cause: %s", err.Error())
		}
	}

	conf := &aws.Config{
		// Static credentials are the best we have found to do the job until now.
		// Might be enhanced, together with a better session pool management
		Credentials: credentials.NewStaticCredentials(apiKey, s3c.ApiSecret, ""),
	}

	tr := http.DefaultTransport
	if sdc.SkipVerify {
		tr = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired and self-signed SSL certificates
		}
	}
	if s3c.UsePydioSpecificHeader { // Legacy:
		tr = NewAuthTransport(tr, sdc, s3c)
	}

	client := &http.Client{Transport: tr}
	conf.WithHTTPClient(client).WithEndpoint(s3c.Endpoint).WithRegion(s3c.Region)

	s3Session, err := session.NewSession(conf)
	if err != nil {
		log.Fatal("cannot initialise default S3 session: " + err.Error())
	}

	// s3.New(s3Session).ListBuckets(nil)

	return s3.New(s3Session), nil
}

// NewAuthTransport takes an http.RoundTripper and returns a new one that adds the JWT Auth
// header on each request (and optionally logs the additional cost of getting the JWT token)
func NewAuthTransport(rt http.RoundTripper, sdkConfig *sdk.SdkConfig, s3Config *sdk.S3Config) http.RoundTripper {
	return &authRoundTripper{rt: rt, sc: sdkConfig, s3c: s3Config, log: DefaultLogger{}}
}

type authRoundTripper struct {
	rt  http.RoundTripper
	log HTTPLogger
	sc  *sdk.SdkConfig
	s3c *sdk.S3Config
}

func (c *authRoundTripper) RoundTrip(request *http.Request) (*http.Response, error) {
	var start time.Time
	if c.s3c.IsDebug {
		c.log.LogRequest(request)
		start = time.Now()
	}

	jwt, err := retrieveToken(c.sc)
	if err != nil {
		return nil, err
	}
	request.Header.Set(KeyS3BearerHeader, jwt)
	response, err := c.rt.RoundTrip(request)

	if c.s3c.IsDebug {
		duration := time.Since(start)
		c.log.LogResponse(request, response, err, duration)
	}
	return response, err
}

// HTTPLogger defines the interface to log http request and responses.
type HTTPLogger interface {
	LogRequest(*http.Request)
	LogResponse(*http.Request, *http.Response, error, time.Duration)
}

// DefaultLogger logs basic information about the http responses.
type DefaultLogger struct {
}

// LogRequest does nothing.
func (dl DefaultLogger) LogRequest(*http.Request) {
}

// LogResponse logs path, host, status code and duration in milliseconds.
func (dl DefaultLogger) LogResponse(req *http.Request, res *http.Response, err error, duration time.Duration) {
	duration /= time.Millisecond
	if err != nil {
		log.Printf("HTTP Request method=%s host=%s path=%s status=error durationMs=%d error=%q", req.Method, req.Host, req.URL.Path, duration, err.Error())
	} else {
		log.Printf("HTTP Request method=%s host=%s path=%s status=%d durationMs=%d", req.Method, req.Host, req.URL.Path, res.StatusCode, duration)
	}
}
