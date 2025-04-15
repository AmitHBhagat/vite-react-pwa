import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Pagination, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PaymentService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { BREAK_POINTS } from "../../../utilities/constants";

const PaymentList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [paymentList, setPaymentList] = useState([]);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState.selectedFlat.societyId && authState.selectedFlat.value)
      getBills();
  }, [authState.selectedFlat]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getBills = async () => {
    setPageError("");
    try {
      const resp = await trackPromise(
        PaymentService.getPaymentsByFlat(
          authState.selectedFlat.societyId,
          authState.selectedFlat.value
        )
      );
      const { data } = resp;
      if (data.success) setPaymentList(data.paymentDetails);
      else setPaymentList([]);
    } catch (err) {
      setPaymentList([]);
      console.error("Payment fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching payments`;
      toast.error(errMsg);
      setPageError(errMsg);
      return;
    }
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

      <div className="inner-container">
        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={0}
              wordWrap="break-word"
              data={paymentList}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column sortable flexGrow={1} minWidth={100}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>
              <Column sortable flexGrow={2} minWidth={200}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>
              <Column sortable flexGrow={2} minWidth={200}>
                <HeaderCell>Bank Branch</HeaderCell>
                <Cell dataKey="bankDetails" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell title="Payment Mode">Mode</HeaderCell>
                <Cell dataKey="paymentMode" />
              </Column>
              <Column sortable flexGrow={2} minWidth={200}>
                <HeaderCell>Transaction Details</HeaderCell>
                <Cell dataKey="transactionDetails" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell title="Maintenance Month">Month</HeaderCell>
                <Cell dataKey="month" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell title="Maintenance Year">Year</HeaderCell>
                <Cell dataKey="year" />
              </Column>
              <Column sortable flexGrow={1.5} minWidth={150}>
                <HeaderCell title="Payment Type">Type</HeaderCell>
                <Cell dataKey="paymentType" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Amount (&#8377;)</HeaderCell>
                <Cell dataKey="amount" />
              </Column>
              <Column sortable flexGrow={1.5} minWidth={150}>
                <HeaderCell title="Payment Date">Date</HeaderCell>
                <Cell dataKey="date">
                  {(rawData) =>
                    rawData.date ? formatDate(rawData.date) : "--"
                  }
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
            total={paymentList.length}
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

export default PaymentList;
