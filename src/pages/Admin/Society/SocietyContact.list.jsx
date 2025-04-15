import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
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
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { THEME } from "../../../utilities/theme";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import "./society.css";

const SocietyContact = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [societyInfo, setSocietyInfo] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selSociety, setSelSociety] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [topAffixed, setTopAffixed] = useState(false);
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
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyInfo();
    }
  }, [societyId]);

  async function fetchSocietyInfo() {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.society.contactInfo;
      }
    } catch (err) {
      console.error("Society contact fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching society contact`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setSocietyInfo(respdata);
  }

  const paginatedData = useTableData({
    data: societyInfo,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "contactName",
    filterElement2: "",
  });

  const handleOpenModal = (item) => {
    setSelSociety(item);
    setDeleteMessage(`Do you wish to delete ${item.contactName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelSociety({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteSocietyContact = async () => {
    try {
      const resp = await trackPromise(
        SocietyService.deleteSocietyContact(societyId, selSociety._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "Society Contact deleted successfully"
        );
        handleCloseModal();
        fetchSocietyInfo();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the society contact";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete society contact catch => ", error);
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
              <Link to={`/society-contacts/add`}>
                <Button appearance="primary" size="md">
                  Add Society Contact
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
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={280} sortable flexGrow={1.5}>
                <HeaderCell>Name</HeaderCell>
                <Cell dataKey="contactName">
                  {(rowData) => (
                    <Link to={`/society-contacts/${rowData._id}`}>
                      {rowData.contactName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={200} sortable flexGrow={1}>
                <HeaderCell>Mobile</HeaderCell>
                <Cell dataKey="mobile" />
              </Column>
              <Column width={300} sortable flexGrow={1.5}>
                <HeaderCell>Email</HeaderCell>
                <Cell dataKey="email" />
              </Column>
              <Column width={200} sortable flexGrow={1}>
                <HeaderCell>Position</HeaderCell>
                <Cell dataKey="position" />
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
                      <Link to={`/society-contacts/edit/${rowData._id}`}>
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
          deleteAction={deleteSocietyContact}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default SocietyContact;
