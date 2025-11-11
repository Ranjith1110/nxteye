import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "./Hero.css";

import "swiper/css";
// import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import banner1 from "/assets/home-hero/1.png";
import banner2 from "/assets/home-hero/2.png";
import banner3 from "/assets/home-hero/3.png";
import banner4 from "/assets/home-hero/4.jpg";

const Hero = () => {
    const slides = [
        {
            image: banner1
        },
        {
            image: banner2
        },
        {
            image: banner3
        },
        {
            image: banner4
        }
    ];

    return (
        <section className="w-full h-[80vh] md:h-[55vh] overflow-hidden relative">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                slidesPerView={1}
                loop={true}
                effect="fade"
                autoplay={{
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation
                className="h-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="relative w-full h-full flex items-center justify-center bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.image})`,
                            }}
                        >
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
