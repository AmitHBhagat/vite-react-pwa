import { useEffect, useState } from "react";
import { Col, Container, Grid, Row } from "rsuite";
import { CiPlay1 } from "react-icons/ci";
import { RiSettings3Fill } from "react-icons/ri";
import image1 from "../../../assets/images/illustration-1.webp";
import FeatureSection from "./FeatureSection";
import PublicHeader from "../../../components/PublicHeader/Header";
import MobileSection from "./mobileSection";
import Footer from "./Footer";
import AboutSection from "./AboutSection";
import AchievementSection from "./AchievementSection";
import LoginModal from "../../../components/Auth/LoginModal";
import { AnimateUpSection, FadeInSection } from "./FadeInSection";
import ScrollToTopButton from "./ScrollToTopButton";

import "./home.css";

const Homepage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const handleClose = () => {
    setShowLogin(false);
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  return (
    <Container className="homepage">
      <Grid fluid className="wd-100 ">
        <Row className="background header-container">
          <PublicHeader />
        </Row>
        <Row className="home-first-view " id="home">
          <Col lg={10} md={20} sm={20} xs={20}>
            <AnimateUpSection>
              <div className="home-first-box ">
                <div className="">
                  <div className=" button-look">
                    <RiSettings3Fill className="icon" />
                    <h2 className="header2">Working for your success</h2>
                  </div>
                </div>
                <div>
                  <h1 className="header1">
                    Vitae Consectetur Led Vestibulum Ante
                  </h1>
                  <p className="primary">
                    Nullam quis ante. Etiam sit amet orci eget eros faucibus
                    tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.
                    Donec sodales sagittis magna.
                  </p>
                </div>
                <div className="xy-center">
                  <button
                    className="button2"
                    onClick={() => setShowLogin(true)}
                  >
                    Get Started
                  </button>
                  <button className="transparent-button">
                    <CiPlay1 />
                    Watch Demo
                  </button>
                </div>
              </div>
            </AnimateUpSection>
          </Col>
          <Col lg={10} md={17} sm={17} xs={24} className="first-view-image-box">
            <FadeInSection>
              <img
                src={image1}
                alt="image of society care"
                className="scroll-fade-in"
              />
            </FadeInSection>
          </Col>
        </Row>
        <AchievementSection />
        <AboutSection />
        <FeatureSection />
        <MobileSection />
        <Footer />
      </Grid>
      <LoginModal open={showLogin} onClose={handleClose} />
      <ScrollToTopButton />
    </Container>
  );
};

export default Homepage;
