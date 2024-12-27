# Start with a basic Go image
FROM golang:1.23.2 as builder

# Set up working directory
WORKDIR /app

# Copy the source code
COPY . .

ENV CGO_ENABLED=0

# Build the gRPC server
RUN go build -o server_a server_a.go
RUN go build -o server_b server_b.go

# Set up runtime image
FROM gcr.io/distroless/base-debian11

COPY --from=builder /app/server_a /server_a
COPY --from=builder /app/server_b /server_b

# Expose the ports
EXPOSE 50051 50052

# Start the service
CMD ["/server_a"]
# or "/server_b" depending on which server you're setting up
