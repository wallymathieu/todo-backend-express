export function up(db:any, callback:any) {
  db.addColumn('todos', 'order', { type: 'int' }, callback);
};

export function down(db:any, callback:any) {
  db.removeColumn('todos', 'order', callback);
};
