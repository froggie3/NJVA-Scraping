{
  function get_thread_posts() {
    const parent = document.querySelectorAll('div.post')

    const posts = new Array;

    const number = Array.from(responses).map(
      parent => parent.querySelector('div.meta span.number').innerText
    )
    const name = Array.from(responses).map(
      parent => parent.querySelector('div.meta span.name').innerText
    )
    const date = Array.from(responses).map((parent) => {
      d = parent.querySelector('div.meta span.date').innerText
      d = d.replace(/\(.\) /g, 'T')
      d = d.replace(/\//g, '-')
      d = d.replace(/$/g, '0Z')
      return d
    })

    const uid = Array.from(responses).map(
      parent => parent.querySelector('div.meta span.uid').innerText
    )
    const message = Array.from(responses).map(
      parent => parent.querySelector('div.message span.escaped').innerText
    )

    for (i = 0; i < parent.length; i++) {
      posts.push({
        number: number[i],
        name: name[i],
        date: date[i],
        uid: uid[i],
        message: message[i]
      })
    }

    return posts;
  }

  const json_text = () => JSON.stringify(get_thread_posts(), null, "  ");

  console.log(json_text());
}