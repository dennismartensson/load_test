#!/bin/bash
echo "Runing load test on:" $1 " with " $2 " connections and " $3 " processes"

COUNTER=0
LOADTESTPATH="/Users/dennis/developing/hacker_school/socketstream/load_test"

rm $LOADTESTPATH/data.ph
rm $LOADTESTPATH/finichetInstances.ph
while [  $COUNTER -lt $3 ]; do
             phantomjs $LOADTESTPATH/ph.js $1 $2 $3 $COUNTER $LOADTESTPATH&
             let COUNTER=COUNTER+1 
         done
         wait
         node $LOADTESTPATH/createLog.js
         open $LOADTESTPATH/charting.html
         killall -9 phantomjs  