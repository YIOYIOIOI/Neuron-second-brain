import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function LandingNew() {
  const { t } = useTranslation();
  const { theme, language } = useStore();
  const [loading, setLoading] = useState(() => {
    return !window.location.search.includes('skipLoading');
  });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorScale, setCursorScale] = useState(1);
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  const [transitioning, setTransitioning] = useState(false);
  const [stars, setStars] = useState(() =>
    [...Array(20)].map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 40,
      opacity: 0.3 + Math.random() * 0.4,
      offsetX: 0,
      offsetY: 0
    }))
  );
  const [flowDots, setFlowDots] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; opacity: number; life: number }>>([]);
  const flowDotsRef = useRef<Array<{ id: number; x: number; y: number; vx: number; vy: number; opacity: number; life: number }>>([]);
  const nextDotId = useRef(0);
  const animationFrameRef = useRef<number>();
  const heroRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const flow3Ref = useRef<HTMLDivElement>(null);
  const flow5Ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Mark as visited after loading completes
  useEffect(() => {
    if (!loading) {
      // No longer needed
    }
  }, [loading]);

  // Smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Custom cursor and star repulsion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Magnetic button effect
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - buttonCenterX, 2) + Math.pow(e.clientY - buttonCenterY, 2)
        );

        if (distance < 100) {
          const strength = 0.3;
          const offsetX = (e.clientX - buttonCenterX) * strength;
          const offsetY = (e.clientY - buttonCenterY) * strength;
          setButtonOffset({ x: offsetX, y: offsetY });
        } else {
          setButtonOffset({ x: 0, y: 0 });
        }
      }

      // Firefly repulsion effect
      if (flowRef.current) {
        const mouseXPercent = (e.clientX / window.innerWidth) * 100;
        const mouseYPercent = (e.clientY / (window.innerHeight * 0.8)) * 100;

        flowDotsRef.current = flowDotsRef.current.map(dot => {
          const dx = dot.x - mouseXPercent;
          const dy = dot.y - mouseYPercent;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 3 && distance > 0) {
            const angle = Math.atan2(dy, dx);
            const pushX = Math.cos(angle) * 0.05;
            const pushY = Math.sin(angle) * 0.05;
            return { ...dot, vx: dot.vx + pushX, vy: dot.vy + pushY };
          }
          return dot;
        });
      }

      // Star repulsion effect
      setStars(prevStars =>
        prevStars.map(star => {
          const starX = (window.innerWidth * star.x) / 100;
          const starY = (window.innerHeight * star.y) / 100;
          const dx = starX - e.clientX;
          const dy = starY - e.clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            const offsetX = (dx / distance) * force * 20;
            const offsetY = (dy / distance) * force * 20;
            return { ...star, offsetX, offsetY };
          }
          return { ...star, offsetX: 0, offsetY: 0 };
        })
      );
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Loading animation
  useEffect(() => {
    if (!loading) return;

    const tl = gsap.timeline();
    tl.to('.loading-progress', {
      width: '100%',
      duration: 2.5,
      ease: 'power2.inOut',
      delay: 1.8
    })
    .to('.loading-screen', {
      y: '-100%',
      duration: 1.2,
      ease: 'power4.inOut',
      delay: 0.5,
      onComplete: () => setLoading(false)
    });

    return () => tl.kill();
  }, [loading]);

  // Hero reveal animation
  useEffect(() => {
    if (loading || !heroRef.current) return;

    const heroSection = heroRef.current.closest('section');
    const tl = gsap.timeline();

    tl.to(heroSection, {
      opacity: 1,
      duration: 0
    });

    // Neuron 标题逐字母钻出
    const solidLayer = heroRef.current.querySelector('.hero-line-wrapper:first-child .hero-line > div:first-child');
    const outlineLayer = heroRef.current.querySelector('.hero-line-wrapper:first-child .hero-line > div:last-child');

    if (solidLayer && outlineLayer) {
      const text = solidLayer.textContent || '';
      const outlineText = outlineLayer.textContent || '';
      const wrappedText = text.split('').map(char =>
        `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      const wrappedOutlineText = outlineText.split('').map(char =>
        `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');

      solidLayer.innerHTML = wrappedText;
      outlineLayer.innerHTML = wrappedOutlineText;

      const chars = solidLayer.querySelectorAll('span');
      tl.set(chars, { y: '120%' });
      chars.forEach((char, i) => {
        tl.to(char, {
          y: '0%',
          duration: 0.2,
          ease: 'power3.out'
        }, i * 0.2);
      });

      const outlineChars = outlineLayer.querySelectorAll('span');
      tl.set(outlineChars, { y: '120%' }, 0);
      outlineChars.forEach((char, i) => {
        tl.to(char, {
          y: '0%',
          duration: 0.2,
          ease: 'power3.out'
        }, i * 0.2);
      });
    }

    // 描述文字从左滑入
    const descLine = heroRef.current.querySelector('.hero-line-wrapper:last-child .hero-line');
    if (descLine) {
      tl.fromTo(descLine,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 0.6, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      );
    }

    // 右侧内容动画
    const rightContent = heroSection?.querySelector('.right-side-content');
    const topLine = heroSection?.querySelector('.right-line-top');
    const bottomLine = heroSection?.querySelector('.right-line-bottom');
    const buttonText = heroSection?.querySelector('.button-text');
    const rightText = heroSection?.querySelector('.right-text');

    if (rightContent && topLine && bottomLine && buttonText && rightText) {
      tl.to(rightContent, { opacity: 1, duration: 0 }, '+=0')
        .to(topLine, { height: '35vh', duration: 0.8, ease: 'power2.out' })
        .to(buttonText, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.3')
        .to(bottomLine, { height: '35vh', duration: 0.8, ease: 'power2.out' }, '-=0.4')
        .to(rightText, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, '+=0.2');
    }

    // 描述下方的线从左向右淡入
    const descUnderline = heroRef.current.querySelector('.desc-underline');
    if (descUnderline) {
      tl.fromTo(descUnderline,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.3, duration: 1.2, ease: 'power2.out' },
        '-=2.5'
      );
    }
  }, [loading]);

  // Flow dots animation
  useEffect(() => {
    if (loading || !flowRef.current) return;

    const interval = setInterval(() => {
      const newDot = {
        id: nextDotId.current++,
        x: Math.random() * 50 + 2,
        y: 78 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        opacity: 0,
        life: 0
      };
      flowDotsRef.current = [...flowDotsRef.current, newDot].slice(-20);
      setFlowDots([...flowDotsRef.current]);
    }, 2000);

    const animate = () => {
      flowDotsRef.current = flowDotsRef.current.map(dot => {
        let newVx = dot.vx * 0.99;
        let newVy = dot.vy * 0.99;

        let newX = dot.x + newVx;
        let newY = dot.y + newVy;

        if (newX < 0 || newX > 54) newVx = -newVx;
        if (newY < 76 || newY > 88) newVy = -newVy;

        newX = Math.max(0, Math.min(54, newX));
        newY = Math.max(76, Math.min(88, newY));

        const newLife = dot.life + 1;
        let newOpacity = dot.opacity;

        if (newLife < 60) {
          newOpacity = newLife / 60;
        } else if (newLife > 3540) {
          newOpacity = Math.max(0, 1 - (newLife - 3540) / 60);
        } else {
          newOpacity = 0.3 + Math.sin(newLife * 0.05) * 0.3;
        }

        return {
          ...dot,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          opacity: newOpacity,
          life: newLife
        };
      }).filter(dot => dot.life < 3600);

      setFlowDots([...flowDotsRef.current]);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading]);

  // Flow scroll animations
  useEffect(() => {
    if (loading || !flowRef.current) return;

    const blocks = flowRef.current.querySelectorAll('.flow-block');

    blocks.forEach((block, i) => {
      // Set initial state
      gsap.set(block, { opacity: 0, y: 60, filter: 'blur(8px)' });

      // Create timeline for each block
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
          onEnter: () => console.log(`Block ${i} entered`),
          onUpdate: (self) => console.log(`Block ${i} progress: ${self.progress.toFixed(2)}`),
        }
      });

      // Reveal animation - 占30%的滚动距离
      tl.to(block, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 3 })
        // Stay at full opacity with parallax - 占50%的滚动距离
        .to(block, { y: -20, duration: 5 })
        // Fade out - 占20%的滚动距离
        .to(block, { opacity: 0.3, duration: 2 });
    });

    // Connection lines
    const lines = flowRef.current.querySelectorAll('.connection-line');
    lines.forEach((line) => {
      gsap.fromTo(line,
        { height: '0%', opacity: 0 },
        {
          height: '100%',
          opacity: 0.3,
          scrollTrigger: {
            trigger: line,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          }
        }
      );
    });

    // Stagger text for block 4
    const crystalChars = flowRef.current.querySelectorAll('.crystal-char');
    crystalChars.forEach((char, i) => {
      gsap.fromTo(char,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: '.flow-block-4',
            start: 'top 70%',
            end: 'top 40%',
            scrub: true,
          },
          delay: i * 0.1
        }
      );
    });

    // Timeline Section animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      gsap.fromTo(item,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          }
        }
      );

      const details = item.querySelectorAll('.timeline-detail-item');
      details.forEach((detail, j) => {
        gsap.fromTo(detail,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: item,
              start: 'top 70%',
              end: 'top 40%',
              scrub: true,
            },
            delay: j * 0.2
          }
        );
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [loading, isDark]);

  return (
    <>
      {/* Loading Screen */}
      {loading && (
        <div className="loading-screen fixed inset-0 bg-[#0a0a0a] z-[1000] flex items-center justify-center">
        <div className="w-[90vw] max-w-6xl">
          <motion.div className="mb-20 relative">
            <motion.div
              animate={{
                opacity: [1, 0, 1, 0, 1],
                x: ['0vw', '0vw', '25vw', '25vw', '50vw']
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                times: [0, 0.33, 0.33, 0.66, 0.66],
                ease: "linear"
              }}
              className="text-sm font-mono text-white/30 tracking-[0.4em] uppercase mb-16"
            >
              Personal Knowledge System
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-[14vw] md:text-[12vw] font-black text-white mb-8 tracking-tighter leading-[0.85] -ml-2"
            >
              Neuron
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-3xl md:text-5xl text-white/80 font-light mb-8 tracking-wide ml-[8vw]"
            >
              正在初始化知识库
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-xl md:text-3xl text-white/60 font-light mb-4 ml-[25vw]"
            >
              连接神经元 · 构建思维网络 ·
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/90"
              >
                {' '}即刻启动
              </motion.span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="relative h-[3px] bg-white/10 overflow-hidden ml-[5vw]"
          >
            <div className="loading-progress absolute left-0 top-0 h-full w-0 bg-white"></div>
          </motion.div>
        </div>
      </div>
      )}

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 8,
          y: cursorPos.y - 8,
          scale: cursorScale,
          opacity: cursorScale > 1 ? 0.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 1000,
          damping: 50,
          mass: 0.1
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-white rounded-full pointer-events-none z-[9998] mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 20,
          y: cursorPos.y - 20,
          scale: cursorScale > 1 ? 1.5 : 1,
          opacity: cursorScale > 1 ? 0 : 0.2,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          mass: 0.5
        }}
      />

      <div className={`${isDark ? 'bg-[#0a0a0a] text-[#fafaf8]' : 'bg-[#fafaf8] text-[#0a0a0a]'} overflow-x-hidden cursor-none`}>
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-8"
        >
          <motion.button
            className={`group text-sm uppercase tracking-widest ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} transition-opacity flex flex-col gap-1.5`}
            whileHover="hover"
          >
            <motion.span
              className="w-6 h-[1px] bg-current origin-left"
              variants={{ hover: { scaleX: 1.3 } }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="w-6 h-[1px] bg-current origin-left"
              variants={{ hover: { scaleX: 0.7 } }}
              transition={{ duration: 0.3, delay: 0.05 }}
            />
            <motion.span
              className="w-6 h-[1px] bg-current origin-left"
              variants={{ hover: { scaleX: 1.3 } }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.button>
          <motion.div
            style={{ scaleY: useTransform(useScroll().scrollYProgress, [0, 0.01], [1, 0]) }}
            className="flex gap-12 origin-top mr-[10vw]"
          >
            <button className={`text-lg uppercase tracking-widest ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} hover:opacity-60 transition-opacity`}>
              {language === 'zh' ? '关于' : 'About'}
            </button>
            <button className={`text-lg uppercase tracking-widest ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} hover:opacity-60 transition-opacity`}>
              {language === 'zh' ? '联系' : 'Contact'}
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8 relative opacity-0">
          <div ref={heroRef} className="w-full max-w-[90vw]">
            <div className="hero-line-wrapper overflow-hidden mb-2 relative" style={{ paddingBottom: '0.1em' }}>
              <div
                className="hero-line text-[18vw] md:text-[22vw] leading-[0.85] tracking-[-0.06em] font-black cursor-pointer relative"
                onMouseEnter={(e) => {
                  const solid = e.currentTarget.querySelector('.solid-layer') as HTMLElement;
                  const outline = e.currentTarget.querySelector('.outline-layer') as HTMLElement;
                  if (solid) solid.style.clipPath = 'inset(0 0 0 100%)';
                  if (outline) outline.style.clipPath = 'inset(0 0 0 0)';
                }}
                onMouseLeave={(e) => {
                  const solid = e.currentTarget.querySelector('.solid-layer') as HTMLElement;
                  const outline = e.currentTarget.querySelector('.outline-layer') as HTMLElement;
                  if (solid) solid.style.clipPath = 'inset(0 0 0 0)';
                  if (outline) outline.style.clipPath = 'inset(0 100% 0 0)';
                }}
              >
                {/* 实心文字层 */}
                <div
                  className="solid-layer absolute inset-0"
                  style={{
                    color: isDark ? '#ffffff' : '#000000',
                    clipPath: 'inset(0 0 0 0)',
                    transition: 'clip-path 0.5s ease-in-out'
                  }}
                >
                  Neuron
                </div>
                {/* 空心文字层 */}
                <div
                  className="outline-layer relative italic"
                  style={{
                    WebkitTextStroke: isDark ? '1.5px #ffffff' : '1.5px #000000',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Times New Roman, serif',
                    clipPath: 'inset(0 100% 0 0)',
                    transition: 'clip-path 0.5s ease-in-out'
                  }}
                >
                  &nbsp;&nbsp;Neuron
                </div>
              </div>
            </div>
            <div className="hero-line-wrapper overflow-hidden mt-8 relative ml-[50vw]">
              <div className={`hero-line text-xl md:text-2xl ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} font-light max-w-3xl opacity-60`}>
                {t('landingDesc')}
              </div>
              <div className={`desc-underline absolute left-0 bottom-[-12px] h-[1px] ${isDark ? 'bg-[#b0b0b0]' : 'bg-[#525252]'} w-full max-w-3xl opacity-0 origin-left`} />
            </div>
          </div>

          {/* Right Side Vertical Line with Circle */}
          <div className="absolute right-[2vw] top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 right-side-content">
            <div className={`w-[1px] right-line-top`} style={{ height: 0, background: `linear-gradient(to bottom, transparent, ${isDark ? 'rgba(176, 176, 176, 0.3)' : 'rgba(82, 82, 82, 0.3)'} 20%, ${isDark ? 'rgba(176, 176, 176, 0.3)' : 'rgba(82, 82, 82, 0.3)'})` }} />
            <div className={`w-24 h-24 rounded-full border ${isDark ? 'border-[#b0b0b0]/40' : 'border-[#525252]/40'} flex items-center justify-center cursor-pointer my-4 relative group transition-colors`}>
              <div className="absolute right-full mr-4 flex items-center gap-2 whitespace-nowrap right-text opacity-0 translate-x-[10px] pointer-events-none">
                <div className="relative w-12 h-6 overflow-hidden">
                  <motion.span
                    animate={{ y: ['-100%', '0%', '0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0, times: [0, 0.25, 0.65, 1] }}
                    className={`absolute text-sm ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'}`}
                  >
                    滚动
                  </motion.span>
                </div>
                <span className={`text-xs ${isDark ? 'text-[#b0b0b0]/50' : 'text-[#525252]/50'}`}>或者</span>
              </div>
              <span
                ref={buttonRef}
                style={{
                  transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
                className={`text-base font-black tracking-tight ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} text-center leading-tight inline-block button-text opacity-0`}
                onClick={() => {
                  setTransitioning(true);
                  setTimeout(() => navigate('/dashboard'), 800);
                }}
              >
                即刻<br/>进入
              </span>
            </div>
            <div className={`w-[1px] right-line-bottom`} style={{ height: 0, background: `linear-gradient(to top, transparent, ${isDark ? 'rgba(176, 176, 176, 0.3)' : 'rgba(82, 82, 82, 0.3)'} 20%, ${isDark ? 'rgba(176, 176, 176, 0.3)' : 'rgba(82, 82, 82, 0.3)'})` }} />
          </div>
        </section>

        {/* Flow Section */}
        <section ref={flowRef} className="relative">
          {/* Floating dots */}
          <div className="absolute top-0 left-0 right-0 h-[80vh] pointer-events-none">
            {flowDots.map(dot => (
              <div
                key={dot.id}
                className="absolute w-2 h-2 rounded-full pointer-events-auto cursor-grab transition-opacity duration-300"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  opacity: dot.opacity,
                  background: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                  boxShadow: isDark ? `0 0 ${10 + dot.opacity * 10}px rgba(255, 255, 255, ${0.4 + dot.opacity * 0.3})` : `0 0 ${10 + dot.opacity * 10}px rgba(0, 0, 0, ${0.2 + dot.opacity * 0.2})`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startDotX = dot.x;
                  const startDotY = dot.y;
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const dx = (moveEvent.clientX - startX) / window.innerWidth * 100;
                    const dy = (moveEvent.clientY - startY) / (window.innerHeight * 0.8) * 100;
                    flowDotsRef.current = flowDotsRef.current.map(d =>
                      d.id === dot.id ? { ...d, x: startDotX + dx, y: startDotY + dy } : d
                    );
                    setFlowDots([...flowDotsRef.current]);
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            ))}
          </div>

          {/* Background text layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="absolute top-[10%] left-[5%] text-[15vw] font-black opacity-[0.03]">FLOW</div>
            <div className="absolute top-[30%] right-[10%] text-[12vw] font-black opacity-[0.04]">CONNECT</div>
            <div className="absolute top-[50%] left-[5%] text-[15vw] font-black opacity-[0.03]" style={{ mixBlendMode: 'difference' }}>THINK</div>
            <div className="absolute top-[70%] right-[5%] text-[13vw] font-black opacity-[0.035]">CREATE</div>
            <div className="absolute top-[88%] left-[8%] text-[14vw] font-black opacity-[0.04]">GROW</div>
          </div>

          {/* 1. 想法从寂静中浮现 */}
          <div
            className="flow-block flow-block-1 min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-[8vw] py-20"
            onMouseEnter={() => setCursorScale(2)}
            onMouseLeave={() => setCursorScale(1)}
          >
            <div className="max-w-4xl">
              <div className="text-xs tracking-[0.3em] uppercase opacity-40 mb-4">[ 01 ] EMERGENCE</div>
              <h2 className="text-5xl md:text-7xl font-black mb-6">想法从寂静中浮现</h2>
              <p className={`text-xl md:text-2xl font-light mb-8 ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'}`}>
                Ideas emerge from silence before structure.
              </p>
              <div className="flex gap-3 text-xs uppercase tracking-wider opacity-30">
                <span>IDEA</span>
                <span>·</span>
                <span>RAW</span>
                <span>·</span>
                <span>UNSTRUCTURED</span>
              </div>
            </div>
            <div
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.2s ease-out'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
              }}
            >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-xl md:text-2xl leading-loose font-light ${isDark ? 'text-[#a0a0a0]' : 'text-[#606060]'} relative p-8`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-20" />
              在一切结构与逻辑形成之前，思考往往诞生于<span className="font-semibold">最安静的时刻</span>。那些尚未成型的念头，以零散、模糊甚至略显混乱的状态出现，它们<span className="underline decoration-1 underline-offset-4">没有明确的归属</span>，也没有清晰的边界，却蕴含着<span className="font-semibold">最原始的创造力</span>。<br/><br/>
              你不会在一开始就拥有答案，你只是在记录一些片段——一句话、一个灵感、一个尚未完成的推论。<br/><br/>
              个人知识库的意义，正是在这一刻开始显现：它<span className="font-semibold underline decoration-1 underline-offset-4">不是为了整理已经清晰的内容</span>，而是为了承接那些尚未被理解的想法，让它们不被遗忘，并等待被进一步发展。
            </motion.div>
            </div>
          </div>

          {/* Connection line 1 */}
          <div className="flex justify-center">
            <div
              className="connection-line w-[1px] h-[15vh] origin-top"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            />
          </div>

          {/* 2. 连接自然形成 */}
          <div
            className="flow-block flow-block-2 min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-[8vw] py-20"
            onMouseEnter={() => setCursorScale(2)}
            onMouseLeave={() => setCursorScale(1)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-xl md:text-2xl leading-loose font-light ${isDark ? 'text-[#a0a0a0]' : 'text-[#606060]'} relative p-8`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-20" />
              当记录逐渐积累，原本孤立的内容开始<span className="font-semibold">产生联系</span>。不同时间、不同语境下产生的想法，在回顾中<span className="underline decoration-1 underline-offset-4">彼此呼应</span>，形成隐约可见的结构。<br/><br/>
              你会开始发现：一些观点其实来源于同一个问题，一些笔记之间存在<span className="font-semibold">潜在的关联</span>，而某些看似无关的内容，正在逐渐指向同一个方向。<br/><br/>
              这种连接<span className="underline decoration-1 underline-offset-4">并不是刻意构建的结果</span>，而是在持续记录与回看中自然浮现的关系网络。<br/><br/>
              知识不再是孤立的片段，而开始形成脉络。而知识库的价值，也从"记录工具"转变为<span className="font-semibold">关系的发现系统</span>。
            </motion.div>
            <div className="max-w-4xl text-right relative">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[2px] h-[50vh] origin-bottom"
                style={{
                  background: isDark
                    ? 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.4))'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4))'
                }}
              />
              <div className="text-xs tracking-[0.3em] uppercase opacity-40 mb-4">[ 02 ] CONNECTION</div>
              <h2 className="text-6xl md:text-8xl font-black mb-6">连接自然形成</h2>
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[2px] h-[50vh]"
                style={{
                  background: isDark
                    ? 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.4) 70%, rgba(255,255,255,0))'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 70%, rgba(0,0,0,0))'
                }}
              />
              <p className={`text-xl md:text-2xl font-light mb-8 ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'}`}>
                Connections form naturally between thoughts.
              </p>
              <div className="flex gap-3 text-xs uppercase tracking-wider opacity-30 justify-end">
                <span>LINK</span>
                <span>·</span>
                <span>NETWORK</span>
                <span>·</span>
                <span>RELATION</span>
              </div>
            </div>
          </div>

          {/* Connection line 2 */}
          <div className="flex justify-center">
            <div
              className="connection-line w-[1px] h-[12vh] origin-top"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            />
          </div>

          {/* 3. 知识流动 */}
          <div
            className="flow-block flow-block-3 min-h-[75vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-[8vw] py-20 relative"
            onMouseEnter={() => setCursorScale(2)}
            onMouseLeave={() => setCursorScale(1)}
          >
            <div className="max-w-4xl relative z-20">
              <motion.div
                className={`absolute inset-0 -inset-x-8 -inset-y-4 z-10 ${isDark ? 'bg-[#fafaf8]' : 'bg-[#0a0a0a]'}`}
                style={{
                  right: useTransform(useScroll().scrollYProgress, [0.4, 0.5], ['0px', '-600px'])
                }}
              />
              <div className={`text-xs tracking-[0.3em] uppercase opacity-40 mb-4 relative z-20 ${isDark ? 'text-black' : 'text-white'}`}>[ 03 ] FLOW</div>
              <motion.h2
                style={{ x: useTransform(useScroll().scrollYProgress, [0.4, 0.5], [0, 600]) }}
                className={`text-4xl md:text-6xl font-black mb-6 relative z-20 ${isDark ? 'text-black' : 'text-white'}`}
              >
                知识流动
              </motion.h2>
              <p className={`text-xl md:text-2xl font-light mb-8 relative z-20 ${isDark ? 'text-[#404040]' : 'text-[#d0d0d0]'}`}>
                Knowledge flows through your network.
              </p>
              <div className={`flex gap-3 text-xs uppercase tracking-wider opacity-30 relative z-20 ${isDark ? 'text-black' : 'text-white'}`}>
                <span>DYNAMIC</span>
                <span>·</span>
                <span>CONTINUOUS</span>
                <span>·</span>
                <span>EVOLVING</span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-xl md:text-2xl leading-loose font-light ${isDark ? 'text-[#a0a0a0]' : 'text-[#606060]'} relative p-8 z-10`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-20" />
              当<span className={`px-1 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>连接</span>足够多，结构逐渐清晰，知识便<span className="underline decoration-1 underline-offset-4">不再停留在静态的记录之中</span>，而开始在不同节点之间流动。<br/><br/>
              你可以从一个想法出发，跳转到相关的记录，再从中延伸出新的理解，形成<span className="font-semibold">连续的思考路径</span>。<br/><br/>
              这种流动，让思考不再是线性的，而是<span className="font-semibold">网状的、可回溯的、可延展的</span>。<br/><br/>
              每一次浏览与回顾，都可能<span className="underline decoration-1 underline-offset-4">重新组合已有的信息</span>，产生新的理解。<br/><br/>
              此时的知识库，不再只是"存储"，而成为一个<span className="font-semibold">持续运转的思考系统</span>。
            </motion.div>
          </div>

          {/* Connection line 3 */}
          <div className="flex justify-center">
            <div
              className="connection-line w-[1px] h-[10vh] origin-top"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            />
          </div>

          {/* 4. 产出思维结晶 */}
          <div
            className="flow-block flow-block-4 min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-[8vw] py-20"
            onMouseEnter={() => setCursorScale(2)}
            onMouseLeave={() => setCursorScale(1)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-xl md:text-2xl leading-loose font-light ${isDark ? 'text-[#a0a0a0]' : 'text-[#606060]'} relative p-8`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-20" />
              当信息被不断连接、重组与验证，原本零散的想法开始<span className="font-semibold">沉淀为相对稳定的认知成果</span>。<br/><br/>
              这些成果可能是一段完整的观点、一篇文章，或是一种你可以<span className="underline decoration-1 underline-offset-4">反复使用的思考方式</span>。<br/><br/>
              它们不再是偶然出现的灵感，而是经过多次推演与整理之后形成的<span className="font-semibold">"结晶"</span>。<br/><br/>
              在这一阶段，知识库帮助你完成的，不只是记录与连接，而是<span className="font-semibold underline decoration-1 underline-offset-4">将思考转化为可表达、可复用、可传播的内容</span>。<br/><br/>
              这也是从"收集信息"走向"创造价值"的关键一步。
            </motion.div>
            <div className="max-w-4xl text-right">
              <div className="text-xs tracking-[0.3em] uppercase opacity-40 mb-4">[ 04 ] CRYSTALLIZE</div>
              <h2 className="text-5xl md:text-7xl font-black mb-6">
                <span className="crystal-char">产</span>
                <span className="crystal-char">出</span>
                <span className="crystal-char">思</span>
                <span className="crystal-char">维</span>
                <span className="crystal-char">结</span>
                <span className="crystal-char">晶</span>
              </h2>
              <p className={`text-xl md:text-2xl font-light mb-8 ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'}`}>
                Thoughts crystallize into tangible insights.
              </p>
              <div className="flex gap-3 text-xs uppercase tracking-wider opacity-30 justify-end">
                <span>OUTPUT</span>
                <span>·</span>
                <span>SYNTHESIS</span>
                <span>·</span>
                <span>CREATION</span>
              </div>
            </div>
          </div>

          {/* Connection line 4 */}
          <div className="flex justify-center">
            <div
              className="connection-line w-[1px] h-[8vh] origin-top"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            />
          </div>

          {/* 5. 理解深化 */}
          <div
            className="flow-block flow-block-5 min-h-[75vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-[8vw] py-20"
            onMouseEnter={() => setCursorScale(2)}
            onMouseLeave={() => setCursorScale(1)}
          >
            <div className="max-w-4xl">
              <div className="text-xs tracking-[0.3em] uppercase opacity-40 mb-4">[ 05 ] DEEPEN</div>
              <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ fontWeight: 900 }}>理解深化</h2>
              <p className={`text-xl md:text-2xl font-light mb-8 ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'}`}>
                Understanding deepens with reflection.
              </p>
              <div className="flex gap-3 text-xs uppercase tracking-wider opacity-30">
                <span>REFLECT</span>
                <span>·</span>
                <span>INTEGRATE</span>
                <span>·</span>
                <span>MASTER</span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-xl md:text-2xl leading-loose font-light ${isDark ? 'text-[#a0a0a0]' : 'text-[#606060]'} relative p-8`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-20" />
              <span className="font-semibold">真正的理解，并不是一次完成的。</span><br/><br/>
              随着时间推移，你会不断回到过去的记录，在新的经验与认知基础上，对旧的内容进行<span className="underline decoration-1 underline-offset-4">修正、补充与重构</span>。<br/><br/>
              一些曾经模糊的概念逐渐清晰，一些曾经确定的结论也可能被推翻。<br/><br/>
              知识在<span className="font-semibold">反复的迭代中不断被打磨</span>，思维的深度，也在这一过程中逐渐建立。<br/><br/>
              个人知识库的最终意义，<span className="underline decoration-1 underline-offset-4">并不只是"存储过去"</span>，而是帮助你在持续回看与重构中，形成<span className="font-semibold">更稳定、更深刻的认知体系</span>。
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="min-h-screen py-32 px-8">
          {[
            { label: '记录', desc: '捕捉转瞬即逝的想法', details: ['快速记录灵感、想法和观察', '支持文字、图片、语音等多种形式', '让每一个闪念都不会遗失'], ml: '5vw' },
            { label: '连接', desc: '将想法联系在一起', details: ['通过标签、链接和关联', '将零散的知识点串联成网络', '发现隐藏的联系，构建知识图谱'], ml: '30vw' },
            { label: '反思', desc: '回顾与整合', details: ['定期回顾已有知识', '通过间隔重复加深记忆', '整合新旧信息，形成更深层次的理解'], ml: '10vw' },
            { label: '创造', desc: '构建新的知识', details: ['AI 辅助写作', '从知识库中提取相关内容', '帮助你创作文章、报告和新想法'], ml: '35vw' },
          ].map((item, i) => (
            <div
              key={i}
              className="timeline-item mb-40 relative flex items-start gap-12 opacity-0"
              style={{ marginLeft: item.ml }}
              onMouseEnter={() => setCursorScale(2)}
              onMouseLeave={() => setCursorScale(1)}
            >
              <div className="flex-shrink-0 sticky top-32">
                <div className="text-7xl md:text-9xl font-black mb-4">{item.label}</div>
                <div className={`text-lg md:text-xl ${isDark ? 'text-[#b0b0b0]' : 'text-[#525252]'} font-light opacity-60 max-w-md`}>
                  {item.desc}
                </div>
              </div>
              <div className="flex flex-col gap-6 mt-8">
                {item.details.map((detail, j) => (
                  <div
                    key={j}
                    className={`timeline-detail-item text-base ${isDark ? 'text-[#b0b0b0]/80' : 'text-[#525252]/80'} font-light max-w-xl leading-relaxed pl-4 border-l-2 ${isDark ? 'border-[#b0b0b0]/30' : 'border-[#525252]/30'}`}
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
          {/* Background zoom effect */}
          <motion.div
            className="absolute inset-0"
            style={{ zIndex: 0 }}
            animate={transitioning ? { scale: 3 } : { scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          />

          {stars.map((star) => (
            <motion.div
              key={star.id}
              className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                opacity: star.opacity,
                x: star.offsetX,
                y: star.offsetY,
                zIndex: 2
              }}
              animate={transitioning ? { opacity: 0 } : {}}
              transition={transitioning ? { duration: 0.5 } : { type: 'spring', stiffness: 150, damping: 20 }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.5 }}
            animate={transitioning ? { opacity: 0 } : {}}
            style={{ zIndex: 3, position: 'relative' }}
          >
            <div
              className="inline-block cursor-pointer"
              onMouseEnter={() => setCursorScale(3)}
              onMouseLeave={() => setCursorScale(1)}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => navigate('/dashboard'), 800);
              }}
            >
              <motion.div
                className="text-4xl md:text-5xl font-light tracking-wide"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                {t('enter')}
              </motion.div>
            </div>
          </motion.div>

          {/* Transition overlay */}
          <AnimatePresence>
            {transitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`fixed inset-0 z-[2000] ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fafaf8]'}`}
              />
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}
