#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import excelToArray from "./utils/excelToArray.js";
import getAccountingVoucherReceiptData from "./utils/getAccountingVoucherReceiptData.js";
import createXls from "./utils/createXls.js";
import getAccoutingVoucherSalesData from "./utils/getAccoutingVoucherSalesData.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const convertFor = process.argv.at(-1);

if (convertFor == "receipt") {
  console.log("Generating receipt data....");

  const filePath = `${__dirname}/r.xls`;
  const receiptDataArray = excelToArray(filePath).filter(
    data => !data["Rec Type"].toLowerCase().includes("refund")
  );

  const { tallyAccountingVoucherArray, ledgerArray } =
    getAccountingVoucherReceiptData(receiptDataArray);

  createXls(
    tallyAccountingVoucherArray,
    "Accounting Voucher",
    "Accounting-Voucher-Receipt.xlsx"
  );

  createXls(ledgerArray, "Ledger", "Ledger.xlsx");

  console.log("Receipt and ledger data created successfully");
} else if (convertFor == "sales") {
  const filePath = `${__dirname}/s.xls`;
  const salesDataArray = excelToArray(filePath);

  const accoutingVoucherSalesArray =
    getAccoutingVoucherSalesData(salesDataArray);

  createXls(
    accoutingVoucherSalesArray,
    "Accounting Voucher",
    "Accounting-Voucher-Sales.xlsx"
  );
}
