import React, { useEffect, useRef, useCallback, useState } from 'react';

const COLOR_PALETTE = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529', '#000000',
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a', '#b02525',
  '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700', '#d66a00',
  '#f0ffe0', '#e0ffd0', '#c8ffb0', '#a9ff90', '#88ff70', '#5fff50', '#44ff30', '#2bff10', '#00ff00', '#00e000', '#00c000',
  '#e0fff0', '#c0ffe0', '#a0ffd0', '#80ffc0', '#60ffb0', '#40ffa0', '#20ff90', '#00ff80', '#00e070', '#00c060', '#00a050',
  '#e0f8ff', '#c0f0ff', '#a0e8ff', '#80e0ff', '#60d8ff', '#40d0ff', '#20c8ff', '#00c0ff', '#00a8e0', '#0090c0', '#0078a0',
  '#e0e0ff', '#c8c8ff', '#b0b0ff', '#9898ff', '#8080ff', '#6868ff', '#5050ff', '#3838ff', '#2020ff', '#0808ff', '#0000ff',
  '#f0e0ff', '#e0c8ff', '#d0b0ff', '#c098ff', '#b080ff', '#a068ff', '#9050ff', '#8038ff', '#7020ff', '#6008ff', '#5000ff',
  '#ffe0f8', '#ffc8f0', '#ffb0e8', '#ff98e0', '#ff80d8', '#ff68d0', '#ff50c8', '#ff38c0', '#ff20b8', '#ff08b0', '#ff00a8'
];

const COLOR_SET = new Set(COLOR_PALETTE.map((c) => c.toLowerCase()));
const PLACEHOLDER_STYLE_ID = 'rich-text-input-placeholder-style';
const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 36;

const ensurePlaceholderStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PLACEHOLDER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PLACEHOLDER_STYLE_ID;
  style.type = 'text/css';
  style.appendChild(document.createTextNode(`
    .rich-text-input[contenteditable="true"]:empty:before {
      content: attr(data-placeholder);
      color: #9ca3af;
      pointer-events: none;
      display: block;
    }
  `));
  document.head.appendChild(style);
};

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const rgbToHex = (color) => {
  const match = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!match) return '';
  const toHex = (value) => {
    const num = Math.max(0, Math.min(255, parseInt(value, 10)));
    return num.toString(16).padStart(2, '0');
  };
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
};

const normalizeColor = (color) => {
  if (!color) return '';
  let normalized = color.trim().toLowerCase();
  
  // Preservar colores rgba (con transparencia)
  if (normalized.startsWith('rgba')) {
    return normalized;
  }
  
  if (normalized.startsWith('rgb')) {
    normalized = rgbToHex(normalized);
  }
  if (normalized.length === 4 && normalized.startsWith('#')) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  if (COLOR_SET.has(normalized)) {
    return normalized;
  }
  // Admite nombres básicos equivalentes a nuestra paleta
  if (normalized === 'black') return '#000000';
  return '';
};

const clampFontSizeValue = (size) => {
  if (!Number.isFinite(size)) return DEFAULT_FONT_SIZE;
  if (size < MIN_FONT_SIZE) return MIN_FONT_SIZE;
  if (size > MAX_FONT_SIZE) return MAX_FONT_SIZE;
  return size;
};

const normalizeFontSize = (value) => {
  if (!value) return '';
  const match = value.match(/([\d.]+)\s*px/i);
  if (!match) return '';
  const numericSize = clampFontSizeValue(parseFloat(match[1]));
  if (!Number.isFinite(numericSize)) return '';
  const rounded = Math.round(numericSize * 10) / 10;
  return `${rounded}px`;
};

const serializeNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const clean = node.nodeValue ? node.nodeValue.replace(/\u00a0/g, ' ') : '';
    // Preservar múltiples espacios consecutivos convirtiéndolos a &nbsp;
    let escaped = escapeHtml(clean);
    // Reemplazar espacios múltiples: mantener el primero normal y convertir los siguientes a &nbsp;
    escaped = escaped.replace(/  +/g, (match) => ' ' + '&nbsp;'.repeat(match.length - 1));
    return escaped;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const tag = node.tagName.toLowerCase();

  if (tag === 'br') {
    return '<br />';
  }

  const serializeChildren = () => {
    let output = '';
    node.childNodes.forEach((child) => {
      output += serializeNode(child);
    });
    return output;
  };

  if (tag === 'div' || tag === 'p') {
    const content = serializeChildren();
    if (!content) {
      return '<br />';
    }
    if (content.endsWith('<br />')) {
      return content;
    }
    return `${content}<br />`;
  }

  if (tag === 'strong' || tag === 'b') {
    const content = serializeChildren();
    return content ? `<strong>${content}</strong>` : '';
  }

  if (tag === 'em' || tag === 'i') {
    const content = serializeChildren();
    return content ? `<em>${content}</em>` : '';
  }

  if (tag === 'span' || tag === 'font') {
    let colorAttr = '';
    let backColorAttr = '';
    let fontSizeAttr = '';
    if (tag === 'font') {
      if (node.getAttribute('color')) {
        colorAttr = node.getAttribute('color');
      }
      if (node.getAttribute('size')) {
        const sizeValue = node.getAttribute('size');
        const sizeNumber = Number(sizeValue);
        if (Number.isFinite(sizeNumber)) {
          fontSizeAttr = `${clampFontSizeValue(8 + sizeNumber * 2)}px`;
        }
      }
    }
    const styleAttr = node.getAttribute('style');
    if (styleAttr) {
      const colorMatch = styleAttr.match(/color\s*:\s*([^;]+)/i);
      if (colorMatch) {
        colorAttr = colorMatch[1];
      }
      const backColorMatch = styleAttr.match(/background-color\s*:\s*([^;]+)/i);
      if (backColorMatch) {
        backColorAttr = backColorMatch[1];
      }
      const fontSizeMatch = styleAttr.match(/font-size\s*:\s*([^;]+)/i);
      if (fontSizeMatch) {
        fontSizeAttr = fontSizeMatch[1];
      }
    }
    const normalizedColor = normalizeColor(colorAttr);
    const normalizedBackColor = normalizeColor(backColorAttr);
    const normalizedFontSize = normalizeFontSize(fontSizeAttr);
    const content = serializeChildren();
    if (!content) return '';
    const styleParts = [];
    if (normalizedColor) {
      styleParts.push(`color:${normalizedColor}`);
    }
    if (normalizedBackColor) {
      styleParts.push(`background-color:${normalizedBackColor}`);
    }
    if (normalizedFontSize) {
      styleParts.push(`font-size:${normalizedFontSize}`);
    }
    if (styleParts.length === 0) {
      return content;
    }
    return `<span style="${styleParts.join(';')}">${content}</span>`;
  }

  return serializeChildren();
};

const collapseBreaks = (html) => {
  if (!html) return '';
  let result = html.replace(/(<br \/>){3,}/g, '<br /><br />');
  result = result.replace(/(<br \/>){3,}$/g, '<br /><br />');
  // Si solo hay <br /> al final, eliminar completamente
  if (result.trim() === '<br />') return '';
  return result;
};

const convertLegacyMarkupToHtml = (input) => {
  if (!input) return '';
  return input
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[color:([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>')
    .replace(/\n/g, '<br />');
};

export const sanitizeRichTextValue = (value) => {
  if (typeof document === 'undefined') {
    return value || '';
  }
  const container = document.createElement('div');
  container.innerHTML = value || '';
  let output = '';
  const children = Array.from(container.childNodes);
  
  children.forEach((child, index) => {
    const serialized = serializeNode(child);
    
    // Si es un elemento div/p y NO es el primero, y ya hay contenido previo,
    // asegurarse de que haya un salto de línea antes
    if (index > 0 && (child.nodeName === 'DIV' || child.nodeName === 'P') && output && !output.endsWith('<br />')) {
      output += '<br />';
    }
    
    output += serialized;
  });
  
  return collapseBreaks(output);
};

export const getPlainTextFromRichText = (value) => {
  if (!value) return '';
  const container = document.createElement('div');
  container.innerHTML = value.replace(/<br\s*\/?\>/gi, '\n');
  return (container.textContent || container.innerText || '').replace(/\u00a0/g, ' ');
};

export const normalizeRichTextValue = (value) => {
  if (!value) return '';
  const legacyConverted = convertLegacyMarkupToHtml(value);
  const sanitized = sanitizeRichTextValue(legacyConverted || value);
  // Si el contenido sanitizado es solo <br /> o espacios en blanco, retornar vacío
  if (!sanitized || sanitized.trim() === '' || sanitized.trim() === '<br />') {
    return '';
  }
  return sanitized;
};

const placeCaretAtEnd = (element) => {
  if (!element) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

export default function RichTextInput({ value, onChange, maxLength = 500, placeholder = '' }) {
  const editorRef = useRef(null);
  const menuRef = useRef(null);
  const selectionRef = useRef(null);
  const lastHtmlRef = useRef('');
  const [activeColor, setActiveColor] = useState('');
  const [activeBackColor, setActiveBackColor] = useState('');
  const [menuFontSize, setMenuFontSize] = useState(DEFAULT_FONT_SIZE);
  const [showColorPalette, setShowColorPalette] = useState(null); // 'text' | 'back' | null
  const [customTextColor, setCustomTextColor] = useState('#000000'); // Color personalizado para texto
  const [customBackColor, setCustomBackColor] = useState('#000000'); // Color personalizado para fondo
  const [colorOpacity, setColorOpacity] = useState(100);
  const [textColor, setTextColor] = useState(''); // Color de texto actual
  const [backColor, setBackColor] = useState(''); // Color de fondo actual
  const [isBold, setIsBold] = useState(false); // Estado de negrita
  const [isItalic, setIsItalic] = useState(false); // Estado de cursiva

  useEffect(() => {
    ensurePlaceholderStyles();
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const normalized = value ? normalizeRichTextValue(value) : '';
    if (normalized !== lastHtmlRef.current) {
      lastHtmlRef.current = normalized;
      if (editorRef.current.innerHTML !== normalized) {
        editorRef.current.innerHTML = normalized;
      }
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    const sanitized = sanitizeRichTextValue(rawHtml);
    let normalizedValue = sanitized;
    const plainText = getPlainTextFromRichText(sanitized);
    const plainTextLength = plainText.length;

    // Detectar si es contenido vacío o solo <br />
    const isContentEmpty = plainTextLength === 0 || !sanitized || sanitized.trim() === '' || sanitized.trim() === '<br />';
    
    if (isContentEmpty) {
      normalizedValue = '';
      if (editorRef.current.innerHTML !== '') {
        editorRef.current.innerHTML = '';
      }
    }

    if (maxLength && plainTextLength > maxLength) {
      editorRef.current.innerHTML = lastHtmlRef.current;
      placeCaretAtEnd(editorRef.current);
      return;
    }

    if (normalizedValue !== lastHtmlRef.current) {
      lastHtmlRef.current = normalizedValue;
      if (onChange) {
        onChange(normalizedValue, plainTextLength);
      }
    } else if (onChange) {
      onChange(normalizedValue, plainTextLength);
    }
  }, [maxLength, onChange]);

  const handlePaste = useCallback((event) => {
    event.preventDefault();
    if (!editorRef.current) return;
    const text = (event.clipboardData || window.clipboardData).getData('text');
    const normalized = escapeHtml(text.replace(/\r/g, ''))
      .replace(/\n/g, '<br />');
    document.execCommand('insertHTML', false, normalized);
    emitChange();
  }, [emitChange]);

  const restoreSelection = () => {
    if (!selectionRef.current) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const closeMenu = () => {
    if (menuRef.current) {
      menuRef.current.style.display = 'none';
    }
  };

  const applyCommand = (command, value, keepMenuOpen = false) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    
    // Guardar la selección después del comando
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      
      // Actualizar estados de formato después de aplicar
      let node = selection.focusNode;
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentElement;
      }
      
      if (node instanceof HTMLElement) {
        const computed = window.getComputedStyle(node);
        
        // Actualizar estado de negrita
        if (command === 'bold') {
          const fontWeight = computed.fontWeight;
          setIsBold(fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700 || node.tagName === 'STRONG' || node.tagName === 'B');
        }
        
        // Actualizar estado de cursiva
        if (command === 'italic') {
          const fontStyle = computed.fontStyle;
          setIsItalic(fontStyle === 'italic' || node.tagName === 'EM' || node.tagName === 'I');
        }
      }
    }
    
    if (!keepMenuOpen) {
      closeMenu();
    }
    setTimeout(emitChange, 0);
  };

  const getSelectionComputedStyles = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { color: '', fontSize: DEFAULT_FONT_SIZE };
    }
    let node = selection.focusNode;
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentElement;
    }
    if (!(node instanceof HTMLElement)) {
      return { color: '', fontSize: DEFAULT_FONT_SIZE };
    }
    const computed = window.getComputedStyle(node);
    const color = normalizeColor(computed.color);
    const fontSizeValue = clampFontSizeValue(parseFloat(computed.fontSize) || DEFAULT_FONT_SIZE);
    return { color, fontSize: fontSizeValue };
  };

  const wrapSelectionWithStyles = (styles) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;
    const styleEntries = Object.entries(styles).filter(([, value]) => Boolean(value));
    if (styleEntries.length === 0) return false;
    
    try {
      // Buscar el nodo span padre si existe
      let parentSpan = selection.focusNode;
      while (parentSpan && parentSpan.nodeType !== Node.ELEMENT_NODE) {
        parentSpan = parentSpan.parentElement;
      }
      
      // Verificar si toda la selección está dentro de un único SPAN
      const isWholeSpanSelected = parentSpan && 
                                  parentSpan.tagName === 'SPAN' && 
                                  range.startContainer === range.endContainer &&
                                  parentSpan.textContent === range.toString();
      
      if (isWholeSpanSelected) {
        // Actualizar el SPAN existente en lugar de crear uno nuevo
        styleEntries.forEach(([key, value]) => {
          parentSpan.style[key] = value;
        });
        
        // Si aplicamos fondo y no hay color de texto, aplicar blanco
        if (styles['background-color'] && !parentSpan.style.color) {
          parentSpan.style.color = '#ffffff';
        }
        
        // Mantener selección
        const newRange = document.createRange();
        newRange.selectNodeContents(parentSpan);
        selection.removeAllRanges();
        selection.addRange(newRange);
        selectionRef.current = newRange.cloneRange();
        
        return true;
      }
      
      // Caso normal: crear nuevo SPAN
      let currentColor = '';
      let currentBackColor = '';
      let currentFontSize = '';
      
      if (parentSpan && parentSpan.tagName === 'SPAN') {
        currentColor = parentSpan.style.color || '';
        currentBackColor = parentSpan.style.backgroundColor || '';
        currentFontSize = parentSpan.style.fontSize || '';
      }
      
      // Extraer contenido seleccionado
      const extractedContent = range.extractContents();
      const textContent = extractedContent.textContent || '';
      
      // Crear nuevo span con estilos combinados
      const span = document.createElement('span');
      
      // Preservar estilos existentes
      if (currentColor && !styles['color']) {
        span.style.color = currentColor;
      }
      if (currentBackColor && !styles['background-color']) {
        span.style.backgroundColor = currentBackColor;
      }
      if (currentFontSize && !styles['font-size']) {
        span.style.fontSize = currentFontSize;
      }
      
      // Si aplicamos fondo y no hay color de texto, aplicar blanco
      if (styles['background-color'] && !currentColor && !styles['color']) {
        span.style.color = '#ffffff';
      }
      
      // Aplicar nuevos estilos
      styleEntries.forEach(([key, value]) => {
        span.style[key] = value;
      });
      
      // Establecer texto
      span.textContent = textContent;
      
      // Insertar span en el rango
      range.insertNode(span);
      
      // Restaurar selección inmediatamente
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);
      selectionRef.current = newRange.cloneRange();
      
      return true;
    } catch (error) {
      console.error('Error applying styles:', error);
      return false;
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getColorWithOpacity = (hex, opacity) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const alpha = opacity / 100;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const applyColor = (color, alreadyProcessed = false) => {
    if (!color || !editorRef.current) return;
    
    // Calcular color final con opacidad si es necesario
    const finalColor = alreadyProcessed ? color : (color.startsWith('#') ? getColorWithOpacity(color, colorOpacity) : color);
    
    // Enfocar y restaurar selección
    editorRef.current.focus();
    restoreSelection();
    
    // Intentar aplicar con wrapSelectionWithStyles
    const success = wrapSelectionWithStyles({ color: finalColor });
    
    if (success) {
      setActiveColor(finalColor);
      setTextColor(finalColor); // Guardar color de texto actual
      // Actualizar preview
      editorRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      emitChange();
    }
  };

  const applyBackColor = (color, alreadyProcessed = false) => {
    if (!color || !editorRef.current) return;
    
    // Calcular color final con opacidad si es necesario
    const finalColor = alreadyProcessed ? color : (color.startsWith('#') ? getColorWithOpacity(color, colorOpacity) : color);
    
    // Enfocar y restaurar selección
    editorRef.current.focus();
    restoreSelection();
    
    // Intentar aplicar con wrapSelectionWithStyles
    const success = wrapSelectionWithStyles({ 'background-color': finalColor });
    
    if (success) {
      setActiveBackColor(finalColor);
      setBackColor(finalColor); // Guardar color de fondo actual
      // Forzar actualización múltiple del preview para cambios de opacidad
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          emitChange();
        }
      }, 0);
    }
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;
    
    // Asegurarse de tener el foco
    editorRef.current.focus();
    
    // Restaurar la selección guardada
    restoreSelection();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    // Guardar el texto seleccionado antes de hacer cambios
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    try {
      // Usar execCommand para remover formato
      document.execCommand('removeFormat', false, null);
      document.execCommand('unlink', false, null);
      
      // Obtener la nueva selección después del removeFormat
      const newSelection = window.getSelection();
      if (newSelection && newSelection.rangeCount > 0) {
        const newRange = newSelection.getRangeAt(0);
        
        // Extraer todo el contenido que pueda tener formato residual
        const fragment = newRange.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        const cleanText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Reemplazar con texto completamente limpio
        newRange.deleteContents();
        const textNode = document.createTextNode(cleanText);
        newRange.insertNode(textNode);
        
        // Reseleccionar el texto
        const finalRange = document.createRange();
        finalRange.selectNodeContents(textNode);
        newSelection.removeAllRanges();
        newSelection.addRange(finalRange);
        
        // Guardar la selección
        selectionRef.current = finalRange.cloneRange();
      }
      
      // Resetear todos los estados de formato
      setIsBold(false);
      setIsItalic(false);
      setActiveColor('');
      setTextColor('');
      setActiveBackColor('');
      setBackColor('');
      setMenuFontSize(DEFAULT_FONT_SIZE);
      
      editorRef.current.focus();
      setTimeout(emitChange, 0);
    } catch (error) {
      console.error('Error clearing formatting:', error);
    }
  };

  const applyFontSizeChange = (delta) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const currentSize = clampFontSizeValue(menuFontSize || DEFAULT_FONT_SIZE);
    const nextSize = clampFontSizeValue(currentSize + delta);
    if (nextSize === currentSize) return;
    if (wrapSelectionWithStyles({ 'font-size': `${nextSize}px` })) {
      setMenuFontSize(nextSize);
      setTimeout(emitChange, 0);
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Guardar selección
    selectionRef.current = selection.getRangeAt(0).cloneRange();
    
    // Buscar el nodo más cercano con estilos
    let node = selection.focusNode;
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentElement;
    }
    
    // Detectar formatos activos (negrita, cursiva)
    if (node instanceof HTMLElement) {
      const computed = window.getComputedStyle(node);
      
      // Detectar negrita
      const fontWeight = computed.fontWeight;
      setIsBold(fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700 || node.tagName === 'STRONG' || node.tagName === 'B');
      
      // Detectar cursiva
      const fontStyle = computed.fontStyle;
      setIsItalic(fontStyle === 'italic' || node.tagName === 'EM' || node.tagName === 'I');
    } else {
      setIsBold(false);
      setIsItalic(false);
    }
    
    // Detectar colores actuales
    if (node && node.tagName === 'SPAN') {
      // Priorizar estilos inline del span
      const inlineColor = node.style.color;
      const inlineBackColor = node.style.backgroundColor;
      const inlineFontSize = node.style.fontSize;
      
      // Color de texto
      if (inlineColor) {
        const normalized = normalizeColor(inlineColor);
        setActiveColor(normalized);
        setTextColor(normalized);
        setCustomTextColor(normalized);
      } else {
        setActiveColor('');
        setTextColor('');
      }
      
      // Color de fondo
      if (inlineBackColor) {
        const normalized = normalizeColor(inlineBackColor);
        setActiveBackColor(normalized);
        setBackColor(normalized);
        setCustomBackColor(normalized);
      } else {
        setActiveBackColor('');
        setBackColor('');
      }
      
      // Tamaño de fuente
      if (inlineFontSize) {
        setMenuFontSize(clampFontSizeValue(parseFloat(inlineFontSize)));
      } else {
        setMenuFontSize(DEFAULT_FONT_SIZE);
      }
    } else {
      // Sin estilos aplicados
      setActiveColor('');
      setTextColor('');
      setActiveBackColor('');
      setBackColor('');
      setMenuFontSize(DEFAULT_FONT_SIZE);
    }
    
    // Posicionar menú contextual
    const menu = menuRef.current;
    if (!menu) return;
    
    menu.style.display = 'block';
    menu.style.position = 'fixed';
    
    const { clientX, clientY } = event;
    const menuWidth = 220;
    const menuHeight = 260;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const left = Math.min(clientX, viewportWidth - menuWidth - 8);
    const top = Math.min(clientY, viewportHeight - menuHeight - 8);
    
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    const handleScroll = (event) => {
      // No cerrar el menú si el scroll ocurre dentro del menú o sus descendientes
      if (menuRef.current && (menuRef.current === event.target || menuRef.current.contains(event.target))) {
        event.stopPropagation();
        return;
      }
      closeMenu();
    };
    const handleWheel = (event) => {
      // No cerrar el menú si la rueda del mouse se usa sobre el menú o sus descendientes
      if (menuRef.current && (menuRef.current === event.target || menuRef.current.contains(event.target))) {
        event.stopPropagation();
        return;
      }
    };
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('resize', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('resize', handleScroll, true);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={editorRef}
        className="rich-text-input w-full min-h-[44px] text-xs px-0 py-0.5 bg-transparent outline-none"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        onContextMenu={handleContextMenu}
        style={{ whiteSpace: 'pre-wrap', direction: 'ltr', overflowWrap: 'anywhere' }}
      />

      <div
        ref={menuRef}
        style={{ position: 'fixed', display: 'none', zIndex: 9999, minWidth: 160 }}
        className="bg-white border border-gray-200 rounded shadow-lg p-2"
      >
        <div className="flex items-center gap-1 mb-2">
          <button
            type="button"
            onClick={clearFormatting}
            className="text-xs px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
            title="Quitar formato del texto seleccionado"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => applyCommand('bold', null, true)}
            className={`text-xs px-2 py-1 rounded cursor-pointer font-bold transition-colors ${
              isBold 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title="Negrita"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyCommand('italic', null, true)}
            className={`text-xs px-2 py-1 rounded cursor-pointer italic transition-colors ${
              isItalic 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'hover:bg-gray-100'
            }`}
            title="Cursiva"
          >
            I
          </button>
        </div>
        
        <div className="flex items-center gap-1 mb-2">
          <button
            type="button"
            onClick={() => setShowColorPalette(showColorPalette === 'text' ? null : 'text')}
            className={`text-xs px-2 py-1 rounded border cursor-pointer flex items-center gap-1 transition-colors ${
              showColorPalette === 'text'
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-100'
            }`}
            title="Cambiar color del texto"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span style={{ color: activeColor || '#000', fontWeight: 'bold' }}>A</span>
          </button>
          <button
            type="button"
            onClick={() => setShowColorPalette(showColorPalette === 'back' ? null : 'back')}
            className={`text-xs px-2 py-1 rounded border cursor-pointer flex items-center gap-1 transition-colors ${
              showColorPalette === 'back'
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-100'
            }`}
            title="Cambiar color de fondo del texto"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span style={{ backgroundColor: activeBackColor || '#e5e7eb', padding: '1px 5px', borderRadius: '2px', fontWeight: 'bold' }}>A</span>
          </button>
        </div>

        {showColorPalette && (
          <div className="mb-2 border-t pt-2">
            <div className="text-[11px] font-semibold text-gray-700 mb-2">
              {showColorPalette === 'text' ? 'Color de texto' : 'Color de fondo'}
            </div>
            
            {/* Selector de color personalizado */}
            <div className="mb-2 flex items-center gap-2">
              <input
                type="color"
                value={showColorPalette === 'text' ? customTextColor : customBackColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  if (showColorPalette === 'text') {
                    setCustomTextColor(newColor);
                  } else {
                    setCustomBackColor(newColor);
                  }
                  // Aplicar color con la opacidad actual
                  showColorPalette === 'text' ? applyColor(newColor) : applyBackColor(newColor);
                }}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                title="Selector de color personalizado"
              />
              <span className="text-xs text-gray-600">Color personalizado</span>
            </div>

            {/* Control de opacidad */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-600">Opacidad</label>
                <span className="text-[10px] font-semibold text-gray-700">{colorOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={colorOpacity}
                onChange={(e) => {
                  const newOpacity = parseInt(e.target.value);
                  setColorOpacity(newOpacity);
                  // Aplicar el color con la nueva opacidad inmediatamente
                  const currentColor = showColorPalette === 'text' ? customTextColor : customBackColor;
                  const colorWithOpacity = getColorWithOpacity(currentColor, newOpacity);
                  showColorPalette === 'text' ? applyColor(colorWithOpacity, true) : applyBackColor(colorWithOpacity, true);
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgba(255, 255, 255, 0) 0%, ${showColorPalette === 'text' ? customTextColor : customBackColor} 100%)`,
                  backgroundSize: '100% 100%'
                }}
              />
            </div>

            {/* Paleta de colores predefinidos */}
            <div className="text-[10px] text-gray-500 mb-1">Colores predefinidos</div>
            <div className="grid grid-cols-11 gap-1 max-h-32 overflow-y-auto">
              {COLOR_PALETTE.map((color) => {
                const isActive = showColorPalette === 'text' 
                  ? (activeColor === color || normalizeColor(activeColor) === color)
                  : (activeBackColor === color || normalizeColor(activeBackColor) === color);
                
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      if (showColorPalette === 'text') {
                        setCustomTextColor(color);
                      } else {
                        setCustomBackColor(color);
                      }
                      setColorOpacity(100); // Resetear opacidad al 100% al seleccionar color de paleta
                      showColorPalette === 'text' ? applyColor(color) : applyBackColor(color);
                    }}
                    className={`w-5 h-5 rounded border-2 ${
                      isActive
                        ? 'border-blue-500 ring-2 ring-blue-300' 
                        : 'border-gray-300 hover:border-gray-400'
                    } cursor-pointer transition-all`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-gray-500">Tamaño ({Math.round(menuFontSize)}px)</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyFontSizeChange(-2)}
              className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => applyFontSizeChange(2)}
              className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
