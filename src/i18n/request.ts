import { getRequestConfig } from "next-intl/server";

/**
 * Server-side default locale config (used for metadata / SSR).
 * The visible locale is switched on the client via LanguageProvider,
 * which re-wraps the tree in a NextIntlClientProvider.
 */
export default getRequestConfig(async () => {
  const locale = "es";
  return {
    locale,
    timeZone: "America/Mexico_City",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
