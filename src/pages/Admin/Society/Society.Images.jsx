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
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";

import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { BREAK_POINTS } from "../../../utilities/constants";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";

import "./society.css";

const SocietyImages = ({ pageTitle }) => {
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [selSociety, setSelSociety] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const [societyInfo, setSocietyInfo] = useState([]);
  const [pageError, setPageError] = useState("");
  const societyId = authState?.user?.societyName;
  const {
    searchQuery,
    setSearchQuery,
    limit,
    setLimit,
    page,
    setPage,
    sortColumn,
    sortType,
    setSort,
    loading,
    setLoading,
  } = useTableState();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyInfo();
    }
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const fetchSocietyInfo = async () => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        respData = data?.society?.societyImages;
      }
    } catch (err) {
      console.error("Society image fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching society image`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setSocietyInfo(respData);
  };

  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleOpenModal = (item) => {
    setSelSociety(item);
    setDeleteMessage(`Do you wish to delete ${item.title}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelSociety({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteSocietyImage = async () => {
    try {
      const resp = await trackPromise(
        SocietyService.deleteSocietyImage(societyId, selSociety._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "Society Image deleted successfully"
        );
        handleCloseModal();
        fetchSocietyInfo();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the society";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete society catch => ", error);
    }
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div className="inner-container">
        <Affix>
          <FlexboxGrid
            style={{
              width: "100%",
              backgroundColor: "white",
              padding: "10px",
            }}
            justify="space-between"
            className=""
          >
            <FlexboxGrid.Item className="filters-row"></FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/society-images/add`}>
                <Button appearance="primary" size="md">
                  Add Society Image
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
              data={societyInfo}
              loading={loading}
              height={400}
              //autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={300}>
                <HeaderCell>Image</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <img
                      src={rowData.fileurl}
                      alt={rowData.title}
                      height="50"
                      width="50"
                    />
                  )}
                </Cell>
              </Column>
              <Column width={500}>
                <HeaderCell>Image Title</HeaderCell>
                <Cell dataKey="title"></Cell>
              </Column>

              <Column width={300} align="center">
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
        <Paginator
          data={societyInfo}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteSocietyImage}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
      </div>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </Container>
  );
};

export default SocietyImages;
