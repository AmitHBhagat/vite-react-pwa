import React, { useEffect, useState } from "react";
import {
  Panel,
  Row,
  Col,
  Table,
  PanelGroup,
  Card,
  CardGroup,
  IconButton,
  Tooltip,
  Whisper,
  Button,
} from "rsuite";
import { setRouteData } from "../../../stores/appSlice.js";
import { useDispatch, useSelector } from "react-redux";
import CalendarWithTodo from "./Calender.jsx";
import PieChart from "./PieChart.jsx";
import { Carousel } from "rsuite";
import { toast } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import noticeService from "../../../services/notice.service.js";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { formatDate, formatDateTime } from "../../../utilities/formatDate";
import parse from "html-react-parser";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import RequestQueryService from "../../../services/requestQuery.service";
import AmcService from "../../../services/amc.service";
import VisitorService from "../../../services/visitor.service";
import { Link } from "react-router-dom";
import DocPassIcon from "@rsuite/icons/DocPass";
import MeetingService from "../../../services/meeting.service";
import PollingService from "../../../services/polling.service";
import { HiUsers } from "react-icons/hi";
import { PiBuildings } from "react-icons/pi";
import { SlPeople } from "react-icons/sl";
import {
  FaUsers,
  FaPeopleCarry,
  FaBuilding,
  FaWrench,
  FaInfoCircle,
} from "react-icons/fa";
import { THEME } from "../../../utilities/theme.js";
import "./Dashboard.css";

const monthlyBillData = {
  categories: [
    "Rent",
    "Groceries",
    "Utilities",
    "Transport",
    "Entertainment",
    "Savings",
  ],
  amounts: [1200, 500, 200, 150, 100, 300],
};

const statsData = [
  { title: "Flats", value: 2, Icon: PiBuildings },
  { title: "Members", value: 4, Icon: SlPeople },
  { title: "Vendors", value: 5, Icon: FaPeopleCarry },
  { title: "AMC", value: 8, Icon: FaWrench },
];

const Dashboard = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [notices, setNotices] = useState([]);
  const [pageError, setPageError] = useState("");
  const [requestQueries, setRequestQueries] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [AmcList, setAmcList] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [pollings, setPollings] = useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  // Fetch events and set page title
  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchNotices(societyId);
      getRequestQueries(societyId);
      getMeetings(societyId);
      getAmcs(societyId);
      getVisitors(societyId);
      getPollings(societyId);
    }
  }, [societyId]);

  const fetchNotices = async (societyId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(noticeService.getNotices(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.notices;
      }
    } catch (err) {
      console.error("Notice fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching notice`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setNotices(respdata);
  };

  const getRequestQueries = async (societyId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        RequestQueryService.getQueries(societyId)
      );
      const { data } = resp;
      if (data.success) {
        respdata = data.queriess
          .filter((query) => query.status === "Open")
          .slice(0, 5);
      }
    } catch (err) {
      console.error("Request queries fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching request queries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setRequestQueries(respdata);
  };

  const getMeetings = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(MeetingService.getAllMeetings(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.meetings;
      }
    } catch (err) {
      console.error("meetings fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching meetings`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setMeetings(respdata);
  };

  const getAmcs = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(AmcService.getAmcs(societyId));
      const { data } = resp;
      if (data.success) {
        const today = new Date();
        respdata = data.amcs
          .filter((amc) => new Date(amc.amcEndDate) > today)
          .slice(0, 5);
      }
    } catch (err) {
      console.error("Amc fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching amc`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmcList(respdata);
  };

  const getVisitors = async (societyId) => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        VisitorService.getSocietyVisitors(societyId)
      );
      const { data } = resp;
      if (data.success) {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        respData = data.visitors
          .filter((visitor) => new Date(visitor.createdAt) >= last24Hours)
          .slice(0, 5);
      }
    } catch (err) {
      console.error("Visitors fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching visitor entries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVisitors(respData);
  };

  const getPollings = async (societyId, userId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(PollingService.getAllPolls(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.polls;
      }
    } catch (err) {
      console.error("Polling fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching pollings`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setPollings(respdata);
  };

  return (
    <div className="dashboard-container">
      <Row className="stats-row" gutter={20}>
        {statsData.map((stat, index) => (
          // <Col xs={12} md={12} lg={6} xl={6} key={index}>
          //   <Panel shaded className="stats-panel">
          //     <div className="stats-content">
          //       <div className="stat-title">
          //         <h6>{stat.title}</h6>
          //         <h6 className="">{stat.value}</h6>
          //       </div>
          //       <span className="inline-icon">
          //         <stat.Icon color={THEME[0].CLR_PRIMARY} size={40} />
          //       </span>
          //     </div>
          //   </Panel>
          // </Col>
          <Col xs={12} md={12} lg={6} xl={6} key={index}>
            <Panel shaded className="stats-panel">
              <div className="stats-content">
                <div className="stat-title">
                  <h6>{stat.title}</h6>
                  <h6 className="">{stat.value}</h6>
                </div>

                <span className="icon-wrapper">
                  <stat.Icon color="white" size={30} />
                </span>
              </div>
            </Panel>
          </Col>
        ))}
      </Row>
      <Row gutter={20}>
        <Col xs={24} lg={12} xl={12}>
          <CustomPanel title="Monthly Analysis">
            <PieChart
              type="donut"
              labels={monthlyBillData.categories}
              series={monthlyBillData.amounts}
            />
          </CustomPanel>
        </Col>
        <Col xs={24} lg={12} xl={12}>
          <CustomPanel title="Meeting">
            <CalendarWithTodo events={meetings} />
          </CustomPanel>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col xs={24} xl={12}>
          <CustomPanel title="Notices">
            {notices.length > 0 ? (
              <Carousel autoplay className="notice-carousel">
                {notices.map((notice, index) => (
                  <div key={index}>
                    <p className="para mr-b-1">{notice.title}</p>
                    <p className="txt-cnt mr-b-1">{formatDate(notice.date)}</p>
                    <p className="txt-justify">{parse(notice.commments)}</p>
                  </div>
                ))}
              </Carousel>
            ) : (
              <p>No notices available</p>
            )}
          </CustomPanel>
        </Col>

        <Col xs={24} xl={12}>
          <CustomPanel
            title={
              <div className="ListIcon">
                <span>Request Query</span>
                <Whisper
                  placement="top"
                  trigger="hover"
                  speaker={<Tooltip>More Details</Tooltip>}
                >
                  <Link to="/request-queries">
                    <FaInfoCircle className="meetInfo" />
                  </Link>
                </Whisper>
              </div>
            }
          >
            <Table
              data={requestQueries}
              height={300}
              wordWrap
              headerHeight={50}
              rowHeight={60}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={0.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Link to={`/request-queries/details/${rowData._id}`}>
                      {rowData.flatNo}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.7}>
                <HeaderCell>Member Name</HeaderCell>
                <Cell dataKey="memberName" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title">
                  {(rowData) => (
                    <div className="two-line-ellipsis">{rowData.title}</div>
                  )}
                </Cell>
              </Column>
            </Table>
          </CustomPanel>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col xs={24} xl={12}>
          <CustomPanel
            title={
              <div className="ListIcon">
                <span>Visitor</span>
                <Whisper
                  placement="top"
                  trigger="hover"
                  speaker={<Tooltip>More Details</Tooltip>}
                >
                  <Link to="/visitors-list">
                    <FaInfoCircle className="meetInfo" />
                  </Link>
                </Whisper>
              </div>
            }
          >
            <Table
              data={visitors}
              height={270}
              wordWrap
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Date </HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => formatDate(rowData.createdAt)}
                </Cell>
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flat.flatNo" />
              </Column>
              <Column flexGrow={1.2}>
                <HeaderCell>Visitor Name</HeaderCell>
                <Cell dataKey="visitorName">
                  {(rowData) => (
                    <Link to={`/visitors-list/details/${rowData._id}`}>
                      {rowData.visitorName}
                    </Link>
                  )}
                </Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Phone</HeaderCell>
                <Cell dataKey="visitorPhone" />
              </Column>
            </Table>
          </CustomPanel>
        </Col>
        <Col xs={24} xl={12}>
          <CustomPanel
            title={
              <div className="ListIcon">
                <span>AMC</span>
                <Whisper
                  placement="top"
                  trigger="hover"
                  speaker={<Tooltip>More Details</Tooltip>}
                >
                  <Link to="/amc">
                    <FaInfoCircle className="meetInfo" />
                  </Link>
                </Whisper>
              </div>
            }
          >
            <Table
              data={AmcList}
              height={270}
              wordWrap
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Description</HeaderCell>
                <Cell dataKey="amcDescription">
                  {(rowData) => (
                    <div className="two-line-ellipsis">
                      {rowData.amcDescription}
                    </div>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Start Date</HeaderCell>
                <Cell dataKey="amcStartDate">
                  {(rawData) => formatDate(rawData.amcStartDate)}
                </Cell>
              </Column>

              <Column flexGrow={0.5}>
                <HeaderCell>End Date</HeaderCell>
                <Cell dataKey="amcEndDate">
                  {(rawData) => formatDate(rawData.amcEndDate)}
                </Cell>
              </Column>
              <Column width={50} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <Link to={`/amc/details/${rowData._id}`}>
                      <IconButton
                        title="edit"
                        icon={<DocPassIcon color={THEME[0].CLR_PRIMARY} />}
                      />
                    </Link>
                  )}
                </Cell>
              </Column>
            </Table>
          </CustomPanel>
        </Col>
      </Row>

      <Row>
        <Col xs={24}>
          <CardGroup columns={2} spacing={20} className="poll-card-group">
            {pollings.map((poll, index) => (
              <Card className="pollCard" key={index} bordered>
                <Card.Header>
                  <h6 className="pollTitle">Poll</h6>
                  <span>{poll.pollDescription}</span>
                  <div className="mr-t-1">
                    {formatDate(poll.pollStartDate)} -{" "}
                    {formatDate(poll.pollEndDate)}
                  </div>
                </Card.Header>
                <Card.Body>
                  <PieChart
                    type="pie"
                    labels={poll.pollOptions.map((option) => option.option)}
                    series={poll.pollOptions.map((option) => option.votes || 0)}
                  />
                </Card.Body>
              </Card>
            ))}
          </CardGroup>
        </Col>
      </Row>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </div>
  );
};

export default Dashboard;

const CustomPanel = ({ title, children }) => {
  return (
    <Panel bordered className="stats-panel  mr-b-1" header={title}>
      {children}
    </Panel>
  );
};
