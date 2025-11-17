
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { IAdminLog } from '@/models/AdminLog';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

async function fetchAdminLogs(): Promise<IAdminLog[]> {
    try {
        const response = await fetch('/api/admin/activities');
        if (!response.ok) {
            throw new Error('Failed to fetch admin logs.');
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch admin logs:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load admin activity logs.'
        });
        return [];
    }
}

export default function AdminActivitiesPage() {
    const [logs, setLogs] = useState<IAdminLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            setIsLoading(true);
            const fetchedLogs = await fetchAdminLogs();
            setLogs(fetchedLogs);
            setIsLoading(false);
        };
        loadLogs();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Activity Log</CardTitle>
                <CardDescription>A record of all administrative actions taken in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No administrative activities have been logged yet.
                                </TableCell>
                            </TableRow>
                        ) : logs.map(log => (
                            <TableRow key={log._id}>
                                <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                                <TableCell>
                                    <Link href={`/admin/users/${log.adminId}`} className="text-primary hover:underline">
                                        {log.adminName}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{log.action.replace(/_/g, ' ')}</Badge>
                                </TableCell>
                                <TableCell>
                                     <Link href={`/admin/users/${log.targetId}`} className="text-primary hover:underline">
                                        {log.targetName || log.targetId}
                                     </Link>
                                </TableCell>
                                <TableCell>{log.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
