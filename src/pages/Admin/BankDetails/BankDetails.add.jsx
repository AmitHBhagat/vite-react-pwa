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
import BankDetailService from "../../../services/bankDetails.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { ACCOUNTTYPE } from "../../../utilities/constants";

function getFormSchema() {
  return {
    accountHolderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    IFSC_Code: "",
    account_type: "",
    is_verified: false,
    societyId: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    accountHolderName: Yup.string().required("Account Holder Name is required"),
    bankName: Yup.string().required("Bank Name is required"),
    branchName: Yup.string().required("Branch Name is required"),
    accountNumber: Yup.string().required("Account Number is required"),
    IFSC_Code: Yup.string().required("IFSC Code is required"),
    account_type: Yup.string().required("Account Type is required"),
    is_verified: Yup.boolean().required("is_verified is required"),
  });
}

function AddEditBankDetail({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bankDetailId } = useParams();
  const [pageError, setPageError] = useState("");
  const [bankDetails, setbankDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (bankDetailId) {
      fetchBankDetails(bankDetailId);
    }
  }, [bankDetailId]);

  useEffect(() => {
    if (bankDetails._id) {
      populateForm();
    }
  }, [bankDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...bankDetails,
    };
    frmObj.setValues(formobj);
  }

  async function fetchBankDetails(bankDetailId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        BankDetailService.getBankDetailDetails(bankDetailId)
      );

      const { data } = resp;
      if (data.success) respdata = resp.data.bankDetail;
    } catch (err) {
      console.error("Bank details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching bank details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setbankDetails(respdata);
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values, societyId: societyId };

    try {
      const resp = bankDetailId
        ? await trackPromise(
            BankDetailService.updateBankDetail(bankDetailId, payload)
          )
        : await trackPromise(BankDetailService.createBankDetail(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Bank Detail saved successfully!");
        navigateBack();
      }
    } catch (err) {
      console.error("Bank detail save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${societyId ? "updating" : "creating"} the bank detail`;
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
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="accountHolderName">
                <Form.ControlLabel className="mandatory-field">
                  Account Holder Name *
                </Form.ControlLabel>
                <Form.Control
                  name="accountHolderName"
                  placeholder="Enter a Account Holder Name"
                  value={frmObj.values.accountHolderName}
                  onChange={handleFieldChange("accountHolderName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.accountHolderName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="accountNumber">
                <Form.ControlLabel className="mandatory-field">
                  Account Number *
                </Form.ControlLabel>
                <Form.Control
                  name="accountNumber"
                  placeholder="Enter a Account Number"
                  value={frmObj.values.accountNumber}
                  onChange={handleFieldChange("accountNumber")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.accountNumber}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="IFSC_Code">
                <Form.ControlLabel className="mandatory-field">
                  IFSC Code *
                </Form.ControlLabel>
                <Form.Control
                  name="IFSC_Code"
                  placeholder="Enter a IFSC Code"
                  value={frmObj.values.IFSC_Code}
                  onChange={handleFieldChange("IFSC_Code")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.IFSC_Code}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="bankName">
                <Form.ControlLabel className="mandatory-field">
                  Bank Name *
                </Form.ControlLabel>
                <Form.Control
                  name="bankName"
                  placeholder="Enter a Bank Name"
                  value={frmObj.values.bankName}
                  onChange={handleFieldChange("bankName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.bankName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="branchName">
                <Form.ControlLabel className="mandatory-field">
                  Branch Name *
                </Form.ControlLabel>
                <Form.Control
                  name="branchName"
                  placeholder="Enter a Branch Name"
                  value={frmObj.values.branchName}
                  onChange={handleFieldChange("branchName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.branchName}
                />
              </Form.Group>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="account_type">
                <Form.ControlLabel>Account Type</Form.ControlLabel>
                <InputPicker
                  block
                  name="account_type"
                  placeholder="Enter a Account Type"
                  data={ACCOUNTTYPE}
                  value={frmObj.values.account_type}
                  onChange={handleFieldChange("account_type")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.account_type}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Group controlId="is_verified">
                <Form.ControlLabel>
                  Confirm If The Entered Details are Correct
                </Form.ControlLabel>
                <Form.Control
                  name="is_verified"
                  accepter={Checkbox}
                  checked={frmObj.values.is_verified}
                  onChange={(val, state) =>
                    handleFieldChange("is_verified")(state)
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {bankDetailId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../bankdetails"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </Form>
    </div>
  );
}

export default AddEditBankDetail;
