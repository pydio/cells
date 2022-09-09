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
	"bytes"
	"context"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/nodes/objects/mock"
	"github.com/pydio/cells/v4/common/sync/model"
)

func NewS3Mock(bucketName ...string) *Client {
	bName := "bucket"
	if len(bucketName) > 0 {
		bName = bucketName[0]
	}
	mn := mock.New("cell1", "cell2", "cell3", "other", bName)
	mn.FakeTags = map[string]map[string]string{
		"cell1": {
			"TagName":      "TagValue",
			"OtherTagName": "OtherTagValue",
		},
	}
	ct := context.Background()
	_, _ = mn.PutObject(ct, bName, "file", bytes.NewBufferString(""), 0, models.PutMeta{UserMetadata: map[string]string{"eTag": "filemd5"}})
	_, _ = mn.PutObject(ct, bName, "folder/.pydio", bytes.NewBufferString(""), 0, models.PutMeta{})
	client := &Client{
		Oc:            mn,
		globalContext: context.Background(),
		Bucket:        bName,
		RootPath:      "",
		options:       model.EndpointOptions{BrowseOnly: true},
	}
	return client
}
