import React from "react";
import { HiOutlineTrophy } from "react-icons/hi2";
import { Col, Row } from "rsuite";
import { AnimateUpSection } from "./FadeInSection";

// Create an internal component for each stat box
const StatBox = ({ heading, text, className = "" }) => {
  return (
    <Col xs={24} sm={12} md={12} lg={6} className={`stat-box ${className}`}>
      <HiOutlineTrophy className="stat-icon" />
      <div className="stat-text">
        <h4 className="stat-heading header4">{heading}</h4>
        <p className="primary">{text}</p>
      </div>
    </Col>
  );
};

const AchievementSection = () => {
  return (
    <AnimateUpSection>
      <Row className="stats" id="stats">
        <Row className="four-stats-boxes">
          <StatBox
            heading="3x Won Awards"
            text="Vestibulum ante ipsum"
            className="stat-box-1"
          />
          <StatBox heading="3x Won Awards" text="Vestibulum ante ipsum" />
          <StatBox heading="3x Won Awards" text="Vestibulum ante ipsum" />
          <StatBox heading="3x Won Awards" text="Vestibulum ante ipsum" />
        </Row>
      </Row>
    </AnimateUpSection>
  );
};

export default AchievementSection;
