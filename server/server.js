const express = require('express');
const path = require('path');

// import ApolloServer
const { ApolloServer } = require('apollo-server-express');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const { authMidleware, authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: authMiddleware,
   });

   //* Start ApolloServer
   await server.start();

   // Integrate our Apollo server with the Express application as middleware
   server.applyMiddleware({ app });

   // log where we can go to test oue GWL API
   console.log(`Use GrapgQL at http://localhost:${PORT}${server.graphqlPath}`);
};

//* Initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

db.once('open', () => {
   app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}!`);
   });
});
