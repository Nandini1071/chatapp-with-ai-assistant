import { useEffect, useRef } from "react";
import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-monokai";
import { getLanguageMode } from "../utils/languageDetector";

const CodeEditor = ({ filename, content, onChange }) => {
  const editorRef = useRef(null);
  const aceEditorRef = useRef(null);
  const isSettingValue = useRef(false);

  // Initialize only once
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = ace.edit(editorRef.current);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode(getLanguageMode(filename));
    editor.setFontSize(14);
    editor.session.setUseWrapMode(true);
    editor.setShowPrintMargin(false);

    editor.setValue(content || "", -1);

    editor.session.on("change", () => {
      if (isSettingValue.current) return;
      onChange(editor.getValue());
    });

    aceEditorRef.current = editor;

    return () => {
      editor.destroy();
      aceEditorRef.current = null;
    };
  }, []);

  // Update mode when filename changes
  useEffect(() => {
    if (aceEditorRef.current) {
      aceEditorRef.current.session.setMode(getLanguageMode(filename));
    }
  }, [filename]);

  // Update content safely
  useEffect(() => {
    if (!aceEditorRef.current) return;

    const editor = aceEditorRef.current;
    const currentValue = editor.getValue();

    if (content !== currentValue) {
      isSettingValue.current = true;
      const cursor = editor.getCursorPosition();
      editor.setValue(content || "", -1);
      editor.moveCursorToPosition(cursor);
      isSettingValue.current = false;
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default CodeEditor;
