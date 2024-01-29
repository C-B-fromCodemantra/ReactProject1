
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Pool } = require('pg');


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'yubi_project',
    password: '122333',
    port:5432,
});

const app = express();

// GraphQL schema
const schema = buildSchema(`
  type Query {
    getTableData: [TableRow]
  }

  type Mutation {
    createTableRow(city_name: String!): TableRow
    updateTableData(id: Int!, city_name: String!, userInput: String!): TableRow
  }

  type TableRow {
    id: Int
    city_name: String
    userInput: String
  }
`);

const root = {
    getTableData: async () => {
        const result = await pool.query('SELECT * FROM yubi_project_schema.geography_columns');
        return result.rows;
        },
  createTableRow: async ({ city_name }) => {
    const result = await pool.query('INSERT INTO yubi_project_schema.geography_columns (city_name) VALUES ($1) RETURNING *', [city_name]);
    return result.rows[0];
  },

  updateTableRow: async ({ id, city_name }) => {
    const result = await pool.query('UPDATE yubi_project_schema.geography_columns SET city_name = $1 WHERE id = $2 RETURNING *', [city_name, id]);
    return result.rows[0];
  },
};

app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

app.get('/', (req, res) => {
    res.send('Welcome to the GraphQL server. Go to /graphql to use the GraphQL playground.');
  });
  
const PORT =  process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/graphql`));
