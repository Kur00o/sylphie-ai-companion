import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface JsonMessageProps {
  content: string;
}

export const JsonMessage = ({ content }: JsonMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isJsonContent = isJson(content);

  return (
    <div className="w-full space-y-2">
      {/* Message content */}
      <div className="text-sm md:text-base leading-relaxed">
        {isJsonContent ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>JSON Response</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            {isExpanded ? (
              <pre className="bg-muted/30 p-3 rounded-lg text-xs overflow-x-auto border whitespace-pre-wrap break-words">
                <code>{formatJson(content)}</code>
              </pre>
            ) : (
              <div className="bg-muted/20 p-2 rounded text-sm">
                <span className="text-muted-foreground">JSON data received</span>
                <span className="text-muted-foreground ml-2">
                  ({content.length} characters)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        )}
      </div>
    </div>
  );
};
