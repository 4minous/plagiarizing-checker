
import React from 'react';
import { DocumentIcon, ClipboardIcon } from './icons';

interface TextInputProps {
  id: string;
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ id, title, value, onChange, placeholder, disabled }) => {
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const event = {
                target: { value: text }
            } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(event);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };
    
    return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
            <DocumentIcon className="w-5 h-5 text-blue-400" />
            <label htmlFor={id} className="font-bold text-lg text-gray-200">{title}</label>
        </div>
        <button 
            onClick={handlePaste} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
            disabled={disabled}
            title="Paste from clipboard"
        >
            <ClipboardIcon className="w-4 h-4" />
            Paste
        </button>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full flex-grow p-4 bg-transparent text-gray-300 resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50"
      />
    </div>
  );
};

export default TextInput;
