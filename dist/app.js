"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const readCsv_1 = require("./readCsv");
function scrape(ID, page) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield page.goto(`https://coin.zerodha.com/mf/fund/${ID}`);
                // const found = await page.evaluate(() =>
                //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //   // @ts-ignore
                //   window.find("not found")
                // );
                const found = yield page.evaluate(() => {
                    return document.querySelector(".feather-alert-triangle"); // !! converts anything to boolean
                });
                if (found) {
                    reject(`${ID} FUND_DETAILS_NOT_FOUND`);
                    return;
                }
                yield page.waitForSelector(".chart", {
                    timeout: 7000,
                });
                // await page.click(".display-all");
                const returnData = yield page.evaluate(() => {
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
                            }
                            else {
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
            }
            catch (err) {
                reject({ ID, err });
            }
        }));
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const IDs = yield (0, readCsv_1.readCsv)("src/MutualFundsDetails.csv");
            // const browser = await puppeteer.launch({ headless: false });
            // const page = await browser.newPage();
            // await page.setUserAgent(
            //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
            // );
            // const data = await scrape("INF194K01P53", page);
            // console.log(`fetched Data > ` + JSON.stringify(data));
            const browser = yield puppeteer_1.default.launch({ headless: true });
            const fundsData = {};
            for (const id of IDs.slice(0, 10)) {
                const page = yield browser.newPage();
                yield page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
                const data = yield scrape(id, page).catch((err) => {
                    console.log("scrape err: ", err);
                    page.close();
                });
                if (data !== undefined) {
                    console.log(`fetched Data > ${id}: ` + data);
                    fundsData[id] = data;
                }
            }
            fs_1.default.writeFile("src/result.json", JSON.stringify(fundsData), (err) => {
                if (err) {
                    console.log("write to file err: ", err);
                }
                console.log("Successfully Written to File.");
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
main();
//# sourceMappingURL=app.js.map