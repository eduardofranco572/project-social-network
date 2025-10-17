"use client";

import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import '../css/auth.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex w-full max-w-4xl h-[600px] bg-[#1c1c1c] rounded-lg shadow-lg overflow-hidden">
        <div className="container-mark hidden md:flex flex-col justify-between w-1/2 text-white">
          <div className="text-left text-center">
            <h1 className="text-2xl font-bold text-center">Bem-vindo à nossa Rede Social</h1>
            <p className="text-gray-300 mt-2">Conecte-se e compartilhe momentos.</p>
          </div>
          <div className="flex items-center justify-center flex-col">
            <Carousel setApi={setApi} className="w-full max-w-xs self-center">
              <CarouselContent>
                <CarouselItem>
                  <p className="text-center text-lg italic">"A melhor maneira de se conectar com velhos amigos."</p>
                </CarouselItem>
                <CarouselItem>
                  <p className="text-center text-lg italic">"Compartilhe suas paixões com o mundo."</p>
                </CarouselItem>
                <CarouselItem>
                  <p className="text-center text-lg italic">"Encontre novas comunidades e interesses."</p>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
            
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${current === i ? 'bg-white' : 'bg-gray-500 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#1c1c1c]">
          {children}
        </div>
      </div>
    </div>
  );
}