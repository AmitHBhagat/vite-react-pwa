import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Pagination,
  Affix,
  Button,
  FlexboxGrid,
  InputPicker,
  Form,
  DateRangePicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate, formatTime } from "../../../utilities/formatDate";
import flatService from "../../../services/flat.service";
import { useFormik } from "formik";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import reportService from "../../../services/report.service";
import { FiExternalLink } from "react-icons/fi";
import BillAdjustmentDetailModal from "./BillingAdjustment.detail.modal";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";
import { BREAK_POINTS } from "../../../utilities/constants";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const IndividualAccountList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [individualAccounts, setIndividualAccounts] = useState([]);
  const [selectedIndividualAccountId, setSelectedIndividualAccountId] =
    useState("");
  const [flats, setFlats] = useState([]);
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [individualAccountId, setIndividualAccountId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getFlats();
  }, [societyId]);

  function getFormSchema() {
    return {
      flatNo: "",
      dateRange: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      flatNo: Yup.string().required("Flat No. is required"),
      dateRange: Yup.array().required("Date range is required"),
    });
  }

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      setFrmSubmitted(true);
      try {
        await getAccountLedger(values);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    },
  });
  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getFlats = async () => {
    setPageError("");
    let flats = [];
    try {
      const resp = await trackPromise(
        flatService.getFlatsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) {
        flats = resp.data.flats;
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || `Error in fetching flats`;
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Failed to fetch flats", errMsg);
    }
    setFlats(flats);
  };

  const getAccountLedger = async (values) => {
    let accountLedger = [];
    const startDate = new Date(values.dateRange[0]);
    const endDate = new Date(values.dateRange[1]);
    // flatNo is flatId
    const flatId = values.flatNo;
    const payload = { flatId, startDate, endDate };
    try {
      const resp = await trackPromise(
        reportService.getLedgerReportBySocietyId(societyId, payload)
      );
      const { data } = resp;
      if (data.success) accountLedger = data.ledger;
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch flats", error);
    }
    setIndividualAccounts(accountLedger);
  };

  const getData = () => {
    if (sortColumn && sortType) {
      individualAccounts.sort((a, b) => {
        const valA =
          sortColumn === "createdAt" ? new Date(a[sortColumn]) : a[sortColumn];

        const valB =
          sortColumn === "createdAt" ? new Date(b[sortColumn]) : b[sortColumn];

        return sortType === "asc" ? valA - valB : valB - valA;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return individualAccounts.slice(start, end);
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

  const handleExport = async () => {
    try {
      const exportData = getData();

      const transformedData = exportData.map((individualAccount) => ({
        date: individualAccount.createdAt,
        time: individualAccount.createdAt,
        particulars: individualAccount.description,
        creditAmount: individualAccount.creditAmount,
        debitAmount: individualAccount.debitAmount,
        balanceAmount: individualAccount.overallBalance,
      }));

      const headersConfig = [
        {
          key: "date",
          title: "Date",
          formatter: (date) => formatDate(date),
        },
        {
          key: "time",
          title: "Time",
          formatter: (date) => formatTime(date),
        },
        { key: "particulars", title: "Particulars" },
        {
          key: "creditAmount",
          title: "Credit Amount",
          numeric: true,
        },
        {
          key: "debitAmount",
          title: "Debit Amount",
          numeric: true,
        },
        {
          key: "balanceAmount",
          title: "Balance Amount",
          numeric: true,
        },
      ];

      await exportToExcel({
        data: transformedData,
        worksheetName: "Maintenance IndividualAccounts",
        headersConfig,
        filename: `Individual Account Details-${month}-${year}.xlsx`,
        headerStyle: {
          font: { bold: true },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E0E0E0" },
          },
          alignment: { horizontal: "center" },
        },
        onError: (error) => {
          toast.error("Export failed");
          console.error(error);
        },
      });
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };
  const handleOpenModal = (id) => {
    setSelectedIndividualAccountId(id);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedIndividualAccountId("");
    setModalOpen(false);
  };

  const flatNumbers = flats?.map((flat) => {
    return { label: flat.flatNo, value: flat._id };
  });
  return (
    <Container className="">
      <ScrollToTop />

      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item
              className="filters-row section-mb"
              style={{ display: "flex", gap: "1rem" }}
            >
              <Form onSubmit={frmObj.handleSubmit}>
                <FlexboxGrid
                  // justify="start"
                  style={{ gap: "1rem" }}
                  justify="space-between"
                  className="flxgrid-theme"
                >
                  <FlexboxGrid.Item
                    className="filters-row section-mb"
                    style={{ display: "flex", gap: "1rem" }}
                  >
                    <Form.Group controlId="flatNo">
                      <InputPicker
                        block
                        name="flatNo"
                        data={flatNumbers}
                        placeholder="Select a flat number"
                        value={frmObj.values.flatNo}
                        onChange={handleFieldChange("flatNo")}
                      />
                      <ErrorMessage
                        show={!!(frmObj.touched.flatNo && frmObj.errors.flatNo)}
                        msgText={frmObj.errors.flatNo}
                      />
                    </Form.Group>
                  </FlexboxGrid.Item>

                  <FlexboxGrid.Item>
                    <Form.Group controlId="dateRange">
                      <DateRangePicker
                        name="dateRange"
                        value={frmObj.values.dateRange}
                        onChange={(value) =>
                          frmObj.setFieldValue("dateRange", value)
                        }
                        placeholder="Select date range"
                        format="dd/MM/yyyy"
                        block
                      />
                      <ErrorMessage
                        show={
                          !!(
                            frmObj.touched.dateRange && frmObj.errors.dateRange
                          )
                        }
                        msgText={frmObj.errors.dateRange}
                      />
                    </Form.Group>
                  </FlexboxGrid.Item>

                  <FlexboxGrid.Item>
                    <Form.Group controlId="submit">
                      <Button block type="submit">
                        Show
                      </Button>
                    </Form.Group>
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </Form>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Button appearance="primary" size="md" onClick={handleExport}>
                Export to Excel
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
              <Column minWidth={100} sortable flexGrow={1}>
                <HeaderCell>Date</HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => {
                    return formatDate(rowData.createdAt);
                  }}
                </Cell>
              </Column>
              <Column minWidth={50} sortable flexGrow={1}>
                <HeaderCell>Time</HeaderCell>
                <Cell dataKey="createdAt">
                  {(rowData) => {
                    return formatTime(rowData.createdAt);
                  }}
                </Cell>
              </Column>
              <Column minWidth={250} sortable flexGrow={2.5}>
                <HeaderCell>Particulars</HeaderCell>
                <Cell dataKey="description" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Credit Amount</HeaderCell>
                <Cell dataKey="creditAmount" />
              </Column>

              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Debit Amount</HeaderCell>
                <Cell dataKey="debitAmount" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Balance Amount</HeaderCell>
                <Cell dataKey="overallBalance" />
              </Column>
              <Column minWidth={50} flexGrow={0.5}>
                <HeaderCell>Link</HeaderCell>
                <Cell>
                  {(rowData) => {
                    const getLinkPath = (type, id) => {
                      switch (type) {
                        case "PaymentDetail":
                          return `/payments/details`;
                        case "Billing":
                          return `/billings/details`;
                        case "BillAdjustment":
                          return `/billing-adjustment/${id}`;
                        default:
                          return "/";
                      }
                    };
                    return rowData.derivedFromModel === "BillAdjustment" ? (
                      <FiExternalLink
                        onClick={() => handleOpenModal(rowData.derivedFrom)}
                      />
                    ) : (
                      <Link
                        to={getLinkPath(
                          rowData.derivedFromModel,
                          rowData.derivedFrom
                        )}
                      >
                        <FiExternalLink />
                      </Link>
                    );
                  }}
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
            total={individualAccounts.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
      <BillAdjustmentDetailModal
        itemId={selectedIndividualAccountId}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default IndividualAccountList;
