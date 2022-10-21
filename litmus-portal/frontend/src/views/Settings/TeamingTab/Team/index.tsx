import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ButtonOutlined, EditableText, Search } from 'litmus-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../../components/Loader';
import config from '../../../../config';
import Center from '../../../../containers/layouts/Center';
// import { GET_PROJECT, UPDATE_PROJECT_NAME } from '../../../../graphql';
import { Member, Project } from '../../../../models/graphql/user';
import useActions from '../../../../redux/actions';
import * as TabActions from '../../../../redux/actions/tabs';
import { RootState } from '../../../../redux/reducers';
import { getToken, getUserId } from '../../../../utils/auth';
import { getProjectID } from '../../../../utils/getSearchParams';
import Invitation from '../Invitation';
import InviteNew from '../InviteNew';
import InvitedTable from './invitedTable';
import MembersTable from './membersTable';
import useStyles from './styles';

interface FilterOptions {
  search: string;
  role: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}

interface TabPanelProps {
  index: any;
  value: any;
}
// TabPanel ise used to implement the functioning of tabs
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};
// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// TeamingTab displays team member table
const TeamingTab: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const scrollToRef = useRef<HTMLInputElement>();
  const tabs = useActions(TabActions);

  const projectID = getProjectID();

  const [loading, setLoading] = useState(true);

  const userID = getUserId();
  const [project, setProject] = useState<Project>();

  // for response data
  const [accepted, setAccepted] = useState<Member[]>([]);
  const [notAccepted, setNotAccepted] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  const invitationTabValue = useSelector(
    (state: RootState) => state.tabNumber.invitation
  );

  const handleLocalChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };

  const handleChange = (actTab: number) => {
    tabs.changeInvitationTabs(actTab);
  };
  const getProjectDetails = () => {
    fetch(`${config.auth.url}/get_project/${projectID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data.data);
        } else {
          setLoading(false);
          const memberList = data.data.Members ?? [];
          const acceptedUsers: Member[] = [];
          const notAcceptedUsers: Member[] = [];
          memberList.forEach((member: Member) => {
            if (member.Invitation === 'Accepted') {
              acceptedUsers.push(member);
            } else if (
              member.UserID !== userID &&
              member.Invitation !== 'Accepted'
            ) {
              notAcceptedUsers.push(member);
            }
          });
          setProject(data.data);
          setAccepted([...acceptedUsers]);
          setNotAccepted([...notAcceptedUsers]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    getProjectDetails();
  }, []);

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    role: 'all',
  });

  // for data filtering based on user role
  const acceptedFilteredData = !loading
    ? accepted &&
      accepted
        .filter((dataRow) =>
          dataRow.UserName.toLowerCase().includes(filters.search.toLowerCase())
        )
        .filter((dataRow: Member) => {
          if (filters.role === 'all') return true;
          if (filters.role === 'Editor') return dataRow.Role === 'Editor';
          if (filters.role === 'Viewer') return dataRow.Role === 'Viewer';
          return dataRow.Role === 'Owner';
        })
    : [];

  const notAcceptedFilteredData = !loading
    ? notAccepted &&
      notAccepted
        .filter((dataRow) =>
          dataRow?.UserName?.toLowerCase().includes(
            filters.search.toLowerCase()
          )
        )
        .filter((dataRow: Member) => {
          if (filters.role === 'all') return true;
          if (filters.role === 'Editor') return dataRow.Role === 'Editor';
          if (filters.role === 'Viewer') return dataRow.Role === 'Viewer';
          return dataRow.Role === 'Owner';
        })
    : [];

  const [inviteNewOpen, setInviteNewOpen] = React.useState(false);
  const [deleteMemberOpen, setDeleteMemberOpen] = React.useState(false);

  function showModal() {
    getProjectDetails();
  }

  const [projectOwnerCount, setProjectOwnerCount] = useState<number>(0);
  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);

  const getProjectDetail = () => {
    fetch(`${config.auth.url}/list_projects`, {
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
        } else {
          setProjects(data.data);
          //  setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getProjectDetail();
  }, []);

  useEffect(() => {
    let projectOwner = 0;
    let projectInvitation = 0;
    let projectOther = 0;
    projects.forEach((project) => {
      const projectMembers = project.Members;
      if (projectMembers) {
        projectMembers.forEach((member: Member) => {
          if (member.UserID === userID && member.Role === 'Owner') {
            projectOwner++;
          } else if (
            member.UserID === userID &&
            member.Invitation === 'Pending'
          ) {
            projectInvitation++;
          } else if (
            member.UserID === userID &&
            member.Role !== 'Owner' &&
            member.Invitation === 'Accepted'
          ) {
            projectOther++;
          }
        });
      }
    });
    setProjectOwnerCount(projectOwner);
    setInvitationCount(projectInvitation);
    setProjectOtherCount(projectOther);
  }, [projects, deleteMemberOpen, inviteNewOpen, invitationTabValue]);

  const updateProjectName = (value: string) => {
    fetch(`${config.auth.url}/update_projectname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        project_id: projectID,
        project_name: value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          getProjectDetails();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      {!loading ? (
        <>
          <div className={classes.row1}>
            <Paper className={classes.projectInfo} elevation={0}>
              <div className={classes.projectInfoProjectStats}>
                <Typography data-cy="totalProjectsCount">
                  {projectOtherCount + projectOwnerCount}
                </Typography>
                {projectOtherCount + projectOwnerCount !== 1 ? (
                  <Typography>{t('settings.teamingTab.projects')}</Typography>
                ) : (
                  <Typography>{t('settings.teamingTab.project')}</Typography>
                )}
              </div>
              <div>
                <div className={classes.displayFlex}>
                  <Typography
                    data-cy="ownedProjectsCount"
                    className={classes.projectInfoBoldText}
                  >
                    {projectOwnerCount}
                  </Typography>
                  <Typography>
                    {t('settings.teamingTab.yourProject')}
                  </Typography>
                </div>
                <div className={classes.displayFlex}>
                  <Typography
                    data-cy="otherProjectsCount"
                    className={classes.projectInfoBoldText}
                  >
                    {projectOtherCount}
                  </Typography>
                  <Typography>
                    {t('settings.teamingTab.projectInvite')}
                  </Typography>
                </div>
              </div>
            </Paper>
            <Paper className={classes.teamInfo} elevation={0}>
              <div className={classes.teamInfoFlex}>
                <ButtonOutlined
                  onClick={() => {
                    if (scrollToRef.current) {
                      scrollToRef.current.scrollIntoView({
                        behavior: 'smooth',
                      });
                      handleChange(1);
                    }
                  }}
                  className={classes.invitationButton}
                >
                  <div className={classes.invitationButtonFlex}>
                    {t('settings.teamingTab.invitations')}
                    <Typography data-cy="invitationsCount">
                      {invitationsCount}
                    </Typography>
                  </div>
                </ButtonOutlined>
              </div>
              <Typography>{t('settings.teamingTab.manageTeam')}</Typography>
            </Paper>
          </div>
          <div className={classes.UMDiv}>
            <Center>
              <Typography className={classes.myProjectText}>
                My Project
              </Typography>
            </Center>
            <div>
              <Paper className={classes.myProject} elevation={0}>
                <Center>
                  <div className={classes.project}>
                    {project && (
                      <EditableText
                        label={t('settings.teamingTab.editProjectLabel')}
                        defaultValue={project.Name ? project.Name : ''}
                        onSave={(value) => {
                          updateProjectName(value);
                        }}
                      />
                    )}
                  </div>
                </Center>
                <Toolbar data-cy="toolBarComponent" className={classes.toolbar}>
                  {/* Search user */}
                  <div
                    className={classes.toolbarFirstCol}
                    data-cy="teamingSearch"
                  >
                    <Search
                      id="input-with-icon-textfield"
                      placeholder={t('settings.teamingTab.label.search')}
                      value={filters.search}
                      onChange={(e) => {
                        setFilters({
                          ...filters,
                          search: e.target.value,
                        });
                        setPaginationData({ ...paginationData, pageNo: 0 });
                      }}
                    />
                    {/* filter menu */}
                  </div>

                  <div className={classes.buttonDiv}>
                    <div className={classes.filter}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                        focused
                      >
                        <InputLabel className={classes.selectText}>
                          {t('settings.teamingTab.tableCell.role')}
                        </InputLabel>
                        <Select
                          label={t('settings.teamingTab.label.role')}
                          value={filters.role}
                          onChange={(event) => {
                            setFilters({
                              ...filters,
                              role: event.target.value as string,
                            });
                            setPaginationData({
                              ...paginationData,
                              pageNo: 0,
                            });
                          }}
                          className={classes.selectText}
                        >
                          <MenuItem value="all">
                            {t('settings.teamingTab.label.options.all')}
                          </MenuItem>
                          <MenuItem value="Editor">
                            {t('settings.teamingTab.label.options.editor')}
                          </MenuItem>
                          <MenuItem value="Viewer">
                            {t('settings.teamingTab.label.options.viewer')}
                          </MenuItem>
                          <MenuItem value="Owner">
                            {t('settings.teamingTab.label.options.owner')}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <InviteNew
                      showModal={() => {
                        showModal();
                        setInviteNewOpen(false);
                      }}
                      handleOpen={() => setInviteNewOpen(true)}
                      open={inviteNewOpen}
                    />
                  </div>
                </Toolbar>
                <Tabs
                  value={activeTab}
                  onChange={handleLocalChange}
                  TabIndicatorProps={{
                    style: {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Tab
                    data-cy="membersTab"
                    label={
                      <span
                        className={
                          activeTab === 0 ? classes.active : classes.inActive
                        }
                      >
                        <span className={classes.invitationCount}>
                          {accepted.length}
                        </span>{' '}
                        {accepted.length > 1 ? 'Members' : 'Member'}
                      </span>
                    }
                    {...tabProps(0)}
                  />
                  <Tab
                    data-cy="invitedTab"
                    label={
                      <span
                        className={
                          activeTab === 1 ? classes.active : classes.inActive
                        }
                      >
                        <span className={classes.invitationCount}>
                          {notAccepted.length}
                        </span>{' '}
                        Invited
                      </span>
                    }
                    {...tabProps(1)}
                  />
                </Tabs>
              </Paper>
              <TabPanel value={activeTab} index={0}>
                <MembersTable
                  acceptedFilteredData={acceptedFilteredData}
                  showModal={() => {
                    showModal();
                    setDeleteMemberOpen(false);
                  }}
                  handleOpen={() => setDeleteMemberOpen(true)}
                  open={deleteMemberOpen}
                />
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                <InvitedTable
                  fetchData={getProjectDetails}
                  notAcceptedFilteredData={notAcceptedFilteredData}
                  showModal={() => {
                    showModal();
                  }}
                />
              </TabPanel>
              {/* user table */}
            </div>
          </div>
          <div>
            <Paper ref={scrollToRef} className={classes.invitations}>
              <Typography className={classes.inviteHeading}>
                {t('settings.teamingTab.invitedProject')}
              </Typography>
              <Typography className={classes.inviteText}>
                {t(
                  'settings.teamingTab.invitation.receivedInvitation.receivedHeading'
                )}
              </Typography>
              <Invitation getProjectDetail={getProjectDetail} />
            </Paper>
          </div>
        </>
      ) : (
        <div style={{ height: '50vh' }}>
          <Center>
            <Loader />
          </Center>
        </div>
      )}
    </div>
  );
};
export default TeamingTab;
