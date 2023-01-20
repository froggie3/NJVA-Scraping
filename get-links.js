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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var pc = require("picocolors");
var puppeteer = require("puppeteer-core");
var scrollPageToBottom = require("puppeteer-autoscroll-down").scrollPageToBottom;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, lastPosition, get_thread_links_1, json_text, fpath, start_time, end_time, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer.launch({
                    channel: "chrome",
                    devtools: true,
                    headless: true
                })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, 8, 11]);
                return [4 /*yield*/, page.goto("https://kakolog.jp/q/%E3%81%AA%E3%82%93JNVA%E9%83%A8", { waitUntil: "networkidle2" })];
            case 4:
                _a.sent();
                return [4 /*yield*/, scrollPageToBottom(page, {
                        size: 500,
                        delay: 250,
                        stepsLimit: 50
                    })];
            case 5:
                lastPosition = _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var parent = document.getElementsByClassName("title");
                        var parent_length = parent.length;
                        var thread_urls = Array.from(parent).map(function (element) { return element.querySelector("a").href; });
                        var thread_titles = Array.from(parent).map(function (element) {
                            return element.querySelector("a").text.replace(/\([0-9]+\)/, "");
                        });
                        var thread_urls_titles = function () {
                            var tmp = [];
                            for (var i = 0; i < parent_length; i++) {
                                tmp.push({
                                    thread_title: thread_titles[i],
                                    thread_url: thread_urls[i]
                                });
                            }
                            return tmp;
                        };
                        return thread_urls_titles();
                    })];
            case 6:
                get_thread_links_1 = _a.sent();
                console.log(get_thread_links_1);
                json_text = function () {
                    return JSON.stringify(get_thread_links_1, null, "    ");
                };
                fpath = function (backup, path) {
                    if (backup === void 0) { backup = false; }
                    if (path === void 0) { path = "target/latest"; }
                    // 将来的に JSON か CSV ファイルがくるかどうかで分けたい
                    return path + (backup == true ? ".old" : "") + ".json";
                };
                try {
                    start_time = new Date();
                    console.log("[INFO] Trying to write contents to ".concat(fpath(), "..."));
                    if (!json_text) {
                        console.log(pc.green("[INFO] Succeeded to retrieve thread names and links"));
                        if (fs.existsSync(fpath())) {
                            // latest.json のコピーを作成してからダウンロード
                            console.log(pc.green("[INFO] Creating a copy to ".concat(fpath(true), "...")));
                            fs.copyFileSync(fpath(), fpath(true));
                        }
                        fs.writeFileSync(fpath(), json_text);
                    }
                    else {
                        console.log(pc.red("[FATAL] NULL returned"));
                    }
                    end_time = new Date();
                    if (fs.existsSync(fpath())) {
                        console.log(pc.blue("[INFO] JSON written to ".concat(fpath(), " (").concat(end_time.getTime() - start_time.getTime(), " ms)")));
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return [3 /*break*/, 11];
            case 7:
                err_1 = _a.sent();
                return [3 /*break*/, 11];
            case 8: return [4 /*yield*/, page.close()];
            case 9:
                _a.sent();
                return [4 /*yield*/, browser.close()];
            case 10:
                _a.sent();
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); })();
