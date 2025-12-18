'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';

interface Risk {
    _id: string;
    Title: string;
    Description?: string;
    'Risk Status': string;
    createdAt?: string;
}

export default function APITestPage() {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [riskStatus, setRiskStatus] = useState('Open');
    const [projectCode, setProjectCode] = useState('TEST-001');

    const fetchRisks = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/risks');
            if (!response.ok) throw new Error('Failed to fetch risks');
            const data = await response.json();
            setRisks(data);
            toast({
                title: 'Success',
                description: `Loaded ${data.length} risk(s) from MongoDB`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/risks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Title: title,
                    Description: description,
                    'Risk Status': riskStatus,
                    'Project Code': projectCode,
                    Probability: 0.5,
                    'Impact Rating (0.05-0.8)': 0.3,
                }),
            });

            if (!response.ok) throw new Error('Failed to create risk');

            toast({
                title: 'Success',
                description: 'Risk created successfully in MongoDB!',
            });

            // Clear form
            setTitle('');
            setDescription('');
            setRiskStatus('Open');

            // Refresh list
            fetchRisks();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/risks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete risk');

            toast({
                title: 'Success',
                description: 'Risk deleted successfully',
            });

            fetchRisks();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchRisks();
    }, []);

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">MongoDB API Test Page</h1>
                <p className="text-muted-foreground">
                    Test your MongoDB connection by creating and viewing risks
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Risk Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Risk</CardTitle>
                        <CardDescription>
                            Add a risk to test MongoDB integration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter risk title"
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter risk description"
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Risk Status</Label>
                                <Select value={riskStatus} onValueChange={setRiskStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Mitigated">Mitigated</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                        <SelectItem value="Transferred">Transferred</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="projectCode">Project Code</Label>
                                <Input
                                    id="projectCode"
                                    value={projectCode}
                                    onChange={(e) => setProjectCode(e.target.value)}
                                    placeholder="TEST-001"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? 'Creating...' : 'Create Risk'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Risks List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Saved Risks</CardTitle>
                                <CardDescription>
                                    All risks stored in MongoDB
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchRisks}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : risks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No risks found. Create one to get started!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {risks.map((risk) => (
                                    <div
                                        key={risk._id}
                                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{risk.Title}</h3>
                                                {risk.Description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {risk.Description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                        {risk['Risk Status']}
                                                    </span>
                                                    {risk.createdAt && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(risk.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(risk._id)}
                                                className="shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Connection Status */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Database:</span>
                            <span className="text-sm font-medium">MongoDB</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Risks Loaded:</span>
                            <span className="text-sm font-medium">{risks.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="text-sm font-medium text-green-600">✓ Connected</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
