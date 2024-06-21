const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log("Initializing proxy middleware...");

    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8080/api',
            changeOrigin: true
        })
    );

    console.log("Proxy middleware loaded");
};
