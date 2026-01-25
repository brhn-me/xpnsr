import React, { useEffect, useCallback } from 'react';
import { Equal } from 'lucide-react';

interface CalculatorProps {
    value: string;
    onChange: (val: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ value, onChange }) => {

    // safe evaluate function
    const evaluate = (expression: string): string => {
        try {
            // Remove invalid characters just in case
            const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
            if (!sanitized) return '';
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + sanitized)();

            if (!isFinite(result) || isNaN(result)) return 'Error';
            return String(result);
        } catch (e) {
            return 'Error';
        }
    };

    const handlePress = useCallback((key: string) => {
        if (key === 'C') {
            onChange('');
            return;
        }
        if (key === 'Back') {
            onChange(value.length > 0 ? value.slice(0, -1) : '');
            return;
        }
        if (key === '=') {
            const result = evaluate(value);
            onChange(result);
            return;
        }

        // Prevent multiple operators in sequence if needed, or rely on user correctness?
        // Basic check for operators to avoid "++" if we want, but "5*-2" is valid math.
        // Let's just append for flexibility.
        onChange(value + key);
    }, [value, onChange]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only capture if we are focused within the modal, but usually modal has focus trap.
            // For now, let's allow global capture if the modal is open (which this component implies).
            // But we must be careful not to double-type if the input itself is focused.
            // If the input is focused, let the browser handle typing numbers.
            // But we need to handle Enter (=) or Esc is handled by Modal.

            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.key >= '0' && e.key <= '9') { e.preventDefault(); handlePress(e.key); }
            if (['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) { e.preventDefault(); handlePress(e.key); }
            if (e.key === 'Enter') { e.preventDefault(); handlePress('='); }
            if (e.key === 'Backspace') { e.preventDefault(); handlePress('Back'); }
            if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
                // Don't handle C here aggressively as it might be copy. 
                // Let's stick to Backspace and standard keys.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePress]);

    const btnClass = "h-12 rounded-xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm";
    const numClass = `${btnClass} bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600`;
    const opClass = `${btnClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40`;
    const actionClass = `${btnClass} bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500`;

    return (
        <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            {/* Row 1 */}
            <button type="button" onClick={() => handlePress('C')} className={actionClass}><span className="text-red-500">C</span></button>
            <button type="button" onClick={() => handlePress('(')} className={opClass}>(</button>
            <button type="button" onClick={() => handlePress(')')} className={opClass}>)</button>
            <button type="button" onClick={() => handlePress('/')} className={opClass}>÷</button>

            {/* Row 2 */}
            <button type="button" onClick={() => handlePress('7')} className={numClass}>7</button>
            <button type="button" onClick={() => handlePress('8')} className={numClass}>8</button>
            <button type="button" onClick={() => handlePress('9')} className={numClass}>9</button>
            <button type="button" onClick={() => handlePress('*')} className={opClass}>×</button>

            {/* Row 3 */}
            <button type="button" onClick={() => handlePress('4')} className={numClass}>4</button>
            <button type="button" onClick={() => handlePress('5')} className={numClass}>5</button>
            <button type="button" onClick={() => handlePress('6')} className={numClass}>6</button>
            <button type="button" onClick={() => handlePress('-')} className={opClass}>-</button>

            {/* Row 4 */}
            <button type="button" onClick={() => handlePress('1')} className={numClass}>1</button>
            <button type="button" onClick={() => handlePress('2')} className={numClass}>2</button>
            <button type="button" onClick={() => handlePress('3')} className={numClass}>3</button>
            <button type="button" onClick={() => handlePress('+')} className={opClass}>+</button>

            {/* Row 5 */}
            <button type="button" onClick={() => handlePress('0')} className={`${numClass} col-span-2`}>0</button>
            <button type="button" onClick={() => handlePress('.')} className={numClass}>.</button>
            <button type="button" onClick={() => handlePress('=')} className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30`}>
                <Equal className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Calculator;
