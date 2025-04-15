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
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import maintenanceService from "../../../services/maintenance.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";

const MaintenanceManagement = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [topAffixed, setTopAffixed] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [currentList, setCurrentList] = useState([]);
  const [billChargesHeaders, setBillChargesHeaders] = useState([]);
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
    getMaintenanceInfo();
  }, [dispatch, pageTitle]);

  const getMaintenanceInfo = async () => {
    try {
      const resp = await trackPromise(
        maintenanceService.getMaintenanceDetails(societyId)
      );

      const allData = resp.data;
      setCurrentList(allData.maintenances);
      setBillChargesHeaders(allData.maintenanceHeaders);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch maintenance"
      );
      console.error("Error fetching maintenance:", error);
    }
  };

  console.log("currentList.....", currentList, billChargesHeaders);

  const paginatedData = useTableData({
    data: currentList,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "flatNo",
    filterElement2: "",
  });

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
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
              loading={loading}
              autoHeight
              headerHeight={50}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column sortable flexGrow={1}>
                <HeaderCell>Flat No.</HeaderCell>
                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Link
                      to={`/maintenance-management/details/${rowData.flatId}`}
                    >
                      {rowData.flatNo}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Maintenance Charges</HeaderCell>
                <Cell dataKey="maintenanceCharges"></Cell>
              </Column>
              {/* {billChargesHeaders?.map((header, index) => (
								<Column key={index} sortable flexGrow={1}>
									<HeaderCell>{header.title}</HeaderCell>
									<Cell>
										{(rowData) => {
											const matchingCharge = rowData.billCharges?.find(
												(charge) => charge._id === header._id
											);
											return matchingCharge ? matchingCharge.value : 0;
										}}
									</Cell>
								</Column>
							))} */}
              <Column sortable flexGrow={1}>
                <HeaderCell>Other Charges</HeaderCell>
                <Cell dataKey="otherCharges" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell>Arrears</HeaderCell>
                <Cell dataKey="arrears"></Cell>
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Description</HeaderCell>
                <Cell dataKey="description" />
              </Column>

              <Column sortable flexGrow={1}>
                <HeaderCell>Total</HeaderCell>
                <Cell dataKey="totalAmount" />
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={currentList}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </Container>
  );
};

export default MaintenanceManagement;
