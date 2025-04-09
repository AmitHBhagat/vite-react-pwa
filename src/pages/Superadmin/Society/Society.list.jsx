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
  IconButton,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { THEME } from "../../../utilities/theme";
import "./society.css";
import { BREAK_POINTS } from "../../../utilities/constants";

const SocietyList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [societies, setSocieties] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
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

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getSocieties();
  }, []);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getSocieties = async () => {
    try {
      const resp = await trackPromise(SocietyService.getSocietyList());
      setSocieties(resp.data.societies);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch societies", error);
    }
  };

  const getData = () => {
    let filteredSocieties = societies.filter((society) =>
      society.societyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredSocieties.sort((a, b) => {
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
    return filteredSocieties.slice(start, end);
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
    setDeleteMessage(`Do you wish to delete ${item.societyName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelSociety({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteSociety = async () => {
    try {
      const resp = await trackPromise(
        SocietyService.deleteSociety(selSociety._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Society deleted successfully");
        handleCloseModal();
        getSocieties();
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in deleting the society";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete society catch => ", error);
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
              <Link to={`/society/add`}>
                <Button appearance="primary" size="md">
                  Add Society
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
              <Column width={100} sortable>
                <HeaderCell>Image</HeaderCell>
                <Cell dataKey="societyImage">
                  {(rowData) => (
                    <img
                      src={rowData?.societyImages[0]?.fileurl}
                      alt={rowData?.societyImages[0]?.title}
                      height="30"
                      width="30"
                    />
                  )}
                </Cell>
              </Column>
              <Column width={280} sortable flexGrow={1.5}>
                <HeaderCell>Name</HeaderCell>
                <Cell dataKey="societyName">
                  {(rowData) => (
                    <Link to={`/society/details/${rowData._id}`}>
                      {rowData.societyName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={250} sortable flexGrow={1}>
                <HeaderCell>URL</HeaderCell>
                <Cell dataKey="societyUrl" />
              </Column>
              <Column width={180} sortable>
                <HeaderCell>Subscription Start</HeaderCell>
                <Cell dataKey="societySubscriptionStartDate">
                  {(rawData) =>
                    formatDate(rawData.societySubscriptionStartDate)
                  }
                </Cell>
              </Column>
              <Column width={180} sortable>
                <HeaderCell>Subscription End</HeaderCell>
                <Cell dataKey="societySubscriptionEndDate">
                  {(rawData) => formatDate(rawData.societySubscriptionEndDate)}
                </Cell>
              </Column>
              <Column width={130} align="center" className="col-action">
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
                      <Link to={`/society/edit/${rowData._id}`}>
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
            total={societies.length}
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
          deleteAction={deleteSociety}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
      </div>
    </Container>
  );
};

export default SocietyList;
