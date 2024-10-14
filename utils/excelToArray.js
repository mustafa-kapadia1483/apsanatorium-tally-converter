import * as XLSX from "xlsx/xlsx.mjs";
import fs from "fs";
XLSX.set_fs(fs);

/**
 * Returns array of json, creating from excel sheet data
 * @param {string} filePath
 * @returns {Array}
 */
export default function excelToArray(filePath) {
  // Read the file
  const workbook = XLSX.readFileSync(filePath);

  // Select the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
  });

  // Process the rows to make an array of JSON objects
  const headers = jsonData[0]; // Top row as headers
  const data = jsonData.slice(1); // Rest as data

  const result = data.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  result.pop(); // Last row has total value which is not needed to create tally data

  return result;
}
