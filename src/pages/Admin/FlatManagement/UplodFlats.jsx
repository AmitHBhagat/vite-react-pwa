import { useState, useEffect } from "react";
import { Form, Button, Grid, Row, Col, Uploader, IconButton } from "rsuite";

import { trackPromise } from "react-promise-tracker";
import flatService from "../../../services/flat.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as ExcelJS from "exceljs";
import { setRouteData } from "../../../stores/appSlice";

import { PiDownloadSimple } from "react-icons/pi";
import MaintenanceMasterService from "../../../services/MaintenanceMaster.service";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";
import { formatDate } from "../../../utilities/formatDate";

function UploadFlat({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [flatDeps, setFlatDeps] = useState([]);
  const [fileList, setFileList] = useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getFlatDeps();
  }, [dispatch, pageTitle]);

  const handleFileChange = (fileList) => {
    if (fileList.length === 0) {
      setFileList([]);

      return;
    }
    const selectedFile = fileList[fileList.length - 1];
    setFileList([selectedFile]);
  };

  async function handleSubmit(e) {
    console.log("fileList", fileList);

    if (fileList.length === 0) {
      toast.error("Please select a file to upload.");
      return;
    }

    const file = fileList[0].blobFile || fileList[0];

    const reader = new FileReader();

    reader.onload = async (event) => {
      const buffer = event.target.result;

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          toast.error("Worksheet not found in the Excel file.");
          return;
        }

        const headers = [];
        const rawData = [];

        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.value ? cell.value.toString().trim() : null);
        });

        for (let i = 2; i <= worksheet.rowCount; i++) {
          const rowData = {};
          let hasData = false;
          worksheet.getRow(i).eachCell((cell, colNumber) => {
            const headerKey = headers[colNumber - 1];
            if (headerKey) {
              rowData[headerKey] = cell.value;
              if (cell.value !== null && cell.value !== undefined) {
                hasData = true;
              }
            }
          });
          if (hasData) {
            rawData.push(rowData);
          }
        }

        console.log("Raw Extracted Data:", rawData);

        const transformedData = rawData.map((row) => {
          const billDependencies = flatDeps.map((obj) => {
            delete obj._id;
            Object.entries(row).forEach(([key, value]) => {
              if (key === obj.depTitle) {
                obj.depValue = value;
              }
            });
            return obj;
          });
          return { ...row, billDependencies, societyId };
        });

        console.log("Transformed Data:", transformedData);

        await postFlatDataToAPI(transformedData);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Failed to read the Excel file.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Failed to read the Excel file.");
    };

    reader.readAsArrayBuffer(file);
  }

  async function postFlatDataToAPI(payload) {
    try {
      const formData = new FormData();
      formData.append("societyId", societyId);
      formData.append("flatsData", JSON.stringify(payload));

      const resp = await trackPromise(flatService.uploadFlatExcelFile(payload));

      const { data } = resp;
      if (data.success) {
        toast.success("Flats uploaded successfully!");
        navigate(-1);
      } else {
        toast.error(data.message || "Failed to upload flats.");
      }
    } catch (err) {
      console.error("Error posting flat data:", err);
      toast.error(err?.response?.data?.message || "Failed to upload flats.");
    }
  }

  async function getFlatDeps() {
    setPageError("");
    let flatDeps = [];
    try {
      const resp = await trackPromise(
        MaintenanceMasterService.getFlatDepsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) flatDeps = data.flatDeps;
      console.log("flatDeps", flatDeps);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching flat dependency";
      toast.error(errMsg);
      console.error("Fetch Flats catch => ", err);
      setPageError(errMsg);
    }
    setFlatDeps(flatDeps);
  }

  const handleExport = async () => {
    try {
      const headersConfig = [
        { key: "flatNo", title: "flatNo", numeric: true },
        { key: "OwnerName", title: "ownerName" },
        { key: "Mobile", title: "mobile" },
        {
          key: "FlatArea",
          title: "flatArea",
          numeric: true,
        },
        {
          key: "FlatType",
          title: "flatType",
        },

        ...flatDeps.map((header) => ({
          key: header.depTitle,
          title: header.depTitle,
          numeric: header.valType === "Number" ? true : false,
        })),
        { key: "OtherCharges", title: "OtherCharges", numeric: true },
        {
          key: "OtherChargesDescription",
          title: "otherChargesDescription",
          numeric: true,
        },
        {
          key: "OutstandingAmount",
          title: "outstandingAmount",
          numeric: true,
        },
        {
          key: "EbillSubscribed",
          title: "eBillSubscribed",
        },
        {
          key: "IsOnRent",
          title: "isOnRent",
        },
        {
          key: "LeaseStartDate",
          title: "leaseStartDate",
          formatter: formatDate,
        },
        {
          key: "LeaseExpiryDate",
          title: "leaseExpiryDate",
          formatter: formatDate,
        },
        { key: "TenantName", title: "tenantName" },
        { key: "TenantContactDetails", title: "tenantContactDetails" },
      ];
      const typeToValue = (value) => {
        if (value === "Boolean") {
          return true;
        }
        if (value === "Number") {
          return 1;
        }
        if (value === "String") {
          return "";
        }
      };
      const dynamicData = flatDeps.reduce((acc, header) => {
        acc[header.depTitle] = typeToValue(header.valType);
        return acc;
      }, {});
      const data = [
        {
          flatNo: 102,
          OwnerName: "Vin D",
          Mobile: 9823166132,
          FlatArea: 240,
          FlatType: "Residential",
          ...dynamicData,
          OtherCharges: 50,
          OtherChargesDescription: "Penalty",
          OutstandingAmount: 0,
          EbillSubscribed: true,
          IsOnRent: false,
          LeaseStartDate: "2025-01-08T18:30:00.000Z",
          LeaseExpiryDate: "2025-01-08T18:30:00.000Z",
          TenantName: "rushabh",
          TenantContactDetails: 1234543212,
        },
        {
          flatNo: 103,
          OwnerName: "Dwayne J",
          Mobile: 8888812346,
          FlatArea: 200,
          FlatType: "Commercial",
          ...dynamicData,
          OtherCharges: 0,
          OtherChargesDescription: "abc",
          OutstandingAmount: 100,
          EbillSubscribed: false,
          IsOnRent: true,
          LeaseStartDate: "2025-01-08T18:30:00.000Z",
          LeaseExpiryDate: "2025-01-08T18:30:00.000Z",
          TenantName: "jon",
          TenantContactDetails: 1111111111,
        },
      ];
      await exportToExcel({
        data: data,
        worksheetName: "Maintenance Bills",
        headersConfig,
        filename: `sample-flat.xlsx`,
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
          toast.error("Template download failed");
          console.error(error);
        },
        onSuccess: () => toast.success("Template successfully downloaded!"),
      });
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };
  return (
    <div className="thm-panel uploadContainer">
      <Form
        className=""
        fluid
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={8}>
              <Form.Group controlId="formFile">
                <Form.ControlLabel>Select File</Form.ControlLabel>

                <Uploader
                  fileList={fileList}
                  multiple={false}
                  onChange={handleFileChange}
                  autoUpload={false}
                  action=""
                  accept=".xlsx, .xls"
                >
                  <Button>Select file...</Button>
                </Uploader>
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={8}></Col>

            <Col xs={24} md={12} lg={8} xl={8} className="mr-b-1">
              <Button
                appearance="primary"
                size="lg"
                type="submit"
                disabled={!fileList.length}
              >
                Upload
              </Button>
              <Button
                as={Link}
                to="../flat-management"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <IconButton
                className="icon"
                icon={
                  <span className="uploadFile">
                    <span>Download Sample File</span>
                    <PiDownloadSimple />
                  </span>
                }
                onClick={() => handleExport()}
              />
            </Col>
          </Row>
        </Grid>
      </Form>
    </div>
  );
}

export default UploadFlat;
