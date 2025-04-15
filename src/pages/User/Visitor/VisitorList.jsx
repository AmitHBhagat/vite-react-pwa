import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
  Modal,
  Grid,
  Whisper,
  Tooltip,
  IconButton,
  DateRangePicker,
  Form,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import VisitorService from "../../../services/visitor.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import {
  formatDateTime,
  getEndOfDay,
  getStartOfDay,
} from "../../../utilities/formatDate";
import { BREAK_POINTS } from "../../../utilities/constants";

const VisitorListUser = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);

  const [pageError, setPageError] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState();
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState.selectedFlat.value) {
      getVisitors(authState.selectedFlat.value);
    }
  }, [authState.selectedFlat]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getVisitors = async () => {
    const startDate = getStartOfDay(dateRange[0]);
    const endDate = getEndOfDay(dateRange[1]);
    const payload = { startDate, endDate };

    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        VisitorService.getFlatVisitors(authState.selectedFlat.value, payload)
      );
      const { data } = resp;
      if (data.success) respData = resp.data.visitors;
    } catch (err) {
      console.error("Visitors fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching visitor entries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVisitors(respData);
  };

  const getData = () => {
    let filteredList = visitors.filter((itm) =>
      itm.visitorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredList.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") {
          x = x.charCodeAt();
        }
        if (typeof y === "string") {
          y = y.charCodeAt();
        }
        return sortType === "asc" ? x - y : y - x;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return filteredList.slice(start, end);
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSortColumn(sortColumn);
      setSortType(sortType);
    }, 500);
  };

  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleOpenModal = (item) => {
    setSelectedVisitor(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVisitor({});
    setModalOpen(false);
  };

  return (
    <Container className="">
      <ScrollToTop />
      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item className="filters-row section-mb">
              <InputGroup inside>
                <Input
                  placeholder="Search by visitor name..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={{ display: "flex", gap: "1rem" }}>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
                format="dd/MM/yyyy"
                block
                cleanable={false}
                placement="bottomEnd"
              />
              <Button appearance="primary" onClick={getVisitors}>
                Show
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1}>
                <HeaderCell>Date & Time</HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => formatDateTime(rowData.createdAt)}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Flat Contact</HeaderCell>
                <Cell dataKey="flatContact" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell>Visitor Name</HeaderCell>
                <Cell dataKey="visitorName">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenModal(rowData)}>
                        {rowData.visitorName}
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Phone</HeaderCell>
                <Cell dataKey="visitorPhone" />
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Image</HeaderCell>
                <Cell dataKey="societyImage">
                  {(rowData) => {
                    console.log(rowData);
                    return (
                      <div>
                        {rowData.visitorImage?.fileurl && (
                          <img
                            src={rowData.visitorImage.fileurl}
                            alt={rowData.visitorImage.title}
                            className="visitor-image"
                          />
                        )}
                      </div>
                    );
                  }}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>

        <div className="">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size={isSmallScreen ? "xs" : "md"}
            layout={[
              "total",
              "-",
              `${!isSmallScreen ? "limit" : ""}`,
              `${!isSmallScreen ? "|" : ""}`,
              "pager",
              `${!isSmallScreen ? "|" : ""}`,
              `${!isSmallScreen ? "skip" : ""}`,
            ]}
            total={visitors.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <DetailsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dataObj={selectedVisitor}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>Visitor Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Visitor Name</div>
                <div className="val">{dataObj.visitorName}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Vistor Phone</div>
                <div className="val">{dataObj.visitorPhone}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Flat No</div>
                <div className="val">{dataObj.flat.flatNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Flat Contact</div>
                <div className="val">{dataObj.flatContact}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Description</div>
                <div className="val">{dataObj.description}</div>
              </div>
            </Col>
            <Col xs={24}>
              {dataObj.visitorImage?.fileurl ? (
                <div className="details-grp">
                  <div className="lbl">Visitor Image</div>
                  <div className="val visitor-image">
                    <img
                      src={dataObj.visitorImage.fileurl}
                      alt={dataObj.visitorImage.title}
                      style={{ maxWidth: "10rem", maxHeight: "10rem" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="details-grp">
                  <div className="lbl">Visitor Image</div>
                  <div className="val">No image available</div>
                </div>
              )}
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

export default VisitorListUser;
