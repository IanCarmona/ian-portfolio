import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Mirrors Amyra: don't let type noise block builds during iteration.
  typescript: { ignoreBuildErrors: true },
};

export default withNextIntl(nextConfig);
