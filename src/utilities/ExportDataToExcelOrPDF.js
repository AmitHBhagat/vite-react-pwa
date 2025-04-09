import { pdf } from "@react-pdf/renderer";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React from "react";
import { toast } from "react-toastify";

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

export const exportToExcel2 = async ({
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

    // Process headers into parent-child groups
    const headerGroups = headersConfig.reduce((acc, header) => {
      const [parent, ...childParts] = header.title.split(" ");
      const child = childParts.join(" ");

      const existingGroup = acc.find((g) => g.parent === parent);
      if (existingGroup) {
        existingGroup.children.push({
          child,
          key: header.key,
          formatter: header.formatter,
        });
      } else {
        acc.push({
          parent,
          children: [{ child, key: header.key, formatter: header.formatter }],
        });
      }
      return acc;
    }, []);

    // Create first header row with merged parent groups
    const firstHeaderRow = worksheet.addRow([]);
    let currentColumn = 1;

    headerGroups.forEach((group) => {
      const startCol = currentColumn;
      const endCol = currentColumn + group.children.length - 1;

      firstHeaderRow.getCell(startCol).value = group.parent;
      Object.assign(firstHeaderRow.getCell(startCol), headerStyle);

      if (group.children.length > 1) {
        worksheet.mergeCells(
          firstHeaderRow.number,
          startCol,
          firstHeaderRow.number,
          endCol
        );
      }

      currentColumn += group.children.length;
    });

    // Create second header row with child titles
    const childHeaders = headerGroups.flatMap((g) =>
      g.children.map((c) => c.child)
    );
    const secondHeaderRow = worksheet.addRow(childHeaders);
    secondHeaderRow.eachCell((cell) => Object.assign(cell, headerStyle));

    // Add data rows
    data.forEach((item) => {
      const row = headerGroups.flatMap((group) =>
        group.children.map((child) => {
          const value = item[child.key];
          return child.formatter
            ? child.formatter(value)
            : child.key.toLowerCase().includes("date")
            ? dateFormatter(value)
            : value;
        })
      );
      worksheet.addRow(row);
    });

    // Detect numeric columns
    const numericColumns = headerGroups.flatMap((group) =>
      group.children
        .filter((child) => {
          const values = data.map((item) => item[child.key]);
          return values.every((v) => isNumeric(v));
        })
        .map((child) => child.child)
    );

    // Set column widths and formatting
    worksheet.columns = headerGroups.flatMap((group) =>
      group.children.map((child) => {
        const maxLength = Math.max(
          child.child.length,
          ...data.map((item) => {
            const value = item[child.key];
            return String(value || "").length;
          })
        );

        return {
          width: maxLength + 2,
          numFmt: numericColumns.includes(child.child) ? "#,##0" : undefined,
          alignment: numericColumns.includes(child.child)
            ? { horizontal: "left" }
            : undefined,
        };
      })
    );

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
    onSuccess?.();
  } catch (error) {
    onError ? onError(error) : console.error("Export failed:", error);
  }
};

export const createPaymentReceiptPdf = async (
  PdfDocComponent,
  data,
  pdfName
) => {
  try {
    const pdfBlob = await pdf(
      React.createElement(PdfDocComponent, { data })
    ).toBlob();

    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
  }
};
