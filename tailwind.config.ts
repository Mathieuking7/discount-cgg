import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      /* ── Font Family ──────────────────────────────────── */
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "ui-serif", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      /* ── Typography Scale (matches base 16px) ─────────── */
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1.5" }],   // 12px
        sm: ["0.875rem", { lineHeight: "1.5" }],        // 14px
        base: ["1rem", { lineHeight: "1.6" }],           // 16px
        lg: ["1.125rem", { lineHeight: "1.6" }],         // 18px
        xl: ["1.25rem", { lineHeight: "1.5" }],          // 20px
        "2xl": ["1.5rem", { lineHeight: "1.35" }],       // 24px
        "3xl": ["1.875rem", { lineHeight: "1.25" }],     // 30px
        "4xl": ["2.25rem", { lineHeight: "1.15" }],      // 36px
        "5xl": ["3rem", { lineHeight: "1.1" }],           // 48px
        "6xl": ["3.75rem", { lineHeight: "1" }],          // 60px
        "7xl": ["4.5rem", { lineHeight: "1" }],           // 72px
        "8xl": ["6rem", { lineHeight: "1" }],             // 96px
      },

      /* ── Colors (HSL via CSS vars for shadcn) ─────────── */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          light: "hsl(var(--destructive-light))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          light: "hsl(var(--warning-light))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          light: "hsl(var(--info-light))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Editorial Tricolore tokens */
        "bleu-france": "#002395",
        "rouge-france": "#ED2939",
        cream: "#F7F4EF",
        encre: "#1A1A1A",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      /* ── Border Radius ────────────────────────────────── */
      borderRadius: {
        lg: "var(--radius)",                    // 0.75rem = 12px
        md: "calc(var(--radius) - 2px)",        // 10px
        sm: "calc(var(--radius) - 4px)",        // 8px
        xs: "calc(var(--radius) - 6px)",        // 6px
      },

      /* ── Spacing (4px base, extended) ─────────────────── */
      spacing: {
        "4.5": "1.125rem",   // 18px
        "13": "3.25rem",     // 52px
        "15": "3.75rem",     // 60px
        "18": "4.5rem",      // 72px — bottom nav height
        "22": "5.5rem",      // 88px
        "128": "32rem",
        "144": "36rem",
      },

      /* ── Min Height (touch targets) ──────────────────── */
      minHeight: {
        touch: "48px",       // WCAG touch target
        "touch-lg": "56px",  // comfortable touch
      },
      minWidth: {
        touch: "48px",
      },

      /* ── Shadows ──────────────────────────────────────── */
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        primary: "var(--shadow-primary)",
        accent: "var(--shadow-accent)",
      },

      /* ── Transitions ──────────────────────────────────── */
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ── Keyframes & Animations ───────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
