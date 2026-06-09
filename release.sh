#!/bin/bash
# usage: ./release.sh 1.1 "log output"

TAG=$1
MSG=$2

git add .
git commit -m "$TAG $MSG"
git tag $TAG
git push && git push --tags

echo "Released $TAG"