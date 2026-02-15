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

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Ace Editor
    const editor = ace.edit(editorRef.current, {
      theme: "ace/theme/monokai",
      mode: getLanguageMode(filename),
      fontSize: 14,
      fontFamily: '"Fira Code", monospace',
      enableLiveAutocompletion: true,
      showPrintMargin: false,
      wrap: true,
    });

    // Set initial content
    editor.setValue(content, -1);

    // Sync changes to React state
    editor.session.on("change", () => {
      onChange(editor.getValue());
    });

    aceEditorRef.current = editor;

    return () => {
      editor.destroy();
      aceEditorRef.current = null;
    };
  }, [filename]); // Reinitialize when file changes

  // Update content when it changes externally
  useEffect(() => {
    if (
      aceEditorRef.current &&
      content !== aceEditorRef.current.getValue()
    ) {
      const currentPosition = aceEditorRef.current.getCursorPosition();
      aceEditorRef.current.setValue(content, -1);
      aceEditorRef.current.moveCursorToPosition(currentPosition);
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full"
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default CodeEditor;