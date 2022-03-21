package fork

import (
	"bufio"
	"context"
	"github.com/pydio/cells/v4/common/runtime"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
)

type Options struct {
	debugFork   bool
	customFlags []string
	retries     int
	parentName  string
	watch       func(event string, p *Process)
}

type Option func(o *Options)

func WithDebug() Option {
	return func(o *Options) {
		o.debugFork = true
	}
}

func WithParentName(p string) Option {
	return func(o *Options) {
		o.parentName = p
	}
}

func WithCustomFlags(f ...string) Option {
	return func(o *Options) {
		o.customFlags = f
	}
}

func WithRetries(i int) Option {
	return func(o *Options) {
		o.retries = i
	}
}

func WithWatch(w func(event string, process *Process)) Option {
	return func(o *Options) {
		o.watch = w
	}
}

type Process struct {
	serviceNames []string
	o            *Options
	lastErr      error
	cmd          *exec.Cmd
	ctx          context.Context
}

func NewProcess(ctx context.Context, serviceNames []string, oo ...Option) *Process {
	p := &Process{
		ctx:          ctx,
		serviceNames: serviceNames,
		o: &Options{
			watch: func(event string, p *Process) {},
		},
	}
	for _, opt := range oo {
		opt(p.o)
	}
	return p
}

func (p *Process) Err() error {
	return p.lastErr
}

func (p *Process) Stop() {
	if p.cmd != nil {
		if e := p.cmd.Process.Signal(syscall.SIGINT); e != nil {
			p.cmd.Process.Kill()
		}
	}
}

func (p *Process) StartAndWait(retry ...int) error {

	cmd := exec.Command(os.Args[0], p.buildForkStartParams()...)
	if err := p.pipeOutputs(cmd); err != nil {
		p.lastErr = err
		return err
	}

	p.cmd = cmd

	p.o.watch("start", p)
	if err := cmd.Start(); err != nil {
		p.lastErr = err
		p.o.watch("stop", p)
		return err
	}
	if err := cmd.Wait(); err != nil {
		p.lastErr = err
		p.o.watch("stop", p)
		if p.o.retries > 0 && err.Error() != "signal: terminated" && err.Error() != "signal: interrupt" && err.Error() != "signal: killed" {
			r := 0
			if len(retry) > 0 {
				r = retry[0]
			}
			if r < p.o.retries {
				log.Logger(p.ctx).Error("Restarting service after error in 3s...", zap.Error(err))
				<-time.After(3 * time.Second)
				return p.StartAndWait(r + 1)
			}
		}
		return err
	}

	p.o.watch("stop", p)

	return nil
}

func (p *Process) pipeOutputs(cmd *exec.Cmd) error {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}
	scannerOut := bufio.NewScanner(stdout)
	parentName := p.o.parentName
	go func() {
		for scannerOut.Scan() {
			text := strings.TrimRight(scannerOut.Text(), "\n")
			merged := false
			for _, sName := range p.serviceNames {
				if strings.Contains(text, sName) || (parentName != "" && strings.Contains(text, parentName)) {
					log.StdOut.WriteString(text + "\n")
					merged = true
					break
				}
			}
			if !merged {
				log.Logger(p.ctx).Info(text)
			}
		}
	}()
	scannerErr := bufio.NewScanner(stderr)
	go func() {
		for scannerErr.Scan() {
			text := strings.TrimRight(scannerErr.Text(), "\n")
			merged := false
			for _, sName := range p.serviceNames {
				if strings.Contains(text, sName) || (parentName != "" && strings.Contains(text, parentName)) {
					log.StdOut.WriteString(text + "\n")
					merged = true
					break
				}
			}
			if !merged {
				log.Logger(p.ctx).Error(text)
			}
		}
	}()
	return nil
}

func (p *Process) buildForkStartParams() []string {
	// Get generic flags
	params := runtime.BuildForkParams("start")

	// Append debug flag
	if p.o.debugFork {
		params = append(params, runtime.KeyLog, "debug")
	}
	// Use regexp to specify that we want to start that specific service
	for _, sName := range p.serviceNames {
		params = append(params, "^"+sName+"$")
	}
	if len(p.o.customFlags) > 0 {
		params = append(params, p.o.customFlags...)
	}
	return params
}
