export default {
  format: 'umd',
  moduleName: 'd3ng',
  external: [
    "@angular/animations",
    "@angular/common",
    "@angular/core",
    "@angular/forms",
    "@angular/http",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/router",
  ],
  onwarn: ( warning ) => {
  const skip_codes = [
    'THIS_IS_UNDEFINED',
    'MISSING_GLOBAL_NAME'
  ];
if ( skip_codes.indexOf(warning.code) != -1 ) return;
console.error(warning);
}
};
