import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// UI library rules (see AGENTS.md): raw controls and inline styles live only inside components/ui
const NO_INLINE_STYLE = {
  selector: "JSXAttribute[name.name='style']",
  message: "Inline styles are not allowed. Use Tailwind classes or a components/ui component.",
};
const NO_RAW_ELEMENTS = ["button", "input", "select", "textarea", "a", "img", "svg"].map((tag) => ({
  selector: `JSXOpeningElement[name.name='${tag}']`,
  message: `Raw <${tag}> is not allowed outside components/ui. Use the library component (Button, ButtonLink, Textarea, FileDrop, Icon).`,
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@mui/*",
                "@chakra-ui/*",
                "@radix-ui/*",
                "@headlessui/*",
                "antd",
                "lucide-react",
                "react-icons",
                "@heroicons/*",
                "clsx",
                "tailwind-merge",
                "class-variance-authority",
                "framer-motion",
              ],
              message: "Only our own UI library (components/ui) is allowed. Add what you need there.",
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", NO_INLINE_STYLE, ...NO_RAW_ELEMENTS],
    },
  },
  {
    files: ["components/ui/**"],
    rules: { "no-restricted-syntax": ["error", NO_INLINE_STYLE] },
  },
]);

export default eslintConfig;
