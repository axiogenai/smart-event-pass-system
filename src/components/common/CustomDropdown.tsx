import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelPrefix?: string;
  width?: string | number;
  searchable?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  labelPrefix,
  width = 'auto',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <div 
      ref={dropdownRef} 
      style={{ 
        position: 'relative', 
        width: width, 
        display: 'inline-block',
        userSelect: 'none'
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--border-strong)' : 'var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          width: '100%',
          minHeight: '34px',
          transition: 'all 0.12s ease',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {labelPrefix && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 400 }}>
              {labelPrefix}
            </span>
          )}
          {selectedOption?.icon && (
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              {selectedOption.icon}
            </span>
          )}
          <span style={{ color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-primary)',
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown 
          size={14} 
          style={{ 
            color: 'var(--text-secondary)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0 
          }} 
        />
      </button>

      {/* Menu Popover */}
      {isOpen && (
        <div
          className="vibe-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            minWidth: typeof width === 'number' ? `${width}px` : '240px',
            maxHeight: '260px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {searchable && (
            <div style={{ padding: '4px 6px 6px 6px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px 8px',
              }}>
                <Search size={12} color="var(--text-tertiary)" />
                <input
                  type="text"
                  className="clean-search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: isSelected ? 'var(--bg-surface-raised)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      {opt.icon && (
                        <span style={{ color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                          {opt.icon}
                        </span>
                      )}
                      <div>
                        <div style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                          {opt.label}
                        </div>
                        {opt.sublabel && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {opt.badge && (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={13} color="#ffffff" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
