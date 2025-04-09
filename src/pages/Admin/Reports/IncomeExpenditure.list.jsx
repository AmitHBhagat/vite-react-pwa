import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Pagination,
  Affix,
  Button,
  FlexboxGrid,
  Form,
  DateRangePicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell, ColumnGroup } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReportService from "../../../services/report.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import {
  createPaymentReceiptPdf,
  exportToExcel2,
} from "../../../utilities/ExportDataToExcelOrPDF";
import { formatDate } from "../../../utilities/formatDate";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  pdf,
  Image,
} from "@react-pdf/renderer";
import logoImage from "../../../assets/images/logo.jpg";
import societyService from "../../../services/society.service";
import { BREAK_POINTS } from "../../../utilities/constants";

const IncomeExpenditureList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);

  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [pageError, setPageError] = useState("");
  const [incomeExpense, setIncomeExpense] = useState([]);
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [societyInfo, setSocietyInfo] = useState("");

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    fetchSocietyInfo();
  }, [societyId]);

  async function fetchSocietyInfo() {
    try {
      const resp = await trackPromise(societyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        setSocietyInfo(data.society.societyName);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        "Error in deleting the billing adjustment";
      toast.error(errMsg);
      console.error("Fetch society contact catch => ", errMsg);
    }
  }

  function getFormSchema() {
    return {
      dateRange: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      dateRange: Yup.array().required("Date range is required"),
    });
  }

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  async function formSubmit(values) {
    setFrmSubmitted(false);
    const startDate = new Date(values.dateRange[0]);
    const endDate = new Date(values.dateRange[1]);

    const payload = {
      startDate,
      endDate,
      societyId: societyId,
    };
    let respdata = [];
    try {
      const resp = await trackPromise(
        ReportService.getIncomeExpenditures(societyId, payload)
      );

      const { data } = resp;

      if (data.success) {
        respdata = data.balanceSheet;
      }
    } catch (err) {
      console.error("Notice fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching notice`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setIncomeExpense(respdata);
  }

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getData = () => {
    const combineBalanceData = (expenses = [], income = []) => {
      const maxLength = Math.max(expenses.length, income.length);
      return Array.from({ length: maxLength }).map((_, index) => ({
        expenseCategory: expenses[index]?.category?.categoryName || "-",
        expenseAmount: expenses[index]?.amount || "-",
        incomeType: income[index]?.paymenttype || "-",
        incomeAmount: income[index]?.amount || "-",
      }));
    };

    const combinedData = combineBalanceData(
      incomeExpense.expenses,
      incomeExpense.income
    );

    if (sortColumn && sortType) {
      combinedData.sort((a, b) => {
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
    return combinedData.slice(start, end);
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

  const handleExportExcel = async () => {
    exportToExcel2({
      data: getData(),
      worksheetName: "Income & Expenditure",
      headersConfig: [
        { title: "Expenses Category Name", key: "expenseCategory" },
        { title: "Expenses Amount", key: "expenseAmount" },

        { title: "Income Category Name", key: "incomeType" },
        { title: "Income Amount", key: "incomeAmount" },
      ],
      filename: "Income_and_expenditure_report.xlsx",
      headerStyle: {
        font: { bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9D9D9" },
        },
        alignment: { horizontal: "center" },
      },
      onSuccess: () => toast.success("Excel exported successfully."),
      onError: (error) => console.error("Export error:", error),
    });
  };
  const styles = StyleSheet.create({
    page: {
      padding: 20,
      fontSize: 10,
    },
    header: {
      textAlign: "center",
      marginBottom: 10,
      fontSize: 12,
    },
    headerTwo: {
      paddingBottom: 15,
    },
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCol: {
      width: "25%",
      borderStyle: "solid",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      textAlign: "center",
    },
    tableCellHeader: {
      margin: 5,
      fontWeight: "bold",
    },
    tableCell: {
      margin: 5,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      right: 0,
      marginRight: 20,
      marginBottom: 20,
    },
  });

  const MyDocument = ({ data }) => {
    const startDate = formatDate(frmObj.values.dateRange[0], "DD-MM-YY");
    const endDate = formatDate(frmObj.values.dateRange[1], "DD-MM-YY");

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{societyInfo}</Text>
          <Text style={styles.headerTwo}>
            Income and Expenditure Report for the Date Range from {startDate} to
            {endDate}
          </Text>

          <View style={styles.table}>
            {/* First header row: Group Headers */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text style={styles.tableCellHeader}>Expense</Text>
              </View>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text style={styles.tableCellHeader}>Income</Text>
              </View>
            </View>

            {/* Second header row: Detailed Column Headers */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Category Name</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Amount</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Category Name</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Amount</Text>
              </View>
            </View>

            {/* Data Rows */}
            {data?.map((row, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.expenseCategory}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.expenseAmount}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.incomeType}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.incomeAmount}</Text>
                </View>
              </View>
            ))}
          </View>

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
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <Form
            className=""
            fluid
            onSubmit={() => {
              setFrmSubmitted(true);
              frmObj.handleSubmit();
            }}
          >
            <FlexboxGrid
              justify="start"
              className="flxgrid-theme"
              style={{ gap: "1rem" }}
            >
              <FlexboxGrid.Item>
                <Form.Group controlId="dateRange">
                  <DateRangePicker
                    name="dateRange"
                    value={frmObj.values.dateRange}
                    onChange={(value) =>
                      frmObj.setFieldValue("dateRange", value)
                    }
                    placeholder="Select date range"
                    format="dd/MM/yyyy"
                    block
                  />
                  <ErrorMessage
                    show={
                      !!(frmObj.touched.dateRange && frmObj.errors.dateRange)
                    }
                    msgText={frmObj.errors.dateRange}
                  />
                </Form.Group>
                <Form.Group controlId="dateRange"></Form.Group>
              </FlexboxGrid.Item>

              <FlexboxGrid.Item>
                <Button appearance="primary" size="md" type="submit">
                  Show
                </Button>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <Button
                  appearance="primary"
                  size="md"
                  onClick={handleExportExcel}
                >
                  Export To Excel
                </Button>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <Button
                  appearance="primary"
                  size="md"
                  onClick={() =>
                    createPaymentReceiptPdf(
                      MyDocument,
                      getData(),
                      `Income-and-Expenditure.pdf`
                    )
                  }
                >
                  Export To PDF
                </Button>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Form>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              bordered
              cellBordered
              affixHeader={60}
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={80}
              rowHeight={60}
              className="tbl-theme tbl-compact"
            >
              <ColumnGroup header="Expenses" align="center">
                <Column width={200} colSpan={2} flexGrow={0.6}>
                  <HeaderCell>Category Name</HeaderCell>
                  <Cell dataKey="expenseCategory" />
                </Column>
                <Column width={150} flexGrow={0.4}>
                  <HeaderCell>Amount</HeaderCell>
                  <Cell dataKey="expenseAmount" />
                </Column>
              </ColumnGroup>

              <ColumnGroup header="Income" align="center">
                <Column width={150} colSpan={2} flexGrow={0.6}>
                  <HeaderCell>Category Name</HeaderCell>
                  <Cell dataKey="incomeType" />
                </Column>
                <Column width={200} flexGrow={0.4}>
                  <HeaderCell>Amount</HeaderCell>
                  <Cell dataKey="incomeAmount" />
                </Column>
              </ColumnGroup>
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
            total={incomeExpense.length}
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

export default IncomeExpenditureList;
