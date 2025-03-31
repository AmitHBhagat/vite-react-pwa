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
  DatePicker,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import noticeService from "../../../services/notice.service.js";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { formats, modules } from "../../../utilities/reactQuill";

function getFormSchema() {
  return {
    title: "",
    date: new Date(),
    commments: "",
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    title: Yup.string().required("Title is required"),
    commments: Yup.string()
      .required("Notice Description is required")
      .test(
        "is-not-empty",
        "Comments cannot be empty",
        (value) => value && value.replace(/<[^>]*>?/gm, "").trim().length > 0
      ),
    status: Yup.boolean().required("Active status is required"),
  });
}

function AddEditNotice({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { noticeId } = useParams();

  const [pageError, setPageError] = useState("");
  const [noticeDetails, setNoticeDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (noticeId) {
      fetchNoticeDetails(noticeId);
    }
  }, [noticeId]);

  useEffect(() => {
    if (noticeDetails?._id) {
      populateForm();
    }
  }, [noticeDetails]);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...noticeDetails,
      date: new Date(noticeDetails.date),
    };
    frmObj.setValues(formobj);
  }

  async function fetchNoticeDetails() {
    try {
      const resp = await trackPromise(noticeService.getNoticeDetails(noticeId));
      const { data } = resp;
      if (data.success) {
        setNoticeDetails(data.notice);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch notice  details catch => ", err);
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
      const resp = noticeId
        ? await trackPromise(noticeService.updateNotice(noticeId, payload))
        : await trackPromise(noticeService.createNotice(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Notice saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Notice save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${noticeId ? "updating" : "creating"} the notice`;
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
            <Col xs={16} md={12}>
              <Form.Group controlId="title">
                <Form.ControlLabel>Title</Form.ControlLabel>
                <Form.Control
                  name="title"
                  placeholder="Enter a title"
                  value={frmObj.values.title}
                  onChange={handleFieldChange("title")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.title}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={12}>
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

            <Col xs={16} md={12}>
              <Form.Group controlId="commments">
                <Form.ControlLabel>Comments</Form.ControlLabel>
                <Form.Control
                  name="commments"
                  accepter={ReactQuill}
                  theme="snow"
                  value={frmObj.values.commments}
                  onChange={handleFieldChange("commments")}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your description ..."
                  style={{ height: "10rem" }}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.commments}
                />
              </Form.Group>
            </Col>

            <Col xs={24} lg={16} xl={12}>
              <Form.Group controlId="status">
                <Form.ControlLabel>Is Active</Form.ControlLabel>
                <Form.Control
                  name="status"
                  accepter={Checkbox}
                  checked={frmObj.values.status}
                  onChange={(val, state) => handleFieldChange("status")(state)}
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
            <FlexboxGrid.Item>
              <Button appearance="primary" size="lg" type="submit">
                {noticeId ? "Update" : "Create"}
              </Button>
              <Button as={Link} to="../notices" size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

export default AddEditNotice;
