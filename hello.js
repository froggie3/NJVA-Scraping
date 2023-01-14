const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

// const dom = new JSDOM(`<!DOCTYPE html><div id="message">Hello world</div>`);
// console.log(dom.window.document.getElementById('message').innerHTML); // Hello world

const file_lists = () => {
    fs.readdir("downloads/", (err, files) => {
        files.forEach((file) => {
            push
            //console.log(file);
        });
    });
}