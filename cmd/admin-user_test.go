//go:build integration

package cmd

import (
	"bytes"
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestUserCommands(t *testing.T) {

	Convey("Test User Commands", t, func() {
		testContext := context.Background()
		cmd := RootCmd // Assume this is your Cobra root command

		buf := new(bytes.Buffer)
		cmd.SetOut(buf)
		cmd.SetArgs([]string{"admin", "user", "create", "--username", "cli-user-test", "--password", "cli-user-pass"})

		err := cmd.ExecuteContext(testContext)
		So(err, ShouldBeNil)

		// Check the output in buf
		output := buf.String()
		So(output, ShouldContainSubstring, "output")
	})
}
