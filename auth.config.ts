import Google from 'next-auth/providers/google';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt', // Use JWT for session management
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    error: '/auth/error', // Error page for authentication errors
  },
};
