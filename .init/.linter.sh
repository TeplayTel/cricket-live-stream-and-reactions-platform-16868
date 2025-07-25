#!/bin/bash
cd /home/kavia/workspace/code-generation/cricket-live-stream-and-reactions-platform-16868/ott_frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

