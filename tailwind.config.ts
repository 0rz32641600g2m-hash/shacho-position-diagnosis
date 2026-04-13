import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./domain/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        navy: {
          950: "#081120",
          900: "#10233f",
          800: "#17345c",
          700: "#234b80"
        },
        gold: {
          300: "#d8c089",
          400: "#c4a966",
          500: "#a8883f"
        },
        mist: {
          50: "#f7f9fc",
          100: "#eef3f9",
          200: "#dde6f0"
        }
      },
      fontFamily: {
        sans: [
          "\"Hiragino Sans\"",
          "\"Hiragino Kaku Gothic ProN\"",
          "\"Yu Gothic\"",
          "\"Meiryo\"",
          "sans-serif"
        ],
        serif: ["\"Iowan Old Style\"", "\"Baskerville\"", "\"Times New Roman\"", "serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(8, 17, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
