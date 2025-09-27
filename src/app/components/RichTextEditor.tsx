"use client";

import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "เขียนเนื้อหาที่นี่...",
  rows = 20,
  className = ""
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleUnderline = () => insertText('__', '__');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + '\t' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }

    // Handle Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      handleBold();
    }

    // Handle Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      handleItalic();
    }

    // Handle Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      handleUnderline();
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
        <button
          type="button"
          onClick={handleBold}
          className="px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition font-bold"
          title="Bold (Ctrl+B) - ใช้ **text**"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition italic"
          title="Italic (Ctrl+I) - ใช้ *text*"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition underline"
          title="Underline (Ctrl+U) - ใช้ __text__"
        >
          U
        </button>
        
        <div className="h-6 w-px bg-white/20"></div>
        
        <span className="text-sm text-white/60">
          Tab = เว้นวรรค | Enter = บรรทัดใหม่
        </span>
        
        <div className="h-6 w-px bg-white/20"></div>
        
        <div className="text-xs text-white/50 space-y-1">
          <div>**ตัวหนา** = <strong>ตัวหนา</strong></div>
          <div>*ตัวเอียง* = <em>ตัวเอียง</em></div>
          <div>__ขีดเส้นใต้__ = <u>ขีดเส้นใต้</u></div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-mono text-sm ${className}`}
        style={{ 
          tabSize: 4,
          whiteSpace: 'pre-wrap'
        }}
      />

      {/* Preview */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-3">ตัวอย่างผลลัพธ์:</h4>
        <div className="text-white/90 leading-relaxed">
          {value.split('\n').map((line, index) => {
            if (line.trim() === '') {
              return <br key={index} />;
            }
            
            // Process formatting
            let processedLine = line;
            processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
            processedLine = processedLine.replace(/__(.*?)__/g, '<u>$1</u>');
            processedLine = processedLine.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            
            return (
              <p 
                key={index} 
                className="mb-2"
                dangerouslySetInnerHTML={{ __html: processedLine }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}