import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
  InputPicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import ExpenseService from "../../../services/expense.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { BREAK_POINTS, MONTHS } from "../../../utilities/constants";
import { THEME } from "../../../utilities/theme";
import { formatDate } from "../../../utilities/formatDate";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import Paginator from "../../../components/Table/Paginator.jsx";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString("default", { month: "long" });

// Static data for years
const yearsData = [
  { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
  { label: currentYear.toString(), value: currentYear.toString() },
  { label: (currentYear + 1).toString(), value: (currentYear + 1).toString() },
];

const Expense = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState("");
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selExpenseDetail, setSelExpenseDetail] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [selectYear, setSelectYear] = useState(currentYear.toString());
  const [selectMonth, setSelectMonth] = useState(currentMonth);
  const [currentExpenses, setCurrentExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getExpenses();
  }, [dispatch, pageTitle]);

  const getExpenses = async () => {
    setPageError("");
    try {
      const resp = await trackPromise(ExpenseService.getExpenses(societyId));
      setAllExpenses(resp.data.expenses);

      const filteredExpenses = resp.data.expenses.filter((expense) => {
        return expense.year === selectYear && expense.month === selectMonth;
      });
      setCurrentExpenses(filteredExpenses);
    } catch (err) {
      console.error("Expense fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching expense`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  };

  const getData = () => {
    let filteredExpenseDetails = currentExpenses.filter(
      (expense) =>
        expense?.expenseCategory?.categoryName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        expense?.expenseBillVoucherNo
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    // Sorting logic
    if (sortColumn && sortType) {
      filteredExpenseDetails.sort((a, b) => {
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
    return filteredExpenseDetails.slice(start, end);
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

  const handleOpenModal = (item) => {
    setSelExpenseDetail(item);
    setDeleteMessage(`Do you wish to delete ${item.expenseType}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelExpenseDetail({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteExpense = async () => {
    try {
      const resp = await trackPromise(
        ExpenseService.deleteExpense(selExpenseDetail._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Expense  deleted successfully");
        handleCloseModal();
        getExpenses();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the bank detail";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete expense catch => ", error);
    }
  };

  const handleSelectYear = (selectedYear) => {
    setSelectYear(selectedYear);
  };

  const handleSelectMonth = (selectedMonth) => {
    setSelectMonth(selectedMonth);
  };

  const handleShowButtonClick = () => {
    const filteredExpenses = allExpenses.filter((expense) => {
      return expense.year === selectYear && expense.month === selectMonth;
    });
    setCurrentExpenses(filteredExpenses);
  };

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
            <FlexboxGrid.Item>
              <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item colspan={9}>
                  <InputPicker
                    block
                    name="year"
                    placeholder="Enter year"
                    data={yearsData}
                    value={selectYear}
                    onChange={handleSelectYear}
                    cleanable={false}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={9}>
                  <InputPicker
                    block
                    name="month"
                    placeholder="Enter Month"
                    data={MONTHS}
                    value={selectMonth}
                    onChange={handleSelectMonth}
                    cleanable={false}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={4}>
                  <Button
                    appearance="primary"
                    size="md"
                    onClick={handleShowButtonClick}
                  >
                    Show
                  </Button>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </FlexboxGrid.Item>

            <FlexboxGrid.Item>
              <Link to={`/expense/add`}>
                <Button appearance="primary" size="md">
                  Add Expense
                </Button>
              </Link>
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
              headerHeight={50}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={150} sortable flexGrow={1}>
                <HeaderCell>Expense Type</HeaderCell>
                <Cell dataKey="expenseType">
                  {(rowData) => (
                    <Link to={`/expense/details/${rowData._id}`}>
                      {rowData.expenseType}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={200} sortable flexGrow={1.5}>
                <HeaderCell>Expense Category</HeaderCell>
                <Cell dataKey="expenseCategory">
                  {(rowData) => rowData?.expenseCategory?.categoryName}
                </Cell>
              </Column>

              <Column width={120} sortable flexGrow={1}>
                <HeaderCell>Bill No.</HeaderCell>
                <Cell dataKey="expenseBillVoucherNo" />
              </Column>
              <Column width={150} sortable flexGrow={1}>
                <HeaderCell>Bill Date</HeaderCell>
                <Cell dataKey="expenseBillDate">
                  {(rowData) => formatDate(rowData.expenseBillDate)}
                </Cell>
              </Column>

              <Column width={120} sortable>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="amount" />
              </Column>

              <Column width={100} align="center" className="col-action">
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
                      <Link to={`/expense/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        />
                      </Link>
                      <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() => handleOpenModal(rowData)}
                      />
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={currentExpenses}
          limit={limit}
          page={page}
          setPage={setPage}
          handleChangeLimit={handleChangeLimit}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteExpense}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default Expense;
