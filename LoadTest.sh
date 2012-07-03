#!/bin/bash
echo "Runing load test on:" $1 " with " $2 " connections and " $3 " clients"

COUNTER=0

while [  $COUNTER -lt $3 ]; do
             phantomjs ph.js $1 $2 &
             let COUNTER=COUNTER+1 
         done
         wait