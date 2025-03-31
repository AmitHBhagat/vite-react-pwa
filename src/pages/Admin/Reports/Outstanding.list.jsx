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
  IconButton,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import ReportService from "../../../services/report.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";

import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const OutstandingList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [outstanding, setOutstanding] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) fetchOutstanding(societyId);
  }, [societyId]);

  const isSmallScreen = useSmallScreen(768);

  const fetchOutstanding = async (societyId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(ReportService.getOutstanding(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.outstanding;
      }
    } catch (err) {
      console.error("Outstanding fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching outstanding`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setOutstanding(respdata);
  };

  const getData = () => {
    let filteredList = outstanding.filter(
      (outstanding) =>
        outstanding?.flat?.flatNo
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        outstanding?.flat?.ownerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
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
              <Column sortable flexGrow={0.6}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Link to={`/flat/details/${rowData?.flat?._id}`}>
                      {rowData?.flat?.flatNo}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={250} sortable flexGrow={0.6}>
                <HeaderCell>Flat Type</HeaderCell>
                <Cell dataKey="flatType">
                  {(rowData) => rowData?.flat?.flatType}
                </Cell>
              </Column>
              <Column sortable flexGrow={0.6}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName">
                  {(rowData) => rowData?.flat?.ownerName}
                </Cell>
              </Column>

              <Column flexGrow={0.6}>
                <HeaderCell>Credit Amount</HeaderCell>
                <Cell dataKey="creditAmount"></Cell>
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Debit Amount</HeaderCell>
                <Cell dataKey="debitAmount"></Cell>
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Outstanding Amount</HeaderCell>
                <Cell dataKey="outStandingAmount"></Cell>
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
            total={outstanding.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default OutstandingList;
