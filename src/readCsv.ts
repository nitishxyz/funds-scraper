import fs from "fs";
import { parse } from "csv";

export const readCsv = async (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    console.log("Reading CSV file...", path);
    const data: string[] = [];
    try {
      fs.createReadStream(path)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
          data.push(row[17]);
        })
        .on("end", () => {
          console.log("CSV file read successfully!");
          resolve(data);
        });
    } catch (err) {
      reject(err);
    }
  });
};
