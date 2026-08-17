/**
 * components/layout/footer.tsx  （項目20：Footer）
 */
import Link from 'next/link';
import { MAIN_NAV } from '@/lib/nav';
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-sand-200 bg-kampo-900 text-sand-100">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-100 text-base font-bold text-kampo-900"
              >
                漢
              </span>
              <span className="font-bold">{SITE_NAME}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sand-200">
              鹿児島大学の学生を中心に、漢方医学・東洋医学を学ぶ学生団体です。
              学部・学年を問わず、どなたでも参加いただけます。
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">コンテンツ</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sand-200 hover:text-white hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/mypage" className="text-sand-200 hover:text-white hover:underline">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">お問い合わせ</h2>
            <dl className="mt-4 space-y-2 text-sm text-sand-200">
              <div>
                <dt className="inline font-medium">所在地：</dt>
                <dd className="inline">鹿児島市桜ヶ丘8-35-1 鹿児島大学 桜ヶ丘キャンパス</dd>
              </div>
              <div>
                <dt className="inline font-medium">Email：</dt>
                <dd className="inline">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-sand-300">
              ※ 本サイトは学生団体の活動紹介を目的としたものであり、
              個別の疾病に関する医学的助言を行うものではありません。
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-kampo-700 pt-6 text-xs text-sand-300">
          <p>&copy; {year} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
