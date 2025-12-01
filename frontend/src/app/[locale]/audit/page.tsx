'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuditService, AuditLog } from '@/services/audit.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function AuditPage() {
    const t = useTranslations('Audit');
    const tCommon = useTranslations('Common');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: '',
        entity: '',
    });

    const fetchLogs = useCallback(async () => {
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
    }, [filters.entity, filters.userId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionColor = (
        action: string,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
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
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('filters')}</CardTitle>
                    <CardDescription>{t('filtersDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">{t('userId')}</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('userIdPlaceholder')}
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">{t('entity')}</label>
                        <Input
                            placeholder={t('entityPlaceholder')}
                            value={filters.entity}
                            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button variant="outline" onClick={() => { setFilters({ userId: '', entity: '' }); fetchLogs(); }}>
                            {t('clear')}
                        </Button>
                        <Button onClick={fetchLogs} className="ml-2">
                            {tCommon('search')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('date')}</TableHead>
                            <TableHead>{t('user')}</TableHead>
                            <TableHead>{t('action')}</TableHead>
                            <TableHead>{t('entity')}</TableHead>
                            <TableHead>{t('entityId')}</TableHead>
                            <TableHead>{t('comment')}</TableHead>
                            <TableHead>{t('details')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {t('noLogs')}
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
                                            <span className="font-medium">
                                                {log.user?.name || log.user?.email || `User #${log.userId}`}
                                            </span>
                                            {log.user?.email && log.user?.name && (
                                                <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getActionColor(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.entity}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs">
                                        {log.comment || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate text-xs text-muted-foreground" title={JSON.stringify(log.changes, null, 2)}>
                                            {log.changes ? JSON.stringify(log.changes) : '-'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
