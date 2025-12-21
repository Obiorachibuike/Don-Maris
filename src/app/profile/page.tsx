'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSession } from '@/contexts/SessionProvider';
import { EditProfileForm } from '@/components/edit-profile-form';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Mail, Calendar, Pencil, User } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const session = useSession();

    const user = session?.user ?? null;
    const isLoading = session?.isLoading ?? true;
    const refetchUser = session?.refetchUser;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    /* -------------------- AUTH GUARD -------------------- */
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <User className="h-10 w-10 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">

                {/* COVER / HEADER */}
                <div className="relative rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-4 top-4"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-28 w-28 border-4 border-background">
                            <AvatarImage src={user.avatar || ''} />
                            <AvatarFallback className="text-3xl">
                                {user.name?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground mt-1 capitalize">
                                {user.role}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                <Badge variant="secondary">{user.role}</Badge>
                                {user.email && <Badge variant="outline">Verified</Badge>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ABOUT SECTION */}
                <Card>
                    <CardContent className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold">About</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {user.bio || 'No bio added yet.'}
                        </p>
                    </CardContent>
                </Card>

                {/* CONTACT INFO */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Contact Information</h2>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Mail className="h-5 w-5" />
                            <a
                                href={`mailto:${user.email}`}
                                className="hover:text-primary transition-colors"
                            >
                                {user.email}
                            </a>
                        </div>

                        {user.dateJoined && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Calendar className="h-5 w-5" />
                                <span>
                                    Joined on {new Date(user.dateJoined).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* EDIT PROFILE MODAL */}
            <EditProfileForm
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                user={user}
                onProfileUpdate={refetchUser}
            />
        </>
    );
}