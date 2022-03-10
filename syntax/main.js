let http = require("http");
let fs = require("fs");
let url = require("url");

let app = http.createServer(function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathName = url.parse(_url, true).pathname;

  if (pathName === "/") {
    // 홈페이지인가를 판별
    if (queryData.id === undefined) {
      let title = "Welcome";
      let description = "Hello, Node.js";
      let template = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8" />
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          <ol>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=JavaScript">JavaScript</a></li>
          </ol>
          <h2>${title}</h2>
          <p>${description}</p>
        </body>
      </html>
      `;
      // 200은 성공적으로 접속됨
      response.writeHead(200);
      response.end(template);
    } else {
      fs.readFile(`../data/${queryData.id}`, "utf8", (err, description) => {
        let title = queryData.id;
        let template = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8" />
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          <ol>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=JavaScript">JavaScript</a></li>
          </ol>
          <h2>${title}</h2>
          <p>${description}</p>
        </body>
      </html>
      `;
        // 200은 성공적으로 접속됨
        response.writeHead(200);
        response.end(template);
      });
    }
  } else {
    // 404는 연결이 되지 않음
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
