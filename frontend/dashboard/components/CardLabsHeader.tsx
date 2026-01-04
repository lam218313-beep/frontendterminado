import React, { useEffect, useRef } from 'react';

export const CardLabsHeader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track mouse position
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Configuration for "Control & Science" Grid
    const GAP = 30; // Distance between points
    const DOT_SIZE = 1.5;
    
    // Resize Handler
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    // Mouse Interaction Handler
    const handleMouseMove = (e: MouseEvent) => {
       const rect = canvas.getBoundingClientRect();
       mouseRef.current = {
           x: e.clientX - rect.left,
           y: e.clientY - rect.top
       };
    };

    const handleMouseLeave = () => {
       mouseRef.current = { x: -9999, y: -9999 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const drawGrid = () => {
       if (!ctx) return;
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       const cols = Math.floor(canvas.width / GAP) + 1;
       const rows = Math.floor(canvas.height / GAP) + 1;

       // Theme Color RGB (Magenta: 242, 15, 121 | Dark Gray: 70, 83, 98)
       
       for (let ix = 0; ix < cols; ix++) {
         for (let iy = 0; iy < rows; iy++) {
           const x = ix * GAP;
           const y = iy * GAP;

           // Calculate distance to mouse for interaction
           const dx = x - mouseRef.current.x;
           const dy = y - mouseRef.current.y;
           const dist = Math.sqrt(dx * dx + dy * dy);
           const interactionRadius = 200;
           
           // Interaction Factor (0 to 1) - higher when closer
           const interaction = Math.max(0, 1 - dist / interactionRadius); 

           // Calculate Wave
           // We create a controlled sine wave moving diagonally
           const wave1 = Math.sin((x * 0.01) + (y * 0.01) + time);
           const wave2 = Math.cos((x * 0.02) - (y * 0.02) + time);
           
           // Amplitude determines circle size opacity
           const amp = (wave1 + wave2) / 2; // Range -1 to 1
           
           // Visualize - Add Interaction to Size
           // Base size + Wave Effect + Mouse Proximity Effect
           const size = DOT_SIZE + (amp * 1) + (interaction * 3); 
           
           // Opacity calculation
           const opacity = Math.min(1, Math.max(0.1, (amp + 1) / 2 * 0.5) + (interaction * 0.5));

           ctx.beginPath();
           ctx.arc(x, y, size, 0, Math.PI * 2);
           
           // If 'active' part of wave OR mouse is close, color it Magenta
           if (amp > 0.5 || interaction > 0.2) {
             ctx.fillStyle = `rgba(242, 15, 121, ${opacity})`; // Brand Magenta
           } else {
             ctx.fillStyle = `rgba(70, 83, 98, ${opacity})`; // Brand Dark
           }
           
           ctx.fill();

           // Connect lines
           // Connect if wave is high OR mouse is close
           if (amp > 0.8 || interaction > 0.3) {
             const nextX = (ix + 1) * GAP;
             const nextY = iy * GAP;
             if (nextX < canvas.width) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nextX, nextY);
                // Line opacity boosted by interaction
                const lineOpacity = (opacity * 0.4) + (interaction * 0.4);
                ctx.strokeStyle = `rgba(242, 15, 121, ${lineOpacity})`;
                ctx.stroke();
             }
           }
         }
       }
       
       time += 0.02; // Control speed
       animationFrameId = requestAnimationFrame(drawGrid);
    };

    window.addEventListener('resize', resize);
    
    // Initial Start
    resize();
    drawGrid();

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[200px] bg-white rounded-[32px] shadow-sm overflow-hidden mb-8 border border-gray-100 group cursor-crosshair">
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
      />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-12 pointer-events-none">
         <div className="space-y-0 relative">
            {/* Geometric Accent Line */}
            <div className="absolute -left-6 top-2 bottom-2 w-1 bg-primary-500 rounded-full"></div>
            
            <h1 className="text-6xl font-extrabold text-brand-dark tracking-tighter uppercase">
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-gray-300"></span>
                <p className="text-lg text-gray-400 font-medium tracking-widest uppercase">
                Control Center
                </p>
            </div>
         </div>
      </div>

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"></div>
    </div>
  );
};