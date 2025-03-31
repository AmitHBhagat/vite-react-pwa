import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Checkbox,
  DatePicker,
  InputPicker,
  Input,
  FlexboxGrid,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ExpenseService from "../../../services/expense.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { EXPENSETYPE, PAYMENTMODE } from "../../../utilities/constants";
import { MONTHS } from "../../../utilities/constants";
import ExpenseCategoryService from "../../../services/expenseCategory.service.js";
import SocietyService from "../../../services/society.service";

function getFormSchema() {
  return {
    expenseType: "",
    expenseCategory: "",
    expenseDescription: "",
    paymentMode: "",
    expenseBillVoucherNo: "",
    amount: "",
    preparedBy: "",
    approvedBy: "",
    expenseBillDate: new Date(),
    paymentDate: new Date(),
    month: "",
    year: new Date().getFullYear().toString(),
    transactionDetails: "",
    bankDetails: "",
    societyId: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    expenseType: Yup.string().required("Expense Type is required."),
    expenseCategory: Yup.string().required("Expense Category is required."),
    expenseDescription: Yup.string().required("Expense Desc. is required."),
    paymentMode: Yup.string().required("Payment Mode is required."),
    expenseBillVoucherNo: Yup.string().required("Expense Bill no. is required"),
    amount: Yup.string().required("Amount is required."),
    approvedBy: Yup.string().required("Approved By. is required."),
    expenseBillDate: Yup.date().required("Bill Date is required."),
    paymentDate: Yup.date().required("Payment Date is required."),
    month: Yup.string().required("Month is required."),
    year: Yup.string().required("Year is required."),
    transactionDetails: Yup.string().required(
      "Transaction Detail is required."
    ),
  });
}

function AddEditExpense({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { expId } = useParams();
  const [pageError, setPageError] = useState("");
  const [expenseDetails, setExpenseDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [expenseCategory, setExpenseCategory] = useState([]);
  const [societyInfo, setSocietyInfo] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getExpenseCategories();
    fetchSocietyInfo();
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (expId) {
      getExpenseDetails(expId);
    }
  }, [expId]);

  useEffect(() => {
    if (expenseDetails._id) {
      populateForm();
    }
  }, [expenseDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...expenseDetails,
      expenseCategory: expenseDetails.expenseCategory?._id,
      approvedBy: expenseDetails.approvedBy?._id,
      expenseBillDate: new Date(expenseDetails.expenseBillDate),
      paymentDate: new Date(expenseDetails.paymentDate),
    };
    frmObj.setValues(formobj);
  }

  async function getExpenseDetails(expId) {
    try {
      const resp = await trackPromise(ExpenseService.getExpenseDetails(expId));

      const { data } = resp;

      if (data.success) {
        setExpenseDetails(data.expense);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch expense details catch => ", err);
    }
  }

  const getExpenseCategories = async () => {
    try {
      const resp = await trackPromise(
        ExpenseCategoryService.getExpenseCategories(societyId)
      );
      setExpenseCategory(resp.data.expenseCategorys);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch expense category", error);
    }
  };

  async function fetchSocietyInfo() {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        setSocietyInfo(data.society.contactInfo);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch society contact catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = {
      ...frmObj.values,
      societyId: societyId,
      preparedBy: authState.user.userName,
    };

    try {
      const resp = expId
        ? await trackPromise(ExpenseService.updateExpense(expId, payload))
        : await trackPromise(ExpenseService.createExpense(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Expense saved successfully!");
        navigateBack();
      } else {
      }
    } catch (err) {
      console.error("Expense save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${expId ? "updating" : "creating"} the Expense`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  }

  return (
    <div className="thm-panel">
      <Form
        className=""
        fluid
        onSubmit={() => {
          setFrmSubmitted(true);
          frmObj.handleSubmit();
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="expenseType">
                <Form.ControlLabel>Cash Details Type</Form.ControlLabel>
                <InputPicker
                  block
                  name="expenseType"
                  placeholder="Enter a Expense Type"
                  data={EXPENSETYPE}
                  value={frmObj.values.expenseType}
                  onChange={handleFieldChange("expenseType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.expenseType}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="expenseCategory">
                <Form.ControlLabel>Cash Expense Category</Form.ControlLabel>

                <InputPicker
                  block
                  name="expenseCategory"
                  placeholder="Enter a Expense Category"
                  data={expenseCategory.map((category) => ({
                    label: category.categoryName,
                    value: category._id,
                  }))}
                  value={frmObj.values.expenseCategory}
                  onChange={(value) => {
                    handleFieldChange("expenseCategory")(value);
                  }}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.expenseCategory}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="expenseDescription">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control
                  name="expenseDescription"
                  placeholder="Enter a Expense Description"
                  value={frmObj.values.expenseDescription}
                  onChange={handleFieldChange("expenseDescription")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.expenseDescription}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="paymentMode">
                <Form.ControlLabel>Payment Mode</Form.ControlLabel>
                <InputPicker
                  block
                  name="paymentMode"
                  placeholder="Enter a paymentMode"
                  data={PAYMENTMODE}
                  value={frmObj.values.paymentMode}
                  onChange={handleFieldChange("paymentMode")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.paymentMode}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="expenseBillVoucherNo">
                <Form.ControlLabel>Bill No.</Form.ControlLabel>
                <Form.Control
                  name="expenseBillVoucherNo"
                  placeholder="Enter a Bill No."
                  value={frmObj.values.expenseBillVoucherNo}
                  onChange={handleFieldChange("expenseBillVoucherNo")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.expenseBillVoucherNo}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="amount">
                <Form.ControlLabel>Amount</Form.ControlLabel>
                <Form.Control
                  name="amount"
                  placeholder="Enter a Amount"
                  value={frmObj.values.amount}
                  onChange={handleFieldChange("amount")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amount}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="preparedBy">
                <Form.ControlLabel>PreparedBy</Form.ControlLabel>
                <Form.Control
                  name="preparedBy"
                  placeholder="Enter a preparedBy"
                  value={authState.user.userName}
                  onChange={handleFieldChange("preparedBy")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.preparedBy}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="approvedBy">
                <Form.ControlLabel>ApprovedBy</Form.ControlLabel>
                <InputPicker
                  block
                  name="approvedBy"
                  placeholder="Enter a ApprovedBy"
                  data={societyInfo.map((soc) => ({
                    label: soc.contactName,
                    value: soc._id,
                  }))}
                  value={frmObj.values.approvedBy}
                  onChange={(value) => {
                    handleFieldChange("approvedBy")(value);
                  }}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.approvedBy}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="month">
                <Form.ControlLabel>Month</Form.ControlLabel>
                <InputPicker
                  block
                  name="month"
                  placeholder="Enter a Month"
                  data={MONTHS}
                  value={frmObj.values.month}
                  onChange={handleFieldChange("month")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.month}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="year">
                <Form.ControlLabel>Year</Form.ControlLabel>

                <InputPicker
                  cleanable={false}
                  block
                  data={years.map((year) => ({
                    label: year.toString(),
                    value: year.toString(),
                  }))}
                  value={frmObj.values.year}
                  // onChange={handleFieldChange("year")(value)}
                  onChange={(value) => {
                    handleFieldChange("year")(value);
                  }}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="transactionDetails">
                <Form.ControlLabel>Transaction Details</Form.ControlLabel>
                <Form.Control
                  name="transactionDetails"
                  placeholder="Enter a Transaction Details"
                  value={frmObj.values.transactionDetails}
                  onChange={handleFieldChange("transactionDetails")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.transactionDetails}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="bankDetails">
                <Form.ControlLabel>Bank Details</Form.ControlLabel>
                <Form.Control
                  name="bankDetails"
                  placeholder="Enter a Bank Details"
                  value={frmObj.values.bankDetails}
                  onChange={handleFieldChange("bankDetails")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.bankDetails}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="expenseBillDate">
                <Form.ControlLabel>Bill Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="expenseBillDate"
                  value={frmObj.values.expenseBillDate}
                  //format="dd/MM/yyyy"
                  onChange={handleFieldChange("expenseBillDate")}
                  cleanable={false}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.expenseBillDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="paymentDate">
                <Form.ControlLabel>Payment Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="paymentDate"
                  value={frmObj.values.paymentDate}
                  onChange={handleFieldChange("paymentDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.paymentDate}
                />
              </Form.Group>
            </Col>
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {expId ? "Update" : "Create"}
              </Button>
              <Button as={Link} to="../expense" size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </Form>
    </div>
  );
}

export default AddEditExpense;
