FROM alpine:3.18

RUN apk add --no-cache bash curl

WORKDIR /app

COPY script.sh .
RUN chmod +x script.sh

CMD ["./script.sh"]