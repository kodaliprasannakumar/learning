
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomQuestion = ({ value, onChange }: CustomQuestionProps) => {
  return (
    <div className="mb-6">
      <Label htmlFor="custom-question">Or type your own question:</Label>
      <Input
        id="custom-question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a question for the AI..."
        className="mt-1"
      />
    </div>
  );
};

export default CustomQuestion;
