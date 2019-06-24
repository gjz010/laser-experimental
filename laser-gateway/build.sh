#!/bin/bash
COMPONENT=laser-gateway
docker build -t localhost:32000/$COMPONENT .
docker tag localhost:32000/$COMPONENT localhost:32000/$COMPONENT:stable
docker push localhost:32000/$COMPONENT
docker push localhost:32000/$COMPONENT:stable

