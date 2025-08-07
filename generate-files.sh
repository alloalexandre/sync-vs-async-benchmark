#!/bin/bash

echo "Generating 100 random 5MB files in ./data/"

mkdir -p data

for i in $(seq -w 1 100); do
  yes "The quick brown fox jumps over the lazy dog." | head -n 150000 > data/file_$i.txt
done

echo "Done."
