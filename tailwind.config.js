/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./componentes/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: "#0D4C85",
        secondary: "#F36C21",
        alternativo: "#4A9CE0",
        opcao: "#ff69b4",
        cinza: "#2F3136",
        cinzaClaro: "#b4b4b6",
        azulClaro: "#00BFFF",
        azulzinho: "#b2bffd",
        cinzinha: "#dfc8f8",
        borderLigth: "rgba(128, 128, 128, 0.3)",
        roxinho: "#EAB8FF",
        roxinhoClaro: "#EAB8FF",
        inputs:"rgba(128, 128, 128, 0.3)"
      },
      backgroundImage: {
        "gradient-custom": "linear-gradient(to bottom right, #9333EA,#9333EA, #FFFF19, #2F3136)",
      },
      fontFamily: {
        Poppins: ["Poppins", "sans-serif"],
      },
      screens: {
        sm: "480px",
        md: "768px",
        lg: "976px",
        xl: "1440px",
      },
    },
    
  
  },
  plugins: [],
};
