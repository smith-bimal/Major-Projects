const tl = gsap.timeline();

// tl.from(".banner-msg", {
//   opacity: 0,
//   duration: 1,
//   delay: 1,
//   ease: "power3.inOut",
// });

tl.to(".banner", {
  delay: 2,
  y: "-200%",
  duration: 1.5,
  ease: "power3.inOut",
});

gsap.from(".banner-msg span", {
    opacity:0,
    duration: 1,
    delay: 1,
    stagger: 0.3
})

// tl.from(".gsap-hero",{
//     y:-20,
//     opacity:0,
//     duration: 0.5,
//     stagger: 0.2
// })

// tl.from(".gsap-discover", {
//     opacity:0,
//     y:20,
//     duration: 2,
//     ease: "back.out(1)",
//     stagger: 0.3
// })

// gsap.from("#most-visit-head", {
//     x:50,
//     opacity:0,
//     duration: 1,
//     scrollTrigger: {
//         trigger:"#most-visit-head",
//         start: "top 75%",
//     }
// })

// gsap.from(".most-visit-content", {
//     opacity:0,
//     duration: 1,
//     stagger: 0.3,
//     scrollTrigger: {
//         trigger:".most-visit-content:nth-of-type(1)",
//         start: "top 75%",
//         end: "top 0%",
//     }
// })

// gsap.from("#most-visit-hr", {
//   opacity: 0,
//   duration: 1,
//   stagger: 0.3,
//   scrollTrigger: {
//     trigger: "#most-visit-hr",
//     start: "top 75%",
//     end: "top 0%",
//   },
// });

// gsap.from("#promo-head", {
//   x: 50,
//   opacity: 0,
//   duration: 1,
//   scrollTrigger: {
//     trigger: "#promo-head",
//     start: "top 75%",
//   },
// });

// gsap.from("#promo-content-1", {
//   x: -200,
//   opacity: 0,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: "#promo-content-1",
//     start: "top 75%",
//   },
// });

// gsap.from("#promo-content-2", {
//   x: 200,
//   opacity: 0,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: "#promo-content-2",
//     start: "top 75%",
//   },
// });

// gsap.from(".demo-logo-container img", {
//   y: 100,
//   opacity: 0,
//   duration: 0.75,
//   ease: "back.out(1)",
//   stagger: 0.2,
//   scrollTrigger: {
//     trigger: ".demo-logo-container",
//     start: "top 75%",
//   },
// });

// gsap.from(".booking-card", {
//   x: -200,
//   opacity: 0,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: ".booking-card",
//     start: "top 75%",
//   },
// });

// gsap.from(".available-card", {
//   x: 200,
//   opacity: 0,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: ".available-card",
//     start: "top 75%",
//   },
// });

// gsap.from(".accommodation", {
//   opacity: 0,
//   y: 500,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: ".accommodation",
//     start: "top 75%",
//   },
// });

// gsap.from("footer", {
//   opacity: 0,
//   duration: 1.5,
//   ease: "power3.inOut",
//   scrollTrigger: {
//     trigger: "footer",
//     start: "top 75%",
//   },
// });
 
