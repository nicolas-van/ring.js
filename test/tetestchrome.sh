#!/bin/sh

cd ..
python -m SimpleHTTPServer &
google-chrome localhost:8000/test/tetest.html
