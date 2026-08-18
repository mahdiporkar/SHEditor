export class SHEditorError extends Error {
  override name = "SHEditorError";
}
export class ParseError extends SHEditorError {
  override name = "ParseError";
}
export class PluginError extends SHEditorError {
  override name = "PluginError";
}
