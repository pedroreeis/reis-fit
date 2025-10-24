import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import Icon from './Icon';

interface AnnualCalendarProps {
  sessions: Session[];
  onDayClick?: (date: Date) => void;
}

const AnnualCalendar: React.FC<AnnualCalendarProps> = ({ sessions, onDayClick }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const trainedDays = useMemo(() => {
        return new Set(sessions.map(s => new Date(s.date).toISOString().split('T')[0]));
    }, [sessions]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(viewDate);

    // 0 = Sunday, 1 = Monday...
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day for comparison
    const todayString = new Date().toISOString().split('T')[0];
    
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const calendarDays = [];

    // Add blank days for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="w-10 h-10"></div>);
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day, 12, 0, 0); // Use midday to avoid TZ issues
        const dateString = new Date(year, month, day).toISOString().split('T')[0];
        const isTrained = trainedDays.has(dateString);
        const isToday = dateString === todayString;
        const isFuture = date > today;

        let dayClass = 'w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors duration-200';
        
        if (isFuture) {
            dayClass += ' text-gray-400 dark:text-slate-600 cursor-not-allowed';
        } else {
            dayClass += ' cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700';
        }

        if (isTrained) {
            dayClass += ' bg-green-500 text-white font-bold';
        } else if (isToday) {
            dayClass += ' bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 font-bold';
        } else if (!isFuture) {
            dayClass += ' text-gray-700 dark:text-slate-300';
        }
        
        calendarDays.push(
            <button 
                key={day} 
                className={dayClass}
                onClick={() => !isFuture && onDayClick?.(date)}
                disabled={isFuture}
                aria-label={`Adicionar treino para ${date.toLocaleDateString()}`}
            >
                {day}
            </button>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                    <Icon name="ChevronLeft" />
                </button>
                <h3 className="font-bold text-lg capitalize">{monthName}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                    <Icon name="ChevronRight" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center items-center">
                {weekDays.map((day, index) => <div key={index} className="font-semibold text-xs text-gray-500 dark:text-gray-400">{day}</div>)}
                {calendarDays}
            </div>
        </div>
    );
};

export default AnnualCalendar;