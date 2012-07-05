#!/bin/bash
echo "Runing load test on:" $1 " with " $2 " connections and " $3 " clients"

COUNTER=0
rm data.ph
rm finichetInstances.ph
while [  $COUNTER -lt $3 ]; do
             phantomjs ph.js $1 $2 $3 &
             let COUNTER=COUNTER+1 
         done
         wait
         node createLog.js
         open charting.html
         killall -9 phantomjs  