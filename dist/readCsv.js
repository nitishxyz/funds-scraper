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
exports.readCsv = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_1 = require("csv");
const readCsv = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        console.log("Reading CSV file...", path);
        const data = [];
        try {
            fs_1.default.createReadStream(path)
                .pipe((0, csv_1.parse)({ delimiter: ",", from_line: 2 }))
                .on("data", function (row) {
                data.push(row[17]);
            })
                .on("end", () => {
                console.log("CSV file read successfully!");
                resolve(data);
            });
        }
        catch (err) {
            reject(err);
        }
    });
});
exports.readCsv = readCsv;
//# sourceMappingURL=readCsv.js.map