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
  Checkbox,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import AmenityService from "../../../services/amenity.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import classNames from "classnames";
import { THEME } from "../../../utilities/theme";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import "./Amenity.css";

const AmentityList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [amenities, setAmenities] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selAmenities, setSelAmenities] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
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

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getAmenities();
  }, [dispatch, pageTitle]);

  const getAmenities = async () => {
    try {
      const resp = await trackPromise(AmenityService.getAmenityList());
      setAmenities(resp.data.amenities);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch societies", error);
    }
  };

  const paginatedData = useTableData({
    data: amenities,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "name",
  });

  const handleOpenModal = (item) => {
    setSelAmenities(item);
    setDeleteMessage(`Do you wish to delete ${item.name}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelAmenities({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  async function deleteAmenity() {
    try {
      const resp = await trackPromise(
        AmenityService.deleteAmenity(selAmenities._id)
      );
      const { data } = resp;

      if (data?.success === true) {
        toast.success(data.message || "Amenity deleted successfully");
        getAmenities();
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.response.data.message);
      console.error("Delete error catch => ", err);
      if (err.code !== "ERR_NETWORK") {
        setDeleteError(err.response.data.message);
      } else {
        setDeleteError(err.response.data.message);
      }
    }
  }

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
              <Link to={`/add-amenity`}>
                <Button appearance="primary" size="md">
                  Add Amenity
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
              height={400}
              //autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={300} sortable>
                <HeaderCell>Name</HeaderCell>
                <Cell dataKey="name">
                  {(rowData) => (
                    <Link to={`/amenity-details/${rowData._id}`}>
                      {rowData.name}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={300} sortable>
                <HeaderCell>Web Icon</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <i
                      className={rowData.webIcon}
                      style={{ color: "grey" }}
                    ></i>
                  )}
                </Cell>
              </Column>

              <Column width={300} sortable>
                <HeaderCell>Status</HeaderCell>
                <Cell dataKey="status">
                  {(rowData) => <Checkbox checked={rowData.status} disabled />}
                </Cell>
              </Column>
              <Column width={200} align="center" className="col-action">
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
                      <Link to={`/edit-amenity/${rowData._id}`}>
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
          data={amenities}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteAmenity}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
      </div>
    </Container>
  );
};

export default AmentityList;
