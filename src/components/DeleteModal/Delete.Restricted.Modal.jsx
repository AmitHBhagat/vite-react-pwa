import React from "react";
import { Modal, Button } from "rsuite";

const DeleteRestrictedModal = ({ isOpen, onClose }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header>
        <Modal.Title>Delete Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>Default Charges cant be deleted</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="default">
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};

export default DeleteRestrictedModal;
