/**
 * auth.config.ts
 * Edge Runtime（middleware）でも読み込める、DB非依存の NextAuth 設定。
 * Prisma / bcrypt を import してはいけない（Edge で動かないため）。
 */
import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@prisma/client';

/** ログインが必須なパス */
const PROTECTED_PREFIXES = ['/mypage', '/admin'];
/** 管理者のみアクセス可能なパス */
const ADMIN_PREFIXES = ['/admin'];
/** ログイン済みならアクセスさせないパス */
const GUEST_ONLY_PATHS = ['/login', '/register'];

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
  callbacks: {
    /**
     * middleware から呼ばれる認可判定（項目47：権限チェック）
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      // ログイン済みユーザーが /login や /register に来たらマイページへ
      if (isLoggedIn && GUEST_ONLY_PATHS.includes(path)) {
        return Response.redirect(new URL('/mypage', nextUrl));
      }

      const needsAuth = PROTECTED_PREFIXES.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      if (!needsAuth) return true;

      // 未ログイン → ログインページへ（元のURLを callbackUrl として保持）
      if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', `${path}${nextUrl.search}`);
        return Response.redirect(loginUrl);
      }

      // 管理者専用エリアの権限チェック
      const needsAdmin = ADMIN_PREFIXES.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      if (needsAdmin && role !== 'ADMIN') {
        return Response.redirect(new URL('/mypage?error=forbidden', nextUrl));
      }

      return true;
    },

    /** ログイン時に user の情報を JWT に載せる */
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      // プロフィール更新時（useSession().update()）に反映
      if (trigger === 'update' && session?.user?.name) {
        token.name = session.user.name as string;
      }
      return token;
    },

    /** JWT の情報を session に展開する */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (typeof token.name === 'string') session.user.name = token.name;
      }
      return session;
    },
  },
  providers: [], // 実プロバイダは auth.ts で追加（Edge に bcrypt を持ち込まないため）
} satisfies NextAuthConfig;
