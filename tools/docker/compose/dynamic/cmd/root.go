/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"net"
	"os"
	"text/template"
	"time"

	sprig "github.com/Masterminds/sprig/v3"
	"github.com/spf13/cobra"

	_ "embed"
)

var (
	//go:embed docker-compose.yml
	dockerComposeTemplate string

	config Config
)

type Config struct {
	Replicas       int
	EnableTLS      bool
	EnableNats     bool
	EnableMysql    bool
	EnableMariaDB  bool
	EnablePostgres bool
	EnableMongoDB  bool
	EnableETCD     bool

	TLS ConfigTLS
}

type ConfigTLS struct {
	Cert      string
	PrivKey   string
	CA        string
	CAPrivKey string
}

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "dynamic",
	Short: "A brief description of your application",
	Long: `A longer description that spans multiple lines and likely contains
examples and usage of using your application. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	RunE: func(cmd *cobra.Command, args []string) error {

		if config.EnableTLS {
			tlsCert, tlsCertPrivKey, caCert, caPrivKey, err := certsetup()
			if err != nil {
				return err
			}

			config.TLS.Cert = string(tlsCert)
			config.TLS.PrivKey = string(tlsCertPrivKey)
			config.TLS.CA = string(caCert)
			config.TLS.CAPrivKey = string(caPrivKey)
		}

		tmpl, err := template.New("docker-compose").Funcs(sprig.FuncMap()).Parse(dockerComposeTemplate)
		if err != nil {
			panic(err)
		}

		return tmpl.Execute(os.Stdout, config)
	},
}

func certsetup() (certPEMB, certPrivKeyPEMB, caPEMB, caPrivKeyPEMB []byte, err error) {
	// set up our CA certificate
	ca := &x509.Certificate{
		SerialNumber: big.NewInt(2019),
		Subject: pkix.Name{
			Organization:  []string{"Company, INC."},
			Country:       []string{"US"},
			Province:      []string{""},
			Locality:      []string{"San Francisco"},
			StreetAddress: []string{"Golden Gate Bridge"},
			PostalCode:    []string{"94016"},
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	// create our private and public key
	caPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return
	}

	// create the CA
	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return
	}

	// pem encode
	caPEM := new(bytes.Buffer)
	pem.Encode(caPEM, &pem.Block{
		Type:  "CERTIFICATE",
		Bytes: caBytes,
	})

	caPrivKeyPEM := new(bytes.Buffer)
	pem.Encode(caPrivKeyPEM, &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(caPrivKey),
	})

	// set up our server certificate
	cert := &x509.Certificate{
		SerialNumber: big.NewInt(2019),
		Subject: pkix.Name{
			Organization:  []string{"Company, INC."},
			Country:       []string{"US"},
			Province:      []string{""},
			Locality:      []string{"San Francisco"},
			StreetAddress: []string{"Golden Gate Bridge"},
			PostalCode:    []string{"94016"},
		},
		IPAddresses:  []net.IP{net.IPv4(127, 0, 0, 1), net.IPv6loopback},
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(10, 0, 0),
		SubjectKeyId: []byte{1, 2, 3, 4, 6},
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:     x509.KeyUsageDigitalSignature,
	}

	certPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, cert, ca, &certPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return
	}

	certPEM := new(bytes.Buffer)
	pem.Encode(certPEM, &pem.Block{
		Type:  "CERTIFICATE",
		Bytes: certBytes,
	})

	certPrivKeyPEM := new(bytes.Buffer)
	pem.Encode(certPrivKeyPEM, &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(certPrivKey),
	})

	caPEMB = caPEM.Bytes()
	caPrivKeyPEMB = caPrivKeyPEM.Bytes()
	certPEMB = certPEM.Bytes()
	certPrivKeyPEMB = certPrivKeyPEM.Bytes()

	return

	/*fmt.Println(string(certPEM.Bytes()), string(certPrivKeyPEM.Bytes()))

	serverCert, err := tls.X509KeyPair(certPEM.Bytes(), certPrivKeyPEM.Bytes())
	if err != nil {
		return nil, nil, err
	}

	serverTLSConf = &tls.Config{
		Certificates: []tls.Certificate{serverCert},
	}

	certpool := x509.NewCertPool()
	certpool.AppendCertsFromPEM(caPEM.Bytes())
	clientTLSConf = &tls.Config{
		RootCAs: certpool,
	}*/

	return
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	rootCmd.PersistentFlags().IntVar(&(config.Replicas), "with-replicas", 1, "number of cells replicas")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableTLS), "with-tls", true, "enable tls")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableMysql), "with-mysql", false, "enable mysql")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableNats), "with-nats", false, "enable nats")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableMariaDB), "with-mariadb", false, "enable mariadb")
	rootCmd.PersistentFlags().BoolVar(&(config.EnablePostgres), "with-postgres", false, "enable postgres")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableMongoDB), "with-mongodb", false, "enable mongodb")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableETCD), "with-etcd", false, "enable etcd")
	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.dynamic.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
