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
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import noticeService from "../../../services/notice.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import classNames from "classnames";
import { formatDate } from "../../../utilities/formatDate";
import parse from "html-react-parser";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { BREAK_POINTS } from "../../../utilities/constants.js";

const NoticeList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selNotices, setSelNotices] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [topAffixed, setTopAffixed] = useState(false);
  const [pageError, setPageError] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) fetchNotices(societyId);
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

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

  const getData = () => {
    let filteredNotices = notices.filter((notices) =>
      notices.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredNotices.sort((a, b) => {
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
    return filteredNotices.slice(start, end);
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
    setSelNotices(item);
    setDeleteMessage(`Do you wish to delete ${item.title}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelNotices({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };
  const handleOpenDetailsModal = (item) => {
    setDetailModalOpen(true);
    setSelNotices(item);
  };

  const handleCloseDetailsModal = () => {
    setDetailModalOpen(false);
    setSelNotices({});
  };

  const deleteNotice = async () => {
    try {
      const resp = await trackPromise(
        noticeService.deleteNotice(selNotices._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Notice deleted successfully");
        handleCloseModal();
        fetchNotices();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the notice";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete notice catch => ", error);
    }
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
                  placeholder="Search ..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/notices/add`}>
                <Button appearance="primary" size="md">
                  Add Notice
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
              <Column width={150} sortable flexGrow={0.6}>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenDetailsModal(rowData)}>
                        {rowData.title}
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column width={250} flexGrow={1.5}>
                <HeaderCell>Comments</HeaderCell>
                <Cell dataKey="commments">
                  {(rowData) => (
                    <div className="two-line-ellipsis">
                      {parse(rowData.commments)}
                    </div>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.4}>
                <HeaderCell>Date</HeaderCell>
                <Cell dataKey="date">
                  {(rowData) => formatDate(rowData.date)}
                </Cell>
              </Column>

              <Column width={100} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <Link to={`/notices/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        />
                      </Link>
                      <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() => handleOpenModal(rowData)}
                      />
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
            total={notices.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteNotice}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
        <DetailsModal
          isOpen={detailModalOpen}
          onClose={handleCloseDetailsModal}
          dataObj={selNotices}
        />
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default NoticeList;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>Notice Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Title</div>
                <div className="val">{dataObj.title}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Comments</div>
                <div className="val">{parse(dataObj.commments)}</div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Meeting Date</div>
                <div className="val">{formatDate(dataObj.date)}</div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">
                  {dataObj.status ? (
                    <span className="affirm">
                      <CheckOutlineIcon />
                    </span>
                  ) : (
                    <span className="negate">
                      <CloseOutlineIcon />
                    </span>
                  )}
                </div>
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
