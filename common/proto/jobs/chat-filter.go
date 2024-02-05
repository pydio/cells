package jobs

import (
	"context"
	"regexp"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/proto/service"
)

func (m *ChatEventFilter) FilterID() string {
	return "ChatEventFilter"
}

func (m *ChatEventFilter) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {
	event := &chat.ChatEvent{}
	if er := anypb.UnmarshalTo(input.Event, event, proto.UnmarshalOptions{}); er != nil {
		return input, input, false
	}
	var bb []bool
	for _, q := range m.Query.SubQueries {
		tQ := &ChatEventFilterQuery{}
		if e := anypb.UnmarshalTo(q, tQ, proto.UnmarshalOptions{}); e == nil {
			bb = append(bb, m.evaluateOne(tQ, event))
		}
	}
	result := service.ReduceQueryBooleans(bb, m.Query.Operation)
	if result {
		return input, nil, true
	} else {
		output := input.Clone()
		input.Event = nil
		return output, input, false
	}
}

func (m *ChatEventFilter) evaluateOne(q *ChatEventFilterQuery, event *chat.ChatEvent) bool {
	if q.EventType != "" {
		return q.EventType == ChatEventName(event)
	}
	if q.RoomUuid != "" {
		if event.Room != nil {
			return event.Room.GetUuid() == q.RoomUuid
		} else if event.Message != nil {
			return event.Message.GetRoomUuid() == q.RoomUuid
		}
		return false
	}
	if q.RoomTypeObject != "" {
		return event.Room != nil && event.Room.RoomTypeObject == q.RoomTypeObject
	}
	if q.RoomLabelRegexp != "" {
		if event.Room == nil {
			return false
		}
		ok, _ := regexp.MatchString(q.RoomLabelRegexp, event.Room.GetRoomLabel())
		return ok
	}
	if q.MessageRegexp != "" {
		if event.Message == nil {
			return false
		}
		ok, _ := regexp.MatchString(q.MessageRegexp, event.Message.GetMessage())
		return ok
	}
	if q.MessageAuthor != "" {
		return event.Message != nil && event.Message.GetAuthor() == q.MessageAuthor
	}
	return false
}
