
interface AiResponseProps {
  response: string;
}

const AiResponse = ({ response }: AiResponseProps) => {
  if (!response) return null;
  
  return (
    <div className="mt-6 bg-muted p-4 rounded-lg animate-fade-in">
      <h3 className="text-lg font-medium mb-2">Answer:</h3>
      <p className="text-muted-foreground">{response}</p>
    </div>
  );
};

export default AiResponse;
