package service

import micro "github.com/micro/go-micro"

type serviceWithStopOnError struct {
	micro.Service
}

func NewServiceWithStopOnError(s micro.Service) micro.Service {
	return &serviceWithStopOnError{Service: s}
}

func (s *serviceWithStopOnError) Run() error {
	if err := s.Service.Run(); err != nil {

		return err
	}

	return nil
}
