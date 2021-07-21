package auth

type VideoGrant struct {
	// actions on rooms
	RoomCreate bool `json:"roomCreate,omitempty"`
	RoomList   bool `json:"roomList,omitempty"`

	// actions on a particular room
	RoomAdmin bool   `json:"roomAdmin,omitempty"`
	RoomJoin  bool   `json:"roomJoin,omitempty"`
	Room      string `json:"room,omitempty"`

	// permissions within a room, if none of the permissions are set
	// it's interpreted as both are permissible
	CanPublish   bool `json:"canPublish,omitempty"`
	CanSubscribe bool `json:"canSubscribe,omitempty"`

	// used for recording
	Hidden bool `json:"hidden,omitempty"`
}

type ClaimGrants struct {
	Identity string      `json:"-"`
	Video    *VideoGrant `json:"video,omitempty"`
	Metadata string      `json:"metadata,omitempty"`
}
