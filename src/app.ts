import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { readCsv } from "./readCsv";

type FundDetails = {
  sector: string;
  allocation: string;
};

async function scrape(ID: string, page: Page): Promise<FundDetails[]> {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(`https://coin.zerodha.com/mf/fund/${ID}`);

      // const found = await page.evaluate(() =>
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   window.find("not found")
      // );

      const found = await page.evaluate(() => {
        return document.querySelector(".feather-alert-triangle"); // !! converts anything to boolean
      });

      if (found) {
        reject(`${ID} FUND_DETAILS_NOT_FOUND`);
        return;
      }

      await page.waitForSelector(".chart", {
        timeout: 7000,
      });

      // await page.click(".display-all");

      const returnData = await page.evaluate(() => {
        const rows = document.querySelectorAll("tr");
        const data = [];

        let blankArr = 0;

        rows.forEach((row) => {
          const columns = row.querySelectorAll("td");
          const rowData = [];
          columns.forEach((column) => {
            rowData.push(column.innerText);
          });

          console.log("rowData: ", rowData);
          if (!rowData.length) {
            if (blankArr === 0) {
              blankArr = 1;
            } else {
              blankArr = 2;
              return;
            }
          }
          if (rowData.length && blankArr < 2) {
            data.push(rowData);
          }
        });

        const organisedData = [];
        data.forEach((row) => {
          const dat = {
            sector: row[0],
            allocation: row[1],
          };

          organisedData.push(dat);
        });

        console.log("organisedData: ", organisedData);
        return organisedData;
      });

      resolve(returnData);
    } catch (err) {
      reject({ ID, err });
    }
  });
}

async function main() {
  try {
    const IDs = await readCsv("src/MutualFundsDetails.csv");

    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
    // );
    // const data = await scrape("INF194K01P53", page);

    // console.log(`fetched Data > ` + JSON.stringify(data));
    const browser = await puppeteer.launch({ headless: true });

    const fundsData = {};

    for (const id of IDs) {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );

      const data = await scrape(id, page).catch((err) => {
        console.log("scrape err: ", err);
        page.close();
      });

      if (data !== undefined) {
        console.log(`fetched Data > ${id}: ` + data);
        fundsData[id] = data;
      }
    }

    fs.writeFile("src/result.json", JSON.stringify(fundsData), (err) => {
      if (err) {
        console.log("write to file err: ", err);
      }
      console.log("Successfully Written to File.");
    });
  } catch (err) {
    console.log(err);
  }
}

main();
