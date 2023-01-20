{
    function get_thread_posts() {
        const parent = document.querySelectorAll("div.post");
        const posts = new Array();
        const number = Array.from(parent).map(
            (parent) =>
                parent.querySelector("div.meta > span.number").textContent
        );
        const name = Array.from(parent).map((parent) =>
            parent
                .querySelector("div.meta > span.name")
                .textContent
        );
        const date = Array.from(parent).map((parent) => {
            d = parent
                .querySelector("div.meta > span.date")
                .textContent.replace(/\(.\) /g, "T")
                .replace(/\//g, "-")
                .replace(/$/g, "0Z");
            return d;
        });
        const uid = Array.from(parent).map(
            (parent) => parent.querySelector("div.meta > span.uid").textContent
        );
        const message = Array.from(parent).map((parent) =>
            parent
                .querySelector("div.message > span.escaped")
                .textContent.replace(/^\n/g, "")
                .replace(/[0-9]  /g, "\n")
                .replace(/  /g, "\n")
                .trim()
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
    }

    const json_text = () => JSON.stringify(get_thread_posts(), null, "  ");

    console.log(json_text());
}