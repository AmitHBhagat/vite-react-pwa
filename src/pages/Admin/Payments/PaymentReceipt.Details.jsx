import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Pagination,
  Affix,
  Button,
  FlexboxGrid,
  InputPicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { IconButton } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import PaymentsService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import { BREAK_POINTS, MONTHS } from "../../../utilities/constants";
import { formatDate } from "../../../utilities/formatDate";
import { FaRegFilePdf } from "react-icons/fa";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logoImage from "../../../assets/images/logo.jpg";
import { numberToWords } from "../../../utilities/functions";
import {
  createPaymentReceiptPdf,
  exportToExcel,
} from "../../../utilities/ExportDataToExcelOrPDF";
import societyService from "../../../services/society.service";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const PaymentReceiptDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [PaymentsReceipt, setPaymentsReceipt] = useState([]);
  const [societyInfo, setSocietyInfo] = useState("");
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState("");
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [generateReceiptLoading, setGenerateReceiptLoading] = useState([
    false,
    "null",
  ]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    fetchSocietyInfo();
    getPaymentsReceipt();
  }, [societyId]);

  async function fetchSocietyInfo() {
    setPageError("");
    let respdata;

    try {
      const resp = await trackPromise(societyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.society.societyName;
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching society detail";
      toast.error(errMsg);
      console.error("Fetch society detail catch => ", errMsg);
      setPageError(errMsg);
    }
    setSocietyInfo(respdata);
  }
  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getPaymentsReceipt = async () => {
    setLoading(true);
    let paymentReceipt = [];
    try {
      const resp = await trackPromise(
        PaymentsService.getAllPaymentReceipt(societyId)
      );
      const { data } = resp;
      if (data.success) paymentReceipt = data.paymentReceipts;
      setLoading(false);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in fetching payment receipt";
      toast.error(errMsg);
      console.error("Failed to fetch PaymentsReceipt", errMsg);
      setPageError(errMsg);
      setLoading(false);
    }
    setPaymentsReceipt(paymentReceipt);
  };

  const generateReceipt = async (paymentReceiptDetailsId) => {
    try {
      setGenerateReceiptLoading([true, paymentReceiptDetailsId]);
      const payload = {
        paymentReceiptDetailsId,
      };
      const resp = await trackPromise(
        PaymentsService.generatePaymentReceipt(payload)
      );
      getPaymentsReceipt();
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to generate PaymentsReceipt", error);
    }
    setGenerateReceiptLoading([false, "null"]);
  };

  let filteredPaymentReceipts = PaymentsReceipt.filter((paymentReceipt) => {
    return (
      paymentReceipt.year === String(year) && paymentReceipt.month === month
    );
  });

  const getData = () => {
    if (!sortColumn || !sortType) {
      return filteredPaymentReceipts
        .slice()
        .sort((a, b) => a.paymentNo - b.paymentNo);
    }

    const sortedPaymentReceipts = [...filteredPaymentReceipts].sort((a, b) => {
      let x = 0,
        y = 0;

      if (sortColumn.startsWith("charge_")) {
        const chargeId = sortColumn.replace("charge_", "");
        x = a.paymentCharges.find((c) => c._id === chargeId)?.value || 0;
        y = b.paymentCharges.find((c) => c._id === chargeId)?.value || 0;
      } else {
        x = a[sortColumn];
        y = b[sortColumn];

        if (typeof x === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
      }

      return sortType === "asc" ? x - y : y - x;
    });

    return sortedPaymentReceipts;
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

  const handleExport = async () => {
    await exportToExcel({
      data: getData(),
      worksheetName: "Maintenance Payments",
      headersConfig: [
        { key: "flatNo", title: "Flat No" },
        { key: "ownerName", title: "Owner Name" },
        { key: "bankDetails", title: "Bank Branch" },
        { key: "paymentMode", title: "Payment Mode" },
        { key: "transactionDetails", title: "Transaction Details" },
        { key: "month", title: "Maintenance Month" },
        { key: "year", title: "Maintenance Year" },
        { key: "paymentType", title: "Payment Type" },
        { key: "amount", title: "Amount" },
        {
          key: "date",
          title: "Payment Date",
          formatter: (date) => formatDate(date),
        },
      ],
      filename: `Payment Receipt Details-${month}-${year}.xlsx`,

      onError: (error) => {
        toast.error("Export failed");
        console.error(error);
      },
      onSuccess: () => toast.success("Export successful!"),
    });
  };

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 20,
    },
    header: {
      textAlign: "center",
      marginBottom: 10,
      fontSize: 12,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderTopWidth: 1,

      marginBottom: 10,
      paddingBottom: 10,
      paddingTop: 10,
    },
    tableRow: {
      flexDirection: "row",

      marginBottom: 10,
    },
    tableCell: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    particulars: {
      flex: 1,
      paddingRight: 10,
    },
    values: {
      flex: 1,
      textAlign: "right",
    },
    grandTotal: {
      textAlign: "right",
      marginTop: 20,
      fontWeight: "bold",
      borderTopWidth: 1,

      paddingTop: 10,
    },
    amountInWords: {
      marginTop: 10,
      fontSize: 10,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      right: 0,
      marginRight: 20,
      marginBottom: 20,
    },
  });

  function PaymentReceiptPdf({ data }) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-GB");

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Text style={styles.header}>{societyInfo}</Text>

          {/* Title */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text>
              Payment Receipt For The Month of {data.month}, {data.year}
            </Text>
            <Text>Flat No.: {data.flatNo}</Text>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={styles.particulars}>Particulars:</Text>
            <Text style={styles.values}>Values</Text>
          </View>

          {/* Table Rows */}
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Type:</Text>
            <Text style={styles.values}>{data.paymentType}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Mode:</Text>
            <Text style={styles.values}>{data.paymentMode}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Date:</Text>
            <Text style={styles.values}>{formattedDate}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Bank Details:</Text>
            <Text style={styles.values}>{data.bankDetails}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Amount:</Text>
            <Text style={styles.values}>{data.amount}</Text>
          </View>

          {/* Grand Total */}
          <Text style={styles.grandTotal}>Grand Total: {data.amount}</Text>

          {/* Amount in Words */}
          <Text style={styles.amountInWords}>
            Amount in Words: {numberToWords(data.amount)}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                marginRight: 25,
                marginBottom: 100,
              }}
            >
              Powered by
            </Text>
            <Image src={logoImage} style={{ width: 100, height: 100 }} />
          </View>
        </Page>
      </Document>
    );
  }

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map((year) => ({
      label: year,
      value: year,
    }));
  }, []);

  const finalDataForTable = () => {
    const sortedData = getData();
    const start = limit * (page - 1);
    const end = start + limit;
    return sortedData.slice(start, end);
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item
              className="filters-row section-mb"
              style={{ display: "flex", gap: "1rem" }}
            >
              <InputPicker
                data={years}
                value={year}
                onChange={(value) => setYear(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <InputPicker
                data={MONTHS}
                value={month}
                onChange={(value) => setMonth(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <Button appearance="primary" size="md" onClick={handleExport}>
                Export to Excel
              </Button>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item
              style={{ display: "flex", gap: "1rem" }}
            ></FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={finalDataForTable()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Bank Detail</HeaderCell>
                <Cell dataKey="bankDetails" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Maintenance Month</HeaderCell>
                <Cell dataKey="month" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Maintenance year</HeaderCell>
                <Cell dataKey="year" />
              </Column>

              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Payment Type</HeaderCell>
                <Cell dataKey="paymentType" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Payment Mode</HeaderCell>
                <Cell dataKey="paymentMode" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="amount" />
              </Column>

              <Column width={130} align="center" className="col-action">
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
                      <IconButton
                        title="pdf"
                        icon={<FaRegFilePdf color={THEME[0].CLR_PRIMARY} />}
                        onClick={() =>
                          createPaymentReceiptPdf(
                            PaymentReceiptPdf,
                            rowData,
                            `PaymentReceipt_${rowData.flatNo}_${rowData.month}_${rowData.year}.pdf`
                          )
                        }
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
            total={filteredPaymentReceipts.length}
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

export default PaymentReceiptDetail;
