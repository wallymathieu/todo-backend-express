import {Client} from 'pg';

export interface DbTodo{
  title:string;
  order:number;
  completed:boolean;
  id:number;
}

export default function createTodoBackend(connectionString:string) {
  async function query(query:string, params:any[]) {
    const client = new Client(connectionString);
    await client.connect();
    const result=await client.query<DbTodo>(query,params);
    const rows = result.rows;
    await client.end()
    return rows
  }

  return {
    all: function() {
      return query('SELECT * FROM todos', []);
    },

    get: async function(id:number) {
      const rows =await query('SELECT * FROM todos WHERE id = $1', [id]);
      return rows[0];
    },

    create: async function(title:string, order:number) {
      const rows = await query('INSERT INTO todos ("title", "order", "completed") VALUES ($1, $2, false) RETURNING *', [title, order]);
      return rows[0];
    },

    update: async function(id:string, properties:Partial<DbTodo>) {
      var assigns = [], values = [];
      if ('title' in properties) {
        assigns.push('"title"=$' + (assigns.length + 1));
        values.push(properties.title);
      }
      if ('order' in properties) {
        assigns.push('"order"=$' + (assigns.length + 1));
        values.push(properties.order);
      }
      if ('completed' in properties) {
        assigns.push('"completed"=$' + (assigns.length + 1));
        values.push(properties.completed);
      }

      var updateQuery = [
        'UPDATE todos',
        'SET ' + assigns.join(', '),
        'WHERE id = $' + (assigns.length + 1),
        'RETURNING *'
      ];

      const rows = await query(updateQuery.join(' '), values.concat([id]));
      return rows[0]
    },

    delete: async function(id:number) {
      const rows = await query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
      return rows[0];
    },

    clear: async function() {
      await query('DELETE FROM todos RETURNING *', []);
    }
  };
};
