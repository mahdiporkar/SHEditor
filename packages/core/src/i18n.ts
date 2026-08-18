import type { Locale } from './types';
export const dictionaries = {
  en: { bold:'Bold', italic:'Italic', underline:'Underline', strike:'Strike', undo:'Undo', redo:'Redo', heading:'Heading', paragraph:'Paragraph', bulletList:'Bullet list', orderedList:'Numbered list', blockquote:'Quote', link:'Link', clear:'Clear formatting' },
  fa: { bold:'پررنگ', italic:'کج', underline:'زیرخط', strike:'خط‌خورده', undo:'واگرد', redo:'ازنو', heading:'عنوان', paragraph:'پاراگراف', bulletList:'فهرست نشانه‌دار', orderedList:'فهرست شماره‌دار', blockquote:'نقل‌قول', link:'پیوند', clear:'پاک‌کردن قالب' },
  ar: { bold:'عريض', italic:'مائل', underline:'تحته خط', strike:'يتوسطه خط', undo:'تراجع', redo:'إعادة', heading:'عنوان', paragraph:'فقرة', bulletList:'قائمة نقطية', orderedList:'قائمة مرقمة', blockquote:'اقتباس', link:'رابط', clear:'مسح التنسيق' },
} satisfies Record<Locale, Record<string,string>>;
export type TranslationKey = keyof typeof dictionaries.en;
