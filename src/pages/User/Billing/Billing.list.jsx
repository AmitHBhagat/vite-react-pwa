import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Pagination, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRazorpay } from "react-razorpay";
import AppLogo from "../../../assets/images/logo.jpg";
import BillService from "../../../services/billing.service";
import PaymentService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { THEME } from "../../../utilities/theme";

const BillingList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const { error, isLoading, Razorpay } = useRazorpay();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [billList, setBillList] = useState([]);
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

  const isSmallScreen = useSmallScreen(768);

  const getBills = async () => {
    try {
      const resp = await trackPromise(
        BillService.getBillsByFlat(
          authState.selectedFlat.societyId,
          authState.selectedFlat.value
        )
      );
      const { data } = resp;
      if (data.success) {
        if (data.billings.length) {
          data.billings[0].isFirstRow = true;
        }
        setBillList(data.billings);
      } else setBillList([]);
    } catch (err) {
      setBillList([]);
      console.error("Fetch bills catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching bills`;
      toast.error(errMsg);
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

  const makePayment = async function (billingId, societyId, flatId, amount) {
    setPageError("");
    let orderPayload = {},
      dbOrder = {};
    try {
      orderPayload = {
        amount,
        userId: authState.user._id,
        societyId,
        flatId,
        billingId,
      };
      const resp = await trackPromise(
        PaymentService.generatePaymentOrder(orderPayload)
      );
      const { data } = resp;
      if (data.success) {
        dbOrder = data.order;
      }
    } catch (err) {
      console.error("Payment order catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in creating payment order`;
      toast.error(errMsg);
      setPageError(errMsg);
      return;
    }

    if (!dbOrder.orderId) {
      toast.error("Server error in creating payment order");
      return;
    }

    const options = {
      key: dbOrder.razorpay_api_key,
      amount: dbOrder.amount * 100,
      currency: dbOrder.currency,
      name: "Society Care",
      description: "Pay Maintenance",
      image: AppLogo,
      order_id: dbOrder.orderId,
      handler: async (rzResp) => {
        try {
          const paymentPayload = {
            rzOrderId: rzResp.razorpay_order_id,
            rzPaymentId: rzResp.razorpay_payment_id,
            rzSignature: rzResp.razorpay_signature,
            ...orderPayload,
          };
          const updateResp = await trackPromise(
            PaymentService.updatePaymentOrder(dbOrder._id, paymentPayload)
          );
          const { data } = updateResp;
          if (data.success) {
            toast.success("Payment successful");
            getBills();
          }
        } catch (error) {
          console.error("Razorpay payment catch => ", error);
          const errMsg =
            error?.rzResp?.data?.message || "Failed to make bill payment";
          toast.error(errMsg);
          setPageError(errMsg);
        }
      },
      prefill: {
        name: authState.user.name,
        email: authState.user.email,
        contact: authState.user.mobile,
      },
      theme: {
        color: THEME[0].CLR_PRIMARY,
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div className="inner-container">
        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={billList}
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
              <Column sortable flexGrow={1} minWidth={100}>
                <HeaderCell>Bill No</HeaderCell>
                <Cell dataKey="billNo" />
              </Column>
              <Column sortable flexGrow={1.5} minWidth={100}>
                <HeaderCell>Bill Date</HeaderCell>
                <Cell dataKey="billDate">
                  {(rawData) => formatDate(rawData.billDate)}
                </Cell>
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell>Month</HeaderCell>
                <Cell dataKey="maintenanceMonth" />
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell>Year</HeaderCell>
                <Cell dataKey="maintenanceYear" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell title="Other Charges">Other (&#8377;)</HeaderCell>
                <Cell dataKey="otherCharges" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell title="Total Charges">Total (&#8377;)</HeaderCell>
                <Cell dataKey="totalCharges" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Arrears (&#8377;)</HeaderCell>
                <Cell dataKey="arrears" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell>Interest (%)</HeaderCell>
                <Cell dataKey="interest" />
              </Column>
              <Column sortable flexGrow={1.5}>
                <HeaderCell title="Grand Total">Grand (&#8377;)</HeaderCell>
                <Cell dataKey="totalAmount" />
              </Column>
              <Column align="center" className="col-action">
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
                      <Button
                        appearance="primary"
                        size="sm"
                        type="button"
                        onClick={() =>
                          makePayment(
                            rowData._id,
                            authState.selectedFlat.societyId,
                            authState.selectedFlat.value,
                            rowData.totalAmount
                          )
                        }
                        disabled={
                          !rowData.paymentStatus ||
                          rowData.paymentStatus === "paid" ||
                          rowData.paymentStatus === "processing" ||
                          !rowData.isFirstRow
                        }
                      >
                        {!rowData.paymentStatus
                          ? "NA"
                          : rowData.paymentStatus === "paid"
                          ? "Paid"
                          : rowData.paymentStatus === "processing"
                          ? "Processing"
                          : "Pay"}
                      </Button>
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
            total={billList.length}
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

export default BillingList;
