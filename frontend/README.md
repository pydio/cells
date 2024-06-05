# Frontend-related Services

This folder contains services required to serve the web interface. It is composed of the following services:

## pydio.web.statics

This is a simple HTTP server for accessing to the basic resources like the interface index, serving the front plugins contents, and handling some specific URLs.

See web/plugins.go

## pydio.grpc.frontend

Provides a couple of frontend-specific REST APIs that are used only by the frontend clients.  It has the particularity to implement a Web Session mechanism (using a CookieStore).

See rest/plugins.go
