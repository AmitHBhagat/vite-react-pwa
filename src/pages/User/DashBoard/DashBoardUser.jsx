import React, { useEffect, useState } from "react";
import {
  Panel,
  Row,
  Col,
  Table,
  Modal,
  Grid,
  Whisper,
  Tooltip,
  IconButton,
  Button,
} from "rsuite";
import { setRouteData } from "../../../stores/appSlice.js";
import { useDispatch, useSelector } from "react-redux";
import CalendarWithTodo from "../../Admin/DashBoard/Calender.jsx";
import { Carousel } from "rsuite";
import { toast } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import noticeService from "../../../services/notice.service.js";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import {
  formatDate,
  getLast24Hours,
  formatDateTime,
} from "../../../utilities/formatDate";
import parse from "html-react-parser";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import QueryService from "../../../services/requestQuery.service";
import PollingService from "../../../services/polling.service";
import { Link } from "react-router-dom";
import MeetingService from "../../../services/meeting.service";
import BillService from "../../../services/billing.service";
import PaymentService from "../../../services/payment.service";
import VisitorService from "../../../services/visitor.service";
import { RiBillLine } from "react-icons/ri";
import { MdCurrencyRupee } from "react-icons/md";
import { PiBuildings } from "react-icons/pi";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaMoneyCheckAlt, FaInfoCircle } from "react-icons/fa";
import { THEME } from "../../../utilities/theme.js";
import "./DashboardUser.css";

const statsData = [
  {
    title: "Flats",
    value: 3,
    Icon: PiBuildings,
  },
  {
    title: "Unpaid bill",
    value: 1000,
    Icon: RiBillLine,
  },
  {
    title: "Last payment",
    value: 2000,
    Icon: RiMoneyRupeeCircleLine,
  },
  {
    title: "Arrears",
    value: 1000,
    Icon: FaMoneyCheckAlt,
  },
];

const DashboardUser = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [notices, setNotices] = useState([]);
  const [pageError, setPageError] = useState("");
  const [requestQueries, setRequestQueries] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [pollings, setPollings] = useState([]);
  const [billList, setBillList] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [selectedPollings, setSelectedPollings] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState.selectedFlat.societyId;
  const flatId = authState.selectedFlat.value;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      getMeetings(societyId);
      fetchNotices(societyId);
      getQueries(societyId);
      getPollings(societyId);
    }
  }, [societyId]);

  useEffect(() => {
    if (societyId && flatId) {
      getBills();
      getPayment();
      getVisitors();
    }
  }, [authState.selectedFlat]);

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

  const getQueries = async (societyId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(QueryService.getQueries(societyId));
      const { data } = resp;
      if (data.success) respdata = resp.data.queriess.slice(0, 3);
    } catch (err) {
      console.error("Queries fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching queries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setRequestQueries(respdata);
  };

  const getMeetings = async (societyId) => {
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

  const getPollings = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(PollingService.getAllPolls(societyid));
      const { data } = resp;
      if (data.success) {
        const today = new Date();
        const userId = authState.user._id;

        respdata = data.polls.filter((poll) => {
          const isDateValid = new Date(poll.pollEndDate) >= today;

          const userHasVoted = poll.pollOptions.some((opt) =>
            opt.voters.includes(userId)
          );

          return isDateValid && !userHasVoted;
        });
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

  const getVisitors = async () => {
    const { startOfLast24Hours, endOfDay } = getLast24Hours();
    const payload = { startDate: startOfLast24Hours, endDate: endOfDay };

    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        VisitorService.getFlatVisitors(authState.selectedFlat.value, payload)
      );
      const { data } = resp;

      if (data.success) {
        respData = data.visitors.slice(0, 5);
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

  const getBills = async () => {
    try {
      const resp = await trackPromise(
        BillService.getBillsByFlat(
          authState.selectedFlat.societyId,
          authState.selectedFlat.value
        )
      );
      const { data } = resp;
      if (data.success) {
        setBillList(data.billings.slice(0, 3));
      } else setBillList([]);
    } catch (err) {
      setBillList([]);
      console.error("Fetch bills catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching bills`;
      toast.error(errMsg);
    }
  };

  const getPayment = async () => {
    try {
      const resp = await trackPromise(
        PaymentService.getPaymentsByFlat(
          authState.selectedFlat.societyId,
          authState.selectedFlat.value
        )
      );
      const { data } = resp;
      if (data.success) setPaymentList(data.paymentDetails.slice(0, 3));
      else setPaymentList([]);
    } catch (err) {
      setPaymentList([]);
      console.error("Fetch payments catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching payments`;
      toast.error(errMsg);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedPollings(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPollings({});
    setModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      <Row className="stats-row " gutter={20}>
        {statsData.map((stat, index) => (
          <Col xs={12} md={12} lg={6} xl={6} key={index}>
            <Panel shaded className="stats-panel">
              <div className="stats-content">
                <div className="stat-title">
                  <h6>{stat.title}</h6>
                  <h6 className="">{stat.value}</h6>
                </div>

                {/* Wrap the icon in a span and apply styles */}
                <span className="icon-wrapper">
                  <stat.Icon color="white" size={30} />
                </span>
              </div>
            </Panel>
          </Col>
        ))}
      </Row>
      <Row gutter={20}>
        <Col xs={24} xl={12}>
          <CustomPanel title="Meeting">
            <CalendarWithTodo events={meetings} />
          </CustomPanel>
        </Col>

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
          <CustomPanel title="Request Query">
            <Table
              data={requestQueries}
              height={300}
              headerHeight={50}
              rowHeight={60}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Date</HeaderCell>
                <Cell dataKey="date">
                  {(rowData) => formatDate(rowData.date)}
                </Cell>
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
          </CustomPanel>
        </Col>
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
                  <Link to="/userVisitors-list">
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
              <Column flexGrow={1.3}>
                <HeaderCell>Date & Time</HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => formatDateTime(rowData.createdAt)}
                </Cell>
              </Column>
              <Column flexGrow={1.4}>
                <HeaderCell>Visitor Name</HeaderCell>
                <Cell dataKey="visitorName">
                  {(rowData) => (
                    <Link to={`/visitors-list/details/${rowData._id}`}>
                      {rowData.visitorName}
                    </Link>
                  )}
                </Cell>
              </Column>

              <Column flexGrow={0.7}>
                <HeaderCell>Phone</HeaderCell>
                <Cell dataKey="visitorPhone" />
              </Column>
            </Table>
          </CustomPanel>
        </Col>

        <Col xs={24}>
          <CustomPanel title="Polling">
            <Table
              data={pollings}
              autoHeight
              wordWrap
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Polling Description</HeaderCell>
                <Cell dataKey="pollDescription">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenModal(rowData)}>
                        <div className="two-line-ellipsis">
                          {rowData.pollDescription}
                        </div>
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Polling Start Date</HeaderCell>
                <Cell dataKey="pollStartDate">
                  {(rawData) => formatDate(rawData.pollStartDate)}
                </Cell>
              </Column>

              <Column flexGrow={0.5}>
                <HeaderCell>Polling End Date</HeaderCell>
                <Cell dataKey="pollEndDate">
                  {(rawData) => formatDate(rawData.pollEndDate)}
                </Cell>
              </Column>
            </Table>
          </CustomPanel>
        </Col>
        <Col xs={24}>
          <CustomPanel title="Bill">
            <Table
              data={billList}
              height={200}
              wordWrap
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Bill No</HeaderCell>
                <Cell dataKey="billNo" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell>Bill Date</HeaderCell>
                <Cell dataKey="billDate">
                  {(rawData) => formatDate(rawData.billDate)}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Month</HeaderCell>
                <Cell dataKey="maintenanceMonth" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Year</HeaderCell>
                <Cell dataKey="maintenanceYear" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell title="Other Charges">Other (&#8377;)</HeaderCell>
                <Cell dataKey="otherCharges" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell title="Total Charges">Total (&#8377;)</HeaderCell>
                <Cell dataKey="totalCharges" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell>Arrears (&#8377;)</HeaderCell>
                <Cell dataKey="arrears" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell>Interest (%)</HeaderCell>
                <Cell dataKey="interest" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell title="Grand Total">Grand (&#8377;)</HeaderCell>
                <Cell dataKey="totalAmount" />
              </Column>
            </Table>
          </CustomPanel>
        </Col>

        <Col xs={24}>
          <CustomPanel title="Payment Details">
            <Table
              data={paymentList}
              height={200}
              wordWrap
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={2}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>
              <Column flexGrow={2}>
                <HeaderCell>Bank Branch</HeaderCell>
                <Cell dataKey="bankDetails" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell title="Payment Mode">Mode</HeaderCell>
                <Cell dataKey="paymentMode" />
              </Column>
              <Column flexGrow={2}>
                <HeaderCell>Transaction Details</HeaderCell>
                <Cell dataKey="transactionDetails" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell title="Maintenance Month">Month</HeaderCell>
                <Cell dataKey="month" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell title="Maintenance Year">Year</HeaderCell>
                <Cell dataKey="year" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell title="Payment Type">Type</HeaderCell>
                <Cell dataKey="paymentType" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell>Amount (&#8377;)</HeaderCell>
                <Cell dataKey="amount" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell title="Payment Date">Date</HeaderCell>
                <Cell dataKey="date">
                  {(rawData) =>
                    rawData.date ? formatDate(rawData.date) : "--"
                  }
                </Cell>
              </Column>
            </Table>
          </CustomPanel>
        </Col>
      </Row>
      <DetailsModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        dataObj={selectedPollings}
        setSelectedPollings={setSelectedPollings}
      />

      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </div>
  );
};

export default DashboardUser;

const CustomPanel = ({ title, children }) => {
  return (
    <Panel bordered className="stats-panel  mr-b-1" header={title}>
      {children}
    </Panel>
  );
};

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>Polling Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Col xs={24}>
          <div className="details-grp">
            <div className="lbl">Polling Description</div>
            <div className="val">{parse(dataObj.pollDescription)}</div>
          </div>
        </Col>
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Polling Start Date</div>
                <div className="val">{formatDate(dataObj.pollStartDate)}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Polling End Date</div>
                <div className="val">{formatDate(dataObj.pollEndDate)}</div>
              </div>
            </Col>
            <Col xs={16}>
              <div className="details-grp">
                <div className="lbl">Polling Options</div>
                {dataObj?.pollOptions?.length ? (
                  <Table
                    data={dataObj.pollOptions}
                    autoHeight
                    cellBordered
                    wordWrap="break-word"
                  >
                    <Column flexGrow={1}>
                      <HeaderCell>Option</HeaderCell>
                      <Cell dataKey="option" />
                    </Column>

                    <Column width={100}>
                      <HeaderCell>Votes</HeaderCell>
                      <Cell dataKey="votes" />
                    </Column>
                  </Table>
                ) : (
                  <p>No polling options available.</p>
                )}
              </div>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="default">
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};
