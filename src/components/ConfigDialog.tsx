import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, TestTube } from "lucide-react";
import { sylphieAPI } from "@/lib/api";

export const ConfigDialog = () => {
  const [webhookUrl, setWebhookUrl] = useState("https://shubh123456.app.n8n.cloud/webhook-test/62c21d28-be46-45f3-a0f3-9ee500889a92");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    if (webhookUrl) {
      sylphieAPI.updateConfig({ baseURL: webhookUrl });
      localStorage.setItem('sylphie_webhook_url', webhookUrl);
      setTestResult("Configuration saved!");
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      sylphieAPI.updateConfig({ baseURL: webhookUrl });
      const isConnected = await sylphieAPI.testConnection();
      
      if (isConnected) {
        setTestResult("✅ Connection successful!");
      } else {
        setTestResult("❌ Connection failed. Check your webhook URL.");
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            N8N Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">N8N Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/sylphie"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your N8N webhook URL to connect SYLPHIE to your AI agent.
            </p>
          </div>
          
          {testResult && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTest} 
              disabled={!webhookUrl || isTesting}
              variant="outline"
              className="flex-1"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!webhookUrl}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
