# Build stage
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Run stage — small final image, no Go toolchain included
FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/server .
EXPOSE 8080
CMD ["./server"]