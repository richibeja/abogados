const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The hero section starts
let heroStartMarker = '<header class="hero">';
let heroIndex = html.indexOf(heroStartMarker);

if (heroIndex > -1 && !html.includes('hero-video-bg')) {
    let videoTag = `
        <video autoplay loop muted playsinline id="hero-video-bg" style="position: absolute; right: 0; bottom: 0; min-width: 100%; min-height: 100%; width: auto; height: auto; z-index: -2; object-fit: cover; filter: brightness(0.6);">
            <!-- Placeholder para el video del trabajador calculando. Cuando tengas el tuyo, renómbralo a video_calculadora.mp4 y ponlo en esta carpeta -->
            <source src="video_calculadora.mp4" type="video/mp4">
            Tu navegador no soporta videos.
        </video>
        <div class="hero-overlay" style="z-index: -1;"></div>`;
        
    html = html.replace('<div class="hero-overlay"></div>', videoTag);
    
    // We remove the blobs for a cleaner look
    html = html.replace('<div class="blob blob-1"></div>', '');
    html = html.replace('<div class="blob blob-2"></div>', '');
    
    // Add position relative to hero if inline css is needed, but style.css should handle it. Just to be safe:
    html = html.replace('<header class="hero">', '<header class="hero" style="position: relative; overflow: hidden; background: none;">');
    
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Video Background setup successfully!');
} else {
    console.log('Could not find hero or already added.');
}
