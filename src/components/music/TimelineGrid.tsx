/**
 * Timeline Grid - Grid Component for Music Timeline
 * Provides the visual grid system for note placement and timeline navigation
 */

import React from 'react';

interface TimelineGridProps {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  measures: number;
  beatsPerMeasure: number;
  subdivisions: number;
}

export default function TimelineGrid({
  width,
  height,
  cellWidth,
  cellHeight,
  measures,
  beatsPerMeasure,
  subdivisions
}: TimelineGridProps) {
  const totalSubdivisions = measures * beatsPerMeasure * subdivisions;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
    >
      {/* Vertical grid lines */}
      {Array.from({ length: totalSubdivisions + 1 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellWidth}
          y1={0}
          x2={i * cellWidth}
          y2={height}
          stroke={
            i % (subdivisions * beatsPerMeasure) === 0
              ? '#666' // Measure lines
              : i % subdivisions === 0
              ? '#999' // Beat lines
              : '#ddd' // Subdivision lines
          }
          strokeWidth={i % (subdivisions * beatsPerMeasure) === 0 ? 2 : 1}
        />
      ))}

      {/* Horizontal grid lines */}
      {Array.from({ length: Math.ceil(height / cellHeight) + 1 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellHeight}
          x2={width}
          y2={i * cellHeight}
          stroke="#ddd"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
} 