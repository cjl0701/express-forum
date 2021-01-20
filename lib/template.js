module.exports = {
  HTML: function (
    title,
    list,
    body,
    control,
    authStateUI = '<a href="/auth/login">login</a> | <a href="/auth/register">register</a>'
  ) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${authStateUI}
      <h1><a href="/">WEB</a></h1>
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
