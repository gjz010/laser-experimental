#!/bin/bash
echo "Fetching function from upstream server..."
curl ${IMAGE_URL} | tar -C /mod -xz
echo "Fetch success."