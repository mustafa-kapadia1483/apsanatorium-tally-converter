#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import strftime from "./utils/strftime.js";
import excelToArray from "./utils/excelToArray.js";
import getAccountingVoucherData from "./utils/getAccountingVoucherData.js";
import createXls from "./utils/createXls.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const filePath = `${__dirname}/${process.argv.at(-1)}`;

const receiptDataArray = excelToArray(filePath);

const { tallyAccountingVoucherArray, ledgerArray } =
  getAccountingVoucherData(receiptDataArray);

createXls(
  tallyAccountingVoucherArray,
  "Accounting Voucher",
  `Accounting-Voucher-${strftime("%Y-%m-%d-%H-%M-%S")}.xlsx`
);

createXls(
  ledgerArray,
  "Ledger",
  `Ledger-${strftime("%Y-%m-%d-%H-%M-%S")}.xlsx`
);
