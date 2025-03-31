import React from 'react';

interface GameCardProps {
  champion: string;
  role: string;
  result: 'win' | 'loss';
  date: string;
}

export const GameCard: React.FC<GameCardProps> = ({ champion, role, result, date }) => {
  return (
    <div className={`p-4 rounded-lg border ${result === 'win' ? 'bg-green-100' : 'bg-red-100'}`}>
      <h3 className="text-lg font-bold">{champion}</h3>
      <p className="text-sm text-gray-600">{role}</p>
      <p className={`text-sm font-semibold ${result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
        {result.toUpperCase()}
      </p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  );
}; 