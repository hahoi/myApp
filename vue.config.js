module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/dist/" : "/",
  filenameHashing: false,
  lintOnSave: true,
  productionSourceMap: false,

  // 它支持webPack-dev-server的所有选项
  devServer: {
    host: "localhost",
    port: 1114, // 端口号
    https: false, // https:{type:Boolean}
    // open: true, //配置自动启动浏览器
    // proxy: 'http://localhost:4000' // 配置跨域处理,只有一个代理

    // 配置多个代理
    proxy: {
      "/api": {
        target: "<url>",
        ws: true,
        changeOrigin: true
      },
      "/foo": {
        target: "<other_url>"
      }
    }
  },
  "transpileDependencies": [
    "vuetify"
  ],
}