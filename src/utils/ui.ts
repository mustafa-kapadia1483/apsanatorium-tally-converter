export function convertTableToJson(
  table: HTMLTableElement
): Record<string, string>[] {
  // Extract table data to JSON
  const rows = Array.from(table.querySelectorAll("tr"));
  const headers = Array.from(rows[0].querySelectorAll("th")).map(
    header => header.textContent?.trim() || ""
  );

  const jsonData: Record<string, string>[] = [];

  // Skip header row (index 0) and process data rows
  for (let i = 1; i < rows.length - 1; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll("td"));

    // Create object with header keys and cell values
    const rowData: Record<string, string> = {};
    cells.forEach((cell, index) => {
      if (index < headers.length) {
        rowData[headers[index]] = cell.textContent?.trim() || "";
      }
    });

    jsonData.push(rowData);
  }

  console.log("Table converted to JSON:", jsonData);
  return jsonData;
}

export function createDownloadButton(): HTMLButtonElement {
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download tally format data";
  downloadButton.style.position = "fixed";
  downloadButton.style.top = "20px";
  downloadButton.style.left = "20px";
  downloadButton.style.zIndex = "9999";
  downloadButton.style.padding = "10px 15px";
  downloadButton.style.backgroundColor = "#4CAF50";
  downloadButton.style.color = "white";
  downloadButton.style.border = "none";
  downloadButton.style.borderRadius = "5px";
  downloadButton.style.cursor = "pointer";
  downloadButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  downloadButton.style.maxHeight = "fit-content";

  // Add hover effect
  downloadButton.addEventListener("mouseover", () => {
    downloadButton.style.backgroundColor = "#45a049";
  });
  downloadButton.addEventListener("mouseout", () => {
    downloadButton.style.backgroundColor = "#4CAF50";
  });

  return downloadButton;
}
