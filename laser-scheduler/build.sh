#!/bin/bash
docker build -t localhost:32000/laser-scheduler .
docker push localhost:32000/laser-scheduler
