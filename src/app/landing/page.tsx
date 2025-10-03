
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Lightbulb, Users } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

export default function LandingPage() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

  const teamMembers = [
    {
      name: "Alex Maris",
      role: "Founder & CEO",
      avatar: "https://placehold.co/200x200.png",
      bio: "Alex is the visionary behind Don Maris, driven by a passion for technology and a commitment to quality.",
      data_ai_hint: "founder portrait"
    },
    {
      name: "Jessica Lane",
      role: "Head of Product",
      avatar: "https://placehold.co/200x200.png",
      bio: "Jessica meticulously curates our collection, ensuring every product meets our high standards for design and durability.",
      data_ai_hint: "woman portrait"
    },
    {
        name: "David Chen",
        role: "Lead Technician",
        avatar: "https://placehold.co/200x200.png",
        bio: "With a decade of experience, David leads our repair parts division, sourcing only the best components for our customers.",
        data_ai_hint: "man portrait"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Banner Section */}
      <AnimatedSection>
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://placehold.co/1600x900.png"
            alt="Stylish phone accessories on a modern background"
            fill
            className="object-cover"
            data-ai_hint="modern accessories"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-4 z-10">
            <h1 className="text-4xl md:text-7xl font-bold font-headline leading-tight mb-4 text-shadow-lg">
              Accessorize Your Ambition
            </h1>
            <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover a curated collection of premium accessories designed to complement your life and your tech.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/products">Explore Collection <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </section>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection>
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-4 text-primary">Who We Are</h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p>
                  <strong>Don Maris was born from a simple idea:</strong> your phone is essential, so its accessories should be exceptional. We got tired of the flimsy, uninspired products flooding the market and decided to build something better.
                </p>
                <p>
                  We are a team of designers, tech enthusiasts, and customer-focused individuals dedicated to sourcing and creating accessories that we're proud to use ourselves. From the durability of our cases to the speed of our chargers, every item in our store is a testament to our commitment to quality, style, and innovation.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Award className="h-8 w-8 text-accent" />
                  <CardTitle>Commitment to Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We obsess over the details. Every product is rigorously tested for performance and longevity, so you can trust it to work when you need it most.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Lightbulb className="h-8 w-8 text-accent" />
                  <CardTitle>Design That Inspires</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We believe accessories should be as beautiful as they are functional. Our collection features modern, elegant designs that enhance your personal style.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection>
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-headline">Meet the Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">The passionate individuals dedicated to bringing you the best in mobile accessories.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square relative w-full">
                      <Image src={member.avatar} alt={member.name} fill className="object-cover" data-ai-hint={member.data_ai_hint} />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-accent font-semibold">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

    </div>
  );
}
