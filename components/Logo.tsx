import React from 'react';

export const GriyaBantenLogo = ({ className = "w-10 h-10", colorClass = "text-orange-700" }: { className?: string; colorClass?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} ${colorClass}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Candi Bentar (Split Gate) Structure */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M26 86V28H40V36H30V44H40V52H34V60H40V68H36V76H40V86H26ZM74 86V28H60V36H70V44H60V52H66V60H60V68H64V76H60V86H74Z" 
        fill="currentColor"
      />
      {/* Base */}
      <rect x="20" y="86" width="60" height="6" rx="1" fill="currentColor" />
      
      {/* Balinese Flower Ornament (Jepun/Frangipani) */}
      <g transform="translate(50, 55)">
         {/* Petals - 5 Petals rotation */}
         {[0, 72, 144, 216, 288].map((angle, i) => (
           <path 
             key={i}
             d="M0 0 C-3 -7 -7 -10 0 -16 C7 -10 3 -7 0 0" 
             fill="#FDBA74" 
             stroke="#FFF"
             strokeWidth="0.5"
             transform={`rotate(${angle})`}
           />
         ))}
         
         {/* Inner Center Halo */}
         <circle cx="0" cy="0" r="3.5" fill="#FDE047" />
         
         {/* Core */}
         <circle cx="0" cy="0" r="1.5" fill="#FFF" />
      </g>
    </svg>
  );
};