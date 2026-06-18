#!/usr/bin/env bash
set -e


RANDOM_URL=$(curl -s -I https://en.wikipedia.org/wiki/Special:Random | grep -i "location:" | awk '{print $2}' | tr -d '\r')

if [ -z "$RANDOM_URL" ]; then
  RANDOM_URL="https://en.wikipedia.org/wiki/Special:Random"
fi

TODO_CONTENT="Read $RANDOM_URL"
echo "Generated Todo: $TODO_CONTENT"

curl -X POST http://todo-backend-svc:2345/todos \
     -H "Content-Type: application/json" \
     -d "{\"content\": \"$TODO_CONTENT\"}"

echo "Successfully submitted todo to backend."