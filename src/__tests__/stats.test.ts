import { describe, it, expect } from '@jest/globals';

describe('Stats Calculations', () => {
  it('should calculate win rate correctly', () => {
    const calculateWinRate = (wins: number, total: number): number => {
      if (total === 0) return 0;
      return Math.round((wins / total) * 100);
    };

    // Test case 1: 5 wins out of 10 games
    expect(calculateWinRate(5, 10)).toBe(50);

    // Test case 2: 0 wins out of 5 games
    expect(calculateWinRate(0, 5)).toBe(0);

    // Test case 3: 3 wins out of 3 games
    expect(calculateWinRate(3, 3)).toBe(100);

    // Test case 4: 0 games played
    expect(calculateWinRate(0, 0)).toBe(0);
  });
}); 