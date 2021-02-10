const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin'
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster'
  }
];

const resolvers = {
  Query: {
    books: () => books
  }
};
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.timeEnd('startup');
  console.log(`🚀  Server ready at ${url}`);
  setTimeout(() => {
    console.warn('Closing server as demo is done.');
    process.exit(0);
  }, 2000);
});
