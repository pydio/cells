package fork

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"regexp"
	"strings"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

type Options struct {
	name        string
	binary      string
	args        []string
	env         []string
	debugFork   bool
	customFlags []string
	retries     int
	watch       func(event string, p *Process)
}

type Option func(o *Options)

func WithDebug() Option {
	return func(o *Options) {
		o.debugFork = true
	}
}

func WithName(p string) Option {
	return func(o *Options) {
		o.name = p
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

func WithBinary(b string) Option {
	return func(o *Options) {
		o.binary = b
	}
}

func WithArgs(a []string) Option {
	return func(o *Options) {
		o.args = a
	}
}

func WithEnv(e []string) Option {
	return func(o *Options) {
		o.env = e
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
	if p.cmd != nil && p.cmd.Process != nil {
		if e := p.cmd.Process.Signal(syscall.SIGINT); e != nil {
			p.cmd.Process.Kill()
		}
	}
}

func (p *Process) StartAndWait(retry ...int) error {

	cmd := exec.Command(p.o.binary, p.o.args...)
	if err := p.pipeOutputs(cmd); err != nil {
		p.lastErr = err
		return err
	}

	p.cmd = cmd
	p.cmd.Env = append(p.cmd.Environ(), p.o.env...)

	p.o.watch("start", p)
	if err := p.cmd.Start(); err != nil {
		p.lastErr = err
		p.o.watch("stop", p)
		return err
	}

	if err := p.cmd.Wait(); err != nil {
		p.lastErr = err
		p.o.watch("stop", p)
		if p.o.retries > 0 && err.Error() != "signal: terminated" && err.Error() != "signal: interrupt" && err.Error() != "signal: killed" {
			r := 0
			if len(retry) > 0 {
				r = retry[0]
			}
			if r < p.o.retries {
				log.Logger(p.ctx).Error("Restarting fork after error in 3s...", zap.Error(err))
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
	defaultLogContext := runtime.WithServiceName(p.ctx, p.o.name)

	logs := regexp.MustCompile("^(?P<log_date>[^\t]+)\t(?P<log_level>[^\t]+)\t(?P<log_name>[^\t]+)\t(?P<log_message>[^\t]+)(\t)?(?P<log_fields>[^\t]*)$")

	// prefix := fmt.Sprintf("%-14s", "["+p.o.name+"]")
	go func() {
		var sb strings.Builder

		for scannerOut.Scan() {
			sb.Reset()
			// sb.WriteString(prefix)
			text := strings.TrimRight(scannerOut.Text(), "\n")
			// merged := false
			if parsed := logs.FindStringSubmatch(text); len(parsed) >= 5 {
				sb.WriteString(text)
				sb.WriteString("\n")

				log.StdOut.WriteString(sb.String())
			} else {
				sb.WriteString(text)

				log.Logger(defaultLogContext).Info(sb.String())
			}
		}
	}()
	scannerErr := bufio.NewScanner(stderr)
	go func() {
		var sb strings.Builder
		for scannerErr.Scan() {
			sb.Reset()
			// sb.WriteString(prefix)

			text := strings.TrimRight(scannerErr.Text(), "\n")
			merged := false
			for _, sName := range p.serviceNames {
				if strings.Contains(text, sName) {
					sb.WriteString(text)
					sb.WriteString("\n")

					log.StdOut.WriteString(sb.String())
					merged = true
					break
				}
			}
			if !merged {
				sb.WriteString(text)

				log.Logger(defaultLogContext).Info(sb.String())
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
