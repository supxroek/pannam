import { useState, useEffect, useRef } from 'react';

export default function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (v) => {
    setSelected(v);
    onChange(v);
    setIsOpen(false);
  };

  const selectedOption = options.find(
    (o) => o.id === selected || o === selected
  );
  const displayText = selectedOption
    ? selectedOption.name || selectedOption
    : placeholder;

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${
          error
            ? 'border-red-400 bg-red-50'
            : isOpen
              ? 'border-[#2563eb] shadow-lg shadow-blue-100'
              : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          className={`text-base ${
            selected !== '' && selected !== undefined
              ? 'text-slate-800'
              : 'text-slate-300'
          }`}
        >
          {displayText}
        </span>
        <i
          className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl max-h-40 overflow-y-auto scrollbar-none">
          <div className="py-1">
            {options.map((opt, idx) => {
              const val = opt.id !== undefined ? opt.id : opt;
              const text = opt.name || opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(val)}
                  className={`w-full px-4 py-3 text-left text-base hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                    selected === val
                      ? 'bg-blue-50 text-[#1e40af] font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected === val
                        ? 'border-[#2563eb] bg-[#2563eb]'
                        : 'border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-white ${
                        selected === val ? 'block' : 'hidden'
                      }`}
                    ></div>
                  </div>
                  {text}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <i className="fas fa-circle-exclamation text-xs"></i>
          {error}
        </p>
      )}
    </div>
  );
}
