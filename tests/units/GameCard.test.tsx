import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameCard } from '../../src/components/GameCard';

describe('GameCard', () => {
  const mockProps = {
    champion: 'Ahri',
    role: 'Mid',
    result: 'win' as const,
    date: '2024-03-31',
  };

  it('renders game card with correct information', () => {
    render(<GameCard {...mockProps} />);

    // Check if all information is displayed
    expect(screen.getByText('Ahri')).toBeInTheDocument();
    expect(screen.getByText('Mid')).toBeInTheDocument();
    expect(screen.getByText('WIN')).toBeInTheDocument();
    expect(screen.getByText('2024-03-31')).toBeInTheDocument();
  });

  it('applies correct styling for win result', () => {
    render(<GameCard {...mockProps} />);
    const resultElement = screen.getByText('WIN');
    expect(resultElement).toHaveClass('text-green-600');
  });

  it('applies correct styling for loss result', () => {
    const lossProps = { ...mockProps, result: 'loss' as const };
    render(<GameCard {...lossProps} />);
    const resultElement = screen.getByText('LOSS');
    expect(resultElement).toHaveClass('text-red-600');
  });
}); 