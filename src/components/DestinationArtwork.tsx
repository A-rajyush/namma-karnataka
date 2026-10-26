import React, { useEffect, useState } from 'react';
import { Destination } from '../data/karnatakaData';

interface DestinationArtworkProps {
  archetype: Destination['archetype'] | 'cuisine';
  destinationId?: string;
  accentHex?: string;
  title?: string;
  className?: string;
  overlayGradient?: boolean;
}

// Cache generated high-res canvas JPEG data URLs by key so they render instantaneously
const RASTER_CACHE: Record<string, string> = {};

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function generateAtmosphericLandscapeJpeg(
  key: string,
  archetype: Destination['archetype'] | 'cuisine',
  title: string
): string {
  const cacheKey = `${key}-${archetype}-${title}`;
  if (RASTER_CACHE[cacheKey]) return RASTER_CACHE[cacheKey];

  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const W = 960;
  const H = 600;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const seed = hashString(key || title || archetype);
  const rand = (n: number) => {
    const x = Math.sin(seed + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  // Curated daylight & golden-hour photographic palettes per region/archetype
  type Palette = {
    skyTop: string;
    skyMid: string;
    skyHorizon: string;
    sunColor: string;
    ridgeFar: string;
    ridgeMid: string;
    ridgeNear: string;
    fg: string;
    water?: string;
    mist: string;
  };

  const palettes: Record<string, Palette> = {
    hampi: {
      skyTop: '#2C4A6F',
      skyMid: '#B86B52',
      skyHorizon: '#F4B860',
      sunColor: '#FFF3B0',
      ridgeFar: '#7A4438',
      ridgeMid: '#592E25',
      ridgeNear: '#3B1D16',
      fg: '#22100C',
      water: '#C87D55',
      mist: 'rgba(244, 184, 96, 0.18)',
    },
    coorg: {
      skyTop: '#1E4E4A',
      skyMid: '#5B8E7D',
      skyHorizon: '#D9E8D8',
      sunColor: '#F7F9F2',
      ridgeFar: '#467362',
      ridgeMid: '#2D5444',
      ridgeNear: '#1B3B2E',
      fg: '#0F241C',
      mist: 'rgba(235, 245, 238, 0.32)',
    },
    mysuru: {
      skyTop: '#24305E',
      skyMid: '#6C5B7B',
      skyHorizon: '#F6AE2D',
      sunColor: '#FFE699',
      ridgeFar: '#4A3B5C',
      ridgeMid: '#332640',
      ridgeNear: '#21182B',
      fg: '#140E1C',
      mist: 'rgba(246, 174, 45, 0.2)',
    },
    gokarna: {
      skyTop: '#1A5276',
      skyMid: '#5499C7',
      skyHorizon: '#F5CBA7',
      sunColor: '#FFF2CC',
      ridgeFar: '#2E6B7E',
      ridgeMid: '#1F4E5F',
      ridgeNear: '#153743',
      fg: '#0D232B',
      water: '#1F7A8C',
      mist: 'rgba(245, 203, 167, 0.16)',
    },
    chikmagalur: {
      skyTop: '#224858',
      skyMid: '#68978E',
      skyHorizon: '#E8D5B7',
      sunColor: '#FFF8E7',
      ridgeFar: '#456D66',
      ridgeMid: '#2D4E47',
      ridgeNear: '#1D3530',
      fg: '#10201D',
      mist: 'rgba(232, 213, 183, 0.28)',
    },
    'jog-falls': {
      skyTop: '#284B63',
      skyMid: '#5C808E',
      skyHorizon: '#C7D6D5',
      sunColor: '#FFFFFF',
      ridgeFar: '#3B5E58',
      ridgeMid: '#28443F',
      ridgeNear: '#1B302C',
      fg: '#111F1C',
      water: '#E2F1F5',
      mist: 'rgba(226, 241, 245, 0.35)',
    },
    kabini: {
      skyTop: '#354F52',
      skyMid: '#84A98C',
      skyHorizon: '#E09F3E',
      sunColor: '#FFF3B0',
      ridgeFar: '#526D5C',
      ridgeMid: '#374B3E',
      ridgeNear: '#243329',
      fg: '#151F18',
      water: '#6B7F6E',
      mist: 'rgba(224, 159, 62, 0.18)',
    },
    badami: {
      skyTop: '#3D5A80',
      skyMid: '#C97A57',
      skyHorizon: '#F2C17D',
      sunColor: '#FFF5CC',
      ridgeFar: '#8F4731',
      ridgeMid: '#6E3220',
      ridgeNear: '#4D2114',
      fg: '#2B110A',
      water: '#4E7A74',
      mist: 'rgba(242, 193, 125, 0.15)',
    },
  };

  let pal = palettes[key];
  if (!pal) {
    if (archetype === 'coast') pal = palettes.gokarna;
    else if (archetype === 'chariot' || archetype === 'temple') pal = palettes.badami;
    else if (archetype === 'palace') pal = palettes.mysuru;
    else if (archetype === 'waterfall') pal = palettes['jog-falls'];
    else if (archetype === 'wildlife') pal = palettes.kabini;
    else pal = palettes.coorg;
  }

  // 1. Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  skyGrad.addColorStop(0, pal.skyTop);
  skyGrad.addColorStop(0.55, pal.skyMid);
  skyGrad.addColorStop(1, pal.skyHorizon);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Warm Sun & Volumetric Atmospheric Glow
  const sunX = W * (0.28 + rand(1) * 0.48);
  const sunY = H * (0.24 + rand(2) * 0.16);
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, W * 0.45);
  sunGlow.addColorStop(0, pal.sunColor);
  sunGlow.addColorStop(0.18, pal.skyHorizon);
  sunGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
  ctx.fillStyle = pal.sunColor;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Helper to paint natural ridgeline with fractal-like sine harmonics
  const drawRidge = (
    baseY: number,
    amp: number,
    freq: number,
    phase: number,
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const y =
        baseY +
        Math.sin(x * freq + phase) * amp +
        Math.sin(x * freq * 2.3 + phase * 1.7) * (amp * 0.42) +
        Math.cos(x * freq * 5.1 + phase * 0.8) * (amp * 0.16);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  // 3. Distant & Mid-groundRidges
  drawRidge(H * 0.52, 48, 0.0045, seed * 0.1, pal.ridgeFar);

  // Mist band 1
  const mist1 = ctx.createLinearGradient(0, H * 0.48, 0, H * 0.68);
  mist1.addColorStop(0, 'rgba(255,255,255,0)');
  mist1.addColorStop(0.5, pal.mist);
  mist1.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = mist1;
  ctx.fillRect(0, H * 0.45, W, H * 0.25);

  drawRidge(H * 0.63, 38, 0.0055, seed * 0.25 + 1.4, pal.ridgeMid);

  // 4. Archetype-Specific Landmark Silhouette on Mid-ground
  if (archetype === 'chariot' || archetype === 'temple') {
    // Stepped Dravidian Gopuram & Mandapa colonnade
    const tx = W * 0.66;
    const ty = H * 0.58;
    ctx.fillStyle = pal.ridgeNear;
    // Gopuram tower tiers
    for (let tier = 0; tier < 6; tier++) {
      const tw = 86 - tier * 11;
      const th = 18;
      ctx.fillRect(tx - tw / 2, ty - tier * 17, tw, th);
    }
    // Kalasha finials
    ctx.fillStyle = pal.sunColor;
    ctx.fillRect(tx - 12, ty - 106, 24, 5);
    // Pillared Mandapa hall
    ctx.fillStyle = pal.ridgeNear;
    ctx.fillRect(tx - 160, ty - 28, 110, 36);
    for (let p = 0; p < 6; p++) {
      ctx.fillStyle = pal.skyHorizon;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(tx - 150 + p * 17, ty - 20, 6, 22);
    }
    ctx.globalAlpha = 1;
  } else if (archetype === 'palace') {
    // Indo-Saracenic Domes & Illuminated Arches
    const px = W * 0.5;
    const py = H * 0.64;
    ctx.fillStyle = pal.ridgeNear;
    ctx.fillRect(px - 170, py - 68, 340, 75);
    // Central dome
    ctx.beginPath();
    ctx.arc(px, py - 68, 36, Math.PI, 0);
    ctx.fill();
    // Side domes
    ctx.beginPath();
    ctx.arc(px - 105, py - 68, 22, Math.PI, 0);
    ctx.arc(px + 105, py - 68, 22, Math.PI, 0);
    ctx.fill();
    // Warm illuminated palace arch windows
    ctx.fillStyle = '#FFD166';
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(px + i * 26, py - 34, 6, Math.PI, 0);
      ctx.fillRect(px + i * 26 - 6, py - 34, 12, 16);
      ctx.fill();
    }
  } else if (archetype === 'waterfall') {
    // Four plunging cataracts of Jog Falls
    const wx = W * 0.44;
    const wy = H * 0.49;
    const streams = [0, 34, 72, 108];
    streams.forEach((offset, idx) => {
      const grad = ctx.createLinearGradient(0, wy, 0, H * 0.85);
      grad.addColorStop(0, 'rgba(255,255,255,0.88)');
      grad.addColorStop(0.7, 'rgba(226,241,245,0.65)');
      grad.addColorStop(1, 'rgba(226,241,245,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(wx + offset, wy + idx * 4, idx === 0 ? 18 : 12, H * 0.34);
    });
  }

  // 5. Near Ridge & Water / Valley Floor
  drawRidge(H * 0.74, 28, 0.0065, seed * 0.4 + 2.8, pal.ridgeNear);

  if (pal.water || archetype === 'coast') {
    const waterY = H * 0.75;
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, H);
    waterGrad.addColorStop(0, pal.skyHorizon);
    waterGrad.addColorStop(0.35, pal.water || '#1F7A8C');
    waterGrad.addColorStop(1, pal.fg);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, W, H - waterY);

    // Shimmering sun reflection lines on water
    ctx.fillStyle = pal.sunColor;
    for (let r = 0; r < 18; r++) {
      const ry = waterY + 8 + r * 7;
      const rw = 90 - r * 3.5 + Math.sin(r * 1.7) * 20;
      ctx.globalAlpha = 0.32 - r * 0.014;
      ctx.fillRect(sunX - rw / 2, ry, rw, 2.2);
    }
    ctx.globalAlpha = 1;
  }

  drawRidge(H * 0.86, 22, 0.008, seed * 0.7 + 4.1, pal.fg);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  RASTER_CACHE[cacheKey] = dataUrl;
  return dataUrl;
}

// Verified direct Wikimedia Commons URLs that load reliably without rate-limit 404s
const VERIFIED_WIKIMEDIA_PHOTOS: Record<string, string> = {
  hampi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Hampi_virupaksha_temple.jpg/960px-Hampi_virupaksha_temple.jpg',
  mysuru:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/960px-Mysore_Palace_Morning.jpg',
};

export const DestinationArtwork: React.FC<DestinationArtworkProps> = ({
  archetype,
  destinationId = '',
  title = '',
  className = 'w-full h-full',
  overlayGradient = false,
}) => {
  const key = destinationId.toLowerCase();

  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (VERIFIED_WIKIMEDIA_PHOTOS[key]) {
      return VERIFIED_WIKIMEDIA_PHOTOS[key];
    }
    return generateAtmosphericLandscapeJpeg(key, archetype, title);
  });

  useEffect(() => {
    if (VERIFIED_WIKIMEDIA_PHOTOS[key]) {
      setImgSrc(VERIFIED_WIKIMEDIA_PHOTOS[key]);
    } else {
      setImgSrc(generateAtmosphericLandscapeJpeg(key, archetype, title));
    }
  }, [key, archetype, title]);

  return (
    <div className={`relative overflow-hidden select-none bg-[#E6E4DD] ${className}`}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt={title ? `${title} — Karnataka landscape` : 'Karnataka destination'}
          referrerPolicy="no-referrer"
          onError={() => {
            const fallback = generateAtmosphericLandscapeJpeg(key, archetype, title);
            if (fallback && imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
