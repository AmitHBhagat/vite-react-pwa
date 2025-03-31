import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Input,
  FlexboxGrid,
  DatePicker,
  InputPicker,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RequestQueryService from "../../../services/requestQuery.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { REQUESTQUERY_STATUS } from "../../../utilities/constants";

function getFormSchema() {
  return {
    societyId: "",
    flatNo: "",
    memberName: "",
    title: "",
    description: "",
    commments: "",
    date: new Date(),
    status: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    commments: Yup.string().required("Comments is required"),
  });
}

function EditRequestQuery({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const { queryId } = useParams();
  const [pageError, setPageError] = useState("");
  const [queryDetails, setQueryDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (queryId) fetchQueryDetails(queryId);
  }, [queryId]);

  useEffect(() => {
    if (queryDetails._id) {
      populateForm(queryDetails);
    }
  }, [queryDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...queryDetails,
      societyId: queryDetails.societyId,
      flatNo: queryDetails.flatNo,
      memberName: queryDetails.memberName,
      date: new Date(queryDetails.date),
    };
    frmObj.setValues(formobj);
  }

  async function fetchQueryDetails(queryid) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        RequestQueryService.getQueryDetails(queryid)
      );
      const { data } = resp;
      if (data.success) respdata = resp.data.queries;
    } catch (err) {
      console.error("Queries fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching queries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setQueryDetails(respdata);
  }
  console.log("queryDetails", queryDetails);

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values };
    try {
      const resp = await trackPromise(
        RequestQueryService.updateRequestQuery(queryId, payload)
      );
      const { data } = resp;
      if (data.success) {
        toast.success("Query saved successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Query save error catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in editing the query`;
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
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="title">
                <Form.ControlLabel>Flat No.</Form.ControlLabel>
                <Form.Control
                  name="flatNo"
                  placeholder="Enter flatNo"
                  value={frmObj.values.flatNo}
                  onChange={handleFieldChange("flatNo")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flatNo}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="title">
                <Form.ControlLabel>Member Name</Form.ControlLabel>
                <Form.Control
                  name="memberName"
                  placeholder="Enter memberName"
                  value={frmObj.values.memberName}
                  onChange={handleFieldChange("memberName")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.memberName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="title">
                <Form.ControlLabel>Title</Form.ControlLabel>
                <Form.Control
                  name="title"
                  placeholder="Enter Title"
                  value={frmObj.values.title}
                  onChange={handleFieldChange("title")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.title}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control
                  name="description"
                  placeholder="Enter Description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.description}
                  onChange={handleFieldChange("description")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.description}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="commments">
                <Form.ControlLabel>Comment</Form.ControlLabel>
                <Form.Control
                  name="commments"
                  placeholder="Enter Comment"
                  value={frmObj.values.commments}
                  onChange={handleFieldChange("commments")}
                  disabled
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.commments}
                />
              </Form.Group>
            </Col>

            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="date">
                <Form.ControlLabel>Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="date"
                  value={frmObj.values.date}
                  onChange={handleFieldChange("date")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.date}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={10} xl={6}>
              <Form.Group controlId="status">
                <Form.ControlLabel>Status</Form.ControlLabel>

                <InputPicker
                  block
                  cleanable={false}
                  name="status"
                  placeholder="Enter Status"
                  data={REQUESTQUERY_STATUS}
                  value={frmObj.values.status}
                  onChange={handleFieldChange("status")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.status}
                />
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                Update
              </Button>
              <Button onClick={navigateBack} size="lg" className="mr-l-1">
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

export default EditRequestQuery;
