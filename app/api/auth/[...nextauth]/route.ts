/**
 * app/api/auth/[...nextauth]/route.ts
 * NextAuth (Auth.js v5) のエンドポイント
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
