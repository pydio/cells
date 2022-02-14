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

package mailer

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"strings"

	bolt "go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

const (
	// MaxSendRetries defines number of retries in case of connection failure.
	MaxSendRetries = 5
)

// BOLT DAO MANAGEMENT
var (
	bucketName = []byte("MailerQueue")
)

// BoltQueue defines a queue for the mails backed by a Bolt DB.
type BoltQueue struct {
	boltdb.DAO
}

func (b *BoltQueue) Init(cfg configx.Values) error {
	return b.DB().Update(func(tx *bolt.Tx) error {
		_, e := tx.CreateBucketIfNotExists(bucketName)
		return e
	})
}

// Close closes the DB and delete corresponding file if deleteOnClose flag as been set on creation.
func (b *BoltQueue) Close() error {
	return b.CloseConn()
}

// Push acquires the lock and add a mail to be sent in the queue.
func (b *BoltQueue) Push(email *mailer.Mail) error {

	return b.DB().Update(func(tx *bolt.Tx) error {
		// Retrieve the bucket.
		b := tx.Bucket([]byte("MailerQueue"))

		// Generate ID for this mail.
		id, _ := b.NextSequence()
		currId := int(id)

		// Marshal mail data into bytes.
		buf, err := json.Marshal(email)
		if err != nil {
			return err
		}

		// Persist bytes to MailerQueue bucket.
		return b.Put(itob(currId), buf)
	})
}

// Consume acquires the lock and send mails that are in the queue by batches,
// sending at most 100 mails by batch.
func (b *BoltQueue) Consume(sendHandler func(email *mailer.Mail) error) error {

	var output error

	b.DB().Update(func(tx *bolt.Tx) error {

		b := tx.Bucket([]byte("MailerQueue"))
		c := b.Cursor()
		var errStack []string
		// Launch by batch
		i := 0
		for k, v := c.First(); k != nil; k, v = c.Next() {

			// Unmarshal mail
			em := mailer.Mail{}
			err := json.Unmarshal(v, &em)
			if err != nil {
				errStack = append(errStack, err.Error())
				c.Delete()
				continue
			}

			// Stream mail
			if err = sendHandler(&em); err != nil {
				tos := getTos(&em)
				if em.Retries <= MaxSendRetries {
					// Update number of tries and re-put mail in the queue.
					em.Retries++
					em.SendErrors = append(em.SendErrors, err.Error())
					marsh, _ := json.Marshal(&em)
					b.Put(k, marsh)
					errStack = append(errStack, fmt.Sprintf("cannot send email to [%s], cause: %s", tos, err.Error()))
					continue
				} else {
					errStack = append(errStack, fmt.Sprintf("max number of retries reached for recipient [%s], cause: %s", tos, err.Error()))
				}
			}

			// Remove message
			if err = c.Delete(); err != nil {
				errStack = append(errStack, err.Error())
				continue
			}

			if i > 100 {
				break
			}
			i++
		}
		if len(errStack) > 0 {
			output = fmt.Errorf("batch sent %d mails and failed %d times, errors were: %s", i, len(errStack), strings.Join(errStack, ", "))
		}
		return nil
	})
	return output
}

// itob returns an 8-byte big endian representation of v.
func itob(v int) []byte {
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(v))
	return b
}

func getTos(em *mailer.Mail) string {
	var buffer bytes.Buffer
	for _, to := range em.GetTo() {
		buffer.WriteString(to.Address)
		buffer.WriteString(", ")
	}
	tos := buffer.String()
	if len(tos) > 1 {
		tos = strings.TrimSuffix(tos, ", ")
	}
	return tos
}
