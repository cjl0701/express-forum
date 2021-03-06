module.exports = {
  HTML: function (
    title,
    list,
    body,
    control,
    authStateUI = `
    <a href="/auth/login">login</a> | 
    <a href="/auth/register">register</a> | 
    <a href="/auth/google">login with google</a>`
  ) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>topic - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${authStateUI}
      <h1><a href="/">TOPICS</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list: function (filelist) {
    var list = "<ul>";
    var i = 0;
    while (i < filelist.length) {
      list =
        list +
        `<li><a href="/topic/${filelist[i].id}">${filelist[i].title}</a></li>`;
      i = i + 1;
    }
    list = list + "</ul>";
    return list;
  },
};
