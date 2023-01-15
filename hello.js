const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function get_thread_posts() {
    
    try {
        const data = fs.readFileSync('downloads/なんJnovelAI部 ★2(1002).html', 'utf8');

        console.log(typeof(data))
    
        const dom = new JSDOM(data);
    
        const parent = dom.window.document.querySelectorAll(".post");

        const posts = new Array();

        const number = Array.from(parent).map(
            (parent) => parent.querySelector("div.meta span.number").innerText
        );
        const name = Array.from(parent).map(
            (parent) => parent.querySelector("div.meta span.name").innerText
        );
        const date = Array.from(parent).map((parent) => {
            d = parent.querySelector("div.meta span.date").innerText;
            d = d.replace(/\(.\) /g, "T");
            d = d.replace(/\//g, "-");
            d = d.replace(/$/g, "0Z");
            return d;
        });
    
        const uid = Array.from(parent).map(
            (parent) => parent.querySelector("div.meta span.uid").innerText
        );
        const message = Array.from(parent).map(
            (parent) => parent.querySelector("div.message span.escaped").innerText
        );
    
        for (i = 0; i < parent.length; i++) {
            posts.push({
                number: number[i],
                name: name[i],
                date: date[i],
                uid: uid[i],
                message: message[i],
            });
        }

        return posts;

    } catch (err) {
        console.error(err);
    }
}

const json_text = () => JSON.stringify(get_thread_posts(), null, "  ");

console.log(json_text());
