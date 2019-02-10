#!/bin/bash -e

GRAFANA_DATABASE="db_grafana"
GRAFANA_USER="grafana"
NODEJS_USER="nodejs"

#Generate strong passwords
mkdir keys
PW_INFLUX_GRAFANA=$(date +%s | sha256sum | base64 | head -c 32 ; echo)
PW_INFLUX_NODEJS=$(date +%s | sha256sum | base64 | head -c 32 ; echo)
echo $PW_INFLUX_NODEJS >./keys/.pw_influx_nodejs

mv grafana.ini /etc/grafana/grafana.ini
chmod 644 /etc/grafana/grafana.ini

#Start the services
service influxdb start
service grafana-server start

#Setup influxdb
influx -execute "CREATE DATABASE $GRAFANA_DATABASE"
influx -execute "USE $GRAFANA_DATABASE"
influx -execute "CREATE USER $GRAFANA_USER WITH PASSWORD '$PW_INFLUX_GRAFANA'"
influx -execute "GRANT READ ON $GRAFANA_DATABASE TO $GRAFANA_USER"
influx -execute "CREATE USER $NODEJS_USER WITH PASSWORD '$PW_INFLUX_NODEJS'"
influx -execute "GRANT WRITE ON $GRAFANA_DATABASE TO $NODEJS_USER"

#Wait for Grafana to start
sleep 10s

#Get Grafana API key
#curl -X POST -H "Content-Type:application/json" -d '{"loginOrEmail":"admin","role": "Admin"}' http://admin:admin@localhost:3000/api/orgs/1/users
curl -X POST http://admin:admin@localhost:3000/api/user/using/1
APIKEY=$(curl -X POST -H "Content-Type:application/json" -d '{"name":"apikeycurl","role": "Admin"}' http://admin:admin@localhost:3000/api/auth/keys|jq '.key'|tr -d '"')
echo $APIKEY > ./keys/grafana.key


#Connect Grafana to influxdb
curl -X POST --insecure -H "Authorization: Bearer "$APIKEY -H "Content-Type:application/json" -d '{"name":"InfluxDB","type":"influxdb","access":"proxy","url":"http://localhost:8086","basicAuth":false,"database":"'$GRAFANA_DATABASE'","user":"'$GRAFANA_USER'","password":"'$PW_INFLUX_GRAFANA'"}' http://localhost:3000/api/datasources
