#!/usr/bin/env node
/* Node Imports */
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import fs from "fs/promises";
import pkg from "enquirer";

/* Internal Imports */
import excelToArray from "./utils/excelToArray.js";
import getAccountingVoucherReceiptData from "./utils/getAccountingVoucherReceiptData.js";
import createXls from "./utils/createXls.js";
import getAccoutingVoucherSalesData from "./utils/getAccoutingVoucherSalesData.js";
/** @import {EFundTransferLedgerName} from './utils/getAccountingVoucherReceiptData.js' */

const { Select, Toggle } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper function to scan for XLS files
 * @param {string} directoryPath - Path of directory to scan
 * @returns {Promise<Array>} - Array of XLS file names found in the directory
 */
async function findXlsFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const xlsFiles = files.filter(file => file.toLowerCase().endsWith(".xls"));

    if (xlsFiles.length === 0) {
      throw new Error("No Excel files found in the current directory");
    }

    return xlsFiles;
  } catch (error) {
    throw new Error(`Error scanning directory: ${error.message}`);
  }
}

// Display welcome banner
console.log(
  chalk.blue(
    figlet.textSync("Tally Converter", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

/**
 * Print error message
 * @param {Error} error - Error object
 */
async function handleError(error) {
  console.log(chalk.red("\n┌────────────────────────────────────────┐"));
  console.log(chalk.red("│              FATAL ERROR               │"));
  console.log(chalk.red("└────────────────────────────────────────┘"));
  console.log(chalk.yellow("\nError details:"));
  console.log(chalk.red(error.message));
  console.log(chalk.dim("\nPress any key to exit..."));

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(1));
}

async function main() {
  const spinner = ora();

  try {
    // First prompt: Select conversion type
    const typePrompt = new Select({
      name: "convertFor",
      message: "What type of conversion would you like to perform?",
      choices: ["Receipt", "Sales"],
    });

    const convertFor = await typePrompt.run();

    // Scan for XLS files
    spinner.start(chalk.cyan("Scanning for Excel(xls) files..."));
    const xlsFiles = await findXlsFiles(__dirname);
    spinner.succeed(chalk.green(`Found ${xlsFiles.length} Excel(xls) files`));

    // Second prompt: Select file
    const filePrompt = new Select({
      name: "filename",
      message: "Select the Excel(xls) file to process:",
      choices: xlsFiles,
    });

    const selectedFile = await filePrompt.run();
    const filePath = path.join(__dirname, selectedFile);

    if (convertFor.toLowerCase() === "receipt") {
      // Select bank name for e fund transfer ledger name
      const eFundTransferDebitLedgerSelect = new Select({
        name: "filename",
        message: "Select ledger name for e fund transfer :",
        choices: [
          "HDFC - Cur A/c  03567620000018",
          "Axis Bank 924020058901303",
        ],
      });

      /** @type {EFundTransferLedgerName} */
      const eFundTransferDebitLedgerName =
        await eFundTransferDebitLedgerSelect.run();

      spinner.start(chalk.cyan("Reading receipt data..."));

      const receiptDataArray = excelToArray(filePath).filter(
        data => !data["Rec Type"].toLowerCase().includes("refund")
      );

      spinner.text = chalk.cyan("Processing receipt voucher data...");
      const { tallyAccountingVoucherArray, ledgerArray } =
        getAccountingVoucherReceiptData(
          receiptDataArray,
          eFundTransferDebitLedgerName
        );

      spinner.text = chalk.cyan("Creating output files...");
      createXls(
        tallyAccountingVoucherArray,
        "Accounting Voucher",
        "Accounting-Voucher-Receipt.xlsx"
      );

      createXls(ledgerArray, "Ledger", "Ledger.xlsx");

      spinner.succeed(
        chalk.green(
          "✨ Successfully created Accounting-Voucher-Receipt.xlsx and Ledger.xlsx"
        )
      );
    } else if (convertFor.toLowerCase() === "sales") {
      spinner.start(chalk.cyan("Reading sales data..."));

      const salesDataArray = excelToArray(filePath);

      spinner.text = chalk.cyan("Processing sales voucher data...");
      const accoutingVoucherSalesArray =
        getAccoutingVoucherSalesData(salesDataArray);

      spinner.text = chalk.cyan("Creating output file...");
      createXls(
        accoutingVoucherSalesArray,
        "Accounting Voucher",
        "Accounting-Voucher-Sales.xlsx"
      );

      spinner.succeed(
        chalk.green("✨ Successfully created Accounting-Voucher-Sales.xlsx")
      );
    }

    // spinner.start(chalk.yellow(`\nDeleting ${filePath}...`));
    const shouldDelete = await new Toggle({
      message: `Delete ${filePath}?`,
      enabled: "Yes",
      disabled: "No",
      initial: true,
    }).run();

    if (shouldDelete) {
      spinner.start(chalk.yellow(`\nDeleting ${filePath}...`));
      fs.unlink(filePath)
        .then(() => spinner.succeed(chalk.green(`Deleted ${filePath}`)))
        .catch(() => spinner.fail(chalk.red(`Failed to delete ${filePath}`)));
    } else {
      spinner.succeed(chalk.green(`Skipped deletion of ${filePath}`));
    }

    // Interactive exit prompt
    const exitPrompt = new Toggle({
      message: "Ready to exit?",
      enabled: "Yes",
      disabled: "No",
      initial: true,
    });

    const shouldExit = await exitPrompt.run();
    if (shouldExit) {
      console.log(
        chalk.cyan("\nThank you for using Tally Converter! Goodbye! 👋")
      );
      process.exit(0);
    } else {
      console.log(chalk.yellow("\nRestarting conversion process...\n"));
      await main();
    }
  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red("Operation failed"));
    }
    await handleError(error);
  }
}

main().catch(handleError);
