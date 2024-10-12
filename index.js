#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import excelToArray from "./utils/excelToArray.js";
import getAccountingVoucherData from "./utils/getAccountingVoucherData.js";
import createXls from "./utils/createXls.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const filePath = `${__dirname}/q.xls`;

const receiptDataArray = excelToArray(filePath);

const { tallyAccountingVoucherArray, ledgerArray } =
  getAccountingVoucherData(receiptDataArray);

createXls(
  tallyAccountingVoucherArray,
  "Accounting Voucher",
  "Accounting-Voucher.xlsx"
);

createXls(ledgerArray, "Ledger", "Ledger.xlsx");
