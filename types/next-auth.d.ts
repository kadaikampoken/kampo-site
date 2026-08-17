/**
 * types/next-auth.d.ts
 * NextAuth (Auth.js v5) のセッション／JWT 型に role を追加する型拡張。
 * JWT の interface は @auth/core/jwt で宣言されているため、そちらを拡張する。
 */
import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}

export {};
