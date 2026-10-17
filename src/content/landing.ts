/**
 * Single source of truth for the landing content.
 *
 * TODO(client-copy) markers flag values that must be replaced with real
 * client data before launch (phone number, Instagram handle). FAQ answers are
 * drafts pending client approval (see change design.md → Open Questions).
 */

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly image: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface NavItem {
  readonly id: string;
  readonly label: string;
}

export const brand = {
  name: "КВАРТА",
  tagline: "Свежая обжарка кофе в Минске",
} as const;

export const site = {
  name: "КВАРТА",
  title: "КВАРТА — свежая обжарка кофе в Минске",
  description:
    "Обжариваем кофе партиями по 5 кг с 2019 года. Зерно на 1–3 день после обжарки. Доставка по Минску в пятницу, самовывоз с ул. Короля, 9.",
  // TODO(client-copy): confirm the production domain before launch.
  url: "https://quarta-landing.vercel.app",
} as const;

export const hero = {
  title: "Свежая обжарка кофе в Минске",
  lead: "Обжариваем партиями по 5 кг с 2019 года. Раньше работали бариста — теперь обжариваем так, как пьём сами.",
  freshness: "Обжарка по четвергам, доставка в пятницу — зерно у вас на 1–3 день после обжарки",
  cta: "Оставить заявку",
} as const;

export const assortment: readonly Product[] = [
  {
    id: "ethiopia-irgacheffe",
    title: "Эфиопия Иргачеффе",
    description: "цветочный, бергамот, светлая обжарка · 250 г",
    price: 32,
    image: "/images/doypack-et.webp",
  },
  {
    id: "colombia-huila",
    title: "Колумбия Уила",
    description: "карамель, красное яблоко · 250 г",
    price: 29,
    image: "/images/doypack-co.webp",
  },
  {
    id: "brazil-cerrado",
    title: "Бразилия Серрадо",
    description: "орех, шоколад, под эспрессо · 250 г",
    price: 26,
    image: "/images/doypack-br.webp",
  },
  {
    id: "drip-assorti",
    title: "Дрип-пакеты, ассорти",
    description: "10 штук",
    price: 18,
    image: "/images/drip-bag.webp",
  },
] as const;

export const subscription = {
  packs: "2 пачки по 250 г в месяц",
  delivery: "Доставка бесплатно",
  price: 54,
  priceLabel: "54 BYN / мес",
  badge: "Подписка",
} as const;

export const delivery = {
  city: "по Минску",
  day: "по пятницам",
  priceLabel: "5 BYN",
  freeFromLabel: "от 50 BYN бесплатно",
  pickupAddress: "Минск, ул. Короля, 9",
  rhythm: "Обжариваем по четвергам — привозим в пятницу",
} as const;

export const processSteps: readonly string[] = [
  "Оставляете заявку на сайте",
  "Менеджер перезванивает и подтверждает заказ",
  "Обжариваем зерно по четвергам",
  "Доставляем в пятницу по Минску или отдаём самовывозом",
  "Зерно у вас на 1–3 день после обжарки",
] as const;

export const contacts = {
  address: "Минск, ул. Короля, 9",
  hours: [
    { days: "пн–пт", time: "8:00–20:00" },
    { days: "сб–вс", time: "10:00–18:00" },
  ],
  // TODO(client-copy): replace with the real phone number before launch.
  phone: "+375 00 000 00 00",
  phoneHref: "+375000000000",
  // TODO(client-copy): replace with the real Instagram profile URL before launch.
  instagramUrl: "https://www.instagram.com/",
  instagramLabel: "Instagram",
} as const;

// Draft copy pending client approval (design.md → Open Questions).
export const faq: readonly FaqItem[] = [
  {
    question: "Насколько свежий кофе?",
    answer:
      "Обжариваем партиями по 5 кг по четвергам и отдаём заказы в пятницу — к клиенту зерно попадает на 1–3 день после обжарки.",
  },
  {
    question: "Как работает доставка?",
    answer:
      "По Минску возим по пятницам — 5 BYN, от 50 BYN бесплатно. Заказ можно забрать самовывозом с ул. Короля, 9.",
  },
  {
    question: "Что входит в подписку?",
    answer:
      "2 пачки по 250 г раз в месяц с бесплатной доставкой — 54 BYN в месяц. Менеджер перезвонит и всё оформит.",
  },
  {
    question: "Как оплатить заказ?",
    answer: "После заявки менеджер перезвонит и расскажет, как оплатить заказ удобным способом.",
  },
  {
    question: "Когда можно забрать заказ самовывозом?",
    answer: "Минск, ул. Короля, 9: пн–пт 8:00–20:00, сб–вс 10:00–18:00.",
  },
] as const;

export const requestForm = {
  kicker: "Заявка",
  title: "Оставить заявку",
  lead: "Заполните форму — менеджер перезвонит, уточнит детали и подтвердит заказ. На сайте никакой оплаты.",
  submitLabel: "Отправить заявку",
  successTitle: "Заявка принята!",
  successMessage: "Менеджер перезвонит и подтвердит заказ.",
  errorTitle: "Не получилось отправить заявку",
} as const;

export const sections = {
  assortment: "assortment",
  subscription: "subscription",
  delivery: "delivery",
  process: "process",
  faq: "faq",
  request: "request",
  contacts: "contacts",
} as const;

export const navItems: readonly NavItem[] = [
  { id: sections.assortment, label: "Ассортимент" },
  { id: sections.subscription, label: "Подписка" },
  { id: sections.delivery, label: "Доставка" },
  { id: sections.process, label: "Как работаем" },
  { id: sections.faq, label: "Вопросы" },
  { id: sections.request, label: "Заявка" },
  { id: sections.contacts, label: "Контакты" },
] as const;

export const business = {
  name: "КВАРТА",
  street: "ул. Короля, 9",
  city: "Минск",
  openingHours: [
    { days: "Monday Tuesday Wednesday Thursday Friday", time: "08:00-20:00" },
    { days: "Saturday Sunday", time: "10:00-18:00" },
  ],
} as const;
