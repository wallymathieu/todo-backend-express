export function up(db:any, callback:any) {
  var schema = {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    title: 'string',
    completed: 'boolean'
  };

  db.createTable('todos', schema, callback);
};

export function down(db:any, callback:any) {
  db.dropTable('todos', callback);
};
