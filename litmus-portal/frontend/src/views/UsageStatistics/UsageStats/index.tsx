import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import config from '../../../config';
import { GET_GLOBAL_STATS } from '../../../graphql';
import { UsageStatsResponse } from '../../../models/graphql/usage';
import { getToken } from '../../../utils/auth';
import Card from './Cards';
import useStyles from './styles';

interface TimeRange {
  start_time: string;
  end_time: string;
}

const UsageStats: React.FC<TimeRange> = ({ start_time, end_time }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [usageQuery, { loading, data }] =
    useLazyQuery<UsageStatsResponse>(GET_GLOBAL_STATS);

  useEffect(() => {
    usageQuery({
      variables: {
        request: {
          dateRange: {
            startDate: start_time,
            endDate: end_time,
          },
        },
      },
    });
  }, [start_time, end_time]);

  const [projectCount, setProjectCount] = React.useState<number>(0);
  const [userCount, setUserCount] = React.useState<number>(0);

  const getProjectStats = () => {
    fetch(`${config.auth.url}/get_projects_stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else if (data.data) {
          setProjectCount(data.data.length);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchUsers = () => {
    fetch(`${config.auth.url}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        setUserCount(res?.length);
      })

      .catch((err) => {
        console.error(err);
      });
  };

  React.useEffect(() => {
    getProjectStats();
    fetchUsers();
  }, []);
  return (
    <div className={classes.cardDiv}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Card
            image="./icons/users.svg"
            header={t('usage.card.userHeader')}
            subtitle={t('usage.card.userSubtitle')}
            color={classes.usersData}
            data={userCount}
          />
          <Card
            image="./icons/viewProjects.svg"
            header={t('usage.card.projectHeader')}
            subtitle={t('usage.card.projectSubtitle')}
            color={classes.projectData}
            data={projectCount}
          />
          <Card
            image="./icons/targets.svg"
            header={t('usage.card.agentHeader')}
            subtitle={t('usage.card.agentSubtitle')}
            color={classes.agentsData}
            data={data?.getUsageData.totalCount.agents.total ?? 0}
            split
            subData={[
              {
                option1: data?.getUsageData.totalCount.agents.cluster ?? 0,
                option2: `${t('usage.card.agentClusterScope')}`,
              },
              {
                option1: data?.getUsageData.totalCount.agents.ns ?? 0,
                option2: `${t('usage.card.agentNamespaceScope')}`,
              },
            ]}
          />

          <Card
            image="./icons/workflow-calender.svg"
            header={t('usage.card.workflowScheduleHeader')}
            subtitle={t('usage.card.workflowScheduleSubtitle')}
            color={classes.schedules}
            data={data?.getUsageData.totalCount.workflows.schedules ?? 0}
          />
          <Card
            image="./icons/workflows-outline.svg"
            header={t('usage.card.workflowRunHeader')}
            subtitle={t('usage.card.workflowRunSubtitle')}
            color={classes.wfRuns}
            data={data?.getUsageData.totalCount.workflows.runs ?? 0}
          />
          <Card
            image="./icons/myhub.svg"
            header={t('usage.card.experimentRunHeader')}
            subtitle={t('usage.card.experimentRunSubtitle')}
            color={classes.expRuns}
            data={data?.getUsageData.totalCount.workflows.expRuns ?? 0}
          />
        </>
      )}
    </div>
  );
};

export default UsageStats;
