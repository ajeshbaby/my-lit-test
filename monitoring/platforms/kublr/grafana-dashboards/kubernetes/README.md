# Node and Pod K8s metrics dashboard

This dashboard visualizes Node and Pod level CPU and memory utilization metrics interleaved with chaos events. 


## Prerequisites 

- Kublr's central monitoring with Prometheus enabled for litmus and node exporter metrics.

- Chaos engine name must match the labels used in PromQL for the grafana dashboard.


## Instructions

- Download the dashboard json file.

- Import the json file into grafana.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Change data source for the dashboard accordingly.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/data-source-config.png?raw=true)

- Tune the PromQL queries to match the labels with engine name and other parameters as per need.


## Screenshot

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Node-and-Pod-metrics-Dashboard.png?raw=true)