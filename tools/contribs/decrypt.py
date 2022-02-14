#!/usr/bin/python3
# Copyright (C) 2021, <Raphael.Droz+floss (at) gmail.com>
# Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
#
# Pydio Cells is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Pydio Cells is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
#
# The latest code can be found at <https://pydio.com>.
#
# Decrypt a file encrypted using Pydio-cells, assuming are provided
# - export the encrypted master key as exported by the UI
# - the user-provided password used for encryption during export
# - the per-file encryption key retrieved from the database
# - and the encrypted file.

from Cryptodome.Cipher import AES
import binascii, hashlib, base64, re, os, sys

# See also decryptRead, https://github.com/pydio/cells/blob/fcbbb18c7e1e034ce0958242244bd2e56c02af60/common/crypto/materials.go#L862
# encryptedBlockSize = plainBlockSize + TAG_SIZE
NONCE_SIZE   = 12
TAG_SIZE     = 16
BLOCK_SIZE   = 26
SALT         = bytearray([224, 32, 00, 33, 78, 3, 25, 56, 54, 5, 54, 9, 79, 76, 189, 8])

# Generate an encryption key suitable for AES-GCM from a user-provided UTF-8 password.
# (Used for master key encryption)
# https://github.com/pydio/cells/blob/2c50df5b6b66b5a125b8b563f540a42842651eca/common/crypto/crypto.go#L45
def KeyFromPassword(password, l):
    if len(password) < l:
        # padding
        password = password+chr(l-len(password)%l)*(l-len(password)%l)
    dk = hashlib.pbkdf2_hmac('sha256', bytes(password, 'utf-8'), bytes(SALT), 50000)
    return dk

# Ubiquitously get data :)
def get_that(key):
    # If it's an existing path: open() & read()
    if os.path.exists(os.path.expanduser(key)):
        with open(os.path.expanduser(key), "rb") as f:
            key = f.read() # b64encode(f.read())
    # If that seems like hexa, decode
    if isinstance(key, str) and re.match(r'^[0-9a-f]+$', key, re.IGNORECASE):
        key = binascii.unhexlify(key)
    # if, otherwise, that sounds like base64, decode
    elif isinstance(key, str) and re.match(r'^[a-z0-9/\+\.]+$', key, re.IGNORECASE):
        key = base64.b64decode(key)
    return key

def help():
    # - master key: 80 bytes  from `SELECT key_data from idm_user_keys`
    print("""$ pydio-decrypt <password> <encrypted master key> <file key> <path>
  Output decrypted file.
  * If <path> is omitted, only output the plain-text file-key.
  * If <path> and <file key> are omitted, only output Pydio's instance plaintext master key.

Arguments:
  * password               The per-export, user-provided, password used to encrypt the master key.
  * encrypted master key   Base64 encoded, as exported using Pydio backend.
  * file key               120 hexadecimal characters of the file-key [1]
  * path                   Path of the encrypted file as retrieved directly from the datasource [2]

[1] To retrieve the file-key, use:
`SELECT hex(key_data), block_header_size, block_data_size FROM enc_node_keys NATURAL JOIN data_meta NATURAL JOIN enc_node_blocks WHERE data = '"<file>"';`
[2] For a Swift+S3 backend: `openstack object save pydio foo.doc`
""")

if len(sys.argv) < 3:
    help()
    sys.exit()

# PASSWORD
master_key_password = sys.argv[1]
paddedPassword = KeyFromPassword(master_key_password, 32)

# MASTER KEY
enc_master_key = getThat(sys.argv[2])
nonce, enc_master_key = enc_master_key[:NONCE_SIZE], enc_master_key[NONCE_SIZE:]
tag, enc_master_key = enc_master_key[-TAG_SIZE:], enc_master_key[:-TAG_SIZE]

cipher = AES.new(paddedPassword, AES.MODE_GCM, nonce)
try:
    master_key = cipher.decrypt_and_verify(enc_master_key, tag)
except ValueError as e:
    print(str(e) + ": Can't decrypt that master key using that password")
    sys.exit(1)

if len(sys.argv) == 3:
    sys.stdout.buffer.write(master_key)
    sys.exit(0)

# FILE KEY
encrypted_file_key = getThat(sys.argv[3])
# Decrypt the file key using the master key
# https://github.com/pydio/cells/blob/53a979fa0626bd3b43273a77eba14e38bac23007/idm/key/tools.go#L92
file_key_nonce, encrypted_file_key = encrypted_file_key[:NONCE_SIZE], encrypted_file_key[NONCE_SIZE:]
tag, encrypted_file_key = encrypted_file_key[-TAG_SIZE:], encrypted_file_key[:-TAG_SIZE]
cipher = AES.new(master_key, AES.MODE_GCM, nonce = file_key_nonce)
try:
    file_key = cipher.decrypt_and_verify(encrypted_file_key, tag)
except ValueError as e:
    print(str(e) + ": Can't decrypt that file key using that master key")
    sys.exit(1)

if len(sys.argv) == 4:
    sys.stdout.buffer.write(file_key)
    sys.exit(0)

# FILE
data = get_that(sys.argv[4])
header = data[:BLOCK_SIZE]
nonce = header[:NONCE_SIZE] # nonce = data[:NONCE_SIZE]
tag = data[-TAG_SIZE:]
data = data[BLOCK_SIZE:-TAG_SIZE]
cipher = AES.new(file_key, AES.MODE_GCM, nonce)
try:
    content = cipher.decrypt_and_verify(data, tag).decode('utf-8')
except ValueError as e:
    print(str(e) + ": Can't decrypt that file using that file key")
    sys.exit(1)

print(content)
