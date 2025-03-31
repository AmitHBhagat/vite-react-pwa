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
  InputPicker,
  Form,
  DateRangePicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import * as Yup from "yup";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { useFormik } from "formik";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import reportService from "../../../services/report.service";
import expenseCategoryService from "../../../services/expenseCategory.service";
import { capitalizeFirstLetter } from "../../../utilities/functions";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";

const ExpenseAccountLedgerList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);

  const [expenseAccountId, setExpenseAccountId] = useState("");
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
    getExpenseCategories();
  }, [societyId]);

  function getFormSchema() {
    return {
      expenseCategory: "",
      dateRange: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      expenseCategory: Yup.string().required("Expense category is required"),
      dateRange: Yup.array().required("Date range is required"),
    });
  }

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      setFrmSubmitted(true);
      try {
        await getExpenseAccountLedger(values);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    },
  });
  const isSmallScreen = useSmallScreen(768);

  const getExpenseCategories = async () => {
    let expenseCategories = [];
    try {
      const resp = await trackPromise(
        expenseCategoryService.getExpenseCategories(societyId)
      );
      const { data } = resp;
      if (data.success) {
        expenseCategories = resp.data.expenseCategorys;
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        `Error in fetching expense categories`;
      toast.error(errMsg);
      console.error("Failed to fetch expense categories", errMsg);
    }
    setExpenseCategories(expenseCategories);
  };

  const getExpenseAccountLedger = async (values) => {
    let accountLedger = [];
    const startDate = new Date(values.dateRange[0]);
    const endDate = new Date(values.dateRange[1]);
    // expenseCategory is expenseCategoryId
    const expenseCategory = values.expenseCategory;
    const payload = { expenseCategory, startDate, endDate };
    try {
      const resp = await trackPromise(
        reportService.getExpenseLedgerReportBySocietyId(societyId, payload)
      );
      const { data } = resp;
      if (data.success) accountLedger = data.expenses;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch expenseCategories", error);
    }
    setExpenseAccounts(accountLedger);
  };

  const getData = () => {
    if (sortColumn && sortType) {
      expenseAccounts.sort((a, b) => {
        const valA =
          sortColumn === "createdAt" ? new Date(a[sortColumn]) : a[sortColumn];

        const valB =
          sortColumn === "createdAt" ? new Date(b[sortColumn]) : b[sortColumn];

        return sortType === "asc" ? valA - valB : valB - valA;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return expenseAccounts.slice(start, end);
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
    try {
      const exportData = getData();

      const transformedData = exportData.map((expenseAccount) => ({
        particulars: expenseAccount.category.categoryName,
        amount: expenseAccount.Amount,
        date: expenseAccount.createdAt,
      }));

      const headersConfig = [
        { key: "particulars", title: "Particulars" },
        {
          key: "amount",
          title: "Amount",
          numeric: true,
        },
        {
          key: "date",
          title: "Date",
          formatter: (date) => formatDate(date),
        },
      ];

      await exportToExcel({
        data: transformedData,
        worksheetName: "Maintenance ExpenseAccounts",
        headersConfig,
        filename: `Expense Account Details-${month}-${year}.xlsx`,
        headerStyle: {
          font: { bold: true },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E0E0E0" },
          },
          alignment: { horizontal: "center" },
        },
        onError: (error) => {
          toast.error("Export failed");
          console.error(error);
        },
      });
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };
  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };
  const expenseCategoryNumbers = expenseCategories?.map((expenseCategory) => {
    return {
      label: capitalizeFirstLetter(expenseCategory.categoryName),
      value: expenseCategory._id,
    };
  });
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
              <Form onSubmit={frmObj.handleSubmit}>
                <FlexboxGrid
                  // justify="start"
                  style={{ gap: "1rem" }}
                  justify="space-between"
                  className="flxgrid-theme"
                >
                  <FlexboxGrid.Item xs={24} sm={12} md={8} lg={8}>
                    <Form.Group controlId="expenseCategory">
                      <InputPicker
                        block
                        name="expenseCategory"
                        data={expenseCategoryNumbers}
                        placeholder="Select a expense category number"
                        value={frmObj.values.expenseCategory}
                        onChange={handleFieldChange("expenseCategory")}
                      />
                      <ErrorMessage
                        show={
                          !!(
                            frmObj.touched.expenseCategory &&
                            frmObj.errors.expenseCategory
                          )
                        }
                        msgText={frmObj.errors.expenseCategory}
                      />
                    </Form.Group>
                  </FlexboxGrid.Item>

                  <FlexboxGrid.Item xs={24} sm={12} md={8} lg={6}>
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
                          !!(
                            frmObj.touched.dateRange && frmObj.errors.dateRange
                          )
                        }
                        msgText={frmObj.errors.dateRange}
                      />
                    </Form.Group>
                  </FlexboxGrid.Item>

                  <FlexboxGrid.Item xs={24} sm={12} md={8} lg={6}>
                    <Form.Group controlId="submit">
                      <Button block type="submit">
                        Show
                      </Button>
                    </Form.Group>
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </Form>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Button appearance="primary" size="md" onClick={handleExport}>
                Export to Excel
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column minWidth={200} sortable flexGrow={2}>
                <HeaderCell>Particulars</HeaderCell>
                <Cell>
                  {(rowData) =>
                    capitalizeFirstLetter(rowData.category.categoryName)
                  }
                </Cell>
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="Amount" />
              </Column>
              <Column minWidth={100} sortable flexGrow={1}>
                <HeaderCell dataKey="createdAt">Date</HeaderCell>
                <Cell>
                  {(rowData) => {
                    return formatDate(rowData.month);
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
            total={expenseAccounts.length}
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

export default ExpenseAccountLedgerList;
