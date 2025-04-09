import React, { useState } from "react";
import { Col, Row } from "rsuite";
import logo from "../../../assets/images/logo.jpg";
import RequestDemoModal from "./RequestDemoModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  function handleOpenModal() {
    setIsModalOpen(true);
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <Row className="footer-row" gutter={10} id="footer">
      <Col className="footer-col-one" xl={9} lg={9} md={24} sm={24} xs={24}>
        <div>
          <img src={logo} alt="logo" className="logo" />
        </div>
        <div>
          <p>A108 Adam Street</p>
          <p>New York, NY 535022</p>
        </div>
        <div>
          <p>
            <strong>Phone:</strong> +1 5589 55488 55
          </p>
          <p>
            <strong>Email:</strong>s info@example.com
          </p>
        </div>
      </Col>

      <Col xl={5} lg={5} md={6} sm={6} xs={12} className="footer-links">
        <ul className="footer-list">
          <li>
            <strong>Useful Links</strong>
          </li>
          <li>Home</li>
          <li>About us</li>
          <li>Services</li>
          <li>Terms of service</li>
          <li>Privacy policy</li>
        </ul>
      </Col>
      <Col xl={5} lg={5} md={6} sm={6} xs={12} className="footer-links">
        <ul className="footer-list">
          <li>
            <strong>Useful Links</strong>
          </li>
          <li>Home</li>
          <li>About us</li>
          <li>Services</li>
          <li>Terms of service</li>
          <li>Privacy policy</li>
        </ul>
      </Col>
      <Col xl={5} lg={5} md={12} sm={12} xs={24} className="footer-button-col">
        <div className="">
          <button className="button2" onClick={handleOpenModal}>
            Request Demo
          </button>
        </div>
      </Col>
      <Col
        lg={24}
        md={24}
        sm={24}
        xs={24}
        className="xy-col-center footer-copyright"
      >
        <p>
          © Copyright <strong>iLanding</strong> All Rights Reserved
        </p>
        <p className="blue tertiary">Designed by BootstrapMade</p>
      </Col>
      <RequestDemoModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Row>
  );
};

export default Footer;
