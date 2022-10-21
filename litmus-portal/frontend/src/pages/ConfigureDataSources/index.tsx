import { useMutation } from '@apollo/client';
import { Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Wrapper from '../../containers/layouts/Wrapper';
import { CREATE_DATASOURCE, UPDATE_DATASOURCE } from '../../graphql/mutations';
import { DataSourceDetails } from '../../models/dataSourceData';
import {
  CreateDataSourceInput,
  ListDataSourceResponse,
} from '../../models/graphql/dataSourceDetails';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import {
  isValidWebUrl,
  validateTextEmpty,
  validateTimeInSeconds,
} from '../../utils/validate';
import useStyles from './styles';

const ConfigurePrometheus = lazy(
  () => import('../../views/Observability/DataSources/Forms/prometheus')
);

interface DataSourceConfigurePageProps {
  configure: boolean;
}

const DataSourceConfigurePage: React.FC<DataSourceConfigurePageProps> = ({
  configure,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dataSourceID = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceID
  );
  const selectedDataSourceName = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceName
  );
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [disabled, setDisabled] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [dataSourceVars, setDataSourceVars] = useState<DataSourceDetails>({
    id: '',
    name: '',
    dataSourceType: 'Prometheus',
    url: 'http://localhost:9090',
    access: 'Server (Default)',
    basicAuth: false,
    username: '',
    password: '',
    noAuth: true,
    withCredentials: false,
    tlsClientAuth: false,
    withCACert: false,
    scrapeInterval: '15s',
    queryTimeout: '30s',
    httpMethod: 'POST',
  });
  const [mutate, setMutate] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [createDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(CREATE_DATASOURCE, {
    onCompleted: () => {
      setMutate(false);
      setSuccess(true);
      setIsAlertOpen(true);
    },
    onError: () => {
      setMutate(false);
      setSuccess(false);
      setIsAlertOpen(true);
    },
  });
  const [updateDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(UPDATE_DATASOURCE, {
    onCompleted: () => {
      setMutate(false);
      setSuccess(true);
      setIsAlertOpen(true);
    },
    onError: () => {
      setMutate(false);
      setSuccess(false);
      setIsAlertOpen(true);
    },
  });

  const handleCreateMutation = () => {
    let authType: string = 'no auth';
    if (dataSourceVars.noAuth === false && dataSourceVars.basicAuth === true) {
      authType = 'basic auth';
    }
    const dataSourceInput = {
      dsName: dataSourceVars.name,
      dsType: dataSourceVars.dataSourceType,
      dsURL:
        dataSourceVars.url[dataSourceVars.url.length - 1] !== '/'
          ? dataSourceVars.url
          : dataSourceVars.url.slice(0, -1),
      accessType: dataSourceVars.access,
      authType,
      basicAuthUsername: dataSourceVars.username,
      basicAuthPassword: dataSourceVars.password,
      scrapeInterval: parseInt(dataSourceVars.scrapeInterval.split('s')[0], 10),
      queryTimeout: parseInt(dataSourceVars.queryTimeout.split('s')[0], 10),
      httpMethod: dataSourceVars.httpMethod,
      projectID,
    };
    createDataSource({
      variables: { DSInput: dataSourceInput },
    });
  };

  const handleUpdateMutation = () => {
    let authType: string = 'no auth';
    if (dataSourceVars.noAuth === false && dataSourceVars.basicAuth === true) {
      authType = 'basic auth';
    }
    const dataSourceInput = {
      dsID: dataSourceVars.id ?? '',
      dsName: dataSourceVars.name,
      dsType: dataSourceVars.dataSourceType,
      dsURL:
        dataSourceVars.url[dataSourceVars.url.length - 1] !== '/'
          ? dataSourceVars.url
          : dataSourceVars.url.slice(0, -1),
      accessType: dataSourceVars.access,
      authType,
      basicAuthUsername: dataSourceVars.username,
      basicAuthPassword: dataSourceVars.password,
      scrapeInterval: parseInt(dataSourceVars.scrapeInterval.split('s')[0], 10),
      queryTimeout: parseInt(dataSourceVars.queryTimeout.split('s')[0], 10),
      httpMethod: dataSourceVars.httpMethod,
      projectID,
    };
    updateDataSource({
      variables: { DSInput: dataSourceInput },
    });
  };

  useEffect(() => {
    if (mutate === true && configure === false) {
      handleCreateMutation();
    } else if (mutate === true && configure === true) {
      handleUpdateMutation();
    }
  }, [mutate]);

  useEffect(() => {
    if (
      dataSourceVars.name === '' ||
      !isValidWebUrl(dataSourceVars.url) ||
      !validateTimeInSeconds(dataSourceVars.queryTimeout) ||
      !validateTimeInSeconds(dataSourceVars.scrapeInterval) ||
      (dataSourceVars.basicAuth &&
        (validateTextEmpty(dataSourceVars.username) ||
          validateTextEmpty(dataSourceVars.password)))
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [dataSourceVars]);

  return (
    <Wrapper>
      <div className={classes.rootConfigure}>
        {configure === false ? (
          <div>
            <div className={classes.backButton}>
              <BackButton />
            </div>
            <Typography className={classes.heading}>
              {t('monitoringDashboard.dataSourceForm.headingAdd')}
            </Typography>
            <ConfigurePrometheus
              configure={configure}
              page={page}
              CallbackToSetVars={(vars: DataSourceDetails) => {
                setDataSourceVars(vars);
              }}
            />
          </div>
        ) : (
          <div>
            <div className={classes.backButton}>
              <BackButton />
            </div>
            <Typography className={classes.heading}>
              {t('monitoringDashboard.dataSourceForm.headingConfigure')} /
              {` ${selectedDataSourceName}`}
            </Typography>
            {dataSourceID ? (
              <ConfigurePrometheus
                configure={configure}
                dataSourceID={dataSourceID}
                page={page}
                CallbackToSetVars={(vars: DataSourceDetails) => {
                  setDataSourceVars(vars);
                }}
              />
            ) : (
              <div />
            )}
          </div>
        )}

        <div
          className={`${classes.buttons} ${page === 2 ? '' : classes.flexEnd}`}
        >
          {page === 2 && (
            <ButtonOutlined onClick={() => setPage(1)} disabled={false}>
              <Typography>
                {t('monitoringDashboard.dataSourceForm.back')}
              </Typography>
            </ButtonOutlined>
          )}
          <div className={classes.saveButton}>
            <Typography className={classes.stepText}>
              {t('monitoringDashboard.dataSourceForm.step')}
              <strong>{` ${page} `}</strong>
              {t('monitoringDashboard.dataSourceForm.of2')}
            </Typography>
            <ButtonFilled
              disabled={
                (page === 1 &&
                  (dataSourceVars.name === '' ||
                    !isValidWebUrl(dataSourceVars.url))) ||
                mutate
                  ? true
                  : page === 2
                  ? disabled
                  : false
              }
              onClick={() =>
                page === 2 && !disabled ? setMutate(true) : setPage(2)
              }
              data-cy="dataSourceControlButton"
            >
              <Typography className={classes.buttonText}>
                {page === 2
                  ? mutate
                    ? !configure
                      ? t('monitoringDashboard.dataSourceForm.adding')
                      : t('monitoringDashboard.dataSourceForm.updating')
                    : t('monitoringDashboard.dataSourceForm.saveChanges')
                  : t('monitoringDashboard.dataSourceForm.next')}
              </Typography>
              {mutate && <Loader size={20} />}
            </ButtonFilled>
          </div>
        </div>
      </div>
      {isAlertOpen && (
        <Snackbar
          open={isAlertOpen}
          autoHideDuration={6000}
          onClose={() => {
            setIsAlertOpen(false);
            if (success) {
              history.push({
                pathname: '/analytics',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }
          }}
        >
          <Alert
            onClose={() => {
              setIsAlertOpen(false);
              if (success) {
                history.push({
                  pathname: '/analytics',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }
            }}
            severity={success ? 'success' : 'error'}
          >
            {!configure
              ? success
                ? t('monitoringDashboard.dataSourceForm.connectionSuccess')
                : t('monitoringDashboard.dataSourceForm.connectionError')
              : success
              ? t('monitoringDashboard.dataSourceForm.updateSuccess')
              : t('monitoringDashboard.dataSourceForm.updateError')}
          </Alert>
        </Snackbar>
      )}
    </Wrapper>
  );
};

export default DataSourceConfigurePage;
