import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Table } from "rsuite";
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
import "./society.css";

function SocietyInfo({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [societyInfo, setSocietyInfo] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState?.user?.societyName) {
      fetchSocietyInfo(authState?.user?.societyName);
    }
  }, [authState?.user?.societyName]);

  async function fetchSocietyInfo(societyid) {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyid));
      const { data } = resp;
      if (data.success) {
        setSocietyInfo(data.society);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch society information catch => ", err);
    }
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Link to={`/society-info-edit`}>
              <Button appearance="primary" size="md">
                Edit
              </Button>
            </Link>
          </FlexboxGrid.Item>
        </FlexboxGrid>

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
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default SocietyInfo;
