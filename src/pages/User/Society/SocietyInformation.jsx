import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Table, Carousel } from "rsuite";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { formatDate } from "../../../utilities/formatDate";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import "./societyInformation.css";

function SocietyInformation({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [societyInfo, setSocietyInfo] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (authState?.selectedFlat?.societyId) {
      fetchSocietyInfo(authState.selectedFlat.societyId);
    }
  }, [authState.selectedFlat]);

  async function fetchSocietyInfo(societyid) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyid));
      const { data } = resp;
      if (data.success) {
        respdata = data.society;
      }
    } catch (err) {
      console.error("User society information fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in fetching user society information`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setSocietyInfo(respdata);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel user-societyinfo">
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Name</div>
                <div className="val">{societyInfo.societyName}</div>
              </div>
            </Col>
            <Col xs={24} lg={16} xl={12}>
              <div className="details-grp">
                <div className="lbl">Society Address</div>
                <div className="val">{societyInfo.societyAddress}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Email</div>
                <div className="val">{societyInfo.societyEmail}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society URL</div>
                <div className="val">{societyInfo.societyUrl}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Registration No.</div>
                <div className="val">{societyInfo.societyRegistrationNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Activation Year</div>
                <div className="val">{societyInfo.societyActivationYear}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Activation Month</div>
                <div className="val">{societyInfo.societyActivationMonth}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Subscription Start Date</div>
                <div className="val">
                  {formatDate(societyInfo.societySubscriptionStartDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Subscription End Date</div>
                <div className="val">
                  {formatDate(societyInfo.societySubscriptionEndDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Members Count</div>
                <div className="val">{societyInfo.societyMembersCount}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Parking</div>
                <div className="val">{societyInfo.societyParkingCount}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Bill Due Date</div>
                <div className="val">
                  {societyInfo.societyBillDueDateinDays}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Default baseline Amount</div>
                <div className="val">
                  {societyInfo.societyDefaulterBaseLineAmount}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Is Active</div>
                <div className="val">
                  {societyInfo.status ? (
                    <span className="affirm">
                      <CheckOutlineIcon />
                    </span>
                  ) : (
                    <span className="negate">
                      <CloseOutlineIcon />
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={20} className="mr-b-1">
            <Col xs={24}>
              <div className="content-title">Society Contacts</div>
            </Col>
            <Col xs={24}>
              <Table
                wordWrap="break-word"
                data={societyInfo.contactInfo}
                autoHeight
                headerHeight={30}
                rowHeight={40}
                className="tbl-theme tbl-compact"
              >
                <Column flexGrow={1}>
                  <HeaderCell>Name</HeaderCell>
                  <Cell dataKey="contactName" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>Mobile</HeaderCell>
                  <Cell dataKey="mobile" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>Email</HeaderCell>
                  <Cell dataKey="email" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>Position</HeaderCell>
                  <Cell dataKey="position" />
                </Column>
              </Table>
            </Col>
          </Row>

          <Row gutter={20} className="mr-b-1">
            <Col xs={24}>
              <div className="content-title">Society Images</div>
            </Col>
            <Col xs={22} xsOffset={1} sm={18} smOffset={3}>
              {societyInfo.societyImages?.length ? (
                <Carousel
                  autoplay={true}
                  autoplayInterval={5000}
                  className="theme-slider"
                >
                  {societyInfo.societyImages.map((img) => (
                    <img key={img?._id} src={img?.fileurl} alt={img?.title} />
                  ))}
                </Carousel>
              ) : (
                <div className="no-images">No image found</div>
              )}
            </Col>
          </Row>

          <Row gutter={20} className="mr-b-1">
            <Col xs={24}>
              <div className="content-title">Amenities</div>
            </Col>
            <Col xs={24}>
              <Table
                wordWrap="break-word"
                data={societyInfo.amenties}
                autoHeight
                headerHeight={30}
                rowHeight={40}
                className="tbl-theme tbl-compact"
              >
                <Column width={250}>
                  <HeaderCell>Name</HeaderCell>
                  <Cell dataKey="name" />
                </Column>
                <Column width={150} align="center">
                  <HeaderCell>Icon</HeaderCell>
                  <Cell dataKey="webIcon">
                    {(rowData) => <i className={`${rowData.webIcon} pr-2`}></i>}
                  </Cell>
                </Column>
              </Table>
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
}

export default SocietyInformation;
