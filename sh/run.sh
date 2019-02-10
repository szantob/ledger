#!/bin/bash -e

#Start influxdb
service influxdb start

#Start grafana
service grafana-server start

#Start Node.js
cd node
npm start

#Wait for input
read -p "Paused"
