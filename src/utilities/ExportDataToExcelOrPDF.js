import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const isNumeric = (value) => {
  if (typeof value === "number") return true;
  if (typeof value === "string") {
    return (
      /^-?\d*\.?\d+$/.test(value.trim()) ||
      /^-?\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(value.trim())
    );
  }
  return false;
};

export const exportToExcel = async ({
  data,
  worksheetName = "Sheet 1",
  headersConfig,
  filename = "export.xlsx",
  dateFormatter = (date) => date.toISOString().split("T")[0],
  headerStyle = {
    font: { bold: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "E0E0E0" } },
    alignment: { horizontal: "center" },
  },
  onError,
  onSuccess,
}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    const headerTitles = headersConfig.map((header) => header.title);
    worksheet.addRow(headerTitles);

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    data.forEach((item) => {
      const row = headersConfig.map(({ key, formatter }) => {
        const value = item[key];
        return formatter
          ? formatter(value)
          : key === "date"
          ? dateFormatter(value)
          : value;
      });
      worksheet.addRow(row);
    });

    const numericColumns = headersConfig
      .filter(({ key }) => {
        const values = data.map((item) => item[key]);
        const nonEmptyValues = values.filter(
          (v) => v !== null && v !== undefined && v !== ""
        );
        return nonEmptyValues.length > 0 && nonEmptyValues.every(isNumeric);
      })
      .map((header) => header.title);

    worksheet.columns.forEach((column, index) => {
      const header = headersConfig[index];
      const headerLength = header.title.length;

      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.text?.length || 0;
        if (cellLength > maxCellLength) maxCellLength = cellLength;
      });

      if (numericColumns.includes(header.title)) {
        column.numFmt = "#,##0";
        column.alignment = { horizontal: "left" };
      }

      column.width = Math.max(headerLength, maxCellLength) + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
    onSuccess?.();
  } catch (error) {
    onError ? onError(error) : console.error("Export failed:", error);
  }
};
