import React, { useState, useEffect, forwardRef } from "react";
import { Form, Button, Grid, Row, Col, Input, FlexboxGrid } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import QueryService from "../../../services/requestQuery.service";
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
    status: REQUESTQUERY_STATUS[0].value,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    commments: Yup.string().required("Comments is required"),
  });
}

function RequestQueryAdd({ pageTitle }) {
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
    if (authState.selectedFlat.societyId && authState.selectedFlat.value)
      populateForm({
        memberName: authState.selectedFlat.ownerName || authState.user.userName,
        societyId: authState.selectedFlat.societyId,
        flatNo: authState.selectedFlat.flatNo,
      });
  }, [authState.selectedFlat]);

  useEffect(() => {
    if (queryDetails._id) {
      populateForm(queryDetails);
    }
  }, [queryDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm(newData = {}) {
    const formobj = {
      ...frmObj.values,
      ...newData,
    };
    frmObj.setValues(formobj);
  }

  async function fetchQueryDetails(queryid) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(QueryService.getQueryDetails(queryid));
      const { data } = resp;
      if (data.success) respdata = resp.data.queriess;
    } catch (err) {
      console.error("Queries fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching queries`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setQueryDetails(respdata);
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values };
    try {
      const resp = await trackPromise(QueryService.createQuery(payload));
      const { data } = resp;
      if (data.success) {
        toast.success("Query saved successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Query save error catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in creating the query`;
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
                <Form.ControlLabel>Title</Form.ControlLabel>
                <Form.Control
                  name="title"
                  placeholder="Enter Title"
                  value={frmObj.values.title}
                  onChange={handleFieldChange("title")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.title}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={8}>
              <Form.Group controlId="commments">
                <Form.ControlLabel>Comment</Form.ControlLabel>
                <Form.Control
                  name="commments"
                  placeholder="Enter Comment"
                  value={frmObj.values.commments}
                  onChange={handleFieldChange("commments")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.commments}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={16} xl={10}>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control
                  name="description"
                  placeholder="Enter Description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.description}
                  onChange={handleFieldChange("description")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.description}
                />
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                Create
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

export default RequestQueryAdd;
