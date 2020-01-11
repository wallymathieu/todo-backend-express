import express from "express";
import bodyParser from "body-parser";
import backend, { DbTodo } from "./backend";
const app = express();
// ----- Parse JSON requests

app.use(bodyParser.json());

// ----- Allow CORS

app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ----- The API implementation

var todos = backend(process.env.DATABASE_URL as string);

function createTodo(_req: express.Request, data: DbTodo) {
  if (!data) {
    return undefined;
  }
  return {
    text: data.title,
    completed: data.completed || false,
    order: data.order,
    id: data.id
  };
}

function getCreateTodo(req: express.Request) {
  return function(data: DbTodo) {
    return createTodo(req, data);
  };
}
function return500OnError(
  promise: (req: express.Request, res: express.Response) => Promise<any>
) {
  return function(req: express.Request, res: express.Response) {
    promise(req, res)
      .then(() => res.end())
      .catch(error => {
        console.error(error);
        res.status(500);
        res.end();
      });
  };
}

app.get(
  "/",
  return500OnError(async function(req, res) {
    const rows = await todos.all();
    res.send(rows.map(getCreateTodo(req)));
  })
);

app.get(
  "/:id",
  return500OnError(async function(req, res) {
    const todo = await todos.get(parseInt(req.params.id, 10));
    res.send(createTodo(req, todo));
  })
);

app.post(
  "/",
  return500OnError(async function(req, res) {
    if (!req.body.text) {
      res.statusMessage = "text is required";
      res.status(400);
    } else {
      const todo = await todos.create(req.body.text, req.body.order);
      res.send(createTodo(req, todo));
    }
  })
);

app.patch(
  "/:id",
  return500OnError(async function(req, res) {
    const call: Partial<DbTodo> = {};
    if ("text" in req.body) {
      call.title = req.body.text;
    }
    if ("completed" in req.body) {
      call.completed = req.body.completed;
    }
    if ("order" in req.body) {
      call.order = req.body.order;
    }
    const todo = await todos.update(req.params.id, call);
    res.send(createTodo(req, todo));
  })
);

app.delete(
  "/",
  return500OnError(async function(_req, res) {
    await todos.clear();
    res.status(202);
  })
);

app.delete(
  "/:id",
  return500OnError(async function(req, res) {
    await todos.delete(parseInt(req.params.id, 10));
    res.status(202);
  })
);

app.listen(Number(process.env.PORT || 5000));
