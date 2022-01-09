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

         if (!user) {
            throw new AuthenticationError('Cannot find this user.');
         }

         const correctPw = await user.isCorrectPassword(password);

         if (!correctPw) {
            throw new AuthenticationError('Incorrect Password.');
         }

         const token = signToken(user);
         return { token, user };
      },

      addUser: async (parent, args) => {
         const user = await User.create(args);
         const token = signToken(user);

         return { token, user };
      },

      saveBook: async (parent, { bookId }, context) => {
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $addToSet: { savedBooks: bookId } },
               { new: true }
            ).populate('savedBooks');

            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      },

      removeBook: async (parent, { bookId }, context) => {
         if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
               { _id: context.user._id },
               { $pull: { savedBooks: bookId } },
               { new: true }
            ).populate('savedBooks');

            return updatedUser;
         }

         throw new AuthenticationError('You need to be logged in!');
      },
   },
};
