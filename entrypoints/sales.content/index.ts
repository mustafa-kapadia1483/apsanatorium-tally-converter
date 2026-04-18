import { convertTableToJson, createDownloadButton } from "../../utils/ui";
import { getAccoutingVoucherSalesData } from "../../utils/getAccoutingVoucherSalesData";
import createXls from "../../utils/createXls";

export default defineContentScript({
  matches: ['*://*.apsanatorium.com/Report/GstReport.aspx'],
  main() {
    console.log("Read-table-script-running");

    const salesTable = document.querySelector(
      "#GrStayRecord"
    ) as HTMLTableElement | null;

    if (salesTable) {
      const downloadButton = createDownloadButton();

      document.body.appendChild(downloadButton);

      downloadButton.addEventListener("click", () => {
        const rawCollectionReportData = convertTableToJson(salesTable);
        const accoutingVoucherSalesArray = getAccoutingVoucherSalesData(
          rawCollectionReportData
        );

        createXls(
          accoutingVoucherSalesArray,
          "Accounting Voucher",
          "Accounting-Voucher-Sales.xlsx"
        );
      });
    }

  },
})
