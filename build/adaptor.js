export class Adaptor {
  // OUTPUT ----------------------------------------------------------------
  outputDirectory = "dist";
  inlineDynamicImports = false;
  // ENV ---------------------------------------------------------------------
  alias = {};
  inject = {};
  polyfill = [];
  external = [];
  resolve = {};
  // ACTIONS ----------------------------------------------------------------
  buildStart;
  buildEnd;
  buildError;
  prerender;
}
