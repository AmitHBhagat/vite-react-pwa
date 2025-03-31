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

import RequestDemoService from "../../../services/requestDemo.service";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";

import classNames from "classnames";

import { setRouteData } from "../../../stores/appSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import "./requestDemo.css";

const RequestDemoList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const [requestDemos, setRequestDemos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState();
  const [sortType, setSortType] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [pageError, set_pageError] = useState("");
  const [status, setStatus] = useState(false);
  const [disable, setDisable] = useState(false);
  const [topAffixed, setTopAffixed] = useState(false);
  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getRequestDemoList();
  }, []);

  const getRequestDemoList = async () => {
    try {
      const resp = await trackPromise(RequestDemoService.getRequestDemos());
      setRequestDemos(resp.data.requestDemos);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Failed to fetch requestDemos", error);
    }
  };

  const getData = () => {
    let filteredRequestDemos = requestDemos;
    if (searchQuery) {
      filteredRequestDemos = requestDemos.filter((requestDemo) =>
        requestDemo.requestDemoName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    let sortedRequestDemos = [...filteredRequestDemos];
    if (sortColumn && sortType) {
      sortedRequestDemos.sort((a, b) => {
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
    const paginatedRequestDemos = sortedRequestDemos.slice(start, end);
    paginatedRequestDemos.forEach((requestDemo) => {
      requestDemo.societyName =
        requestDemo.societyName?.societyName || requestDemo.societyName;
    });
    return paginatedRequestDemos;
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
    <Container className="requestDemos-cont">
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
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={0.75} minWidth={135} sortable>
                <HeaderCell>Society Name</HeaderCell>
                <Cell dataKey="societyName">
                  {(rowData) => (
                    <Link to={`/requestDemo/${rowData._id}`}>
                      {rowData.societyName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Society Address</HeaderCell>
                <Cell dataKey="societyAddress" />
              </Column>
              <Column flexGrow={0.75} minWidth={100} sortable>
                <HeaderCell>Contact Name</HeaderCell>
                <Cell dataKey="name" />
              </Column>
              <Column width={100} sortable>
                <HeaderCell>Mobile</HeaderCell>
                <Cell dataKey="mobile" />
              </Column>
              <Column flexGrow={0.75} width={135} sortable>
                <HeaderCell>Email</HeaderCell>
                <Cell dataKey="email" />
              </Column>
              <Column width={160} sortable>
                <HeaderCell>Status</HeaderCell>
                <Cell>
                  {(rowData) => {
                    const status = rowData.status;
                    let color;
                    // Demo Scheduled(skyblue), Demo Given(orange), Approval Pending(red), Completed(green)
                    switch (status) {
                      case "Demo Scheduled":
                        color = "var(--clr-primary-light)";
                        break;
                      case "Demo Given":
                        color = "var(--clr-secondary)";
                        break;
                      case "Approval Pending":
                        color = "var(--clr-negate)";
                        break;
                      case "Completed":
                        color = "var(--clr-affirm)";
                        break;
                    }
                    return (
                      <div
                        className="status"
                        style={{ borderColor: color, color: color }}
                      >
                        {rowData.status}
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
            total={requestDemos.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
      </div>
    </Container>
  );
};

export default RequestDemoList;
