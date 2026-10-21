import type { NextConfig } from "next";

const config: NextConfig = {
  // Playbook markdown is read from disk at request time; make sure it ships with the server bundle.
  outputFileTracingIncludes: { "/playbook/[[...slug]]": ["./playbook/**/*"] },
};

export default config;
