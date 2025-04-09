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
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import NoticeService from "../../../services/notice.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import parse from "html-react-parser";
import { BREAK_POINTS } from "../../../utilities/constants";

const NoticesList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [notices, setNotices] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchNotices, setSearchNotices] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState.selectedFlat.societyId)
      getNotices(authState.selectedFlat.societyId);
  }, [authState.selectedFlat]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getNotices = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(NoticeService.getNotices(societyid));
      const { data } = resp;
      if (data.success) {
        respdata = data.notices;
      }
    } catch (err) {
      console.error("Notices fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching notices`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setNotices(respdata);
  };

  const getData = () => {
    let filteredList = notices.filter((itm) =>
      itm.title?.toLowerCase()?.includes(searchNotices.toLowerCase() || "")
    );

    if (sortColumn && sortType) {
      filteredList?.sort((a, b) => {
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
    return filteredList?.slice(start, end);
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
    setSelectedNotice(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNotice({});
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
                  placeholder="Search ..."
                  value={searchNotices}
                  onChange={setSearchNotices}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
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
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenModal(rowData)}>
                        {rowData.title}
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.75}>
                <HeaderCell>Notice Date</HeaderCell>
                <Cell dataKey="date">
                  {(rawData) => formatDate(rawData.date)}
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
            total={notices?.length}
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
          dataObj={selectedNotice}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default NoticesList;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>{parse(dataObj.title)}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Comments</div>
                <div className="val">{parse(dataObj.commments)}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Notice Date</div>
                <div className="val">{formatDate(dataObj.date)}</div>
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
