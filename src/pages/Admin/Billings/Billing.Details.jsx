import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Affix,
  Button,
  FlexboxGrid,
  InputPicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import { FaRegFilePdf } from "react-icons/fa6";
import { IconButton } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import BillsService from "../../../services/billing.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { THEME } from "../../../utilities/theme";
import { MONTHS } from "../../../utilities/constants";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";

const BillingDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [bills, setBills] = useState([]);
  const [maintenanceHeaders, setMaintenanceHeaders] = useState([]);
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [pageError, setPageError] = useState("");
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const {
    searchQuery,
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
    getBills();
  }, [societyId]);

  const getBills = async () => {
    setPageError("");
    setLoading(true);
    let maintenanceHeaders = [];
    let bills = [];
    try {
      const resp = await trackPromise(
        BillsService.getBillsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) {
        bills = resp.data.billings;
        maintenanceHeaders = resp.data.maintenanceHeaders;
      }
      setLoading(false);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in fetching bills";
      toast.error(errMsg);
      console.error("Failed to fetch bills", errMsg);
      setPageError(errMsg);
      setLoading(false);
    }
    setBills(bills);
    setMaintenanceHeaders(maintenanceHeaders);
  };

  const generateBill = async () => {
    setPageError("");
    try {
      setLoading(true);
      const payload = {
        societyId,
        maintenanceMonth: month,
        maintenanceYear: year,
      };
      const res = await trackPromise(BillsService.generateBill(payload));
      const { data } = res;
      if (data.success) {
        toast.success("Bill generated successfully!");
      }
      getBills();
      setLoading(false);
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Error in generate bill";
      toast.error(errMsg);
      console.error("Failed to generate bills", errMsg);
      setPageError(errMsg);
      setLoading(false);
    }
  };
  const notifyMembers = async () => {
    try {
      const resp = await trackPromise(BillsService.notifyMembers(societyId));
      const { data } = resp;
      if (data.success)
        toast.success("Notification sent to members successfully!");
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in notify members";
      toast.error(errMsg);
      console.error("Failed to generate bills", errMsg);
      setPageError(errMsg);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter(
      (bill) =>
        bill.maintenanceYear === String(year) && bill.maintenanceMonth === month
    );
  }, [bills, month, year]);

  const paginatedData = useTableData({
    data: filteredBills,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "billNo",
  });

  const handleExport = async () => {
    try {
      const exportData = paginatedData.rowData;
      const activeHeaders = maintenanceHeaders.filter((h) => h.status);

      const headersConfig = [
        { key: "flatNo", title: "Flat No" },
        { key: "maintenanceMonth", title: "Maintenance Month" },
        { key: "maintenanceYear", title: "Maintenance Year" },
        {
          key: "maintenanceCharges",
          title: "Maintenance Charges",
          numeric: true,
        },

        ...activeHeaders.map((header) => ({
          key: `charge_${header._id}`,
          title: header.title,
          numeric: true,
          formatter: (value) => value || "N/A",
        })),
        { key: "otherCharges", title: "Other Charges", numeric: true },
        { key: "arrears", title: "Arrears", numeric: true },
        { key: "interest", title: "Interest", numeric: true },
        { key: "adjustment", title: "Adjustment", numeric: true },
        { key: "totalAmount", title: "Grand Total", numeric: true },
      ];

      const transformedData = exportData.map((bill) => {
        const dynamicCharges = activeHeaders.reduce((acc, header) => {
          const charge = bill.billCharges.find((c) => c._id === header._id);
          acc[`charge_${header._id}`] = charge ? charge.value : "N/A";
          return acc;
        }, {});

        return {
          flatNo: bill.flatNo,
          maintenanceMonth: bill.maintenanceMonth,
          maintenanceYear: bill.maintenanceYear,
          maintenanceCharges: bill.maintenanceCharges,
          ...dynamicCharges,
          otherCharges: bill.otherCharges,
          arrears: bill.arrears,
          interest: bill.interest,
          adjustment: bill.adjustment,
          totalAmount: bill.totalAmount,
        };
      });

      await exportToExcel({
        data: transformedData,
        worksheetName: "Maintenance Bills",
        headersConfig,
        filename: `Billings-${month}-${year}.xlsx`,
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
        onSuccess: () => toast.success("Export successful!"),
      });
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map((year) => ({
      label: year,
      value: year,
    }));
  }, []);

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
              <InputPicker
                data={years}
                value={year}
                onChange={(value) => setYear(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <InputPicker
                data={MONTHS}
                value={month}
                onChange={(value) => setMonth(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <Button
                appearance="primary"
                size="md"
                onClick={generateBill}
                loading={loading}
                className="rs-ml-2"
              >
                Generate Bill
              </Button>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={{ display: "flex", gap: "1rem" }}>
              <Button appearance="primary" size="md" onClick={handleExport}>
                Export to Excel
              </Button>

              <Button appearance="primary" size="md" onClick={notifyMembers}>
                Notify Members
              </Button>
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
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Month</HeaderCell>
                <Cell dataKey="maintenanceMonth" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Year </HeaderCell>
                <Cell dataKey="maintenanceYear" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Charges</HeaderCell>
                <Cell dataKey="maintenanceCharges" />
              </Column>
              {maintenanceHeaders.map((header) => (
                <Column key={header._id} minWidth={150} sortable flexGrow={1.5}>
                  <HeaderCell>{header.title}</HeaderCell>
                  <Cell dataKey={`charge_${header._id}`}>
                    {(rowData) => {
                      const charge = rowData.billCharges.find(
                        (c) => c._id === header._id
                      );
                      return charge
                        ? `${charge.value.toLocaleString()}`
                        : "N/A";
                    }}
                  </Cell>
                </Column>
              ))}
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Other Charges</HeaderCell>
                <Cell dataKey="otherCharges" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Arrears</HeaderCell>
                <Cell dataKey="arrears" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Interest</HeaderCell>
                <Cell dataKey="interest" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Adjustment</HeaderCell>
                <Cell dataKey="adjustment" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Grand Total</HeaderCell>
                <Cell dataKey="totalAmount" />
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
                      <a
                        href={rowData.billingURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconButton
                          title="edit"
                          icon={<FaRegFilePdf color={THEME[0].CLR_PRIMARY} />}
                        />
                      </a>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={filteredBills}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </Container>
  );
};

export default BillingDetail;
