/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
package proc

import (
	"context"
	"errors"
	"testing"

	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

func TestPostProcess(t *testing.T) {
	process := func(cb func() error) (merger.Patch, bool) {
		patch := merger.NewPatch(memory.NewMemDB(), memory.NewMemDB(), merger.PatchOptions{})
		done := make(chan interface{}, 1)
		patch.SetupChannels(nil, done, nil)
		ran := false
		patch.PostProcess(func() error {
			ran = true
			if len(done) > 0 {
				t.Error("PostProcess must run before the patch is Done")
			}
			return cb()
		})
		NewProcessor(context.Background()).Process(patch, model.NewCommand())
		<-done
		return patch, ran
	}

	t.Run("callbacks run once the patch is processed", func(t *testing.T) {
		patch, ran := process(func() error { return nil })
		if !ran {
			t.Fatal("PostProcess callback was not called")
		}
		if _, has := patch.HasErrors(); has {
			t.Fatal("unexpected patch error")
		}
	})

	t.Run("a callback error is set as the patch error", func(t *testing.T) {
		patch, _ := process(func() error { return errors.New("capture failed") })
		if _, has := patch.HasErrors(); !has {
			t.Fatal("the callback error should be reported on the patch")
		}
	})
}
