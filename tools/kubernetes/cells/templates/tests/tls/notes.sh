# ca
# openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:4096 -subj '/O=Pydio Wire/CN=dev.pydio.local' -keyout ca.key -out ca.crt
# # 
# openssl req -out cells.pydio.local.csr -newkey rsa:2048 -nodes -keyout cells.pydio.local.key -subj "/CN=cells.pydio.local/O=pydio dev"
# openssl x509 -req -sha256 -days 3650 -CA ca.crt -CAkey ca.key -set_serial 0 -in cells.pydio.local.csr -out cells.pydio.local.crt

# openssl req -out prometheus.pydio.local.csr -newkey rsa:2048 -nodes -keyout prometheus.pydio.local.key -subj "/CN=prometheus.pydio.local/O=pydio dev"
# openssl x509 -req -sha256 -days 3650 -CA ca.crt -CAkey ca.key -set_serial 0 -in prometheus.pydio.local.csr -out prometheus.pydio.local.crt

# kubectl create secret generic cells-tls-secret -n cells --from-file=tls.crt=cells.pydio.local.crt --from-file=tls.key=cells.pydio.local.key --from-file=ca.crt=ca.crt