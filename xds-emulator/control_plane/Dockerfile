FROM golang:1.23 as builder

WORKDIR /app

COPY . .

ENV CGO_ENABLED=0

RUN go build -o control_plane control_plane.go

FROM gcr.io/distroless/base-debian11

COPY --from=builder /app/control_plane /control_plane

EXPOSE 18000

CMD ["/control_plane"]
