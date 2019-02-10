FROM node:8
WORKDIR /usr/src/ledger
ENV DEBIAN_FRONTEND noninteractive

USER root
#Install dependencies
RUN apt-get update; apt-get install -y -qq apt-utils wget curl dialog jq adduser libfontconfig
#Install Grafana
RUN wget -q https://dl.grafana.com/oss/release/grafana_5.4.2_amd64.deb; dpkg -i grafana_5.4.2_amd64.deb; rm grafana_5.4.2_amd64.deb;
#Install InfluxDB
RUN wget -q https://dl.influxdata.com/influxdb/releases/influxdb_1.7.2_amd64.deb; dpkg -i influxdb_1.7.2_amd64.deb; rm influxdb_1.7.2_amd64.deb;

#Expose ports
EXPOSE 8080
EXPOSE 3000

COPY ./sh/setup.sh ./
COPY ./sh/run.sh ./
COPY ./grafana/* ./
#Run setup.sh
#RUN ./setup.sh
RUN rm ./setup.sh;

#Setup NodeJs
COPY ./node ./node
WORKDIR /usr/src/ledger/node
RUN npm install;

#Start container
WORKDIR /usr/src/ledger
CMD ./run.sh
