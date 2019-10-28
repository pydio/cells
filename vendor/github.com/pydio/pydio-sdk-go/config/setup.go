package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strconv"
)

var (
	// Keys to retrieve configuration via environment variables
	KeyProtocol, KeyURL, KeyPath, KeyUser, KeyPassword, KeySkipVerify = "TARGET_PROTOCOL", "TARGET_URL", "TARGET_PATH", "TARGET_USER", "TARGET_PASSWORD", "TARGET_SKIP_VERIFY"

)

// SetUpEnvironment retrieves parameter to configure the environment (either by env variable or json file)
// and stores them in the DefaultCOnfig of the SDK.
func SetUpEnvironment(configFilePath string) error {

	c, err := getSdkConfigFromEnv()
	if err != nil {
		return err
	}

	if c.Url == "" {
		s, err := ioutil.ReadFile(configFilePath)
		if err != nil {
			return err
		}
		err = json.Unmarshal(s, &c)
		if err != nil {
			return err
		}
	}

	DefaultConfig = &c

	return nil
}

func getSdkConfigFromEnv() (SdkConfig, error) {

	var c SdkConfig

	// check presence of Env variable
	protocol := os.Getenv(KeyProtocol)
	url := os.Getenv(KeyURL)
	path := os.Getenv(KeyPath)
	user := os.Getenv(KeyUser)
	password := os.Getenv(KeyPassword)
	skipVerifyStr := os.Getenv(KeySkipVerify)
	if skipVerifyStr == "" {
		skipVerifyStr = "false"
	}
	skipVerify, err := strconv.ParseBool(skipVerifyStr)
	if err != nil {
		return c, err
	}

	if !(len(protocol) > 0 && len(url) > 0 && len(user) > 0 && len(password) > 0) {
		return c, nil
	}

	c.Protocol = protocol
	c.Url = url
	c.Path = path
	c.User = user
	c.Password = password
	c.SkipVerify = skipVerify

	return c, nil
}
