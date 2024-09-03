const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} = require("graphql");
const app = express();

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const Book = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    authorId: { type: GraphQLInt },
    author: {
      type: Author,
      resolve: (book) => {
        return authors.find((a) => a.id === book.authorId);
      },
    },
  }),
});

const Author = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    books: {
      type: GraphQLList(Book),
      resolve: (author) => {
        return books.filter((b) => b.authorId === author.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    books: {
      type: new GraphQLList(Book),
      description: "A list of all the books",
      resolve: () => books,
    },
    book: {
      type: Book,
      description: "A single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((b) => b.id === args.id),
    },
    authors: {
      type: new GraphQLList(Author),
      description: "A list of all the authors",
      resolve: () => authors,
    },
    author: {
      type: Author,
      description: "A single author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => authors.find((a) => a.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",
  fields: () => ({
    addBook: {
      type: Book,
      description: "Add a book",
      args: {
        name: { type: GraphQLString },
        authorId: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: Author,
      description: "Add an author",
      args: {
        name: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use("/graphql", expressGraphQL({ schema: schema, graphiql: true }));
app.listen(5000, () => console.log("Server running"));
