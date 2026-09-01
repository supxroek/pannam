import { useState, useRef } from 'react';

export default function InputField({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  maxLength,
  icon,
  helpText,
  disabled = false,
  onBlur,
  onFocus,
  inputMode,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
          error
            ? 'border-red-400 bg-red-50'
            : isFocused
              ? 'border-[#2563eb] shadow-lg shadow-blue-100'
              : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {icon && (
          <div className="absolute left-4 text-slate-400">
            <i className={`fas ${icon}`}></i>
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          inputMode={inputMode}
          className="w-full px-4 py-3.5 bg-transparent text-slate-800 placeholder-slate-300 text-base rounded-xl"
          style={{ paddingLeft: icon ? '48px' : '16px' }}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <i className="fas fa-circle-exclamation text-xs"></i>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
