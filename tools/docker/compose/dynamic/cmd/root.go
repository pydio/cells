/*
Copyright © 2025 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"os"
	"text/template"

	"github.com/spf13/cobra"

	_ "embed"
)

var (
	//go:embed docker-compose.yml
	dockerComposeTemplate string

	config Config
)

type Config struct {
	EnableMysql    bool
	EnableMariaDB  bool
	EnablePostgres bool
	EnableMongoDB  bool
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

		tmpl, err := template.New("docker-compose").Parse(dockerComposeTemplate)
		if err != nil {
			panic(err)
		}

		return tmpl.Execute(os.Stdout, config)
	},
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

	rootCmd.PersistentFlags().BoolVar(&(config.EnableMysql), "with-mysql", false, "enable mysql")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableMariaDB), "with-mariadb", false, "enable mariadb")
	rootCmd.PersistentFlags().BoolVar(&(config.EnablePostgres), "with-postgres", false, "enable postgres")
	rootCmd.PersistentFlags().BoolVar(&(config.EnableMongoDB), "with-mongodb", false, "enable mongodb")

	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.dynamic.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
