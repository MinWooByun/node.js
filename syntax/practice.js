const http = require("http");
const fs = require("fs");
const url = require("url");

const templateList = (fileList) => {
  let list = "<ul>";
  let i = 0;
  while (i < fileList.length) {
    list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
    i += 1;
  }
  list += "</ul>";
  return list;
};

const templateHTML = (title, list, body, control) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
  </html>
  `;
};

const app = http.createServer((request, response) => {
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const pathName = url.parse(_url, true).pathname;

  if (pathName === "/") {
    if (queryData.id === undefined) {
      fs.readdir("../data", (err, fileList) => {
        const title = "Welcome";
        const description = "Hello~ Node.js";
        const list = templateList(fileList);
        const template = templateHTML(
          title,
          list,
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("../data", (err, fileList) => {
        fs.readFile(`../data/${queryData.id}`, (err, description) => {
          const title = queryData.id;
          const list = templateList(fileList);
          const template = templateHTML(
            title,
            list,
            `<h2>${title}</h2><p>${description}</p>`,
            `
            <a href="/create">create</a> <a href="/update?id=${title}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${title}" />
              <input type="submit" value="delete" />
            </form>
            `
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathName === "/create") {
    fs.readdir("../data", (err, fileList) => {
      const title = queryData.id;
      const list = templateList(fileList);
      const template = templateHTML(
        title,
        list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title" /></p>
          <p>
            <textarea name="description" placeholder="discription"></textarea>
          </p>
          <p><input type="submit" /></p>
        </form>
        `,
        ""
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathName === "/create_process") {
    let body = "";

    request.on("data", (data) => {
      body += data;
    });

    request.on("end", () => {
      let title = new URLSearchParams(body).get("title");
      let description = new URLSearchParams(body).get("description");
      fs.writeFile(`../data/${title}`, description, "utf8", (err) => {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathName === "/update") {
    fs.readdir("../data", (err, fileList) => {
      fs.readFile(`../data/${queryData.id}`, "utf8", (err, description) => {
        const title = queryData.id;
        const list = templateList(fileList);
        const template = templateHTML(
          title,
          list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}" />
            <p><input type="text" name="title" value="${title}"/></p>
            <p>
              <textarea name="description">${description}</textarea>
            </p>
            <p><input type="submit" /></p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update">update</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathName === "/update_process") {
    let body = "";

    request.on("data", (data) => {
      body += data;
    });

    request.on("end", () => {
      let id = new URLSearchParams(body).get("id");
      let title = new URLSearchParams(body).get("title");
      let description = new URLSearchParams(body).get("description");
      fs.rename(`../data/${id}`, `../data/${title}`, (err) => {
        fs.writeFile(`../data/${title}`, description, "utf8", (err) => {
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
      const id = new URLSearchParams(body).get("id");
      fs.unlink(`../data/${id}`, (err) => {
        response.writeHead(302, { Location: "/" });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found...");
  }
});

app.listen(5000);
