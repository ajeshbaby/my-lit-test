import { useQuery } from '@apollo/client';
import { Paper, Typography, useTheme } from '@material-ui/core';
import { RadialChart, RadialChartMetric } from 'litmus-ui';
import React from 'react';
import Loader from '../../../../components/Loader';
import Center from '../../../../containers/layouts/Center';
import { GET_WORKFLOW_RUNS_STATS } from '../../../../graphql';
import {
  WorkflowRunStatsRequest,
  WorkflowRunStatsResponse,
} from '../../../../models/graphql/workflowData';
import { getProjectID } from '../../../../utils/getSearchParams';
import ScheduleAndRunStats from './ScheduleAndRunStats';
import useStyles from './styles';

const WorkflowGraphs: React.FC = () => {
  const classes = useStyles();

  const theme = useTheme();

  const projectID = getProjectID();

  const { data, loading } = useQuery<
    WorkflowRunStatsResponse,
    WorkflowRunStatsRequest
  >(GET_WORKFLOW_RUNS_STATS, {
    variables: {
      workflowRunStatsRequest: {
        projectID,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const graphData: RadialChartMetric[] = [
    {
      value: data?.getWorkflowRunStats.succeededWorkflowRuns ?? 0,
      label: 'Succeeded',
      baseColor: theme.palette.status.workflow.completed,
    },
    {
      value: data?.getWorkflowRunStats.failedWorkflowRuns ?? 0,
      label: 'Failed',
      baseColor: theme.palette.status.workflow.failed,
    },
    {
      value: data?.getWorkflowRunStats.runningWorkflowRuns ?? 0,
      label: 'Running',
      baseColor: theme.palette.status.workflow.running,
    },
  ];
  return (
    <div className={classes.root}>
      <div className={classes.graphs}>
        <ScheduleAndRunStats />
        <Paper elevation={0} className={classes.radialChartContainer}>
          <Typography className={classes.radialChartContainerHeading}>
            Chaos Scenario Run stats
          </Typography>
          <div className={classes.radialChart}>
            {loading ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <RadialChart
                radialData={graphData}
                legendTableHeight={140}
                heading={
                  data?.getWorkflowRunStats.totalWorkflowRuns !== 1
                    ? 'Runs'
                    : 'Run'
                }
                showCenterHeading
              />
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default WorkflowGraphs;
