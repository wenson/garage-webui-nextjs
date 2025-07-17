'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Copy } from 'lucide-react';

interface Bucket {
  id: string;
  globalAliases?: string[];
}

interface S3ConnectionInfoProps {
  bucket: Bucket;
  onCopyToClipboard: (text: string) => void;
}

export function S3ConnectionInfo({ bucket, onCopyToClipboard }: S3ConnectionInfoProps) {
  const endpointUrl = "http://localhost:3900";
  const bucketName = bucket.globalAliases?.[0] || bucket.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" />
          S3 连接信息
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Endpoint URL</label>
            <div className="flex items-center space-x-2">
              <Input
                value={endpointUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(endpointUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bucket Name</label>
            <div className="flex items-center space-x-2">
              <Input
                value={bucketName}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(bucketName)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
