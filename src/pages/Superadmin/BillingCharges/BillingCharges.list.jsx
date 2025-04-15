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

import billChargeService from "../../../services/billingCharge.service";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import EditIcon from "@rsuite/icons/Edit";

import classNames from "classnames";
import { IconButton } from "rsuite";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { THEME } from "../../../utilities/theme";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import "./billingCharges.css";

const BillsList = ({ pageTitle }) => {
  const dispatch = useDispatch();

  const [bills, setBills] = useState([]);
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
    getBills();
  }, []);

  const getBills = async () => {
    setPageError("");
    setLoading(true);
    let bills = [];
    try {
      const resp = await trackPromise(billChargeService.getCharges());
      const { data } = resp;
      if (data.success) bills = data.data;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || `Error in fetching bills`;
      toast.error(errMsg);
      console.error("Failed to fetch bills", errMsg);
      setPageError(errMsg);
    }
    setBills(bills);
    setLoading(false);
  };
  const paginatedData = useTableData({
    data: bills,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "societyName",
    filterElement2: "",
  });

  return (
    <Container className="">
      <ScrollToTop />
      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix>
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
              wordWrap="break-word"
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
              loading={loading}
              affixHeader={60}
              headerHeight={40}
              autoHeight
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1.5} minWidth={250} sortable>
                <HeaderCell>Society Name</HeaderCell>
                <Cell dataKey="societyName">
                  {(rowData) => (
                    <Link to={`/bill/${rowData.billingCharge}`}>
                      {rowData.societyName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Members Count</HeaderCell>
                <Cell dataKey="societyMembersCount" />
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Activation Year</HeaderCell>
                <Cell dataKey="societyActivationYear" />
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Activation Month</HeaderCell>
                <Cell dataKey="societyActivationMonth" />
              </Column>
              <Column
                flexGrow={0.5}
                minWidth={90}
                align="center"
                className="col-action"
              >
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
                      <Link to={`/edit-bill/${rowData.billingCharge}`}>
                        <IconButton
                          title="edit"
                          icon={
                            <EditIcon
                              className="icon-blue"
                              color={THEME[0].CLR_PRIMARY}
                            />
                          }
                        />
                      </Link>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={bills}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </Container>
  );
};

export default BillsList;
