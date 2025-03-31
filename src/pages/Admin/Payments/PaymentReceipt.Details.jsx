import React, { useEffect, useState } from "react";
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
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IconButton } from "rsuite";
import DocPassIcon from "@rsuite/icons/DocPass";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { Link } from "react-router-dom";
import PaymentsService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import { MONTHS } from "../../../utilities/constants";
import { formatDate } from "../../../utilities/formatDate";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { FaRegFilePdf } from "react-icons/fa";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import logoImage from "../../../assets/images/logo.jpg";
import { capitalizeWords } from "../../../utilities/functions";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";

const PaymentReceiptDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [PaymentsReceipt, setPaymentsReceipt] = useState([]);
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [generateReceiptLoading, setGenerateReceiptLoading] = useState([
    false,
    "null",
  ]);
  const [paymentId, setPaymentId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getPaymentsReceipt();
  }, [societyId]);

  const isSmallScreen = useSmallScreen(768);

  const getPaymentsReceipt = async () => {
    setLoading(true);

    try {
      const resp = await trackPromise(
        PaymentsService.getAllPaymentReceipt(societyId)
      );
      setPaymentsReceipt(resp.data.paymentReceipts);

      setLoading(false);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch PaymentsReceipt", error);
      setLoading(false);
    }
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
  const handleCloseModal = () => {
    setPaymentId({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteUser = async () => {
    try {
      const resp = await trackPromise(
        PaymentsService.deletePaymentReceiptDetails(paymentId)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "paymentReceipt detail deleted successfully"
        );
        handleCloseModal();

        getPaymentsReceipt();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the user";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete paymentReceipt detail catch => ", error);
    }
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

  function numberToWords(num) {
    if (num === 0) return "zero only";

    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    function convertHundred(n) {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " hundred ";
        n %= 100;
      }
      if (n > 0) {
        if (n < 10) {
          str += ones[n] + " ";
        } else if (n < 20) {
          str += teens[n - 10] + " ";
        } else {
          str += tens[Math.floor(n / 10)] + " ";
          if (n % 10) {
            str += ones[n % 10] + " ";
          }
        }
      }
      return str;
    }

    let result = "";

    const billion = Math.floor(num / 1000000000);
    if (billion) {
      result += convertHundred(billion) + "billion ";
      num %= 1000000000;
    }

    const million = Math.floor(num / 1000000);
    if (million) {
      result += convertHundred(million) + "million ";
      num %= 1000000;
    }

    const thousand = Math.floor(num / 1000);
    if (thousand) {
      result += convertHundred(thousand) + "thousand ";
      num %= 1000;
    }

    if (num > 0) {
      result += convertHundred(num);
    }
    let fullWordString = capitalizeWords(result.trim() + " Only");
    return fullWordString;
  }

  const createPaymentReceiptPdf = async (rowData) => {
    try {
      const pdfBlob = await pdf(
        <PaymentReceiptPdf rowData={rowData} />
      ).toBlob();

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `PaymentReceipt_${rowData.flatNo}_${rowData.month}_${rowData.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  function PaymentReceiptPdf({ rowData }) {
    const formattedDate = new Date(rowData.date).toLocaleDateString("en-GB");

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Text style={styles.header}>niraj</Text>

          {/* Title */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text>
              Payment Receipt For The Month of {rowData.month}, {rowData.year}
            </Text>
            <Text>Flat No.: {rowData.flatNo}</Text>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={styles.particulars}>Particulars:</Text>
            <Text style={styles.values}>Values</Text>
          </View>

          {/* Table Rows */}
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Type:</Text>
            <Text style={styles.values}>{rowData.paymentType}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Mode:</Text>
            <Text style={styles.values}>{rowData.paymentMode}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Payment Date:</Text>
            <Text style={styles.values}>{formattedDate}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Bank Details:</Text>
            <Text style={styles.values}>{rowData.bankDetails}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.particulars}>Amount:</Text>
            <Text style={styles.values}>{rowData.amount}</Text>
          </View>

          {/* Grand Total */}
          <Text style={styles.grandTotal}>Grand Total: {rowData.amount}</Text>

          {/* Amount in Words */}
          <Text style={styles.amountInWords}>
            Amount in Words: {numberToWords(rowData.amount)}
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
  let currentYear = new Date().getFullYear();
  let lastYear = currentYear - 1;
  let nextYear = currentYear + 1;
  let yearsData = [lastYear, currentYear, nextYear];

  const years = yearsData.map((year) => {
    return { label: year, value: year };
  });
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
                        onClick={() => createPaymentReceiptPdf(rowData)}
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
      <DeleteModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        deleteAction={deleteUser}
        deleteMsg={deleteMessage}
        deleteErr={deleteError}
        consentRequired={deleteConsent}
      />
    </Container>
  );
};

export default PaymentReceiptDetail;
