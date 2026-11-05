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

package s3

import (
	"context"
	"errors"
	"testing"

	"github.com/pydio/cells/v5/common/sync/model"
)

func TestWriterReportsUploadErrors(t *testing.T) {
	for i := 0; i < 100; i++ {
		c, st := newPrefixClient("")
		st.putErr = errors.New("503 slow down")
		w, done, errs, e := c.GetWriterOn(context.Background(), "a", 5, nil)
		if e != nil {
			t.Fatal(e)
		}
		_, _ = w.Write([]byte("hello"))
		_ = w.Close()
		if e := model.WaitWriteResult(context.Background(), done, errs); e == nil {
			t.Fatalf("iteration %d: the upload error should be reported", i)
		}
	}
}
