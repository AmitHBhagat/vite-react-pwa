import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
  Modal,
  Grid,
  Whisper,
  Tooltip,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import BillingAdjustmentService from "../../../services/billingAdjustments.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import classNames from "classnames";
import { BREAK_POINTS } from "../../../utilities/constants";

const BillingAdjustments = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [billingAdjust, setBillingAdjust] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selBillAdjust, setBillAdjust] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [topAffixed, setTopAffixed] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchBillingAdjust(societyId);
    }
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  async function fetchBillingAdjust() {
    try {
      const resp = await trackPromise(
        BillingAdjustmentService.getAllBillAdjustments(societyId)
      );
      const { data } = resp;
      if (data.success) {
        setBillingAdjust(data.billAdjustments);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch billing adjustment catch => ", err);
    }
  }

  const getData = () => {
    let filteredBillingAdjust = billingAdjust.filter(
      (billingAdjust) =>
        billingAdjust.flatNo
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        billingAdjust.adjustmentType
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredBillingAdjust.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") {
          x = x.charCodeAt();
        }
        if (typeof y === "string") {
          y = y.charCodeAt();
        }
        return sortType === "asc" ? x - y : y - x;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return filteredBillingAdjust.slice(start, end);
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSortColumn(sortColumn);
      setSortType(sortType);
    }, 500);
  };

  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleOpenModal = (item) => {
    setBillAdjust(item);
    setDeleteMessage(`Do you wish to delete ${item.adjustmentDescription}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setBillAdjust({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const handleOpenDetailsModal = (item) => {
    setDetailModalOpen(true);
    setBillAdjust(item);
  };

  const handleCloseDetailsModal = () => {
    setDetailModalOpen(false);
    setBillAdjust({});
  };

  const deleteSocietyContact = async () => {
    try {
      const resp = await trackPromise(
        BillingAdjustmentService.deleteBillAdjustment(selBillAdjust._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "Billing Adjustment deleted successfully"
        );
        handleCloseModal();
        fetchBillingAdjust();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message ||
        "Error in deleting the billing adjustment";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete billing adjustment catch => ", error);
    }
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item className="filters-row section-mb">
              <InputGroup inside>
                <Input
                  placeholder="Search ..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/billing-adjustment/add`}>
                <Button appearance="primary" size="md">
                  Add Billing Adjustment
                </Button>
              </Link>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column sortable flexGrow={0.5}>
                <HeaderCell>Flat No</HeaderCell>

                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="top"
                      controlId={rowData._id}
                      speaker={<Tooltip arrow={false}>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenDetailsModal(rowData)}>
                        {rowData.flatNo}
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Adjustment Type</HeaderCell>
                <Cell dataKey="adjustmentType" />
              </Column>
              <Column flexGrow={1.5}>
                <HeaderCell>Adjustment Description</HeaderCell>
                <Cell dataKey="adjustmentDescription" />
              </Column>
              <Column flexGrow={0.5}>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="amount" />
              </Column>

              <Column width={100} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() => handleOpenModal(rowData)}
                      />
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>

        <div className="">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size={isSmallScreen ? "xs" : "md"}
            layout={[
              "total",
              "-",
              `${!isSmallScreen ? "limit" : ""}`,
              `${!isSmallScreen ? "|" : ""}`,
              "pager",
              `${!isSmallScreen ? "|" : ""}`,
              `${!isSmallScreen ? "skip" : ""}`,
            ]}
            total={billingAdjust.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteSocietyContact}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
        <DetailsModal
          isOpen={detailModalOpen}
          onClose={handleCloseDetailsModal}
          dataObj={selBillAdjust}
        />
      </div>
    </Container>
  );
};

export default BillingAdjustments;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>Billing Adjustment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Flat No</div>
                <div className="val">{dataObj.flatNo}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Adjustment Type</div>
                <div className="val">{dataObj.adjustmentType}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Adjustment Description</div>
                <div className="val">{dataObj.adjustmentDescription}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Amount</div>
                <div className="val">{dataObj.amount}</div>
              </div>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="default">
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};
