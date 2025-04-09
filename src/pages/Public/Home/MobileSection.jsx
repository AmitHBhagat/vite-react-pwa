import { FaCheckCircle } from "react-icons/fa";
import { Col, Popover, Row, Whisper } from "rsuite";
import mobileScreen from "../../../assets/images/mobile-screen.png";
import Popup from "./Popup";
import { FadeInSection, HorizontalAnimation } from "./FadeInSection";

const MobileSection = () => {
  const list = {
    leftList: [
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
    ],
    rightList: [
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
      {
        title: "Society Information",
        icon: <FaCheckCircle className="icon" />,
      },
    ],
  };
  return (
    <Row className="mobile-row">
      <Col className="mobile-left-list" lg={9} md={8} sm={24} xs={24}>
        <ul className="mobile-feature-list list">
          {list.leftList.map((e, index) => (
            <HorizontalAnimation direction={"leftToRight"} key={index}>
              <div>
                <Whisper
                  placement="top"
                  trigger="click"
                  controlId="control-id-click"
                  speaker={
                    <Popover title={e.title} className="popup">
                      <Popup index={index} />
                    </Popover>
                  }
                >
                  <li className="cursor-pointer">
                    <p className="primary">{e.title}</p>
                    {e.icon}
                  </li>
                </Whisper>
              </div>
            </HorizontalAnimation>
          ))}
        </ul>
      </Col>
      <Col className="mobile-screen-image " lg={6} md={8} sm={24} xs={24}>
        <FadeInSection elementCover={0.1}>
          <img src={mobileScreen} alt="mobileScreen" />
        </FadeInSection>
      </Col>
      <Col className="mobile-right-list" lg={9} md={8} sm={24} xs={24}>
        <ul className="mobile-feature-list list">
          {list.rightList.map((e, index) => (
            <HorizontalAnimation direction={"rightToLeft"} key={index}>
              <div>
                <Whisper
                  placement="top"
                  trigger="click"
                  controlId="control-id-click"
                  speaker={
                    <Popover title={e.title} className="popup">
                      <Popup index={index} />
                    </Popover>
                  }
                >
                  <li className="cursor-pointer">
                    {e.icon} <p className="primary">{e.title}</p>
                  </li>
                </Whisper>
              </div>
            </HorizontalAnimation>
          ))}
        </ul>
      </Col>
    </Row>
  );
};

export default MobileSection;
