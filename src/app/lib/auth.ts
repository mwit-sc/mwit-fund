import GoogleProvider from "next-auth/providers/google";
import { DatabaseAPI } from "./api";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ account, profile }: { account: any; profile: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (account?.provider === "google") {
        // You can add email domain restrictions here
        // For example, only allow @mwit.ac.th emails
        return profile?.email?.endsWith("@mwit.ac.th") || 
               profile?.email?.endsWith("@gmail.com") || // Allow Gmail for testing
               false;
      }
      return true;
    },
    async session({ session, token }: { session: any; token: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Add user ID and role to session
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, account, profile }: { token: any; account: any; profile: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        
        // Create or update user in database and get role
        if (profile?.email) {
          try {
            // First try to get existing user
            let user = await DatabaseAPI.getUserByEmail(profile.email);
            
            if (!user) {
              // Create new user with default role 'user'
              user = await DatabaseAPI.createOrUpdateUser({
                email: profile.email,
                name: profile.name,
                image_url: profile.picture,
                role: 'user'
              });
            } else {
              // Update existing user info
              user = await DatabaseAPI.createOrUpdateUser({
                email: profile.email,
                name: profile.name,
                image_url: profile.picture,
                role: user.role // Keep existing role
              });
            }
            
            token.role = user.role;
          } catch (error) {
            console.error('Error handling user in JWT callback:', error);
            token.role = 'user'; // Default role on error
          }
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};