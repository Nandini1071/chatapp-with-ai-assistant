// Map file extensions to Ace Editor language modes
const languageModeMap = {
  // JavaScript variants
  js: "ace/mode/javascript",
  jsx: "ace/mode/javascript",
  ts: "ace/mode/typescript",
  tsx: "ace/mode/typescript",
  mjs: "ace/mode/javascript",
  
  // Web languages
  html: "ace/mode/html",
  htm: "ace/mode/html",
  css: "ace/mode/css",
  scss: "ace/mode/scss",
  less: "ace/mode/less",
  
  // Data formats
  json: "ace/mode/json",
  jsonc: "ace/mode/json",
  
  // Backend languages
  py: "ace/mode/python",
  python: "ace/mode/python",
  php: "ace/mode/php",
  java: "ace/mode/java",
  
  // Markup
  xml: "ace/mode/xml",
  svg: "ace/mode/xml",
  
  // Special cases
  md: "ace/mode/markdown",
  markdown: "ace/mode/markdown",
  txt: "ace/mode/text",
};

export const getLanguageMode = (filename) => {
  if (!filename) return "ace/mode/text";
  
  const extension = filename.split(".").pop()?.toLowerCase();
  return languageModeMap[extension] || "ace/mode/text";
};

export const getFileExtension = (filename) => {
  return filename.split(".").pop()?.toLowerCase() || "";
};