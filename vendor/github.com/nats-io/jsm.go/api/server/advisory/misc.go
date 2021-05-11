package advisory

import "time"

// ServerInfoV1 identifies remote servers.
type ServerInfoV1 struct {
	Name      string    `json:"name"`
	Host      string    `json:"host"`
	ID        string    `json:"id"`
	Cluster   string    `json:"cluster,omitempty"`
	Version   string    `json:"ver"`
	Seq       uint64    `json:"seq"`
	JetStream bool      `json:"jetstream"`
	Time      time.Time `json:"time"`
}

// ClientInfoV1 is detailed information about the client forming a connection.
type ClientInfoV1 struct {
	Start     time.Time     `json:"start,omitempty"`
	Host      string        `json:"host,omitempty"`
	ID        uint64        `json:"id,omitempty"`
	Account   string        `json:"acc"`
	User      string        `json:"user,omitempty"`
	Name      string        `json:"name,omitempty"`
	Lang      string        `json:"lang,omitempty"`
	Version   string        `json:"ver,omitempty"`
	RTT       time.Duration `json:"rtt,omitempty"`
	Server    string        `json:"server,omitempty"`
	Cluster   string        `json:"cluster,omitempty"`
	Stop      time.Time     `json:"stop,omitempty"`
	Jwt       string        `json:"jwt,omitempty"`
	IssuerKey string        `json:"issuer_key,omitempty"`
	NameTag   string        `json:"name_tag,omitempty"`
	Tags      []string      `json:"tags,omitempty"`
}

// DataStatsV1 reports how may msg and bytes. Applicable for both sent and received.
type DataStatsV1 struct {
	Msgs  int64 `json:"msgs"`
	Bytes int64 `json:"bytes"`
}
