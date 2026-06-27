module.exports = {
  content: ["./public/**/*.html", "./public/assets/**/*.js"],
  theme: {
    extend: {
      colors: {
        yard: {
          cream: "#F6EFDE",
          darkGreen: "#173D25",
          lightGreen: "#E3D8C2",
          wood: "#D2B58F",
          charcoal: "#29332B",
          terracotta: "#8F5D49",
          softRose: "#EFE3D7",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', "SimSun", "serif"],
        brush: ['"Ma Shan Zheng"', '"STXingkai"', '"KaiTi"', "cursive"],
        accent: ['"ZCOOL XiaoWei"', '"Songti SC"', "serif"],
        roman: ['"Cinzel"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
