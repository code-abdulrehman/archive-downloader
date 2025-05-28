#!/bin/bash

# Check if the downloads directory exists, if not, create it
mkdir -p downloads

# Loop through all arguments (URLs) and download each using curl
for url in "$@"
do
  echo "Downloading $url"
  curl -O "$url" --output-dir "downloads"
done
