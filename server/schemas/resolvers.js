// import User model
const { User } = require('../models');
// Import Authentication handling
const { AuthenticationError } = require('apollo-server-express');
// Import jsonwebtoken functionality
const { signToken } = require('../utils/auth');

const resolvers = {
   Query: {
      me: async (parent, args, context) => {
         if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
               .select('-__v -password') //
               .populate('savedBooks');

            return userData;
         }

         throw new AuthenticationError('You are not logged in.');
      },
   },
   Mutation: {
      login: async (parent, { email, password }) => {
         const user = await User.findOne({ email });
         console.log('file: resolvers.js ~ line 25 ~ user', user);

         if (!user) {
            throw new AuthenticationError('Cannot find this user.');
         }

         const correctPw = await user.isCorrectPassword(password);
         console.log('file: resolvers.js ~ line 32 ~ correctPw', correctPw);

         if (!correctPw) {
            throw new AuthenticationError('Incorrect Password.');
         }

         const token = signToken(user);
         console.log('file: resolvers.js ~ line 39 ~ user', user);
         console.log('file: resolvers.js ~ line 40 ~ token', token);
         return { token, user };
      },

      addUser: async (parent, args) => {
         const user = await User.create(args);
         const token = signToken(user);

         return { token, user };
      },
      // args
      saveBook: async (parent, { bookId }, context) => {
         console.log('file: resolvers.js ~ line 48 ~ bookId', bookId);
         console.log('file: resolvers.js ~ line 50 ~ context.user', context.user);
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $push: { savedBooks: { bookId: bookId } } },
               { new: true }
            );

            console.log('file: resolvers.js ~ line 58 ~ updatedUser', updatedUser);
            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      },

      removeBook: async (parent, { bookId }, context) => {
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $pull: { savedBooks: { bookId: bookId } } },
               { new: true }
            )

            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      },
   },
};

module.exports = resolvers;
