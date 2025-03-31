import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  useToaster,
  Affix,
  FlexboxGrid,
} from "rsuite";

import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import classNames from "classnames";
import "../../../layouts/ProtectedLayout.css";
import { formatDate } from "../../../utilities/formatDate";
import StatusIndicator from "../../../components/StatusIndicator/StatusIndicator";
import reportService from "../../../services/report.service";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const LeaseHoldFlatsList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const [leaseHoldFlats, setLeaseHoldFlats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = React.useState(5);
  const [topAffixed, setTopAffixed] = useState(false);
  const [page, setPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState();
  const [sortType, setSortType] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [pageError, setPageError] = useState("");
  const authState = useSelector((state) => state.authState);
  const role = authState?.user?.role;
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getLeaseHoldFlats();
  }, []);

  const getLeaseHoldFlats = async () => {
    setPageError("");
    let LeaseHoldFlatData = [];
    try {
      const resp = await trackPromise(reportService.getRentedReport(societyId));
      const { data } = resp;
      if (data.success) LeaseHoldFlatData = resp.data.flat;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || `Error in fetching flats`;

      toast.error(errMsg);
      console.error("Failed to fetch leaseHoldFlats", error);
      setPageError(errMsg);
    }
    setLeaseHoldFlats(LeaseHoldFlatData);
  };

  const getData = () => {
    let filteredLeaseHoldFlats = leaseHoldFlats;

    if (searchQuery) {
      filteredLeaseHoldFlats = leaseHoldFlats.filter(
        (leaseHoldFlat) =>
          leaseHoldFlat.ownerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          leaseHoldFlat.flatNo.includes(searchQuery)
      );
    }
    let sortedLeaseHoldFlats = [...filteredLeaseHoldFlats];
    if (sortColumn && sortType) {
      sortedLeaseHoldFlats.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") {
          x = x.charCodeAt();
        }
        if (typeof y === "string") {
          y = y.charCodeAt();
        }
        if (sortType === "asc") {
          return x - y;
        } else {
          return y - x;
        }
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    const paginatedLeaseHoldFlats = sortedLeaseHoldFlats.slice(start, end);
    paginatedLeaseHoldFlats.forEach((leaseHoldFlat) => {
      leaseHoldFlat.societyName =
        leaseHoldFlat.societyName?.societyName || leaseHoldFlat.societyName;
    });
    return paginatedLeaseHoldFlats;
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

  const isSmallScreen = useSmallScreen(768);

  return (
    <Container className="leaseHoldFlats-container">
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
              autoHeight
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              affixHeader={50}
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Flat No</HeaderCell>

                <Cell dataKey="flatNo" />
              </Column>
              <Column flexGrow={0.5} minWidth={100} sortable>
                <HeaderCell>Flat Area</HeaderCell>
                <Cell dataKey="flatArea" />
              </Column>
              <Column flexGrow={1} minWidth={90} sortable>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>
              <Column flexGrow={0.5} minWidth={150} sortable>
                <HeaderCell>Owner Contact</HeaderCell>
                <Cell dataKey="contactDetails" />
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Is On Rent</HeaderCell>
                <Cell dataKey="isOnRent">
                  {(rowData) => <StatusIndicator status={rowData.isOnRent} />}
                </Cell>
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Tenant Name</HeaderCell>
                <Cell dataKey="tenantName" />
              </Column>
              <Column flexGrow={0.5} minWidth={200} sortable>
                <HeaderCell>Tenant Contact Details</HeaderCell>
                <Cell dataKey="tenantContactDetails" />
              </Column>
              <Column flexGrow={0.5} minWidth={200} sortable>
                <HeaderCell>Lease Start Date</HeaderCell>
                <Cell>
                  {(rowData) => {
                    return formatDate(rowData.leaseStartDate);
                  }}
                </Cell>
              </Column>
              <Column flexGrow={0.5} minWidth={200} sortable>
                <HeaderCell>Lease Expiry Date</HeaderCell>
                <Cell>
                  {(rowData) => {
                    return formatDate(rowData.leaseExpiryDate);
                  }}
                </Cell>
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Two Wheeler</HeaderCell>
                <Cell dataKey="twoWheeler" />
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Four Wheeler</HeaderCell>
                <Cell dataKey="fourWheeler" />
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Outstanding Amount</HeaderCell>
                <Cell dataKey="outStandingAmount" />
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
            total={leaseHoldFlats.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
      </div>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </Container>
  );
};

export default LeaseHoldFlatsList;
