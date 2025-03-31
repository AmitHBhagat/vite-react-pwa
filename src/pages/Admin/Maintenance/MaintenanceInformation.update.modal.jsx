import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  InputPicker,
  Form,
  Grid,
  Row,
  Col,
  Checkbox,
  InputNumber,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import AddOutlineIcon from "@rsuite/icons/AddOutline";
import { CiEdit } from "react-icons/ci";
import {
  PARAM_TYPES,
  CHARGE_TYPES,
  CALC_OR_ARREARS_INTEREST_TYPES,
} from "../../../utilities/constants";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  value: Yup.number().required("Value is required"),
  dependencyParam: Yup.string().when("isFlatDependent", {
    is: true,
    then: (schema) => schema.required("Dependency is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  calcType: Yup.string().required("Calculation type is required"),
  chargeType: Yup.string().required("Charge type is required"),
});

const MaintenanceUpdateModal = ({
  itemId,
  isOpen,
  onClose,
  selectedBill,
  setSelectedBill,
  status,
  setStatus,
  consentRequired = false,
  activeStatus = true,
  intentDisable = false,
}) => {
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const frmObj = useFormik({
    initialValues: {
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
    },
    validationSchema,
    onSubmit: async (values) => {
      const updatedSelectedBill = {
        ...selectedBill,
        ...frmObj.values,
      };

      setSelectedBill(updatedSelectedBill);
      if (selectedBill._id) {
        setStatus("Edited");
      } else {
        setStatus("Added");
      }

      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      frmObj.setValues({
        isDefault: selectedBill.isDefault || false,
        title: selectedBill.title || "",
        tag: selectedBill.tag || "",
        value: Number(selectedBill.value) || "",
        calcType: selectedBill.calcType || "",
        isFlatDependent: selectedBill.isFlatDependent || false,
        dependencyParam: selectedBill.dependencyParam || "",
        status: selectedBill.status || false,
        paramType: selectedBill.paramType || "",
        chargeType: selectedBill.chargeType || "",
      });
    }
  }, [isOpen, selectedBill]);

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };
  const handleCheckboxChange = (key) => (bollean, event) => {
    if (key === "isFlatDependent" && bollean === false) {
      frmObj.setFieldValue("dependencyParam", "");
      frmObj.setFieldValue(key, bollean);
    } else {
      frmObj.setFieldValue(key, bollean);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="thm-modal request-demo-modal"
    >
      <Modal.Header>
        <Modal.Title>{`${status} Billing Charge`}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="request-demo-modal-body">
        <Form
          className=""
          fluid
          onSubmit={() => {
            setFrmSubmitted(true);
            frmObj.handleSubmit();
          }}
        >
          <Grid fluid className="billing-charges">
            <Row gutter={5}>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
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
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Value</Form.ControlLabel>
                  <Form.Control
                    name="number"
                    accepter={InputNumber}
                    placeholder="Enter Value"
                    value={frmObj.values.value}
                    onChange={handleFieldChange("value")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.value}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Calculation</Form.ControlLabel>

                  <InputPicker
                    block
                    name="calcType"
                    placeholder="Enter Calculation Type"
                    data={CALC_OR_ARREARS_INTEREST_TYPES}
                    value={frmObj.values.calcType}
                    onChange={handleFieldChange("calcType")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.calcType}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Charge Type</Form.ControlLabel>

                  <InputPicker
                    block
                    name="chargeType"
                    placeholder="Enter Charge Type"
                    data={CHARGE_TYPES}
                    onChange={handleFieldChange("chargeType")}
                    value={frmObj.values.chargeType}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.chargeType}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group className="">
                  <Checkbox
                    name="isFlatDependent"
                    onChange={(_, bollean) =>
                      handleCheckboxChange("isFlatDependent")(bollean)
                    }
                    checked={frmObj.values.isFlatDependent}
                  >
                    Is Flat Dependant
                  </Checkbox>
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Dependency Param</Form.ControlLabel>
                  <Form.Control
                    name="dependencyParam"
                    placeholder="Enter Dependency Param"
                    value={frmObj.values.dependencyParam}
                    onChange={handleFieldChange("dependencyParam")}
                    disabled={!frmObj.values.isFlatDependent}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.dependencyParam}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group className="">
                  <Checkbox
                    name="active"
                    onChange={(_, bollean) => {
                      handleCheckboxChange("status")(bollean);
                    }}
                    checked={frmObj.values.status}
                  >
                    Active
                  </Checkbox>
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Param Type</Form.ControlLabel>

                  <InputPicker
                    block
                    name="paramType"
                    placeholder="Enter Param Type"
                    data={PARAM_TYPES}
                    value={frmObj.values.paramType}
                    onChange={handleFieldChange("paramType")}
                    disabled={!frmObj.values.isFlatDependent}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <Form.Group className="txt-rgt">
                  <Button
                    startIcon={
                      status === "Add" ? <AddOutlineIcon /> : <CiEdit />
                    }
                    appearance="primary"
                    align="center"
                    type="submit"
                  >
                    {status}
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Grid>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MaintenanceUpdateModal;
