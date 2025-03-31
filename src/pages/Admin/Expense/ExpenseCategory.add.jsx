import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  InputPicker,
  Input,
  FlexboxGrid,
  Checkbox,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import ExpenseCategoryService from "../../../services/expenseCategory.service.js";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

function AddExpenseCategory({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [pageError, setPageError] = useState("");
  const [categoryDetails, setCategoryDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  function getFormSchema() {
    return {
      categoryName: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      categoryName: Yup.string().required(" Category Name is required"),
    });
  }
  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryDetails?._id) {
      populateForm();
    }
  }, [categoryDetails]);

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...categoryDetails,
    };
    frmObj.setValues(formobj);
  }

  async function fetchCategoryDetails() {
    try {
      const resp = await trackPromise(
        ExpenseCategoryService.getExpenseCategoryDetails(categoryId)
      );
      const { data } = resp;
      if (data.success) {
        setCategoryDetails(data.expenseCategory);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch expense category  details catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values, societyId: societyId };

    try {
      const resp = categoryId
        ? await trackPromise(
            ExpenseCategoryService.updateExpenseCategory(categoryId, payload)
          )
        : await trackPromise(
            ExpenseCategoryService.createExpenseCategory(payload)
          );
      const { data } = resp;

      if (data.success) {
        toast.success("Expense category saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Expense category save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${categoryId ? "updating" : "creating"} the expense category`;
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
              <Form.Group controlId="categoryName">
                <Form.ControlLabel>Category Name</Form.ControlLabel>
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
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {categoryId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../expense-category"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddExpenseCategory;
