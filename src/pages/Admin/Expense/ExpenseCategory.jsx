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
  Modal,
  Form,
  Grid,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import ExpenseCategoryService from "../../../services/expenseCategory.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";

import { THEME } from "../../../utilities/theme";
import { BREAK_POINTS } from "../../../utilities/constants.js";
import Paginator from "../../../components/Table/Paginator.jsx";

const ExpenseCategory = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [expenseCategory, setExpenseCategory] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selExpenseCategory, setSelExpenseCategory] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      getExpenseCategories();
    }
  }, [societyId]);

  const getExpenseCategories = async (societyId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        ExpenseCategoryService.getExpenseCategories(societyId)
      );
      const { data } = resp;
      if (data.success) respdata = resp.data.expenseCategorys;
    } catch (err) {
      console.error("Expense Category fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching expense category`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setExpenseCategory(respdata);
  };

  const getData = () => {
    let filteredExpenseCategory = expenseCategory.filter((expenseCategory) =>
      expenseCategory.categoryName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredExpenseCategory.sort((a, b) => {
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
    return filteredExpenseCategory.slice(start, end);
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

  const openFormModal = (item) => {
    setSelExpenseCategory(item);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setSelExpenseCategory({});
    setFormOpen(false);
  };

  const handleOpenModal = (item) => {
    setSelExpenseCategory(item);
    setDeleteMessage(`Do you wish to delete ${item.categoryName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelExpenseCategory({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteExpenseCategory = async () => {
    try {
      const resp = await trackPromise(
        ExpenseCategoryService.deleteExpenseCategory(selExpenseCategory._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "Expense Category deleted successfully"
        );
        handleCloseModal();
        getExpenseCategories();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the Expense Category";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete Expense category catch => ", error);
    }
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
              <Button
                appearance="primary"
                size="md"
                onClick={() => openFormModal({})}
              >
                Add Expense Category
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
              headerHeight={50}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={300} sortable flexGrow={1.5}>
                <HeaderCell>Name</HeaderCell>
                <Cell dataKey="categoryName"></Cell>
              </Column>

              <Column width={200} align="center" className="col-action">
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
                        title="edit"
                        icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        onClick={() => openFormModal(rowData)}
                      />

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
          data={expenseCategory}
          limit={limit}
          page={page}
          setPage={setPage}
          handleChangeLimit={handleChangeLimit}
        />

        <ModalForm
          isOpen={formOpen}
          onClose={closeFormModal}
          closeCallback={getExpenseCategories}
          contextObj={{ societyId: societyId }}
          dataObj={selExpenseCategory}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteExpenseCategory}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default ExpenseCategory;

function getFormSchema() {
  return {
    societyId: "",
    categoryName: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    categoryName: Yup.string().required(" Category Name is required"),
  });
}

const ModalForm = ({
  isOpen,
  onClose,
  closeCallback = void 0,
  contextObj = {},
  dataObj = {},
}) => {
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(
    () => populateForm({ ...contextObj, ...dataObj }),
    [contextObj, dataObj]
  );

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  function populateForm(newData = {}) {
    const formobj = {
      ...frmObj.values,
      ...newData,
    };
    frmObj.setValues(formobj);
  }

  const closeModal = () => {
    onClose();
    frmObj.resetForm();
    setFrmSubmitted(false);
    setModalError("");
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setModalError("");
    const payload = { ...frmObj.values };

    try {
      const resp = dataObj._id
        ? await trackPromise(
            ExpenseCategoryService.updateExpenseCategory(dataObj._id, payload)
          )
        : await trackPromise(
            ExpenseCategoryService.createExpenseCategory(payload)
          );
      const { data } = resp;

      if (data.success) {
        toast.success("Expense category saved successfully!");
        if (closeCallback) closeCallback(contextObj.societyId);
        closeModal();
      }
    } catch (err) {
      console.error("Expense category save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${
          dataObj._id ? "updating" : "creating"
        } the expense category`;
      toast.error(errMsg);
      setModalError(errMsg);
    }
  }

  return isOpen ? (
    <Modal open={isOpen} onClose={closeModal} size="xs" className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>
          {dataObj._id ? "Edit " : "Add "}Expense Category
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Form className="" fluid>
          <Grid fluid>
            <Row gutter={0}>
              <Col xs={24}>
                <Form.Group controlId="categoryName">
                  <Form.ControlLabel className="mandatory-field">
                    Category Name *
                  </Form.ControlLabel>
                  <Form.Control
                    name="categoryName"
                    placeholder="Enter a Category Name"
                    value={frmObj.values.categoryName}
                    onChange={handleFieldChange("categoryName")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.categoryName}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Grid>

          <PageErrorMessage show={Boolean(modalError)} msgText={modalError} />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary"
          type="button"
          onClick={() => {
            setFrmSubmitted(true);
            frmObj.handleSubmit();
          }}
        >
          {dataObj._id ? "Update" : "Create"}
        </Button>
        <Button onClick={closeModal} appearance="default">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};
