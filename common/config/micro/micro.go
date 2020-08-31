package micro

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
	"github.com/pydio/go-os/config"
	"github.com/pydio/go-os/config/source/file"
)

type Micro struct {
	path   string
	source config.Config
}

type mem struct {
	source config.Config
}

func NewMemorySource(data []byte) configx.KVStore {
	return &mem{
		config.NewConfig(
			config.WithSource(
				memory.NewSource(data),
			),
		),
	}
}

func (m *mem) Get() configx.Value {
	v := configx.NewMap()

	m.source.Get().Scan(&v)

	return v
}

func (m *mem) Set(data interface{}) error {
	return fmt.Errorf("not implemented")
}

func (m *mem) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *mem) Watch(path ...string) (configx.Receiver, error) {
	// For the moment do nothing
	return &receiver{}, nil
}

func NewLocalSource(fName string) configx.KVStore {
	// If file exists and is not empty, check it has valid JSON content
	// fName := filepath.Join(config.PydioConfigDir, config.PydioConfigFile)
	if data, err := ioutil.ReadFile(fName); err == nil && len(data) > 0 {
		var whatever map[string]interface{}
		if e := json.Unmarshal(data, &whatever); e != nil {
			errColor := "\033[1;31m%s\033[0m"
			fmt.Println("**************************************************************************************")
			fmt.Println("It seems that your configuration file contains invalid JSON. Did you edit it manually?")
			fmt.Println("File is located at " + fName)
			fmt.Println("Error was: ", fmt.Sprintf(errColor, e.Error()))
			fmt.Println("")
			fmt.Printf(errColor, "FATAL ERROR : Aborting now\n")
			fmt.Println("**************************************************************************************")
			log.Fatal(e)
		}
	}

	return &Micro{
		fName,
		config.NewConfig(
			config.WithSource(
				file.NewSource(
					config.SourceName(fName),
				),
			),
			config.PollInterval(10*time.Second),
		),
	}
}

func (m *Micro) Get() configx.Value {
	v := configx.NewMap()

	m.source.Get().Scan(&v)

	return v
}

func (m *Micro) Set(data interface{}) error {
	if err := filex.Save(m.path, data); err != nil {
		return err
	}

	return nil
}

func (m *Micro) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *Micro) Watch(path ...string) (configx.Receiver, error) {
	// For the moment do nothing
	return &receiver{}, nil
}

type receiver struct{}

func (*receiver) Next() (configx.Values, error) {
	select {}

	return nil, nil
}

func (*receiver) Stop() {
}
