[English](README.md) | [فارسی](README.fa.md) | [العربية](README.ar.md)

<div dir="rtl">

# SHEditor

SHEditor یک پلتفرم رایگان و مستقل از فریم‌ورک برای ویرایش WYSIWYG HTML است که با TypeScript strict و زیرساخت ProseMirror ساخته می‌شود. توسعه برای رسیدن به پوشش حرفه‌ای گسترده ادامه دارد و پروژه هنوز ادعای برابری کامل با CKEditor ندارد.

[دموی زنده](https://mahdiporkar.github.io/SHEditor/) · [معماری](docs/ARCHITECTURE.md) · [ماتریس امکانات تأییدشده](docs/FEATURE_MATRIX.md) · [نقشه راه](docs/ROADMAP.md)

![دموی SHEditor](docs/assets/sheditor-typography.png)

## امکانات اصلی

- پاراگراف، H1 تا H6، فهرست، نقل‌قول، code، پیوند و تاریخچه
- bold، italic، underline، strike، زیرنویس، بالانویس، رنگ، highlight، font family/size و alignment
- commandها، eventها، chain API و Extensionهای typed
- پاک‌سازی allowlist برای HTML، URL، attribute و CSS تایپوگرافی
- پشتیبانی بومی فارسی/عربی RTL، انگلیسی، پوسته روشن/تیره و کنترل‌های دسترس‌پذیر
- یک هستهٔ مشترک برای Vanilla TypeScript، React، Vue 3 و Angular

تصویر (URL، Base64، آپلود سرور، drag/drop، paste و resize) و جدول‌های ساختاریافته با مدیریت سطر/ستون/سلول در دسترس‌اند. Markdown، Source Editing، امکانات سند، import/export، comment، track changes، revision و collaboration هنوز کامل نیستند. وضعیت دقیق در ماتریس ثبت شده است.

## نصب و شروع سریع

</div>

```bash
npm install @sheditor/core @sheditor/ui
```

```ts
import { createEditorUI } from '@sheditor/ui';
import '@sheditor/ui/style.css';
import '@sheditor/ui/content.css';

const ui = createEditorUI(document.querySelector('#editor')!, {
  content: '<p>سلام SHEditor</p>',
  locale: 'fa', direction: 'rtl',
  onUpdate: ({ editor }) => console.log(editor.getHTML()),
});
```

<div dir="rtl">

برای UI سفارشی از `createEditor()` در `@sheditor/core` استفاده کنید. نام بسته‌های فریم‌ورک `@sheditor/react`، `@sheditor/vue` و `@sheditor/angular` است؛ تا زمان انتشار رسمی، موجود بودن آن‌ها روی npm ادعا نمی‌شود.

## React

</div>

```tsx
const [value, setValue] = useState('<p>سلام</p>');
<SHEditor value={value} onChange={setValue} />
```

<div dir="rtl">

`defaultValue` حالت uncontrolled را فعال می‌کند. `SHEditorRef` شامل `editor`، `focus()` و `getHTML()` است. wrapper در controlled mode فقط هنگام تفاوت واقعی HTML محتوا را جایگزین می‌کند تا selection بی‌دلیل reset نشود.

## Vue 3

</div>

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SHEditor } from '@sheditor/vue';
const content = ref('<p>سلام</p>');
</script>
<template><SHEditor v-model="content" locale="fa" /></template>
```

<div dir="rtl">

کامپوننت eventهای `update:modelValue` و `ready` را منتشر می‌کند، propهای `locale`، `editable` و `placeholder` دارد و `getEditor()`/`focus()` را expose می‌کند.

## Angular و Forms

</div>

```ts
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SHEditorComponent],
  template: `<she-editor [formControl]="content" />`,
})
export class EditorPage {
  content = new FormControl('<p>سلام</p>');
}
```

<div dir="rtl">

کامپوننت standalone، رابط `ControlValueAccessor` را برای مقدار اولیه، تغییرات، reset، touched و disabled پیاده می‌کند. خروجی `ready` نمونهٔ editor را تحویل می‌دهد. با import کردن `FormsModule`، استفاده از `[(ngModel)]` نیز ممکن است.

## تنظیمات، Toolbar و Commandها

نوع `SHEditorOptions` شامل `content`، `editable`، `locale`، `direction`، `placeholder`، `extensions`، `sanitizer`، `typography` و callbackهای update/focus/blur است. allowlist تایپوگرافی fontها، اندازه‌ها و رنگ‌های مجاز را محدود می‌کند. Toolbar پیش‌فرض فقط commandهای فعال را نشان می‌دهد.

`editor.commands` قالب‌بندی، زیرنویس/بالانویس، رنگ، highlight، font، alignment، heading/paragraph، list، quote، link، HR، clear formatting و undo/redo را ارائه می‌کند. برای UI سفارشی `chain()`، `can()` و `isActive()` در دسترس‌اند.

## Eventها و API محتوا

`onUpdate`، `onFocus` و `onBlur` را در config بدهید یا با `editor.on()` عضو شوید؛ تابع برگشتی unsubscribe می‌کند. APIهای واقعی عبارت‌اند از `getHTML()`، `getJSON()`، `getText()`، `setContent()`، `focus()`، `blur()`، `setEditable()`، `setLocale()` و `destroy()`. APIهای Markdown هنوز وجود ندارند.

## RTL و بومی‌سازی

</div>

```ts
createEditor({ locale: 'fa', direction: 'rtl', content: '<p>نسخه SHEditor برای React آماده است.</p>' });
createEditor({ locale: 'ar', direction: 'rtl', content: '<p>محرر عربي و English.</p>' });
```

<div dir="rtl">

فرهنگ‌های typed برای `en`، `fa` و `ar` موجودند و جهت از API خود editor تنظیم می‌شود، نه فقط CSS ظرف دمو.

## پیوندها

`setLink(href, title?)` آدرس HTTP(S)، email، تلفن، relative و anchor را می‌پذیرد و scheme ناامن را رد می‌کند. UI حرفه‌ای target/rel/bookmark و autolink هنوز ناقص است.

## تصویر و Upload Adapter

تصویر از URL، Base64 و upload adapter سرور پشتیبانی می‌کند. drag/drop، paste، resize، alt/title و alignment نیز پیاده شده‌اند. قرارداد و نمونه کامل adapter در [راهنمای تصویر و جدول](docs/IMAGES_AND_TABLES.md) آمده است. caption و responsive sources هنوز برنامه آینده‌اند.

## جدول

مدل جدول، cell selection، افزودن/حذف row و column، merge/split، header، resize ستون و serialization در HTML/JSON پیاده شده و در دمو قابل آزمایش است. جزئیات commandها در [راهنمای تصویر و جدول](docs/IMAGES_AND_TABLES.md) ثبت شده است.

## Source، Markdown، سند و Import/Export

دمو خروجی زندهٔ HTML/JSON/Text را فقط نمایش می‌دهد و Source Editor نیست. Markdown، pagination، TOC، outline، footnote، template، merge field، Office paste، PDF/DOCX و email export فعلاً **وجود ندارند**.

## Comment، Track Changes، Revision و Collaboration

این قابلیت‌ها هنوز **پیاده نشده‌اند**. Collaboration در آینده یک بستهٔ اختیاری و provider-based خواهد بود و رفتار چندکاربره در دمو شبیه‌سازی نمی‌شود.

## Extension و Custom Widget

</div>

```ts
export const telemetry = defineExtension({
  name: 'telemetry',
  plugins: () => [new Plugin({})],
});
```

<div dir="rtl">

ثبت plugin نام‌دار و تشخیص نام تکراری کامل است. قرارداد عمومی schema/command/node-view هنوز partial است؛ برای custom node نباید به internalهای core وابسته شد.

## پوسته و Content CSS

تمام selectorها با `she-` scope شده‌اند. `style.css` برای UI و `content.css` برای نمایش HTML ذخیره‌شده است. پوسته روشن، تیره، سفارشی، responsive و print پشتیبانی می‌شوند.

## امنیت، دسترس‌پذیری و SSR

ورودی قبل از parse پاک‌سازی می‌شود؛ script، iframe، event handler، URL و CSS خطرناک رد می‌شوند و تست XSS دارند. کنترل‌ها label، focus، pressed state و keyboard دارند، ولی هنوز گواهی کامل WCAG/axe ادعا نمی‌شود. packageها در top-level به DOM دسترسی ندارند؛ smoke testهای اختصاصی Next/Nuxt/Angular SSR و تست Firefox/WebKit هنوز لازم‌اند.

## دموی زنده

دموی hash-routed اکنون روی [GitHub Pages](https://mahdiporkar.github.io/SHEditor/) فعال است. workflow با نام `Deploy SHEditor Demo` پروژه را بررسی و خروجی را روی شاخهٔ `gh-pages` منتشر می‌کند. [راهنمای انتشار](docs/GITHUB_PAGES.md)

## توسعه و تست

</div>

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

<div dir="rtl">

Vitest هسته، parse/serialization، command، history، RTL، lifecycle و XSS را پوشش می‌دهد. E2E فریم‌ورک‌ها و مرورگرهای مختلف هنوز release gate هستند.

## مجوز

[MIT](LICENSE) — استفاده، تغییر و توزیع آزاد است.

</div>
