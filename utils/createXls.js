import * as XLSX from "xlsx/xlsx.mjs";
import fs from "fs";

XLSX.set_fs(fs);

/**
 * Creates excel file with the data array provided to it
 * @param {Array} xlsDataArray - Array ofjson for which excel will be created
 * @param {string} sheetName - Sheetname in which data will be added in workbook
 * @param {string} fileName - Filename with which Excel Workbook will be saved
 */
export default function createXls(xlsDataArray, sheetName, fileName) {
  const tallyImportWorksheet = XLSX.utils.json_to_sheet(xlsDataArray, {
    dateNF: "yy/mm/dd",
  });

  const tallyImportWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    tallyImportWorkbook,
    tallyImportWorksheet,
    sheetName
  );

  XLSX.writeFileXLSX(tallyImportWorkbook, fileName);
}
