import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  FlexboxGrid,
  DatePicker,
  IconButton,
  Input,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { startOfDay, endOfDay } from "date-fns";
import PollService from "../../../services/polling.service";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { useDispatch, useSelector } from "react-redux";
import { setRouteData } from "../../../stores/appSlice";
import TrashIcon from "@rsuite/icons/Trash";
import { getEndOfDay, getStartOfDay } from "../../../utilities/formatDate";

function getFormSchema() {
  return {
    societyId: "",
    pollDescription: "",
    pollStartDate: startOfDay(new Date()),
    pollEndDate: endOfDay(new Date()),
    pollOptions: [{ option: "" }, { option: "" }],
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    pollDescription: Yup.string().required("Poll description is required"),
    pollStartDate: Yup.date().required("Start date is required"),
    pollEndDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("pollStartDate"), "End date must be after start date"),
    pollOptions: Yup.array()
      .of(
        Yup.object().shape({
          option: Yup.string().required("Option is required"),
        })
      )
      .min(2, "At least 2 options are required"),
  });
}

function AddPolling({ pageTitle = "Add Polling" }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const navigate = useNavigate();
  const societyId = authState?.user?.societyName;
  const { pollId } = useParams();
  const [pageError, setPageError] = useState("");
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [pollDetails, setPollDetails] = useState({});

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (pollId) {
      getPolling();
    }
  }, [pollId, societyId]);

  useEffect(() => {
    if (pollDetails._id) {
      populateForm();
    }
  }, [pollDetails]);

  function populateForm() {
    const formObj = {
      ...frmObj.values,
      ...pollDetails,
      pollStartDate: new Date(pollDetails.pollStartDate),
      pollEndDate: new Date(pollDetails.pollEndDate),
      pollOptions:
        pollDetails.pollOptions.length > 0
          ? pollDetails.pollOptions
          : [{ option: "" }, { option: "" }],
    };
    frmObj.setValues(formObj);
  }

  const getPolling = async () => {
    try {
      const resp = await trackPromise(PollService.getPollById(pollId));
      const pollData = resp.data.poll;
      if (pollData) {
        setPollDetails(pollData);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || `Error while getting the poll`;
      toast.error(errMsg);
      console.error(errMsg);
      setPageError(errMsg);
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  const handleOptionChange = (index) => (value) => {
    const newOptions = [...frmObj.values.pollOptions];
    newOptions[index] = { option: value };
    frmObj.setFieldValue("pollOptions", newOptions);
  };

  const addOption = () => {
    const newOptions = [...frmObj.values.pollOptions, { option: "" }];
    frmObj.setFieldValue("pollOptions", newOptions);
  };

  const removeOption = (index) => {
    if (frmObj.values.pollOptions.length <= 2) {
      toast.warning("At least 2 options are required");
      return;
    }
    const newOptions = [...frmObj.values.pollOptions];
    newOptions.splice(index, 1);
    frmObj.setFieldValue("pollOptions", newOptions);
  };

  function navigateBack() {
    navigate(-1);
  }

  async function formSubmit() {
    setFrmSubmitted(true);
    setPageError("");

    const payload = {
      ...frmObj.values,
      societyId: societyId,
      pollStartDate: getStartOfDay(frmObj.values.pollStartDate.toISOString()),
      pollEndDate: getEndOfDay(frmObj.values.pollEndDate.toISOString()),
    };

    try {
      let resp;
      if (pollId) {
        resp = await trackPromise(PollService.updatePoll(pollId, payload));
      } else {
        resp = await trackPromise(PollService.createPoll(payload));
      }

      const { data } = resp;
      if (data.success) {
        toast.success(
          pollId ? "Poll updated successfully!" : "Poll created successfully!"
        );
        navigateBack();
      } else {
        throw new Error(
          data.message || `Failed to ${pollId ? "update" : "create"} poll`
        );
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        `Error ${pollId ? "updating" : "creating"} poll`;
      toast.error(errMsg);
      console.error(errMsg);
      setPageError(errMsg);
    }
  }

  return (
    <div className="thm-panel">
      <Form
        fluid
        onSubmit={() => {
          setFrmSubmitted(true);
          frmObj.handleSubmit();
        }}
      >
        <Grid fluid>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Group controlId="pollDescription">
                <Form.ControlLabel>Poll Description</Form.ControlLabel>

                <Form.Control
                  name="pollDescription"
                  placeholder="Enter Poll Description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.pollDescription}
                  onChange={handleFieldChange("pollDescription")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.pollDescription}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Group controlId="pollStartDate">
                <Form.ControlLabel>Start Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="pollStartDate"
                  value={frmObj.values.pollStartDate}
                  onChange={handleFieldChange("pollStartDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.pollStartDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Group controlId="pollEndDate">
                <Form.ControlLabel>End Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="pollEndDate"
                  value={frmObj.values.pollEndDate}
                  onChange={handleFieldChange("pollEndDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.pollEndDate}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={24} md={12}>
              <Form.Group controlId="pollOptions">
                <Form.ControlLabel>Poll Options</Form.ControlLabel>
                {frmObj.values.pollOptions.map((optionObj, index) => (
                  <FlexboxGrid
                    align="middle"
                    justify="space-between"
                    className="poll-options"
                    key={index}
                  >
                    <FlexboxGrid.Item colspan={12}>
                      <Form.Control
                        name={`pollOptions[${index}].option`}
                        placeholder={`Option ${index + 1}`}
                        value={optionObj.option}
                        onChange={(value) => handleOptionChange(index)(value)}
                      />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={11}>
                      <IconButton
                        onClick={() => removeOption(index)}
                        disabled={frmObj.values.pollOptions.length <= 2}
                        title="delete"
                        icon={<TrashIcon color="red" />}
                      />
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                ))}
                <Button appearance="ghost" onClick={addOption} className="mt-2">
                  Add Option
                </Button>
                {frmSubmitted && frmObj.errors.pollOptions && (
                  <div>
                    {typeof frmObj.errors.pollOptions === "string"
                      ? frmObj.errors.pollOptions
                      : "Please fill all options"}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <Row gutter={12}>
              <Col>
                <Button appearance="primary" size="lg" type="submit">
                  {pollId ? "Update Poll" : "Create Poll"}
                </Button>
              </Col>
              <Col>
                <Button onClick={navigateBack} size="lg">
                  Cancel
                </Button>
              </Col>
            </Row>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddPolling;
