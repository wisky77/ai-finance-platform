"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// AI moved server-side via /api/generate-insight
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'




export function AIInsightBox({ transactions }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    setInsight(""); // Reset previous insight

    try {
      // Call server API to generate insight securely
      const res = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setInsight(data.insight || 'No insight generated.');
      } else {
        throw new Error(data.message || 'Failed to generate insight');
      }
    } catch (err) {
      console.error(err);
      setInsight("Something went wrong while generating insight.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-secondary/50 border-2 border-dashed">
      <CardHeader>
        <h2 className="text-lg font-semibold">AI Financial Insights</h2>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click below to get personalized insights based on your transactions.
        </p>

        <Button onClick={handleGenerateInsight} disabled={loading}>
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>

        {insight && (
          <div className="mt-4 bg-background p-4 border rounded-lg text-sm">
          <Markdown remarkPlugins={[remarkGfm]}>{String(insight)}</Markdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
