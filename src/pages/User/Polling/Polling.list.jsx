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
  RadioTileGroup,
  RadioTile,
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
import PollingService from "../../../services/polling.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { BiSolidGrid } from "react-icons/bi";
import parse from "html-react-parser";
import { Icon } from "@rsuite/icons";
import { CiCircleCheck } from "react-icons/ci";
import { BREAK_POINTS } from "../../../utilities/constants";

const PollingList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [pollings, setPollings] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchPollings, setSearchPollings] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPollings, setSelectedPollings] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (authState.selectedFlat.societyId)
      getPollings(authState.selectedFlat.societyId);
  }, [authState.selectedFlat]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getPollings = async (societyid) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(PollingService.getAllPolls(societyid));
      const { data } = resp;
      if (data.success) {
        respdata = data.polls;
      }
    } catch (err) {
      console.error("Polling fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching pollings`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setPollings(respdata);
  };

  const getData = () => {
    let filteredList = pollings?.filter((itm) =>
      itm.pollDescription
        ?.toLowerCase()
        ?.includes(searchPollings.toLowerCase() || "")
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
    setSelectedPollings(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPollings({});
    setModalOpen(false);
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
                  value={searchPollings}
                  onChange={setSearchPollings}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
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
              <Column sortable flexGrow={3}>
                <HeaderCell>Polling Description</HeaderCell>
                <Cell dataKey="pollDescription">
                  {(rowData) => (
                    <Whisper
                      trigger="hover"
                      placement="topEnd"
                      controlId={rowData._id}
                      speaker={<Tooltip>More details</Tooltip>}
                    >
                      <Link onClick={() => handleOpenModal(rowData)}>
                        <div className="two-line-ellipsis">
                          {rowData.pollDescription}
                        </div>
                      </Link>
                    </Whisper>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Polling Start Date</HeaderCell>
                <Cell dataKey="pollStartDate">
                  {(rawData) => formatDate(rawData.pollStartDate)}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Polling End Date</HeaderCell>
                <Cell dataKey="pollEndDate">
                  {(rawData) => formatDate(rawData.pollEndDate)}
                </Cell>
              </Column>
              <Column>
                <HeaderCell>Action</HeaderCell>
                <Cell>
                  {(rawData) => (
                    <Button
                      onClick={() => handleOpenModal(rawData)}
                      appearance="primary"
                      size="md"
                    >
                      Poll
                    </Button>
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
            total={pollings?.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <DetailsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dataObj={selectedPollings}
          setSelectedPollings={setSelectedPollings}
          getPollings={getPollings}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default PollingList;

const DetailsModal = ({
  isOpen,
  onClose,
  dataObj = {},
  setSelectedPollings,
  getPollings,
}) => {
  const authState = useSelector((state) => state.authState);
  const userId = authState?.user?._id;
  const societyId = authState?.selectedFlat?.societyId;
  console.log(authState);

  const hasVotedAlready = dataObj?.pollOptions?.map((opt) => ({
    ...opt,
    hasVoted: Array.isArray(opt.voters) ? opt.voters.includes(userId) : false,
  }));

  const handleVote = async (optionId) => {
    if (!userId) {
      toast.error("You need to be logged in to vote!");
      return;
    }

    let previousVote = null;

    const updatedPollOptions = dataObj.pollOptions.map((opt) => {
      if (opt.voters.includes(userId)) {
        previousVote = opt._id;
        return {
          ...opt,
          votes: opt.votes - 1,
          voters: opt.voters.filter((voter) => voter !== userId),
        };
      }
      return opt;
    });

    const finalPollOptions = updatedPollOptions.map((opt) => {
      if (opt._id === optionId && opt._id !== previousVote) {
        return {
          ...opt,
          votes: opt.votes + 1,
          voters: [...opt.voters, userId],
        };
      }
      return opt;
    });

    const updatedPoll = {
      ...dataObj,
      pollOptions: finalPollOptions,
    };

    setSelectedPollings(updatedPoll);

    try {
      const resp = await PollingService.updatePoll(dataObj._id, updatedPoll);
      toast.success(resp?.data?.message || "Vote updated successfully!");
      getPollings(societyId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error in voting");
      console.error(err);
    }
  };

  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>Polling Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0 mr-b-1">
        <Col xs={24}>
          <div className="details-grp">
            <div className="lbl">Polling Description</div>
            <div className="val">{parse(dataObj.pollDescription)}</div>
          </div>
        </Col>
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Polling Start Date</div>
                <div className="val">{formatDate(dataObj.pollStartDate)}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="details-grp">
                <div className="lbl">Polling End Date</div>
                <div className="val">{formatDate(dataObj.pollEndDate)}</div>
              </div>
            </Col>
            <Col xs={24}>
              <RadioTileGroup
                defaultValue={
                  dataObj?.pollOptions?.find(
                    (opt, i) => hasVotedAlready[i]?.hasVoted
                  )?._id || ""
                }
                aria-label="Polling Options"
                onChange={(value) => handleVote(value)}
              >
                {dataObj.pollOptions.map((opt, i) => (
                  <RadioTile
                    key={opt?._id}
                    icon={<Icon as={CiCircleCheck} />}
                    label={opt.option}
                    value={opt?._id}
                  >
                    {hasVotedAlready[i]?.hasVoted
                      ? "Already Voted"
                      : "Click to Vote"}
                  </RadioTile>
                ))}
              </RadioTileGroup>
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
