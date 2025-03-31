import billingAdjustmentsService from "../../../services/billingAdjustments.service";
import { useEffect, useState } from "react";
import { Modal, Button, Grid, Row, Col } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";

const BillAdjustmentDetailModal = ({
  itemId,
  isOpen,
  onClose,
  requestDemoDetails,
  setRequestDemoDetails,
  consentRequired = false,
  activeStatus = true,
  intentDisable = false,
}) => {
  const [billAdjustmentDetails, setBillAdjustmentDetails] = useState({});
  const [error, setError] = useState("");
  useEffect(() => {
    if (itemId) {
      getBillingAdjustmentsDetails();
    }
  }, [itemId]);

  const getBillingAdjustmentsDetails = async () => {
    let billAdjustmentDetail = {};
    try {
      const resp = await trackPromise(
        billingAdjustmentsService.getBillAdjustmentById(itemId)
      );
      const { data } = resp;
      if (data.success) {
        billAdjustmentDetail = resp.data.billAdjustment;
        setBillAdjustmentDetails(billAdjustmentDetail);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        `Error in fetching flats adjustment details`;
      toast.error(errMsg);
      console.error("Failed to fetch flats adjustment details", errMsg);
      setError(errMsg);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>{billAdjustmentDetails.adjustmentDescription}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Flat No</div>
                <div className="val">{billAdjustmentDetails.flatNo}</div>
                <p>{error}</p>
                <p className="error-message">{error}</p>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Adjustment type</div>
                <div className="val">
                  {billAdjustmentDetails.adjustmentType}
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Adjustment Description</div>
                <div className="val">
                  {billAdjustmentDetails.adjustmentDescription}
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Amount</div>
                <div className="val">{billAdjustmentDetails.amount}</div>
              </div>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="default">
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillAdjustmentDetailModal;
