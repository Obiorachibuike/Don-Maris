
'use client'

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold font-headline mb-8 text-center">My Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button 
                            variant="outline" 
                            className={cn("h-24 flex-col gap-2", theme === "light" && "border-primary ring-2 ring-primary")}
                            onClick={() => setTheme("light")}
                        >
                            <Sun className="h-8 w-8" />
                            <span>Light</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            className={cn("h-24 flex-col gap-2", theme === "dark" && "border-primary ring-2 ring-primary")}
                            onClick={() => setTheme("dark")}
                        >
                            <Moon className="h-8 w-8" />
                            <span>Dark</span>
                        </Button>
                            <Button 
                            variant="outline" 
                            className={cn("h-24 flex-col gap-2", theme === "system" && "border-primary ring-2 ring-primary")}
                            onClick={() => setTheme("system")}
                        >
                            <Laptop className="h-8 w-8" />
                            <span>System</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
