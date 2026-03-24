const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The hero section starts
let heroStartMarker = '<header class="hero">';
let heroIndex = html.indexOf(heroStartMarker);

if (heroIndex > -1 && !html.includes('hero-video-bg')) {
    let videoTag = `
        <video autoplay loop muted playsinline id="hero-video-bg" poster="https://scontent-mia5-1.xx.fbcdn.net/v/t39.35426-6/611752732_1371959324403929_5540363817519887416_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=c53f8f&_nc_ohc=5lRIbddniNoQ7kNvwHZaXFU&_nc_oc=AdplGHzGFsNBwAY3NgGis-P9pBa_H_PRpdxVwuQ6ZgjhxXgaKxnCC7Q619T0tGmA8-ljS6lEn5VzO6kSIyp6CFe2&_nc_zt=14&_nc_ht=scontent-mia5-1.xx&_nc_gid=riqHSGBt2PZMn_i0d0ktDg&_nc_ss=7a32e&oh=00_Afz2_feBl0C5RBbMQcwOzJCgBen1Zc-LFFMSXdE-950uQA&oe=69C8751F" style="position: absolute; right: 0; bottom: 0; min-width: 100%; min-height: 100%; width: auto; height: auto; z-index: -2; object-fit: cover; filter: brightness(0.6);">
            <source src="https://scontent-mia3-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQNUraE0PUkQKryOeotTqqOmqPKXgx-97QqHBGvvsMyEMjAXeadUvCmjj-tSXD68U-XPQDe9m6D6Wc9hym6rxYuH7vic6Gloxkw0tETiPA.mp4?_nc_cat=111&_nc_sid=8bf8fe&_nc_ht=scontent-mia3-1.xx.fbcdn.net&_nc_ohc=SiA-E3SuwL4Q7kNvwFPhBxG&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6ODcwODMxMjkyMzQwOTMwLCJhc3NldF9hZ2VfZGF5cyI6NzMsInZpX3VzZWNhc2VfaWQiOjEwNzk5LCJkdXJhdGlvbl9zIjozNCwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=riqHSGBt2PZMn_i0d0ktDg&_nc_ss=7a32e&_nc_zt=28&oh=00_AfzEs-Gk5SQkGFYhS6yA1Kyjj5XrTTwgR9NElfSap0gt5A&oe=69C86387" type="video/mp4">
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
