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
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { BREAK_POINTS } from "../../../utilities/constants";

const VisitorList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState();
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  // useEffect(() => {
  //   if (societyId) {
  //     getVisitors();
  //   }
  // }, [societyId]);

  useEffect(() => {
    if (societyId && dateRange) {
      getVisitors(dateRange);
    }
  }, [societyId, dateRange]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getVisitors = async (range) => {
    const startDate = getStartOfDay(range[0]);
    const endDate = getEndOfDay(range[1]);
    const payload = { startDate, endDate };

    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        VisitorService.getSocietyVisitorflatwise(societyId, payload)
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
        if (sortColumn === "createdAt") {
          x = new Date(x);
          y = new Date(y);
        } else {
          if (typeof x === "string") x = x.toLowerCase();
          if (typeof y === "string") y = y.toLowerCase();
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

  const deleteVisitor = async () => {
    try {
      const resp = await trackPromise(
        VisitorService.deleteVisitor(selectedVisitor)
      );
      const { data } = resp;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(data.message || "Visitor deleted successfully");
        getVisitors(societyId);
        handleCloseDeleteModal();
      }
    } catch (err) {
      const errMsg = err.response.data.message || "Error deleting the visitor";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Error deleting the visitor", err);
    }
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedVisitor(item._id);
    setDeleteMessage(`Do you want to delete this visitor ${item.visitorName}`);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedVisitor();
    setDeleteError("");
    setDeleteMessage("");
    setDeleteModalOpen(false);
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
              <FlexboxGrid>
                <FlexboxGrid.Item>
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
                <FlexboxGrid.Item>
                  <DateRangePicker
                    placeholder="Filter by Date"
                    value={dateRange}
                    onChange={setDateRange}
                    className="date-picker"
                    cleanable={false}
                  />
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/visitors/add`}>
                <Button appearance="primary" size="md">
                  Add Visitor
                </Button>
              </Link>
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
              <Column sortable width={180}>
                <HeaderCell>Date & Time</HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => formatDateTime(rowData.createdAt)}
                </Cell>
              </Column>
              <Column width={80}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flat.flatNo" />
              </Column>
              <Column sortable flexGrow={2}>
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
              <Column width={100} sortable>
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
              <Column width={130}>
                <HeaderCell>Phone</HeaderCell>
                <Cell dataKey="visitorPhone" />
              </Column>
              <Column width={130}>
                <HeaderCell>Flat Contact</HeaderCell>
                <Cell dataKey="flatContact" />
              </Column>
              <Column width={130} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <div>
                      <Link to={`/visitors/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon className="icon-blue" />}
                        />
                      </Link>
                    </div>
                  )}
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

        <DeleteModal
          itemId={selectedVisitor}
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          deleteAction={deleteVisitor}
          deleteErr={deleteError}
          deleteMsg={deleteMessage}
          consentRequired={deleteConsent}
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
        <Grid fluid className="visitor-grid">
          <Row gutter={16}>
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

export default VisitorList;
