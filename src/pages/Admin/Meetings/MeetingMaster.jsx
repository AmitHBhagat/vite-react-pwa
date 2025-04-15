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
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import MeetingService from "../../../services/meeting.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { formatDateTime } from "../../../utilities/formatDate";
import { THEME } from "../../../utilities/theme";
import parse from "html-react-parser";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import Paginator from "../../../components/Table/Paginator";

const MeetingList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchMeetings, setSearchMeetings] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getMeetings();
  }, [dispatch, pageTitle]);

  const getMeetings = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(MeetingService.getAllMeetings(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.meetings;
      }
    } catch (err) {
      console.error("meetings fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching meetings`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setMeetings(respdata);
  };

  const getData = () => {
    let filteredList = meetings?.filter((itm) =>
      itm.meetingAgenda
        ?.toLowerCase()
        ?.includes(searchMeetings.toLowerCase() || "")
    );

    if (sortColumn && sortType) {
      filteredList?.sort((a, b) => {
        let x = a[sortColumn] || "";
        let y = b[sortColumn] || "";

        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
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
    setSelectedMeeting(item);
    setDeleteMessage(`Do you wish to delete this Meeting"?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMeeting({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteMeeting = async () => {
    try {
      const resp = await trackPromise(
        MeetingService.deleteMeeting(selectedMeeting._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Meeting deleted successfully");
        handleCloseModal();
        getMeetings();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the meeting";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete meeting catch => ", error);
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
                  value={searchMeetings}
                  onChange={setSearchMeetings}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/meetings/add`}>
                <Button appearance="primary" size="md">
                  Add Meeting
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
              <Column flexGrow={0.7}>
                <HeaderCell>Meeting Type</HeaderCell>
                <Cell dataKey="meetingType">
                  {(rowData) => (
                    <Link to={`/meetings/details/${rowData._id}`}>
                      {rowData.meetingType}
                    </Link>
                  )}
                </Cell>
              </Column>

              <Column sortable flexGrow={1.5}>
                <HeaderCell>Meeting Agenda</HeaderCell>
                <Cell dataKey="meetingAgenda">
                  {(rowData) => (
                    <div className="two-line-ellipsis">
                      {parse(rowData.meetingAgenda)}
                    </div>
                  )}
                </Cell>
              </Column>

              <Column flexGrow={0.7}>
                <HeaderCell>Meeting Date</HeaderCell>
                <Cell dataKey="date">
                  {(rawData) => formatDateTime(rawData.meetingDate)}
                </Cell>
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
                      <Link to={`/meetings/edit/${rowData._id}`}>
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
          data={meetings}
          limit={limit}
          page={page}
          setPage={setPage}
          handleChangeLimit={handleChangeLimit}
        />

        <DeleteModal
          showBigMsg={true}
          bigMsg={
            selectedMeeting?.meetingAgenda
              ? parse(selectedMeeting.meetingAgenda)
              : ""
          }
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteMeeting}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default MeetingList;
