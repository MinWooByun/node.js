let http = require("http");
let fs = require("fs");
let url = require("url");

const templateHTML = (title, list, body) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${body}
  </body>
  </html>
`;
};

const templateList = (fileList) => {
  let list = "<ul>";
  for (let i = 0; i < fileList.length; i++) {
    list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
  }
  list += "</ul>";
  return list;
};

let app = http.createServer(function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathName = url.parse(_url, true).pathname;

  if (pathName === "/") {
    // 홈페이지인가를 판별
    if (queryData.id === undefined) {
      fs.readdir("../data", (err, fileList) => {
        let title = "Welcome";
        let description = "Hello, Node.js";
        let list = templateList(fileList);
        let template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`
        );
        // 200은 성공적으로 접속됨
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("../data", (err, fileList) => {
        fs.readFile(`../data/${queryData.id}`, "utf8", (err, description) => {
          let title = queryData.id;
          let list = templateList(fileList);
          let template = templateHTML(
            title,
            list,
            `<h2>${title}</h2>${description}`
          );
          // 200은 성공적으로 접속됨
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else {
    // 404는 연결이 되지 않음
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
