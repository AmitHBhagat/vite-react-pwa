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
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import RequestQueryService from "../../../services/requestQuery.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { THEME } from "../../../utilities/theme";
import { BREAK_POINTS } from "../../../utilities/constants";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const RequestQueries = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [requestQueries, setRequestQueries] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selQuery, setSelQuery] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [pageError, setPageError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getRequestQueries();
  }, []);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getRequestQueries = async () => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        RequestQueryService.getQueries(societyId)
      );
      const { data } = resp;
      if (data.success) respData = resp.data.queriess;
    } catch (err) {
      console.error("Request query fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching request query`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setRequestQueries(respData);
  };

  const getData = () => {
    let filteredQueries = requestQueries.filter((query) =>
      query.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredQueries.sort((a, b) => {
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
    return filteredQueries.slice(start, end);
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
    setSelQuery(item);
    setDeleteMessage(`Do you wish to delete ${item.title}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelQuery({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteRequestQuery = async () => {
    try {
      const resp = await trackPromise(
        RequestQueryService.deleteRequestQuery(selQuery._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Query deleted successfully");
        handleCloseModal();
        getRequestQueries();
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in deleting the query";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete query catch => ", error);
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
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb ">
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
              <Column width={120} sortable flexGrow={0.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Link to={`/request-queries/details/${rowData._id}`}>
                      {rowData.flatNo}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={150} sortable flexGrow={0.7}>
                <HeaderCell>Member Name</HeaderCell>
                <Cell dataKey="memberName" />
              </Column>
              <Column width={150} sortable flexGrow={0.9}>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title" />
              </Column>
              <Column width={150} align="center" flexGrow={0.6}>
                <HeaderCell>Request Status</HeaderCell>

                <Cell dataKey="status">
                  {(rowData) => (
                    <div className={`col-status query-${rowData.status}`}>
                      {rowData.status}
                    </div>
                  )}
                </Cell>
              </Column>
              <Column width={200} flexGrow={1.2}>
                <HeaderCell>Description</HeaderCell>
                <Cell dataKey="description" />
              </Column>

              <Column width={150} flexGrow={0.6}>
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
                      <Link to={`/request-queries/edit/${rowData._id}`}>
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
            total={requestQueries.length}
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
          deleteAction={deleteRequestQuery}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default RequestQueries;
