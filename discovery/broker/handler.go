package broker

import (
	"context"

	"go.uber.org/zap"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common/log"
	pb "github.com/pydio/cells/common/proto/broker"
)

type Broker struct{}

func (h *Broker) Publish(ctx context.Context, req *pb.PublishRequest, rsp *pb.Empty) error {
	// validate the request
	if req.Message == nil {
		return errors.BadRequest("broker.Broker.Publish", "Missing message")
	}

	// ensure the header is not nil
	if req.Message.Header == nil {
		req.Message.Header = map[string]string{}
	}

	// set any headers which aren't already set
	if md, ok := metadata.FromContext(ctx); ok {
		for k, v := range md {
			if _, ok := req.Message.Header[k]; !ok {
				req.Message.Header[k] = v
			}
		}
	}

	log.Debug("Publishing message to topic", zap.String("topic", req.Topic))
	err := broker.Publish(req.Topic, &broker.Message{
		Header: req.Message.Header,
		Body:   req.Message.Body,
	})
	log.Debug("Published message to topic", zap.String("topic", req.Topic))
	if err != nil {
		return errors.InternalServerError("broker.Broker.Publish", err.Error())
	}
	return nil
}

func (h *Broker) Subscribe(ctx context.Context, req *pb.SubscribeRequest, stream pb.Broker_SubscribeStream) error {

	errChan := make(chan error, 1)

	// message Broker to stream back messages from broker
	Broker := func(p broker.Publication) error {
		m := p.Message()

		if err := stream.Send(&pb.Message{
			Header: m.Header,
			Body:   m.Body,
		}); err != nil {
			select {
			case errChan <- err:
				return err
			default:
				return err
			}
		}
		return nil
	}

	log.Debug("Subscribing to topic", zap.String("topic", req.Topic))
	sub, err := broker.Subscribe(req.Topic, Broker, broker.Queue(req.Queue))
	if err != nil {
		return errors.InternalServerError("broker.Broker.Subscribe", err.Error())
	}
	defer func() {
		log.Debug("Unsubscribing from topic", zap.String("topic", req.Topic))
		sub.Unsubscribe()
	}()

	select {
	case <-ctx.Done():
		log.Debug("Context done for subscription to topic %s", zap.String("topic", req.Topic))
		return nil
	case err := <-errChan:
		log.Debug("Subscription error for topic", zap.String("topic", req.Topic), zap.Error(err))
		return err
	}
}
