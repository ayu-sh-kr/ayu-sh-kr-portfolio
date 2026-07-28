export const EMAIL = {
  hello: "hello@ayu-sh-kr.com",
  support: "support@ayu-sh-kr.com",
} as const;

export const MAILTO = {
  hello: `mailto:${EMAIL.hello}`,
  support: `mailto:${EMAIL.support}`,
  helloSubject: (subject: string) => `mailto:${EMAIL.hello}?subject=${encodeURIComponent(subject)}`,
  supportSubject: (subject: string) => `mailto:${EMAIL.support}?subject=${encodeURIComponent(subject)}`,
} as const;