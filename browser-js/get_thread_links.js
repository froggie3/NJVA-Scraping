{
  function get_thread_links() {
    const is_target = () => {
      const domain = document.querySelector("html").ownerDocument.domain;
      if (domain == "kakolog.jp") {
        return true;
      }
      return false;
    };

    if (!is_target()) {
      console.error("This website is not supported.");
      return null
    } else {
      console.log(is_target);
      const parent = document.getElementsByClassName("title");
      const parent_length = parent.length;
      const thread_urls = Array.from(parent).map(
        (element) => element.querySelector("a").href
      );
      const thread_titles = Array.from(parent).map(
        (element) => element.querySelector("a").text
      );
      const thread_urls_titles = (function() {
        const tmp = [];
        for (let i = 0; i < parent_length; i++) {
          tmp.push({
            thread_title: thread_titles[i],
            thread_url: thread_urls[i],
          });
        }
        return tmp;
      })();

      return thread_urls_titles;
    }
  }
  
  const json_out = () => JSON.stringify(get_thread_links(), null, "  ");

  console.log(json_out());
}