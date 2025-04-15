import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  InputGroup,
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
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import "./requestDemo.css";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const RequestDemoList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [requestDemos, setRequestDemos] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [pageError, setPageError] = useState("");
  const {
    searchQuery,
    setSearchQuery,
    limit,
    setLimit,
    page,
    setPage,
    sortColumn,
    sortType,
    setSort,
    loading,
    setLoading,
  } = useTableState();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getRequestDemoList();
  }, []);

  const getRequestDemoList = async () => {
    setPageError("");
    setLoading(true);
    let requestDemos = [];
    try {
      const resp = await trackPromise(RequestDemoService.getRequestDemos());
      const { data } = resp;
      if (data.success) requestDemos = data.requestDemos;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || `Error in fetching request demos`;
      toast.error(errMsg);
      console.error("Failed to fetch requestDemos", errMsg);
      setPageError(errMsg);
    }
    setRequestDemos(requestDemos);
    setLoading(false);
  };
  const paginatedData = useTableData({
    data: requestDemos,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "societyName",
    filterElement2: "name",
  });

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
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
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
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

        <Paginator
          data={requestDemos}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </Container>
  );
};

export default RequestDemoList;
