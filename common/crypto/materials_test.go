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

package crypto

import (
	"bytes"
	"crypto/rand"
	"io"
	"log"
	"os"
	"path/filepath"
	"testing"

	"github.com/pydio/cells/v4/common/proto/encryption"
	. "github.com/smartystreets/goconvey/convey"
)

func TestOption_Write_Read(t *testing.T) {
	Convey("Header Option", t, func() {
		op1 := new(EncryptedBlockHeaderOption)
		op1.id = optionKey
		op1.value = make([]byte, 12)
		_, _ = rand.Read(op1.value)
		op1.SetIsTheLast(true)

		bb := &bytes.Buffer{}

		written, err := op1.Write(bb)
		So(err, ShouldBeNil)

		op2 := new(EncryptedBlockHeaderOption)
		read, err := op2.Read(bb)
		So(err, ShouldBeNil)

		So(written, ShouldEqual, read)
		So(string(op1.GetID()), ShouldEqual, string(op2.GetID()))
		So(string(op1.GetValue()), ShouldEqual, string(op2.GetValue()))
		So(op1.IsTheLast(), ShouldEqual, op2.IsTheLast())
	})
}

func TestOptions_Write_Read(t *testing.T) {
	Convey("Header Options List", t, func() {

		opts := new(Options)

		opts.Key = make([]byte, 32)
		_, _ = rand.Read(opts.Key)
		opts.UserId = "cells-test"
		opts.PartId = 2
		opts.Position = 1

		bb := &bytes.Buffer{}

		written, err := opts.Write(bb)
		So(err, ShouldBeNil)

		opts2 := new(Options)
		read, err := opts2.Read(bb)
		So(err, ShouldBeNil)

		So(written, ShouldEqual, read)
		So(string(opts.Key), ShouldEqual, string(opts2.Key))
		So(opts.UserId, ShouldEqual, opts2.UserId)
		So(opts.Position, ShouldEqual, opts2.Position)
		So(opts.PartId, ShouldEqual, opts2.PartId)
	})
}

func TestEncryptedBlockHeader_Write_Read(t *testing.T) {
	Convey("Header", t, func() {
		h1 := new(EncryptedBlockHeader)
		h1.Options = new(Options)
		h1.Options.Key = make([]byte, 32)
		_, _ = rand.Read(h1.Options.Key)
		h1.Options.UserId = "cells-test"
		h1.Options.PartId = 0
		h1.Options.Position = 0
		h1.Nonce = make([]byte, 12)
		_, _ = rand.Read(h1.Nonce)

		bb := &bytes.Buffer{}

		written, err := h1.Write(bb)
		So(err, ShouldBeNil)

		h2 := new(EncryptedBlockHeader)
		read, err := h2.Read(bb)
		So(err, ShouldBeNil)

		So(written, ShouldEqual, read)
		So(h1.GetDataLength(), ShouldEqual, h2.GetDataLength())
		So(string(h1.Nonce), ShouldEqual, string(h2.Nonce))
		So(string(h1.Options.Key), ShouldEqual, string(h2.Options.Key))
		So(string(h1.Options.UserId), ShouldEqual, string(h2.Options.UserId))
		So(h1.Options.PartId, ShouldEqual, h2.Options.PartId)
		So(h1.Options.Position, ShouldEqual, h2.Options.Position)
	})
}

func TestEncryptedBlock_Write_Read(t *testing.T) {
	Convey("Header", t, func() {
		b1 := new(EncryptedBlock)

		h1 := new(EncryptedBlockHeader)
		h1.Options = new(Options)
		h1.Options.Key = make([]byte, 32)
		_, _ = rand.Read(h1.Options.Key)
		h1.Options.UserId = "cells-test"
		h1.Options.PartId = 0
		h1.Options.Position = 0
		h1.Nonce = make([]byte, 12)
		_, _ = rand.Read(h1.Nonce)

		payload := make([]byte, 1024)
		_, _ = rand.Read(payload)
		err := b1.SetPayload(payload)
		So(err, ShouldBeNil)
		b1.Header = h1
		err = b1.SetPayload(payload)
		err = b1.SetPayload(payload)

		log.Println(b1.Header.String())
		bb := &bytes.Buffer{}
		written, err := b1.Write(bb)
		So(err, ShouldBeNil)

		b2 := new(EncryptedBlock)
		read, err := b2.Read(bb)
		log.Println(b2.Header.String())
		So(err, ShouldBeNil)

		So(written, ShouldEqual, read)
		So(b1.Header.GetDataLength(), ShouldEqual, b2.Header.GetDataLength())
		So(string(b1.Payload), ShouldEqual, string(b2.Payload))
		So(string(b1.Header.Nonce), ShouldEqual, string(b2.Header.Nonce))
		So(string(b1.Header.Options.Key), ShouldEqual, string(b2.Header.Options.Key))
		So(string(b1.Header.Options.UserId), ShouldEqual, string(b2.Header.Options.UserId))
		So(b1.Header.Options.PartId, ShouldEqual, b2.Header.Options.PartId)
		So(b1.Header.Options.Position, ShouldEqual, b2.Header.Options.Position)
	})
}

var plainFileContent = `
[32] Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta 
sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia
consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui 
dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi 
tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? 
Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur
, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? [33] At vero eos et accusamus et iusto
odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et
quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia 
deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita 
distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id
, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. 
Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et 
voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente 
delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores
repellat. »

Traduction (source : corrigeur.fr [archive]) :
« Pour vous faire mieux connaitre d’où vient l’erreur de ceux qui blâment la volupté, et qui louent en 
quelque sorte la douleur, je vais entrer dans une explication plus étendue, et vous faire voir tout ce 
qui a été dit là-dessus par l’inventeur de la vérité, et, pour ainsi dire, par l’architecte de la vie 
heureuse.
Personne [dit Épicure] ne craint ni ne fuit la volupté en tant que volupté, mais en tant qu’elle attire 
de grandes douleurs à ceux qui ne savent pas en faire un usage modéré et raisonnable ; et personne 
n’aime ni ne recherche la douleur comme douleur, mais parce qu’il arrive quelquefois que, par le travail
et par la peine, on parvienne à jouir d’une grande volupté. En effet, pour descendre jusqu’aux petites 
choses, qui de vous ne fait point quelque exercice pénible pour en retirer quelque sorte d’utilité ? Et 
qui pourrait justement blâmer, ou celui qui rechercherait une volupté qui ne pourrait être suivie de rien
de fâcheux, ou celui qui éviterait une douleur dont il ne pourrait espérer aucun plaisir.
Au contraire, nous blâmons avec raison et nous croyons dignes de mépris et de haine ceux qui, se 
laissant corrompre par les attraits d’une volupté présente, ne prévoient pas à combien de maux et de 
chagrins une passion aveugle les peut exposer. J’en dis autant de ceux qui, par mollesse d’esprit, 
c’est-à-dire par la crainte de la peine et de la douleur, manquent aux devoirs de la vie. Et il est très
facile de rendre raison de ce que j’avance. Car, lorsque nous sommes tout à fait libres, et que rien ne 
nous empêche de faire ce qui peut nous donner le plus de plaisir, nous pouvons nous livrer entièrement 
à la volupté et chasser toute sorte de douleur ; mais, dans les temps destinés aux devoirs de la société
ou à la nécessité des affaires, souvent il faut faire divorce avec la volupté, et ne se point refuser à 
la peine. La règle que suit en cela un homme sage, c’est de renoncer à de légères voluptés pour en avoir
de plus grandes, et de savoir supporter des douleurs légères pour en éviter de plus fâcheuses. »
`

func Test_AESGCMEncryptionMaterials(t *testing.T) {
	tmpDir := os.TempDir()

	testDir := filepath.Join(tmpDir, "cells", "tests", "materials")

	_ = os.RemoveAll(testDir)

	err := os.MkdirAll(testDir, os.ModePerm)
	if err != nil {
		t.Fatal("failed to create test dir", err)
	}

	plainFilename := filepath.Join(testDir, "plain.txt")
	encryptedFilename := filepath.Join(testDir, "encrypted.txt")
	decryptedFilename := filepath.Join(testDir, "decrypted.txt")

	err = os.WriteFile(plainFilename, []byte(plainFileContent), os.ModePerm)
	if err != nil {
		t.Fatal("failed to initialize test", err)
	}

	key := make([]byte, 32)
	_, _ = rand.Read(key)

	defaultBlockSize = 4 * 1024
	ni := &encryption.NodeInfo{
		Node: &encryption.Node{
			NodeId: "test",
			Legacy: false,
		},
		NodeKey: &encryption.NodeKey{
			KeyData: key,
			OwnerId: "cells",
			UserId:  "cells",
			NodeId:  "test",
		},
	}

	Convey("Encrypt file", t, func() {
		input, err := os.Open(plainFilename)
		So(err, ShouldBeNil)
		defer input.Close()

		materials := NewAESGCMMaterials(ni, nil)
		err = materials.SetupEncryptMode(ni.NodeKey.KeyData, input)
		So(err, ShouldBeNil)

		encryptedData, err := io.ReadAll(materials)
		So(err == nil || err == io.EOF, ShouldEqual, true)

		err = os.WriteFile(encryptedFilename, encryptedData, os.ModePerm)
		So(err, ShouldBeNil)
	})

	Convey("Decrypt", t, func() {
		input, err := os.Open(encryptedFilename)
		So(err, ShouldBeNil)
		defer input.Close()

		materials := NewAESGCMMaterials(ni, nil)
		err = materials.SetupDecryptMode(ni.NodeKey.KeyData, input)
		So(err, ShouldBeNil)

		decryptedData, err := io.ReadAll(materials)
		So(err, ShouldBeNil)

		err = os.WriteFile(decryptedFilename, decryptedData, os.ModePerm)
		So(err, ShouldBeNil)

	})
}
