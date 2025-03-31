import React, { useState, useEffect } from "react";
import { Form, Button, Grid, Row, Col, FlexboxGrid } from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import billChargeService from "../../../services/billingCharge.service";
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import BillingTable from "./BillingTable";
import useFetchSocieties from "../../../utilities/useFetchSocieties";
import AddOutlineIcon from "@rsuite/icons/AddOutline";
import { CiEdit } from "react-icons/ci";
import "./billingCharges.css";
import "react-quill/dist/quill.snow.css";

function getFormSchema() {
  return {
    isDefault: false,
    title: "",
    tag: "",
    value: "",
    calcType: "",
    isFlatDependent: false,
    dependencyParam: "",
    status: false,
    paramType: "",
    chargeType: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    title: Yup.string().required("Title is required"),
    value: Yup.number().required("Value is required"),
  });
}

function AddBill({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { billId } = useParams();

  const [billDetails, setBillDetails] = useState([]);
  const [selectedBill, setSelectedBill] = useState({});
  const [status, setStatus] = useState("noChange");
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: addBillingCharge,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [pageTitle, dispatch]);
  useEffect(() => {
    if (status === "Edited") {
      if (selectedBill._id && selectedBill.rowIndex !== undefined) {
        setBillDetails((prevDetails) =>
          prevDetails.map((bill, index) =>
            index === selectedBill.rowIndex ? selectedBill : bill
          )
        );
      }

      setSelectedBill({});
      setStatus("noChange");
    }

    if (status === "Added") {
      if (selectedBill.title) {
        setBillDetails((prevDetails) =>
          prevDetails.map((bill, index) =>
            index === selectedBill.rowIndex ? selectedBill : bill
          )
        );
        setBillDetails([...billDetails, selectedBill]);
      }

      setSelectedBill({});
      setStatus("noChange");
    }
  }, [status]);

  async function addBillingCharge() {
    setSelectedBill({});

    setStatus("Add");

    setIsMaintenanceModalOpen(true);
  }
  async function formUpdate() {
    setFrmSubmitted(false);
    const payload = billDetails;
    try {
      const resp = billId
        ? await trackPromise(billChargeService.updateCharge(billId, payload))
        : await trackPromise(billChargeService.createCharge(payload));
      const { data } = resp;
      if (data.success) {
        toast.success("bill saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("bill save error catch => ", err);
      toast.error(err.response.data.message);
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
        <Grid fluid className="billing-charges">
          <Row gutter={20}>
            <Col xs={24} md={24} lg={24}>
              <Form.Group className="txt-rgt">
                <Button
                  startIcon={<AddOutlineIcon />}
                  appearance="primary"
                  align="center"
                  type="submit"
                  onClick={addBillingCharge}
                >
                  Add
                </Button>
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={20}>
            <BillingTable
              billId={billId}
              pageTitle={pageTitle}
              billsData={billDetails}
              setBillDetails={setBillDetails}
              selectedBill={selectedBill}
              setSelectedBill={setSelectedBill}
              frmObj={frmObj}
              isMaintenanceModalOpen={isMaintenanceModalOpen}
              setIsMaintenanceModalOpen={setIsMaintenanceModalOpen}
              status={status}
              setStatus={setStatus}
              pageType="billingChargesEdit"
            />
          </Row>
          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" onClick={formUpdate}>
                {billId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="/billing-charges"
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

export default AddBill;
