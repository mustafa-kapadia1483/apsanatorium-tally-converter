#!/usr/bin/env node
import * as XLSX from "xlsx/xlsx.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import strftime from "./utils/strftime.js";
import excelToArray from "./utils/excelToArray.js";
import getAccountingVoucherData from "./utils/getAccountingVoucherData.js";

XLSX.set_fs(fs);

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const filePath = `${__dirname}/${process.argv.at(-1)}`;

const receiptDataArray = excelToArray(filePath);
const tallyVoucherArray = getAccountingVoucherData(receiptDataArray);

const tallyImportWorksheet = XLSX.utils.json_to_sheet(tallyVoucherArray);
const tallyImportWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  tallyImportWorkbook,
  tallyImportWorksheet,
  "Accounting Voucher"
);

XLSX.writeFileXLSX(
  tallyImportWorkbook,
  `Accounting-Voucher-${strftime("%Y-%m-%d-%H-%M-%S")}.xlsx`
);
