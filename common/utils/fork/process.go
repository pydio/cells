package fork

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
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

func (p *Process) GetPID() (string, bool) {
	if p.cmd == nil || p.cmd.Process == nil {
		return "", false
	}
	return fmt.Sprintf("%d", p.cmd.Process.Pid), true
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
	defaultLogContext := servicecontext.WithServiceName(p.ctx, p.serviceNames[0])

	logs := regexp.MustCompile("^(?P<log_date>[^\t]+)\t(?P<log_level>[^\t]+)\t(?P<log_name>[^\t]+)\t(?P<log_message>[^\t]+)(\t)?(?P<log_fields>[^\t]*)$")

	go func() {
		for scannerOut.Scan() {
			text := strings.TrimRight(scannerOut.Text(), "\n")
			// merged := false
			if parsed := logs.FindStringSubmatch(text); len(parsed) >= 5 {
				log.StdOut.WriteString(text + "\n")
				/*
					var f func(string, ...zapcore.Field)
					switch parsed[2][5:9] {
					case "INFO":
						f = log.Logger(defaultLogContext).Info
					case "DEBU":
						f = log.Logger(defaultLogContext).Debug
					case "WARN":
						f = log.Logger(defaultLogContext).Warn
					case "ERRO":
						f = log.Logger(defaultLogContext).Error
					default:
						f = log.Logger(defaultLogContext).Info
					}
					if len(parsed) == 7 {
						f(parsed[4] + "\t" + parsed[6])
					} else {
						f(parsed[4])
					}
				*/
			} else {
				log.Logger(defaultLogContext).Info(text)
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
				log.Logger(defaultLogContext).Error(text)
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
		params = append(params, "--"+runtime.KeyLog, "debug")
		params = append(params, "^pydio.grpc.registry$")
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
