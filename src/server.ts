import express from 'express';
import bodyParser from 'body-parser';
import backend from './backend';
const app = express();

// ----- Parse JSON requests

app.use(bodyParser.json());

// ----- Allow CORS

app.use(function(_req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ----- The API implementation

var todos = backend(process.env.DATABASE_URL as string);

function createTodo(req:express.Request, data:any) {
  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: req.protocol + '://' + req.get('host') + '/' + data.id
  };
}

function getCreateTodo(req:express.Request) {
  return function(data:any) {
    return createTodo(req, data);
  };
}

app.get('/', async function(req, res) {
  const rows = await todos.all();
  res.send(rows.map(getCreateTodo(req)));
});

app.get('/:id', async function(req, res) {
  const todo=await todos.get(parseInt(req.params.id,10))
  res.send(createTodo(req, todo));
});

app.post('/', async function(req, res) {
  const todo=await todos.create(req.body.title, req.body.order)
  res.send(createTodo(req, todo));
});

app.patch('/:id', async function(req, res) {
  const todo=await todos.update(req.params.id, req.body);
  res.send(createTodo(req, todo));
});

app.delete('/', async function(_req, res) {
  await todos.clear();
  res.status(202);
});

app.delete('/:id', async function(req, res) {
  await todos.delete(parseInt(req.params.id,10))
  res.status(202);
});

app.listen(Number(process.env.PORT || 5000));
