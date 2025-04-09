import React from "react";
import { FaCheckCircle, FaPhoneAlt } from "react-icons/fa";
import { Col, Row } from "rsuite";
import { AnimateUpSection, FadeInSection } from "./FadeInSection";
import logo from "../../../assets/images/logo.jpg";
import image1 from "../../../assets/images/illustration-1.webp";

// Create a reusable component for list items
const ListItem = ({ children }) => (
  <li>
    <FaCheckCircle className="icon" />
    {children}
  </li>
);

const AboutSection = () => {
  return (
    <Row className="home-first-view" id="about">
      <Col lg={10} md={20} sm={20} xs={20}>
        <AnimateUpSection>
          <div className="home-first-box">
            <div className="about-text">
              <h2 className="header2">MORE ABOUT US</h2>
              <h4 className="header4">Voluptas enim suscipit temporibus</h4>
              <p className="primary">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
            </div>
            <div className="about-list secondary">
              <ul className="list">
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
              </ul>
              <ul className="list">
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
              </ul>
            </div>
            <div className="about-info">
              <div className="about-avatar">
                <img src={logo} alt="logo" className="avatar-image" />
                <div>
                  <h5>Mario Smith</h5>
                  <p className="blue">Mario Smith</p>
                </div>
              </div>
              <div className="about-avatar">
                <FaPhoneAlt className="icon" />
                <div>
                  <h5>Call us anytime</h5>
                  <p className="blue">+123 456-789</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateUpSection>
      </Col>
      <Col lg={10} md={17} sm={17} xs={24} className="first-view-image-box">
        <FadeInSection>
          <img src={image1} alt="" className="scroll-fade-in" />
        </FadeInSection>
      </Col>
    </Row>
  );
};

export default AboutSection;
