"use strict";
exports.__esModule = true;
var fs = require("fs");
var pc = require("picocolors");
var jsdom = require("jsdom");
var argv = require("node:process").argv;
var JSDOM = jsdom.JSDOM;
var arg_has_force = (function () {
    return argv.includes("--force") | argv.includes("-f") ? true : false;
})();
var dom = new JSDOM();
var filelist = fs.readdirSync("./downloads");
/**
 * A function to output an array, taking one argument of path to a JSON file.
 * @param {string} path Path to your favorite JSON file.
 */
function get_thread_posts(path) {
    var posts = [];
    dom.window.document.body.innerHTML = fs.readFileSync(path, "utf8");
    //console.log("Persing DOM...");
    var parent = dom.window.document.querySelectorAll("div.post");
    //console.log("Retrieving post IDs");
    var number = Array.from(parent).map(function (parent) { return parent.querySelector("div.meta > span.number").textContent; });
    //console.log("Retrieving post authors");
    var name = Array.from(parent).map(function (parent) { return parent.querySelector("div.meta > span.name").textContent; });
    //console.log("Formatting datetime");
    var date = Array.from(parent).map(function (parent) {
        return parent
            .querySelector("div.meta > span.date")
            .textContent.replace(/\(.\) /g, "T")
            .replace(/\//g, "-")
            .replace(/$/g, "0Z");
    });
    //console.log("Retrieving UIDs");
    var uid = Array.from(parent).map(function (parent) {
        // "ID:" を削除
        return parent.querySelector("div.meta > span.uid").textContent.substring(3);
    });
    //console.log("Retrieving Messages");
    var message = Array.from(parent).map(function (parent) {
        return parent
            .querySelector("div.message > span.escaped")
            .textContent.replace(/^\n/g, "")
            .replace(/  /g, "\n")
            .replace(/\n /g, "\n")
            .replace(/\n /g, "\n\n")
            .trim();
    });
    //console.log("Zipping...");
    for (var i = 0; i < parent.length; i++) {
        posts.push({
            number: number[i],
            name: name[i],
            date: date[i],
            uid: uid[i],
            message: message[i]
        });
    }
    return posts;
}
console.log(pc.green("[INFO] Starting the process"));
var _loop_1 = function (file) {
    var fpath = function () {
        // 将来的に JSON か CSV ファイルがくるかどうかで分けたい
        return "json/" + file.replace(/html/g, "json");
    };
    var json_text = function () {
        return JSON.stringify(get_thread_posts("downloads/" + file), null, "  ");
    };
    // 未実装(CSV用)
    var csv_text = "";
    var threadT = "なんJNVA部★133(824)";
    var threadN = threadT.slice(threadT.search(/★[0-9]+/) + 1, threadT.search(/\([0-9]+\)/));
    try {
        if (!fs.existsSync(fpath()) || arg_has_force) {
            var start_time = new Date();
            console.log("[INFO] Trying to write contents to ".concat(fpath(), "..."));
            fs.writeFileSync(fpath(), json_text());
            var end_time = new Date();
            if (fs.existsSync(fpath())) {
                console.log(pc.blue("[INFO] JSON written to ".concat(fpath(), " (").concat(end_time.getTime() - start_time.getTime(), " ms)")));
            }
        }
        else {
            console.log("[INFO] ".concat(fpath(), " already exists. Skipping..."));
        }
    }
    catch (err) {
        console.error(err);
    }
};
for (var _i = 0, filelist_1 = filelist; _i < filelist_1.length; _i++) {
    var file = filelist_1[_i];
    _loop_1(file);
}
dom.window.close();
console.log(pc.green("[INFO] Done."));
