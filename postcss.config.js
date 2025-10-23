module.exports = {
  plugins: {
    autoprefixer: {
      // Target browsers that support oklab() or provide fallbacks
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'Chrome >= 111', // oklab() support
        'Firefox >= 96',
        'Safari >= 15.4',
        'Edge >= 111'
      ]
    },
    cssnano: process.env.NODE_ENV === 'production' ? {} : false
  }
}
