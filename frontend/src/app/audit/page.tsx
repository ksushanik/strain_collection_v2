'use client';

import { useEffect, useState } from 'react';
import { AuditService, AuditLog } from '@/services/audit.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: '',
        entity: '',
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await AuditService.getLogs({
                userId: filters.userId ? parseInt(filters.userId) : undefined,
                entity: filters.entity || undefined,
            });
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'default'; // usually black/primary
            case 'UPDATE':
                return 'secondary'; // usually gray
            case 'DELETE':
                return 'destructive'; // red
            default:
                return 'outline';
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="userId" className="text-sm font-medium">
                                User ID
                            </label>
                            <Input
                                id="userId"
                                placeholder="Filter by User ID"
                                value={filters.userId}
                                onChange={(e) =>
                                    setFilters({ ...filters, userId: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="entity" className="text-sm font-medium">
                                Entity
                            </label>
                            <Input
                                id="entity"
                                placeholder="Filter by Entity (e.g. Strain)"
                                value={filters.entity}
                                onChange={(e) =>
                                    setFilters({ ...filters, entity: e.target.value })
                                }
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.user?.email || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">ID: {log.userId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionColor(log.action) as any}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.entity}</TableCell>
                                        <TableCell>{log.entityId}</TableCell>
                                        <TableCell className="max-w-md truncate" title={JSON.stringify(log.changes)}>
                                            {log.comment ? (
                                                <span className="italic text-muted-foreground">{log.comment}</span>
                                            ) : (
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {JSON.stringify(log.changes || {})}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
