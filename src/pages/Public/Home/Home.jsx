import React from "react";
import { HiOutlineTrophy } from "react-icons/hi2";
import { Button, Col, Container, Grid, Row } from "rsuite";
import { CiPlay1 } from "react-icons/ci";
import { Heading, Text, List, Avatar, Panel } from "rsuite";
import { MdOutlineDone } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

import logo from "../../../assets/images/logo.jpg";
import image1 from "../../../assets/images/illustration-1.webp";

import "./home.css";

import { RiSettings3Fill } from "react-icons/ri";

const Homepage = () => {
  // const navigationBar = [{label: Home}]
  return (
    <Container className="homepage">
      <Grid fluid className="wd-100">
        <Row className="background">
          <header className="header">
            <nav className="nav-box">
              <div className="xy-center">
                <img src={logo} alt="logo" className="logo" />
                <h6>Society Care</h6>
              </div>

              <ul className="nav-list">
                <li>Home</li>
                <li>About</li>
                <li>Features</li>
                <li>Service</li>
                <li>Pricing</li>
                <li>Dropdown</li>
                <li>Contact</li>
              </ul>
              <button className="button">Get Started</button>
            </nav>
          </header>
          {/* </Row> */}
          {/* <Row> */}
          {/* <div>hello</div> */}
        </Row>
        <Row className="home-first-view">
          <Col className="home-first-box" lg={10} md={20} sm={20} xs={20}>
            <div className="">
              <div className=" button-look">
                <RiSettings3Fill className="icon" />
                <h2>Working for your success</h2>
              </div>
            </div>
            <div>
              <h1>Vitae Consectetur Led Vestibulum Ante</h1>
              <p>
                Nullam quis ante. Etiam sit amet orci eget eros faucibus
                tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec
                sodales sagittis magna.
              </p>
            </div>
            <div className="xy-center">
              <button className="button2">Get Started</button>
              <button className="transparent-button">
                <CiPlay1 />
                Watch Demo
              </button>
            </div>
          </Col>
          <Col lg={10} md={24} sm={24} xs={24} className="first-view-image-box">
            <img src={image1} alt="image of society care" />
          </Col>
        </Row>
        <Row className="stats">
          <Row className="four-stats-boxes">
            <Col xs={24} sm={12} md={12} lg={6} className="stat-box stat-box-1">
              <HiOutlineTrophy className="stat-icon" />
              <div className="stat-text">
                <h3 className="stat-heading">3x Won Awards</h3>
                <p>Vestibulum ante ipsum</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} className="stat-box">
              <HiOutlineTrophy className="stat-icon" />
              <div className="stat-text">
                <h3 className="stat-heading">3x Won Awards</h3>
                <p>Vestibulum ante ipsum</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} className="stat-box">
              <HiOutlineTrophy className="stat-icon" />
              <div className="stat-text">
                <h3 className="stat-heading">3x Won Awards</h3>
                <p>Vestibulum ante ipsum</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} className="stat-box">
              <HiOutlineTrophy className="stat-icon" />
              <div className="stat-text">
                <h3 className="stat-heading">3x Won Awards</h3>
                <p>Vestibulum ante ipsum</p>
              </div>
            </Col>
          </Row>
        </Row>
        <Row className="home-first-view">
          <Col className="home-first-box" lg={10} md={20} sm={20} xs={20}>
            <div className="about-text">
              <h2>MORE ABOUT US</h2>
              <h3>Voluptas enim suscipit temporibus</h3>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
            </div>
            <div className="about-list">
              <ul>
                <li>
                  <FaCheckCircle className="icon" />
                  <p className="secondary">Lorem ipsum dolor sit amet</p>
                </li>
                <li>
                  <FaCheckCircle className="icon" />
                  <p className="secondary">Lorem ipsum dolor sit amet</p>
                </li>
                <li>
                  <FaCheckCircle className="icon" />
                  <p className="secondary">Lorem ipsum dolor sit amet</p>
                </li>
              </ul>
              <ul>
                <li>
                  <FaCheckCircle className="icon" />
                  <p className="secondary">Lorem ipsum dolor sit amet</p>
                </li>
                <li>
                  <FaCheckCircle className="icon" />
                  <p className="secondary">Lorem ipsum dolor sit amet</p>
                </li>
              </ul>
            </div>
            <div className="about-info">
              <div className="about-avatar">
                <img src={logo} alt="logo" className="avatar-image" />
                <div>
                  <h5>Mario Smith</h5>
                  <h5>Mario Smith</h5>
                </div>
              </div>
              <div className="about-avatar">
                <FaPhoneAlt className="icon" />
                <div>
                  <p>Call us anytime</p>
                  <p>+123 456-789</p>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={10} md={24} sm={24} xs={24} className="first-view-image-box">
            <img src={image1} alt="" />
          </Col>
        </Row>
      </Grid>
    </Container>
  );
};

export default Homepage;
