import { gql } from '@apollo/client';

// GetDataSource
export const GET_DATASOURCE = gql`
  query listDataSource($projectID: String!) {
    listDataSource(projectID: $projectID) {
      dsID
      dsName
      dsType
      dsURL
      accessType
      authType
      basicAuthUsername
      basicAuthPassword
      scrapeInterval
      queryTimeout
      httpMethod
      projectID
      healthStatus
      createdAt
      updatedAt
    }
  }
`;

export const GET_DATASOURCE_OVERVIEW = gql`
  query listDataSource($projectID: String!) {
    listDataSource(projectID: $projectID) {
      dsID
    }
  }
`;

// portalDashboardData
export const GET_PORTAL_DASHBOARDS = gql`
  query listPortalDashboardData($projectID: String!, $hubName: String!) {
    listPortalDashboardData(projectID: $projectID, hubName: $hubName) {
      name
      dashboardData
    }
  }
`;

// listDashboard
export const GET_DASHBOARD = gql`
  query listDashboard($projectID: String!, $clusterID: String, $dbID: String) {
    listDashboard(projectID: $projectID, clusterID: $clusterID, dbID: $dbID) {
      dbID
      dsID
      dbName
      clusterName
      dsName
      dsType
      dsURL
      dsHealthStatus
      dbTypeID
      dbTypeName
      dbInformation
      chaosEventQueryTemplate
      chaosVerdictQueryTemplate
      applicationMetadataMap {
        namespace
        applications {
          kind
          names
        }
      }
      panelGroups {
        panels {
          panelID
          createdAt
          promQueries {
            queryID
            promQueryName
            legend
            resolution
            minstep
            line
            closeArea
          }
          panelOptions {
            points
            grIDs
            leftAxis
          }
          panelName
          yAxisLeft
          yAxisRight
          xAxisDown
          unit
        }
        panelGroupName
        panelGroupID
      }
      endTime
      startTime
      refreshRate
      projectID
      clusterID
      viewedAt
    }
  }
`;

export const GET_DASHBOARD_OVERVIEW = gql`
  query listDashboard($projectID: String!, $clusterID: String, $dbID: String) {
    listDashboard(projectID: $projectID, clusterID: $clusterID, dbID: $dbID) {
      dbID
      dbName
      dbTypeID
      dbTypeName
      clusterName
      clusterID
      viewedAt
      dbInformation
      chaosEventQueryTemplate
      chaosVerdictQueryTemplate
      applicationMetadataMap {
        namespace
        applications {
          kind
          names
        }
      }
      panelGroups {
        panels {
          panelID
          createdAt
          promQueries {
            queryID
            promQueryName
            legend
            resolution
            minstep
            line
            closeArea
          }
          panelOptions {
            points
            grIDs
            leftAxis
          }
          panelName
          yAxisLeft
          yAxisRight
          xAxisDown
          unit
        }
        panelGroupName
        panelGroupID
      }
    }
  }
`;

// getPromQuery
export const PROM_QUERY = gql`
  query PrometheusQuery($request: PrometheusDataRequest!) {
    getPrometheusData(request: $request) {
      metricsResponse {
        queryID
        legends
        tsvs {
          date
          value
        }
      }
      annotationsResponse {
        queryID
        legends
        tsvs {
          date
          value
        }
      }
    }
  }
`;

// getPromLabelNamesAndValues
export const PROM_LABEL_VALUES = gql`
  query PrometheusLabelValues($request: PromSeriesInput) {
    getPromLabelNamesAndValues(request: $request) {
      series
      labelValues {
        label
        values {
          name
        }
      }
    }
  }
`;

// getPromSeriesList
export const PROM_SERIES_LIST = gql`
  query getPromSeriesList($request: DsDetails) {
    getPromSeriesList(request: $request) {
      seriesList
    }
  }
`;
