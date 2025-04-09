import { useEffect, useRef, useState } from "react";
import { IoCheckmarkDone } from "react-icons/io5";
import image1 from "../../../assets/images/illustration-1.webp";
import { Col, Row } from "rsuite";
import { AnimateUpSection, FadeInSection } from "./FadeInSection";
import classNames from "classnames";

const FeatureSection = () => {
  const [animate, setAnimate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const [featureActiveIndex, setFeatureActiveIndex] = useState(0);

  const featureData = [
    {
      heading: "Voluptatem dignissimos provident",
      subheading:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      list: [
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequatUllamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
      ],
      image: image1,
      imageAlt: "Feature 1",
    },
    {
      heading: "Voluptatem dignissimos",
      subheading:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      list: [
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequatUllamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
      ],
      image: image1,
      imageAlt: "Feature 1",
    },
    {
      heading: "Voluptatem dignissimos provident",
      subheading:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      list: [
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequatUllamco laboris nisi ut aliquip ex ea commodo consequat",
        "Ullamco laboris nisi ut aliquip ex ea commodo consequat",
      ],
      image: image1,
      imageAlt: "Feature 1",
    },
  ];

  const [currentData, setCurrentData] = useState(
    featureData[featureActiveIndex]
  );

  useEffect(() => {
    setAnimate(false); // Start fade-out
    const timer = setTimeout(() => {
      setCurrentData(featureData[featureActiveIndex]);
      setAnimate(true); // Trigger fade-in after content update
    }, 300); // 300ms should match the CSS transition duration
    // return () => clearTimeout(timer);
  }, [featureActiveIndex]);

  return (
    <>
      <AnimateUpSection>
        <Row className="center-row" id="features">
          <Col className="center-col">
            <h3 className="header3 border-header">Features</h3>
            <p className="primary">
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </Col>
        </Row>
      </AnimateUpSection>
      <AnimateUpSection>
        <Row>
          <div className="center-row">
            <div className="button-look feature-menu">
              <button
                className={`feature-button
                ${featureActiveIndex === 0 ? "button" : "not-active-button"}`}
                onClick={() => setFeatureActiveIndex(0)}
              >
                Modisit
              </button>
              <button
                className={`feature-button
                ${featureActiveIndex === 1 ? "button" : "not-active-button"}`}
                onClick={() => setFeatureActiveIndex(1)}
              >
                Modisit
              </button>
              <button
                className={`feature-button
                ${featureActiveIndex === 2 ? "button" : "not-active-button"}`}
                onClick={() => setFeatureActiveIndex(2)}
              >
                Modisit
              </button>
            </div>
          </div>
        </Row>
      </AnimateUpSection>
      <AnimateUpSection>
        <Row className="home-first-view">
          <Col
            className={classNames(
              "home-first-box",
              "feature-section",
              "animate",
              {
                "animate-in": animate,
                "animate-out": !animate,
              }
            )}
            lg={10}
            md={20}
            sm={20}
            xs={20}
            ref={elementRef}
          >
            <h3 className="header3 border-header-start">
              {currentData?.heading}
            </h3>
            <p className="primary">{currentData?.subheading}</p>
            <ul className="list">
              {currentData?.list?.map((e, i) => (
                <li key={i}>
                  <IoCheckmarkDone className="icon" />
                  <p className="primary">{e}</p>
                </li>
              ))}
            </ul>
          </Col>

          <Col
            lg={10}
            md={17}
            sm={17}
            xs={24}
            className={classNames("first-view-image-box", {
              "animate-in": animate,
              "animate-out": !animate,
            })}
          >
            <FadeInSection>
              <img src={currentData?.image} alt={currentData?.imageAlt} />
            </FadeInSection>
          </Col>
        </Row>
      </AnimateUpSection>
    </>
  );
};

export default FeatureSection;
