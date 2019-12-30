/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cmd

import (
	"context"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	shellActionName = "actions.cmd.shell"
)

type ShellAction struct {
	Client          client.Client
	Router          *views.Router
	CmdBin          string
	CmdParameters   []string
	TemporaryFolder string
	ExitOnError     bool

	// Input via tmp file or via StdIn
	StreamToStdIn      bool
	UseTemporaryFolder bool
	// Output (if any) from tmp file or from StdOut
	OutputNodePlaceHolder string
	StreamFromStdOut      bool
	// Output result
	ResultPlaceHolder string
}

func (c *ShellAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              shellActionName,
		Label:           "Shell Command",
		Category:        actions.ActionCategoryCmd,
		Icon:            "console",
		Description:     "Perform a console command on the underlying server. If applied to a Cells file, data will be temporarily copied on the server file system to be processed.",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (c *ShellAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{{Fields: []forms.Field{
		&forms.FormField{
			Name:        "cmd",
			Type:        forms.ParamString,
			Label:       "Shell Command",
			Description: "Command to be called on server OS",
			Mandatory:   true,
		},
		&forms.FormField{
			Name:        "parameters",
			Type:        forms.ParamString,
			Label:       "Parameters",
			Description: "List of space separated parameters to append to the command",
		},
		&forms.FormField{
			Name:        "inputTempFile",
			Type:        forms.ParamBool,
			Label:       "Use temporary folder",
			Description: "Use a temporary folder to store file before applying command",
		},
	}}}}
}

// Unique identifier
func (c *ShellAction) GetName() string {
	return shellActionName
}

// Pass parameters
func (c *ShellAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.TemporaryFolder = os.TempDir()
	c.Router = views.NewStandardRouter(views.RouterOptions{AdminView: true})

	if command, ok := action.Parameters["cmd"]; ok {
		c.CmdBin = command
	} else {
		return errors.BadRequest(common.SERVICE_JOBS, "Invalid parameters for action Shell")
	}
	c.CmdParameters = strings.Split(action.Parameters["parameters"], " ")
	c.UseTemporaryFolder, _ = strconv.ParseBool(action.Parameters["inputTempFile"])
	return nil
}

// Run the actual action code
func (c *ShellAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	var stdIn io.Reader
	var tempFileIn string

	var outputNode *tree.Node
	var stdOut io.Writer
	var tempFileOut string

	output := input

	// Read Input File
	if c.UseTemporaryFolder || c.StreamToStdIn {

		if len(input.Nodes) == 0 {
			return input.WithIgnore(), nil
		}

		if c.UseTemporaryFolder {

			reader, e := c.Router.GetObject(ctx, input.Nodes[0], &views.GetRequestData{StartOffset: 0, Length: -1})
			if e != nil {
				return input.WithError(e), e
			}
			defer reader.Close()
			// Create tmp file
			file, e := ioutil.TempFile(c.TemporaryFolder, "pydio-cmd-input-")
			if e != nil {
				return input.WithError(e), e
			}
			defer file.Close()
			defer os.Remove(file.Name())
			written, e := io.Copy(file, reader)
			if e != nil {
				return input.WithError(e), e
			}
			if written != input.Nodes[0].Size {
				err := errors.InternalServerError(common.SERVICE_JOBS, "Written number of bytes differ from original node Size, this is weird")
				return input.WithError(err), err
			}
			tempFileIn = file.Name()

		} else {

			reader, e := c.Router.GetObject(ctx, input.Nodes[0], &views.GetRequestData{StartOffset: 0, Length: -1})
			if e != nil {
				return input.WithError(e), e
			}
			defer reader.Close()
			stdIn = reader

		}

	}

	if len(c.OutputNodePlaceHolder) > 0 {

		// TODO: Compute from placeholder pattern
		if len(input.Nodes) != 0 {
			outputNode = &tree.Node{
				Path: input.Nodes[0].Path + ".cmd-output",
			}
		} else {
			outputNode = &tree.Node{
				Path: c.OutputNodePlaceHolder,
			}
		}
		output.Nodes[0] = outputNode

		if c.StreamFromStdOut {

			var pipeR *io.PipeReader
			pipeR, stdOut = io.Pipe()
			go func() {

				_, e := c.Router.PutObject(ctx, outputNode, pipeR, &views.PutRequestData{})
				if e != nil {
					log.Logger(ctx).Error("Error while copying output", zap.Error(e))
				}

			}()

		} else {

			// Create a temporary filename for writing output
			file, e := ioutil.TempFile(c.TemporaryFolder, "pydio-cmd-output-")
			if e != nil {
				return input.WithError(e), e
			}
			tempFileOut = file.Name()
			file.Close()

		}

	}

	params := c.CmdParameters

	if len(tempFileIn) > 0 || len(tempFileOut) > 0 {
		oldNew := []string{}
		if len(tempFileIn) > 0 {
			oldNew = append(oldNew, "PYDIO_INPUT_FILE")
			oldNew = append(oldNew, tempFileIn)
		}
		if len(tempFileOut) > 0 {
			oldNew = append(oldNew, "PYDIO_OUTPUT_FILE")
			oldNew = append(oldNew, tempFileOut)
		}
		replacer := strings.NewReplacer(oldNew...)
		for index, param := range c.CmdParameters {
			params[index] = replacer.Replace(param)
		}
	}

	log.Logger(ctx).Debug("Running command:", zap.String("bin", c.CmdBin), zap.Strings("params", params))

	command := exec.Command(c.CmdBin, params...)

	if stdIn != nil {
		command.Stdin = stdIn
	}

	if stdOut != nil {
		command.Stdout = stdOut
	}
	var exitStatus int
	var cmdError *exec.ExitError

	out, e := command.Output()
	if e != nil {

		if c.ExitOnError {
			return input.WithError(e), e
		}
		// Did the command fail because of an unsuccessful exit code ?
		if exitError, ok := e.(*exec.ExitError); ok {
			cmdError = exitError
			waitStatus := exitError.Sys().(syscall.WaitStatus)
			exitStatus = waitStatus.ExitStatus()
		} else {
			log.Logger(ctx).Error("Error Running command, without exit status", zap.String("bin", c.CmdBin), zap.Strings("params", params), zap.Error(e))
			return input.WithError(e), e
		}

	} else {
		// Command was successful
		waitStatus := command.ProcessState.Sys().(syscall.WaitStatus)
		exitStatus = waitStatus.ExitStatus()
	}

	// DO SOMETHING WITH OUTPUT
	log.Logger(ctx).Debug("Command Output was", zap.ByteString("out", out), zap.Int("exit", exitStatus))

	if exitStatus > 0 && cmdError != nil { // If we are there, error but no ExitOnError => pass the error to next action(s)
		output.AppendOutput(&jobs.ActionOutput{
			Success:     false,
			StringBody:  string(out),
			ErrorString: cmdError.Error(),
		})
		return output, nil
	}

	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: string(out),
	})

	if len(tempFileOut) > 0 {
		// Read back temp file from system
		readFile, e := os.Open(tempFileOut)
		if e == nil {
			defer readFile.Close()
			defer os.Remove(tempFileOut)
			fInfo, _ := readFile.Stat()
			c.Router.PutObject(ctx, outputNode, readFile, &views.PutRequestData{
				Size: fInfo.Size(),
			})
		}
	}

	return output, nil
}
