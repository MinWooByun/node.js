let http = require("http");
let fs = require("fs");
let url = require("url");
let path = require("path");
let sanitizeHtml = require("sanitize-html");
// let qs = require("querystring");

let template = require("../lib/template.js");

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

        let list = template.list(fileList);
        let html = template.html(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        // 200은 성공적으로 접속됨
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("../data", (err, fileList) => {
        // path를 쓰는 이유는 url를 조작하여 ..을 붙여 계속해서 상위폴더에 접근해 정보를 빼낼 수도 있기 때문이다.
        let filteredId = path.parse(queryData.id).base;
        fs.readFile(`../data/${filteredId}`, "utf8", (err, description) => {
          let title = queryData.id;
          // sanitize-html을 쓰는 이유는 작성자가 악의적으로 script 태그등을 기입하여 마음대로 조작할 수도 있기 때문이다.
          let sanitizedTitle = sanitizeHtml(title);
          let sanitizeDescription = sanitizeHtml(description, {
            allowedTags: ["h1"],
          });
          let list = template.list(fileList);
          let html = template.html(
            sanitizedTitle,
            list,
            `<h2>${sanitizedTitle}</h2>${sanitizeDescription}`,
            `<a href="/create">create</a>
             <a href="/update?id=${sanitizedTitle}">update</a>
             <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}"/>
              <input type="submit" value="delete"/>
             </form>`
          );
          // 200은 성공적으로 접속됨
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathName === "/create") {
    fs.readdir("../data", (err, fileList) => {
      let title = "WEB - create";
      let list = template.list(fileList);
      let html = template.html(
        title,
        list,
        `<form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"/></p>
          <p>
            <textarea name="description" placeholder="discription"></textarea>
          </p>
          <p><input type="submit"/></p>
         </form>`,
        ""
      );
      // 200은 성공적으로 접속됨
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathName === "/create_process") {
    let body = "";

    request.on("data", (data) => {
      body += data;
      console.log(body);
    });

    request.on("end", () => {
      // let post = qs.parse(body);
      let title = new URLSearchParams(body).get("title");
      let description = new URLSearchParams(body).get("description");
      fs.writeFile(`../data/${title}`, description, "utf8", (err) => {
        // 302는 리다이렉션이다.
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathName === "/update") {
    fs.readdir("../data", (err, fileList) => {
      let filteredId = path.parse(queryData.id).base;
      fs.readFile(`../data/${filteredId}`, "utf8", (err, description) => {
        let title = queryData.id;
        let list = template.list(fileList);
        let html = template.html(
          title,
          list,
          `<form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}"/>
            <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
            <p>
              <textarea name="description" placeholder="discription">${description}</textarea>
            </p>
            <p><input type="submit"/></p>
           </form>`,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        // 200은 성공적으로 접속됨
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathName === "/update_process") {
    let body = "";

    request.on("data", (data) => {
      body += data;
    });

    request.on("end", () => {
      // let post = qs.parse(body);
      let id = new URLSearchParams(body).get("id");
      let title = new URLSearchParams(body).get("title");
      let description = new URLSearchParams(body).get("description");
      fs.rename(`../data/${id}`, `../data/${title}`, (err) => {
        fs.writeFile(`../data/${title}`, description, "utf8", (err) => {
          // 302는 리다이렉션이다.
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathName === "/delete_process") {
    let body = "";

    request.on("data", (data) => {
      body += data;
    });

    request.on("end", () => {
      // let post = qs.parse(body);
      let id = new URLSearchParams(body).get("id");
      let filteredId = path.parse(id).base;
      fs.unlink(`../data/${filteredId}`, (err) => {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    // 404는 연결이 되지 않음
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
