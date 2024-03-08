import React, { useRef, useEffect, useState } from 'react';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

interface JsonEditorComponentProps {
  value: object;
  onChange: (value: object) => void;
  onError: (hasError: boolean) => void;
}

const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({ value, onChange, onError }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && editorRef.current) {
      const options: JSONEditorOptions = {
        modes: ['code', 'tree', 'view', 'form', 'text'],
        mainMenuBar: false,
        onChange: () => {
          try {
            onChange(editor.get());
            onError(false);
          } catch (error) {
            onError(true);
          }
        }
      };

      const editor = new JSONEditor(editorRef.current, options);
      editor.set(value);

      return () => editor.destroy();
    }
  }, [isMounted]);

  return isMounted ? (<div>
    <style jsx global>{`
      .jsoneditor {
        border-color: rgb(229 231 235) !important;
      }
    `}</style>
    <div ref={editorRef} style={{ height: '400px' }} />
  </div>) : null;
};

export default JsonEditorComponent;
