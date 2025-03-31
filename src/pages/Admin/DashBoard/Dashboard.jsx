import React, { useEffect, useState } from "react";
import { Panel, Row, Col, Table } from "rsuite";
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
import { formatDate } from "../../../utilities/formatDate";
import parse from "html-react-parser";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import RequestQueryService from "../../../services/requestQuery.service";
import { Link } from "react-router-dom";
import avatar from "../../../assets/images/avtar.png";
import {
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
} from "react-icons/fa";
import { THEME } from "../../../utilities/theme";
import "./Dashboard.css";

const Dashboard = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [events, setEvents] = useState({});
  const [notices, setNotices] = useState([]);
  const [pageError, setPageError] = useState("");
  const [requestQueries, setRequestQueries] = useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  // Fetch and set events dynamically
  const fetchEvents = async () => {
    const data = {
      10: [
        { time: "10:30 am", title: "Meeting" },
        { time: "12:00 pm", title: "Lunch" },
      ],
      15: [
        { time: "09:30 am", title: "Products Introduction Meeting" },
        { time: "12:30 pm", title: "Client entertaining" },
        { time: "02:00 pm", title: "Product design discussion" },
        { time: "05:00 pm", title: "Product test and acceptance" },
      ],
    };
    setEvents(data);
  };

  const visitorData = [
    {
      visitorName: "John Doe",
      flatNo: "A-101",
      phone: "9876543210",
      imageUrl: avatar,
    },
    {
      visitorName: "Jane Smith",
      flatNo: "B-202",
      phone: "8765432109",
      imageUrl: avatar,
    },
    {
      visitorName: "Michael Brown",
      flatNo: "C-303",
      phone: "7654321098",
      imageUrl: avatar,
    },
    {
      visitorName: "Emily Davis",
      flatNo: "D-404",
      phone: "6543210987",
      imageUrl: avatar,
    },
    {
      visitorName: "David Wilson",
      flatNo: "E-505",
      phone: "5432109876",
      imageUrl: avatar,
    },
  ];

  // Fetch events and set page title
  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    fetchEvents();
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchNotices(societyId);
      getRequestQueries(societyId);
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
        respdata = data.queriess;
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

  const statsData = [
    { title: "Flats", value: 2, Icon: FaUsers },
    { title: "Members", value: 4, Icon: FaShoppingCart },
    { title: "Vendors", value: 5, Icon: FaDollarSign },
    { title: "AMC", value: 8, Icon: FaChartLine },
  ];

  return (
    <div className="dashboard-container">
      <Row className="stats-row" gutter={10}>
        {statsData.map((stat, index) => (
          <Col xs={12} md={12} lg={6} xl={6} key={index}>
            <Panel bordered className="stats-panel">
              <div className="stats-content">
                <h4 className="stat-title">
                  {stat.title}
                  <span className="inline-icon">
                    <stat.Icon color={THEME[0].CLR_PRIMARY} size={40} />
                  </span>
                </h4>
                <h2 className="fontSize20 ">{stat.value}</h2>
              </div>
            </Panel>
          </Col>
        ))}
      </Row>
      <Row gutter={20}>
        <Col xs={24} lg={12} xl={12}>
          <Panel bordered className="stats-panel">
            <h5>Distribution</h5>
            <PieChart />
          </Panel>
        </Col>
        <Col xs={24} lg={12} xl={12}>
          <Panel bordered className="stats-panel">
            <CalendarWithTodo events={events} />
          </Panel>
        </Col>
      </Row>
      <Row>
        <Col xs={24} xl={12}>
          <Panel bordered className="stats-panel">
            <h5 className="txt-cnt mr-b-1">Notices</h5>
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
          </Panel>
        </Col>
        {/* </Row>
      <Row> */}
        <Col xs={24} xl={12}>
          <Panel bordered className="stats-panel">
            <h5 className="txt-cnt mr-b-1">Request Query</h5>
            <Table
              data={requestQueries} // Pass the entire array to the Table
              bordered
              cellBordered
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
                <Cell dataKey="title" />
              </Column>
              <Column flexGrow={0.5} align="center">
                <HeaderCell>Status</HeaderCell>
                <Cell dataKey="status">
                  {(rowData) => (
                    <div className={`col-status query-${rowData.status}`}>
                      {rowData.status}
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Panel>
        </Col>
      </Row>
      <Row>
        <Col xs={24} xl={12}>
          <Panel bordered className="stats-panel">
            <h5 className="txt-cnt mr-b-1">Visitor</h5>
            <Table
              data={visitorData} // Pass the entire array to the Table
              bordered
              cellBordered
              autoHeight
              wordWrap
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={0.7} align="center">
                <HeaderCell>Image</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <img
                      src={rowData.imageUrl}
                      alt={rowData.imageUrl}
                      className="vis-image"
                    />
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Visitor Name</HeaderCell>
                <Cell dataKey="visitorName" />
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>

              <Column flexGrow={0.5}>
                <HeaderCell>Phone</HeaderCell>
                <Cell dataKey="phone" />
              </Column>
            </Table>
          </Panel>
        </Col>
        <Col xs={24} xl={12}>
          <Panel bordered className="stats-panel">
            <h5 className="txt-cnt mr-b-1">AMC</h5>
            <Table
              data={visitorData} // Pass the entire array to the Table
              bordered
              cellBordered
              autoHeight
              wordWrap
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>AMC Description</HeaderCell>
                <Cell dataKey="visitorName" />
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Vendor Name</HeaderCell>
                <Cell dataKey="visitorName" />
              </Column>

              <Column flexGrow={0.5}>
                <HeaderCell>Vendor Type</HeaderCell>
                <Cell dataKey="phone" />
              </Column>
            </Table>
          </Panel>
        </Col>
      </Row>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </div>
  );
};

export default Dashboard;
