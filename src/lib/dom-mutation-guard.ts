/**
 * Tashqi DOM o'zgarishlaridan himoya (brauzer TARJIMASI va kengaytmalar).
 *
 * ⚠️ MUAMMO (jonli takrorlangan): Chrome sahifa `lang` i brauzer tilidan farq
 * qilsa avtomatik tarjima qiladi va HAR matn tugunini `<font>` ichiga o'raydi.
 * Shundan keyin matn tugunining ota-elementi O'ZGARADI. React esa uni eski
 * ota orqali o'chirmoqchi bo'ladi →
 *   `NotFoundError: Failed to execute 'removeChild' on 'Node'`
 * → xato chegarasi butun sahifani "Ilova xatosi" ekraniga almashtiradi.
 *
 * Bu ayni yangi arabcha/xitoycha sahifalarda chiqadi: o'zbek/rus brauzerida
 * `lang="zh"` sahifa tarjimaga tushadi (uz/ru/en sahifalarida tushmasdi).
 *
 * YECHIM — mos kelmagan tugunni o'chirish/kiritishni JIM o'tkazib yuborish.
 * Natija: tarjima ishlayveradi (foydalanuvchidan imkoniyat olinmaydi),
 * ko'pi bilan bitta eskirgan tugun ekranda qoladi — lekin ilova YIQILMAYDI.
 *
 * ⚠️ Nega `<meta name="google" content="notranslate">` EMAS: u tarjimani
 * butunlay o'chiradi. Biz qamramagan tildagi odam (masalan ispan) sahifani
 * o'qiy olmay qolardi, qolaversa u faqat Google tarjimasini to'xtatadi —
 * Grammarly kabi kengaytmalar baribir DOM'ga tegadi.
 *
 * ⚠️ Hydratsiyadan OLDIN ishlashi shart — shuning uchun ildiz layout'da
 * `<head>` ichida inline skript sifatida beriladi (tarmoq so'rovi yo'q).
 */
export const DOM_MUTATION_GUARD = `(function(){
if(typeof Node!=='function'||!Node.prototype||Node.prototype.__mmGuard)return;
Node.prototype.__mmGuard=1;
var rc=Node.prototype.removeChild;
Node.prototype.removeChild=function(c){
if(c&&c.parentNode!==this)return c;
return rc.apply(this,arguments)};
var ib=Node.prototype.insertBefore;
Node.prototype.insertBefore=function(n,r){
if(r&&r.parentNode!==this)return n;
return ib.apply(this,arguments)}})();`;
