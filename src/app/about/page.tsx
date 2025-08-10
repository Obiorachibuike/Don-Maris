
'use client';

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Eye } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function AboutPage() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const sliderImages = [
    {
        src: "https://placehold.co/600x400.png",
        alt: "Don Maris team working",
        "data-ai-hint": "team collaboration"
    },
    {
        src: "https://placehold.co/600x400.png",
        alt: "Close-up of a high-quality phone case",
        "data-ai-hint": "phone case"
    },
    {
        src: "https://placehold.co/600x400.png",
        alt: "Modern workshop with repair tools",
        "data-ai-hint": "modern workshop"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold font-headline mb-4">About Don Maris</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We believe in quality, style, and the simple idea that your phone accessories should be as personal and reliable as the device they protect.
        </p>
      </section>
      
      <section className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold font-headline mb-4 text-primary">Our Story</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              Founded in 2023, Don Maris Accessories started as a small project fueled by a passion for technology and design. We were tired of generic, low-quality phone accessories that broke easily and lacked personality. We knew there had to be a better way.
            </p>
            <p>
              We set out to create a curated collection of accessories that we would be proud to use ourselves. From durable, stylish cases to powerful, fast-charging tech, every product in our store is hand-picked and tested for quality and performance.
            </p>
            <p>
              Our mission is simple: to be the go-to shop for stylish, reliable phone accessories that you can trust.
            </p>
          </div>
        </div>
         <Carousel 
            plugins={[plugin.current]}
            className="w-full max-w-xl mx-auto" 
            opts={{ loop: true }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {sliderImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-video items-center justify-center p-0 rounded-lg overflow-hidden">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={600}
                            height={400}
                            className="object-cover"
                            data-ai-hint={image['data-ai-hint']}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
      </section>

      <section className="text-center">
         <h2 className="text-3xl font-bold font-headline mb-10">Our Values</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Heart className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold font-headline mb-2">Customer First</h3>
                    <p className="text-muted-foreground">Our customers are at the heart of everything we do. We strive to provide an exceptional experience from start to finish.</p>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Target className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold font-headline mb-2">Quality Obsessed</h3>
                    <p className="text-muted-foreground">We never compromise on quality. Every product is vetted to ensure it meets our high standards of durability and performance.</p>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Eye className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold font-headline mb-2">Design Forward</h3>
                    <p className="text-muted-foreground">We believe tech accessories should be functional and beautiful. We focus on modern designs that complement your style.</p>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold font-headline mb-2">Community Focused</h3>
                    <p className="text-muted-foreground">We're more than just a store; we're a community of tech enthusiasts. We're always here to help and share our knowledge.</p>
                </CardContent>
            </Card>
         </div>
      </section>
    </div>
  );
}
