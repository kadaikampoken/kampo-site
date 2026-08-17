/**
 * auth.ts
 * NextAuth (Auth.js v5) 本体。Node.js ランタイム専用。
 * Credentials（メールアドレス＋パスワード）認証。
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { authConfig } from './auth.config';
import { prisma } from './lib/prisma';
import { loginSchema } from './lib/validations';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        // ユーザーが存在しない場合もハッシュ比較を行い、
        // 応答時間の差から存在有無が漏れないようにする
        const hash =
          user?.passwordHash ??
          '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
        const valid = await bcrypt.compare(password, hash);

        if (!user || !valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
