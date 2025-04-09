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
import QueryService from "../../../services/requestQuery.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { BREAK_POINTS } from "../../../utilities/constants";

const RequestQueryList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [queries, setQueries] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState.selectedFlat.societyId)
      getQueries(authState.selectedFlat.societyId);
  }, [authState.selectedFlat]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getQueries = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(QueryService.getQueries(societyid));
      const { data } = resp;
      if (data.success) respdata = resp.data.queriess;
    } catch (err) {
      console.error("Queries fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching queries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setQueries(respdata);
  };

  const getData = () => {
    let filteredList = queries.filter((itm) =>
      itm.title.toLowerCase().includes(searchQuery.toLowerCase())
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
    setSelectedQuery(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedQuery({});
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
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/request-queries/add`}>
                <Button appearance="primary" size="md">
                  Add Query
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
              <Column flexGrow={1}>
                <HeaderCell>Member Name</HeaderCell>
                <Cell dataKey="memberName" />
              </Column>
              <Column flexGrow={0.75}>
                <HeaderCell>Date</HeaderCell>
                <Cell dataKey="date">
                  {(rawData) => formatDate(rawData.date)}
                </Cell>
              </Column>
              <Column flexGrow={0.75} align="center">
                <HeaderCell>Status</HeaderCell>
                <Cell dataKey="status">
                  {(rawData) => (
                    <div className={`col-status query-${rawData.status}`}>
                      {rawData.status}
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
            total={queries.length}
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
          dataObj={selectedQuery}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default RequestQueryList;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>{dataObj.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Comment</div>
                <div className="val">{dataObj.commments}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Description</div>
                <div className="val">{dataObj.description}</div>
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
