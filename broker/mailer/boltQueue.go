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

package mailer

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/boltdb/bolt"

	"github.com/pydio/cells/common/proto/mailer"
)

const (
	MaxSendRetries = 5
)

// BOLT DAO MANAGEMENT
var (
	bucketName = []byte("MailerQueue")
)

type BoltQueue struct {
	// Internal DB
	db *bolt.DB
	// For Testing purpose : delete file after closing
	DeleteOnClose bool
	// Path to the DB file
	DbPath string
}

func NewBoltQueue(fileName string, deleteOnClose ...bool) (*BoltQueue, error) {

	bs := &BoltQueue{
		DbPath: fileName,
	}
	if len(deleteOnClose) > 0 && deleteOnClose[0] {
		bs.DeleteOnClose = true
	}
	options := bolt.DefaultOptions
	options.Timeout = 5 * time.Second
	db, err := bolt.Open(fileName, 0644, options)
	if err != nil {
		return nil, err
	}
	bs.db = db
	e2 := db.Update(func(tx *bolt.Tx) error {
		_, e := tx.CreateBucketIfNotExists(bucketName)
		return e
	})
	return bs, e2

}

func (b *BoltQueue) Close() error {
	err := b.db.Close()
	if b.DeleteOnClose {
		os.Remove(b.DbPath)
	}
	return err
}

func (b *BoltQueue) Push(email *mailer.Mail) error {

	return b.db.Update(func(tx *bolt.Tx) error {
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

func (b *BoltQueue) Consume(mh func(email *mailer.Mail) error) error {

	var output error

	b.db.Update(func(tx *bolt.Tx) error {

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
			if err = mh(&em); err != nil {
				if em.Retries <= MaxSendRetries {
					em.Retries++
					em.SendErrors = append(em.SendErrors, err.Error())
					marsh, _ := json.Marshal(&em)
					b.Put(k, marsh)
					errStack = append(errStack, fmt.Sprintf("error while trying to send email: %s. Will retry next time", err.Error()))
					continue
				} else {
					errStack = append(errStack, fmt.Sprintf("max number of retries have been reached (%s)", err.Error()))
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
			output = fmt.Errorf("consuming queue had %d errors (successfully sent %d), errors were %s", len(errStack), i, strings.Join(errStack, ",\n"))
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
