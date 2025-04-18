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
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import VendorService from "../../../services/vendor.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";

import parse from "html-react-parser";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { THEME } from "../../../utilities/theme";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { BREAK_POINTS } from "../../../utilities/constants";

const VendorList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [vendors, setVendor] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchVendor, setSearchVendor] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState?.user?.societyName) getVendors(authState.user.societyName);
  }, [authState?.user?.societyName]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getVendors = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(VendorService.getAllVendors(societyid));
      const { data } = resp;
      if (data.success) {
        respdata = data.vendors;
      }
    } catch (err) {
      console.error("Vendor fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching vendors`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVendor(respdata);
  };

  const getData = () => {
    let filteredList = vendors?.filter((itm) =>
      itm.vendorName?.toLowerCase()?.includes(searchVendor.toLowerCase() || "")
    );

    if (sortColumn && sortType) {
      filteredList?.sort((a, b) => {
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
    return filteredList?.slice(start, end);
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
    setSelectedVendor(item);
    setDeleteMessage(`Do you wish to delete ${item.vendorName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVendor({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const openDetailModal = (item) => {
    setSelectedVendor(item);
    setDetailOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedVendor({});
    setDetailOpen(false);
  };

  const deleteVendor = async () => {
    try {
      const resp = await trackPromise(
        VendorService.deleteVendor(selectedVendor._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Vendor deleted successfully");
        handleCloseModal();
        getVendors(authState.user.societyName);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in deleting the vendor";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete vendor catch => ", error);
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
                  value={searchVendor}
                  onChange={setSearchVendor}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/vendors/add`}>
                <Button appearance="primary" size="md" className="mr-2">
                  Add Vendor
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
              <Column sortable flexGrow={1}>
                <HeaderCell>Vendor Name</HeaderCell>
                <Cell dataKey="vendorName">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => openDetailModal(rowData)}>
                        {rowData.vendorName}
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Vendor Type</HeaderCell>
                <Cell dataKey="vendorType" />
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Vendor Mobile</HeaderCell>
                <Cell dataKey="vendorMobile" />
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Vendor Email</HeaderCell>
                <Cell dataKey="vendorEmail" />
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
                      <Link to={`/vendors/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        />
                      </Link>
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
            total={vendors?.length}
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
          deleteAction={deleteVendor}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <DetailsModal
          isOpen={detailOpen}
          onClose={closeDetailModal}
          dataObj={selectedVendor}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default VendorList;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>{parse(dataObj.vendorName)}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Vendor Type</div>
                <div className="val">{dataObj.vendorType}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Vendor Mobile</div>
                <div className="val">{dataObj.vendorMobile}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Vendor Email</div>
                <div className="val">
                  {dataObj.vendorEmail ? dataObj.vendorEmail : "-"}
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Vendor Details</div>
                <div className="val">{dataObj.vendorDetails}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Vendor Description</div>
                <div className="val">{dataObj.vendorDescription}</div>
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
