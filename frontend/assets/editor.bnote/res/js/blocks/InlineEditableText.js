/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */


import React, { useState, useRef, useEffect } from 'react';

/**
 * Props:
 * - value: string (initial value to show)
 * - onCommit: function (called with new value on Enter or blur)
 * - className: optional class for the wrapper
 * - inputStyle: optional inline styles for the input
 * - renderDisplay: optional function to render non-editing display
 */
export function InlineEditableText({
                                       value='',
                                       onCommit=(v)=>{},
                                       className = '',
                                       inputStyle = {},
                                       renderDisplay,
                                   }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const commit = () => {
        setEditing(false);
        const trimmed = text.trim();
        if (trimmed !== value) {
            onCommit?.(trimmed);
        }
    };

    const cancel = () => {
        setEditing(false);
        setText(value); // revert
    };

    return (
        <span className={className}>
      {editing ? (
          <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  else if (e.key === 'Escape') cancel();
              }}
              style={{
                  font: 'inherit',
                  padding: 0,
                  margin: 0,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  ...inputStyle,
              }}
          />
      ) : (
          <span
              tabIndex={0}
              role="button"
              onClick={() => setEditing(true)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditing(true);
              }}
              style={{ cursor: 'text' }}
          >
          {renderDisplay ? renderDisplay(value) : value}
        </span>
      )}
    </span>
    );
}
