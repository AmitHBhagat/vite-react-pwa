import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
  Form,
  DateRangePicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell, ColumnGroup } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";

import { Link } from "react-router-dom";
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

import { formatDate } from "../../../utilities/formatDate";

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

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    //getExpenses();
  }, [dispatch, pageTitle]);

  function getFormSchema() {
    return {
      dateRange: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      dateRange: Yup.array().required("Date range is required"), // Add this line
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

  const isSmallScreen = useSmallScreen(768);

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

    // Sorting logic
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

    // Pagination logic
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
              </FlexboxGrid.Item>

              <FlexboxGrid.Item>
                <Button appearance="primary" size="md" type="submit">
                  Show
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
