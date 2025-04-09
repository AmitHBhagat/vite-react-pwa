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
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import classNames from "classnames";
import "./society.css";
import { BREAK_POINTS } from "../../../utilities/constants";

const SocietyContact = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [societyInfo, setSocietyInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selSociety, setSelSociety] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [topAffixed, setTopAffixed] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyInfo(societyId);
    }
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  async function fetchSocietyInfo() {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        setSocietyInfo(data.society.contactInfo);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch society contact catch => ", err);
    }
  }

  const getData = () => {
    let filteredSocietyContact = societyInfo.filter((societycontact) =>
      societycontact.contactName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredSocietyContact.sort((a, b) => {
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
    return filteredSocietyContact.slice(start, end);
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
            total={societyInfo.length}
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
      </div>
    </Container>
  );
};

export default SocietyContact;
