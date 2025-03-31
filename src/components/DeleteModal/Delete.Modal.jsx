import React from "react";
import { Modal, Button } from "rsuite";
import "./delete.css";

const DeleteModal = ({
  isOpen,
  onClose,
  deleteMsg = "",
  deleteErr = "",
  deleteAction = () => void 0,
  consentRequired = false,
  activeStatus = true,
  intentDisable = false,
  showBigMsg = false,
  bigMsg = "",
}) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header>
        <Modal.Title>
          {intentDisable
            ? !activeStatus
              ? "Enable Confirmation"
              : "Disable Confirmation"
            : "Delete Confirmation"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>{deleteMsg}</p>
          <p className="error-message">{deleteErr}</p>
          {showBigMsg && <p className="two-line-ellipsis">{bigMsg}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {intentDisable ? (
          <Button
            onClick={deleteAction}
            appearance="primary"
            color={activeStatus ? "red" : "blue"}
          >
            {activeStatus ? "Disable" : "Enable"}
          </Button>
        ) : (
          <Button onClick={deleteAction} appearance="primary" color="red">
            {consentRequired ? "Confirm Delete" : "Delete"}
          </Button>
        )}
        <Button onClick={onClose} appearance="default">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};

export default DeleteModal;
