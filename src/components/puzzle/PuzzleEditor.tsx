
import { useRef } from 'react';
import { X } from 'lucide-react';

interface PuzzlePiece {
  id: string;
  text: string;
  order: number;
  position: { x: number; y: number };
}

interface PuzzleEditorProps {
  pieces: PuzzlePiece[];
  draggedPiece: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemovePiece: (id: string) => void;
}

const PuzzleEditor = ({ 
  pieces, 
  draggedPiece,
  onDragStart,
  onDragOver,
  onDrop,
  onRemovePiece
}: PuzzleEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg h-64 mb-6 p-4 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          draggable
          onDragStart={() => onDragStart(piece.id)}
          className="absolute bg-kid-blue text-white px-3 py-1 rounded-lg cursor-move shadow-md flex items-center gap-1"
          style={{
            left: `${piece.position.x}px`,
            top: `${piece.position.y}px`,
            touchAction: 'none',
            zIndex: draggedPiece === piece.id ? 10 : 1,
            transition: draggedPiece === piece.id ? 'none' : 'all 0.2s ease'
          }}
        >
          {piece.text}
          <button 
            onClick={() => onRemovePiece(piece.id)}
            className="text-white/80 hover:text-white ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      {pieces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Drag words here to form a question
        </div>
      )}
    </div>
  );
};

export default PuzzleEditor;
