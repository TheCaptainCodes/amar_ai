import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface NoteGeneratorProps {
  companionName: string;
}

export function NoteGenerator({ companionName }: NoteGeneratorProps) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('detailed');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/companions/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companionName,
          subject,
          topic,
          style,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      setPdfUrl(data.pdfUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Generate Study Notes</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Mathematics, Physics, History"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Quadratic Equations, Newton's Laws, World War II"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Style</label>
          <Select
            value={style}
            onValueChange={setStyle}
          >
            <option value="detailed">Detailed</option>
            <option value="concise">Concise</option>
            <option value="visual">Visual Focus</option>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !subject || !topic}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Notes'
          )}
        </Button>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {pdfUrl && (
          <div className="mt-4">
            <a
              href={`${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Generated Notes
            </a>
          </div>
        )}
      </div>
    </Card>
  );
} 