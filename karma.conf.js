module.exports = function(config) {
    config.set({
        basePath: '',
        preprocessors: {
            '**/*.html': ['ng-html2js']
        },
        ngHtml2JsPreprocessor: {
            cacheIdFromPath: function(filepath) {
                return cacheId;
            },
            moduleName: 'klioTemplateModule'
        },
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'dist/wSQL.min.js'
//            'src/**/*.js',
//            'test/**/*.spec.js'
        ]
    });
};