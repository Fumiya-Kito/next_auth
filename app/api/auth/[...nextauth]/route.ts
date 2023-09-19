import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/app/lib/prisma';


// Next Authの設定
export const authOptions: NextAuthOptions = {
  // prismaを使うための設定
  adapter: PrismaAdapter(prisma),

  // 認証プロバイダの設定
  providers: [
    // Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // email
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        // email and password
        email: { label: 'email', type: 'text'},
        password: { label: 'password', type: 'password' },
      },

      async authorize(credentials) {
        // Email, Password 存在チェック
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードが存在しません')
        }

        // ユーザーを取得
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          }
        })

        // User 存在チェック
        if (!user || !user?.hashedPassword) {
          throw new Error('ユーザーが存在しません')
        }

        // Passwordチェック(credentialsとuserのパスワード比較)
        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isCorrectPassword) {
          throw new Error('パスワードが存在しません');
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }