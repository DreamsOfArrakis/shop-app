"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/debug")
      .then((res) => res.json())
      .then((data) => {
        setDebugInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-4">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug Information</h1>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Configuration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(debugInfo?.environment || {}).map(
              ([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono text-sm">{key}:</span>
                  {typeof value === "boolean" ? (
                    <Badge variant={value ? "default" : "destructive"}>
                      {value ? "✓ Set" : "✗ Missing"}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {String(value).substring(0, 50)}
                      {String(value).length > 50 ? "..." : ""}
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* GraphQL Endpoint Test */}
      <Card>
        <CardHeader>
          <CardTitle>GraphQL Endpoint Test</CardTitle>
          <CardDescription>Testing GraphQL API connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          {debugInfo?.tests?.graphqlEndpoint ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge
                  variant={
                    debugInfo.tests.graphqlEndpoint.ok
                      ? "default"
                      : "destructive"
                  }
                >
                  {debugInfo.tests.graphqlEndpoint.status}{" "}
                  {debugInfo.tests.graphqlEndpoint.statusText}
                </Badge>
              </div>
              {debugInfo.tests.graphqlEndpoint.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                  <strong>Error:</strong>{" "}
                  {debugInfo.tests.graphqlEndpoint.error}
                </div>
              )}
              {debugInfo.tests.graphqlEndpoint.data && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <strong>Response:</strong>{" "}
                  <pre className="mt-2">
                    {JSON.stringify(
                      debugInfo.tests.graphqlEndpoint.data,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No test data</p>
          )}
        </CardContent>
      </Card>

      {/* URQL Query Test */}
      <Card>
        <CardHeader>
          <CardTitle>URQL Client Test</CardTitle>
          <CardDescription>
            Testing GraphQL queries through URQL
          </CardDescription>
        </CardHeader>
        <CardContent>
          {debugInfo?.tests?.urqlQuery ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge
                  variant={
                    debugInfo.tests.urqlQuery.success
                      ? "default"
                      : "destructive"
                  }
                >
                  {debugInfo.tests.urqlQuery.success ? "✓ Success" : "✗ Failed"}
                </Badge>
              </div>
              {debugInfo.tests.urqlQuery.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                  <strong>Error:</strong>
                  <pre className="mt-2">
                    {JSON.stringify(debugInfo.tests.urqlQuery.error, null, 2)}
                  </pre>
                </div>
              )}
              {debugInfo.tests.urqlQuery.data && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <strong>Data Keys:</strong>{" "}
                  {debugInfo.tests.urqlQuery.data.join(", ")}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No test data</p>
          )}
        </CardContent>
      </Card>

      {/* REST Endpoint Test */}
      <Card>
        <CardHeader>
          <CardTitle>REST Endpoint Test</CardTitle>
          <CardDescription>
            Testing Supabase REST API (fallback)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {debugInfo?.tests?.restEndpoint ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge
                  variant={
                    debugInfo.tests.restEndpoint.ok ? "default" : "destructive"
                  }
                >
                  {debugInfo.tests.restEndpoint.status}
                </Badge>
              </div>
              {debugInfo.tests.restEndpoint.hasData && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <strong>✓ REST API works!</strong> Found{" "}
                  {debugInfo.tests.restEndpoint.dataCount} record(s)
                </div>
              )}
              {debugInfo.tests.restEndpoint.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                  <strong>Error:</strong> {debugInfo.tests.restEndpoint.error}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No test data</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button onClick={() => window.location.reload()}>
          Refresh Debug Info
        </Button>
      </div>
    </div>
  );
}
