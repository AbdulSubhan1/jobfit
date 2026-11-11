import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// JWT sessions in an encrypted cookie: no user database. We keep only a stable id and a first name.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        return {
          uid: `${account.provider}:${account.providerAccountId}`,
          name: (profile?.given_name as string | undefined) ?? token.name?.split(" ")[0] ?? null,
        };
      }
      return token;
    },
    session({ session, token }) {
      session.user = { ...session.user, id: token.uid as string, name: token.name, email: "", image: null };
      return session;
    },
  },
});
