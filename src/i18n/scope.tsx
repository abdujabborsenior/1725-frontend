import { getMessages } from 'next-intl/server';

import { MessagesScope } from './messages-scope';
import { pickMessages, SCOPES, type ScopeName } from './scopes';

/**
 * Bo'lim xabarlarini brauzerga yuboradigan SERVER qobig'i.
 *
 *   <Scope name="startupsPage"><StartupsClient … /></Scope>
 *
 * Ildiz layout faqat umumiy nomlar maydonini yuboradi (navbar, tugmalar,
 * vaqt...). Bo'limga xos matnlar esa AYNAN shu bo'limga kirilganda keladi —
 * shuning uchun bosh sahifaning RSC payload'i chat yoki startap formasining
 * lug'atini ko'tarib yurmaydi.
 *
 * ⚠️ Har bir `name` `scopes.ts` dagi SCOPES da bo'lishi va o'sha marshrutda
 * ishlatiladigan BARCHA namespace'ni qamrashi shart — buni
 * `npm run i18n:check` statik tekshiradi.
 */
export async function Scope({
  name,
  children,
}: {
  name: ScopeName;
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return <MessagesScope messages={pickMessages(messages, SCOPES[name])}>{children}</MessagesScope>;
}
