#!/bin/bash

if [ $# -ne 2 ]; then
  echo "Error: two arguments required"
  echo "Usage: ./deploy.sh <user> <host>"
  exit 1
fi

SOURCE=./
TARGET=$2
USER=$1
DEPL_DIR=/home/$USER/sensorsphereportal/
DEST=$USER@$TARGET:$DEPL_DIR
rsync -avr --exclude-from ./.rsyncignore ./ $DEST
