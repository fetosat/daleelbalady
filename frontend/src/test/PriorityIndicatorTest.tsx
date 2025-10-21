import React from 'react';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';

export function PriorityIndicatorTest() {
  return (
    <div className="p-4 space-y-4 bg-white">
      <h2 className="text-xl font-bold mb-4">PriorityIndicator Test Cases</h2>
      
      {/* Normal cases */}
      <div>
        <h3 className="font-semibold mb-2">Normal Cases:</h3>
        <PriorityIndicator priority={8} variant="bars" showLabel />
        <br />
        <PriorityIndicator priority={5} variant="badge" showLabel />
        <br />
        <PriorityIndicator priority={3} variant="stars" showLabel />
      </div>

      {/* Edge cases that were causing errors */}
      <div>
        <h3 className="font-semibold mb-2">Edge Cases (should not crash):</h3>
        {/* @ts-ignore - Testing with invalid props */}
        <PriorityIndicator priority={undefined} variant="bars" showLabel />
        <br />
        {/* @ts-ignore - Testing with invalid props */}
        <PriorityIndicator priority={null} variant="bars" showLabel />
        <br />
        {/* @ts-ignore - Testing with invalid props */}
        <PriorityIndicator priority="high" variant="bars" showLabel />
        <br />
        {/* @ts-ignore - Testing with invalid size */}
        <PriorityIndicator priority={7} variant="bars" size="invalid" showLabel />
        <br />
        {/* @ts-ignore - Testing with invalid variant */}
        <PriorityIndicator priority={6} variant="invalid" showLabel />
      </div>

      {/* Medical service priority (what backend sends) */}
      <div>
        <h3 className="font-semibold mb-2">Medical Service Priority (priority: 8):</h3>
        <PriorityIndicator priority={8} variant="bars" showLabel />
        <br />
        <PriorityIndicator priority={8} variant="badge" showLabel />
      </div>

      {/* Other service priority (what backend sends) */}
      <div>
        <h3 className="font-semibold mb-2">Other Service Priority (priority: 5):</h3>
        <PriorityIndicator priority={5} variant="bars" showLabel />
        <br />
        <PriorityIndicator priority={5} variant="badge" showLabel />
      </div>
    </div>
  );
}

export default PriorityIndicatorTest;
