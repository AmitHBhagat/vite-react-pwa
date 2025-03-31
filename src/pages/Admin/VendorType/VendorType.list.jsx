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
  IconButton,
  Form,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import VendorTypeService from "../../../services/vendorType.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";

const VendorTypeList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [vendorTypes, setVendorTypes] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState?.user?.societyName)
      getVendorTypes(authState.user.societyName);
  }, [authState?.user?.societyName]);

  const isSmallScreen = useSmallScreen(768);

  const getVendorTypes = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(VendorTypeService.getTypes(societyid));
      const { data } = resp;
      if (data.success) respdata = resp.data.vendorTypes;
    } catch (err) {
      console.error("Vendor Types fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching vendor types`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVendorTypes(respdata);
  };

  const getData = () => {
    let filteredList = vendorTypes.filter((itm) =>
      itm.vendorTypeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredList.sort((a, b) => {
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
    return filteredList.slice(start, end);
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

  const openFormModal = (item) => {
    setSelectedType(item);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setSelectedType({});
    setFormOpen(false);
  };

  const handleOpenModal = (item) => {
    setSelectedType(item);
    setDeleteMessage(`Do you wish to delete ${item.vendorTypeName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedType({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteVendorType = async () => {
    try {
      const resp = await trackPromise(
        VendorTypeService.deleteType(selectedType._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Vendor type deleted successfully");
        handleCloseModal();
        getVendorTypes(authState.user.societyName);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in deleting the vendor type";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete vendor type catch => ", error);
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
              <Button
                appearance="primary"
                size="md"
                onClick={() => openFormModal({})}
              >
                Add Vendor Type
              </Button>
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
                <HeaderCell>Vendor Type Name</HeaderCell>
                <Cell dataKey="vendorTypeName" />
              </Column>
              <Column align="center" className="col-action">
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
                        title="edit"
                        icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        onClick={() => openFormModal(rowData)}
                      />
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
            total={vendorTypes.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <ModalForm
          isOpen={formOpen}
          onClose={closeFormModal}
          closeCallback={getVendorTypes}
          contextObj={{ societyId: authState.user.societyName }}
          dataObj={selectedType}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteVendorType}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default VendorTypeList;

function getFormSchema() {
  return {
    societyId: "",
    vendorTypeName: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    vendorTypeName: Yup.string().required("Vendor Type Name is required"),
  });
}

const ModalForm = ({
  isOpen,
  onClose,
  closeCallback = void 0,
  contextObj = {},
  dataObj = {},
}) => {
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(
    () => populateForm({ ...contextObj, ...dataObj }),
    [contextObj, dataObj]
  );

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  function populateForm(newData = {}) {
    const formobj = {
      ...frmObj.values,
      ...newData,
    };
    frmObj.setValues(formobj);
  }

  const closeModal = () => {
    onClose();
    frmObj.resetForm();
    setFrmSubmitted(false);
    setModalError("");
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setModalError("");
    const payload = { ...frmObj.values };
    try {
      const resp = dataObj._id
        ? await trackPromise(VendorTypeService.updateType(dataObj._id, payload))
        : await trackPromise(VendorTypeService.createType(payload));
      const { data } = resp;
      if (data.success) {
        toast.success("Vendor Type saved successfully!");
        if (closeCallback) closeCallback(contextObj.societyId);
        closeModal();
      }
    } catch (err) {
      console.error("Vendor Type save error catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in creating the Vendor Type`;
      toast.error(errMsg);
      setModalError(errMsg);
    }
  }

  return isOpen ? (
    <Modal open={isOpen} onClose={closeModal} size="xs" className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>
          {dataObj._id ? "Edit " : "Create "}Vendor Type
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Form className="" fluid>
          <Grid fluid>
            <Row gutter={0}>
              <Col xs={24}>
                <Form.Group controlId="vendorTypeName">
                  <Form.ControlLabel>Vendor Type Name</Form.ControlLabel>
                  <Form.Control
                    name="vendorTypeName"
                    placeholder="Enter vendor type name"
                    value={frmObj.values.vendorTypeName}
                    onChange={handleFieldChange("vendorTypeName")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.vendorTypeName}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Grid>

          <PageErrorMessage show={Boolean(modalError)} msgText={modalError} />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary"
          type="button"
          onClick={() => {
            setFrmSubmitted(true);
            frmObj.handleSubmit();
          }}
        >
          {dataObj._id ? "Update" : "Create"}
        </Button>
        <Button onClick={closeModal} appearance="default">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};
