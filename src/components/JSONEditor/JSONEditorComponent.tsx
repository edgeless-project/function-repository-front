import React, { useRef, useEffect, useState } from 'react';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

interface JsonEditorComponentProps {
  value: object;
  onChange?: (value: object) => void;
  onError?: (hasError: boolean) => void;
  readOnly?: boolean;
}

const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({ value, onChange, onError, readOnly=false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && editorRef.current) {
      const options: JSONEditorOptions = {
        modes: ['code', 'tree', 'view', 'form', 'text'],
        mode: readOnly ? 'view' : 'code',
        mainMenuBar: false,
        onChange: () => {
          try {
            if (onChange) onChange(editor.get());
            if (onError) onError(false);
          } catch (error) {
            if (onError) onError(true);
          }
        }
      };

      const editor = new JSONEditor(editorRef.current, options);
      editor.set(value);

      if (readOnly) {
        editor.expandAll();
      }

      return () => editor.destroy();
    }
  }, [isMounted]);

  return isMounted ? (<div>
    <style jsx global>{`
      .jsoneditor {
        border-color: rgb(229 231 235) !important;
      }
    `}</style>
    <div ref={editorRef} style={{ height: '500px' }} />
  </div>) : null;
};

export default JsonEditorComponent;
