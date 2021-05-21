package server

import (
	server "github.com/micro/go-micro/server"
)

type serverWithStopOnRegisterError struct {
	server.Server
}

func NewServerWithStopOnRegisterError(s server.Server) server.Server {
	return &serverWithStopOnRegisterError{Server: s}
}

func (s *serverWithStopOnRegisterError) Register() error {
	if err := s.Server.Register(); err != nil {
		s.Server.Deregister()
		s.Server.Stop()

		return err
	}

	return nil
}
