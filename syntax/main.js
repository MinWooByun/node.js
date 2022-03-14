let http = require("http");
let fs = require("fs");
let url = require("url");
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
        fs.readFile(`../data/${queryData.id}`, "utf8", (err, description) => {
          let title = queryData.id;
          let list = template.list(fileList);
          let html = template.html(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
             <a href="/update?id=${title}">update</a>
             <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${title}"/>
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
      fs.readFile(`../data/${queryData.id}`, "utf8", (err, description) => {
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
      fs.unlink(`../data/${id}`, (err) => {
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
