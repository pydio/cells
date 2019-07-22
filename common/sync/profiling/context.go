package profiling

import (
	"context"
	"fmt"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
	"os"
	"path/filepath"
	"runtime"
	"runtime/pprof"
	"time"
)

var Dir = "."

type Capture struct {
	shouldStop                   bool
	stopSync                     chan bool
	cpuOutputFile, memOutputFile *os.File
	name                         string
}

type Key string

const (
	ProcessFunction = Key("processFunc")
)

func (c *Capture) start() error {
	var err error
	c.cpuOutputFile, err = os.Create(filepath.Join(Dir, "cpu_"+c.name))
	if err != nil {
		return err
	}

	runtime.GC()
	err = pprof.StartCPUProfile(c.cpuOutputFile)
	if err == nil {
		go c.continuousShots()
	}
	return err
}

func (c *Capture) continuousShots() {
	for !c.shouldStop {
		runtime.GC()
		<-time.After(time.Millisecond * 10)
	}
	c.stopSync <- true
}

func (c *Capture) stop() error {
	defer func() {
		pprof.StopCPUProfile()
		c.cpuOutputFile.Close()
		close(c.stopSync)
	}()

	c.shouldStop = true
	<-c.stopSync
	runtime.GC()

	var err error

	c.memOutputFile, err = os.Create(filepath.Join(Dir, "mem_"+c.name))
	if err != nil {
		return err
	}
	defer c.memOutputFile.Close()
	err = pprof.WriteHeapProfile(c.memOutputFile)
	return err
}

func Context(parent context.Context, key Key) context.Context {
	return context.WithValue(parent, key, &Capture{
		stopSync: make(chan bool),
		name:     fmt.Sprintf("%s.%d", string(key), time.Now().Unix()),
	})
}

func Start(ctx context.Context, k Key) (stopFunc func()) {
	var capture *Capture
	val := ctx.Value(k)
	if val != nil {
		capture = val.(*Capture)
		err := capture.start()
		if err != nil {
			log.Error("failed to start profiling", zap.Error(err))
			capture = nil
		}
	}

	stopFunc = func() {
		if capture != nil {
			_ = capture.stop()
		}
	}
	return stopFunc
}
