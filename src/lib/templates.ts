
export const imageTemplates = [
  {
    name: 'News Headline',
    json: JSON.stringify([
      {
        "textLayers": [
          {
            "text": "BREAKING NEWS",
            "textColor": "#FFFFFF",
            "fontSize": 128,
            "fontFamily": "'Playfair Display', serif",
            "textAlign": "center",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(204, 0, 0, 0.8)",
            "x": 640,
            "y": 360
          },
          {
            "text": "A Major Event Has Just Occurred",
            "textColor": "#FFFFFF",
            "fontSize": 48,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "center",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(0, 0, 0, 0.7)",
            "x": 640,
            "y": 500
          }
        ],
        "width": 1280,
        "height": 720,
        "backgroundImage": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070"
      }
    ], null, 2),
  },
  {
    name: 'Social Media Quote',
    json: JSON.stringify([
      {
        "textLayers": [
          {
            "text": '"The best way to predict the future is to create it."',
            "textColor": "#1a1a1a",
            "fontSize": 96,
            "fontFamily": "'Playfair Display', serif",
            "textAlign": "center",
            "x": 540,
            "y": 480
          },
          {
            "text": "- Abraham Lincoln",
            "textColor": "#555555",
            "fontSize": 48,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "right",
            "x": 900,
            "y": 700
          }
        ],
        "background": "linear-gradient(to bottom right, #ece9e6, #ffffff)",
        "width": 1080,
        "height": 1080
      }
    ], null, 2),
  },
  {
    name: 'Event Announcement',
    json: JSON.stringify([
      {
        "textLayers": [
          {
            "text": "You're Invited!",
            "textColor": "#FFFFFF",
            "fontSize": 150,
            "fontFamily": "'Playfair Display', serif",
            "addTextShadow": true,
            "textShadowColor": "rgba(0,0,0,0.3)",
            "textShadowBlur": 10
          },
          {
            "text": "To The Grand Opening Gala",
            "textColor": "#FFFFFF",
            "fontSize": 60,
            "fontFamily": "'Inter', sans-serif"
          },
           {
            "text": "Saturday, Dec 21st | 8:00 PM",
            "textColor": "#FFFFFF",
            "fontSize": 32,
            "fontFamily": "'Inter', sans-serif",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(0,0,0,0.5)"
          }
        ],
        "background": "linear-gradient(to right, #6d6027, #d3cbb8)",
        "width": 1280,
        "height": 720
      }
    ], null, 2),
  },
   {
    name: 'Product Feature',
    json: JSON.stringify([
      {
        "textLayers": [
          {
            "text": "The All-New",
            "textColor": "#FFFFFF",
            "fontSize": 48,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "x": 100,
            "y": 150
          },
          {
            "text": "Hyperion X1",
            "textColor": "#FFFFFF",
            "fontSize": 128,
            "fontFamily": "'Playfair Display', serif",
            "textAlign": "left",
            "textStrokeWidth": 2,
            "textStrokeColor": "#000000",
            "letterSpacing": -5,
            "x": 100,
            "y": 260
          },
           {
            "text": "• Faster Than Ever\n• Sleek New Design\n• 48-Hour Battery",
            "textColor": "#FFFFFF",
            "fontSize": 36,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "addTextShadow": true,
            "x": 100,
            "y": 450
          }
        ],
        "backgroundImage": "https://images.unsplash.com/photo-1526726538690-5c690f73c457?q=80&w=2070",
        "width": 1280,
        "height": 720
      }
    ], null, 2),
  },
   {
    name: 'Breaking News Ticker',
    json: JSON.stringify([
      {
        "textLayers": [
          {
            "text": "BREAKING",
            "textColor": "#FFFFFF",
            "fontSize": 64,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "center",
            "addTextBackground": true,
            "textBackgroundColor": "#CC0000",
            "x": 220,
            "y": 650
          },
          {
            "text": "This is a sample news headline scrolling across the screen",
            "textColor": "#000000",
            "fontSize": 52,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(255, 255, 255, 0.9)",
            "x": 450,
            "y": 650
          }
        ],
        "width": 1920,
        "height": 1080,
        "background": "#CCCCCC"
      }
    ], null, 2),
  },
  {
    "name": "Minimalist Title",
    "json": JSON.stringify([
      {
        "textLayers": [
          {
            "text": "A Simple, Elegant Title",
            "textColor": "#333333",
            "fontSize": 96,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "x": 100,
            "y": 320
          },
          {
            "text": "And a short, descriptive subtitle",
            "textColor": "#777777",
            "fontSize": 36,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "x": 100,
            "y": 420
          }
        ],
        "width": 1280,
        "height": 720,
        "background": "#F4F4F4"
      }
    ], null, 2)
  },
  {
    "name": "Sale Banner",
    "json": JSON.stringify([
      {
        "textLayers": [
          {
            "text": "50% OFF",
            "textColor": "#FFFFFF",
            "fontSize": 200,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "center",
            "textStrokeWidth": 8,
            "textStrokeColor": "#000000",
            "letterSpacing": 10,
            "y": 400
          },
          {
            "text": "FLASH SALE",
            "textColor": "#000000",
            "fontSize": 80,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "center",
            "addTextBackground": true,
            "textBackgroundColor": "#FFFF00",
            "y": 650
          }
        ],
        "width": 1080,
        "height": 1080,
        "background": "linear-gradient(to right, #f857a6, #ff5858)"
      }
    ], null, 2)
  },
  {
    "name": "Coming Soon",
    "json": JSON.stringify([
      {
        "textLayers": [
          {
            "text": "COMING SOON",
            "textColor": "#FFFFFF",
            "fontSize": 128,
            "fontFamily": "'Roboto Mono', monospace",
            "textAlign": "center",
            "addTextShadow": true,
            "textShadowColor": "#00FFFF",
            "textShadowBlur": 20,
            "textShadowOffsetX": 0,
            "textShadowOffsetY": 0
          }
        ],
        "width": 1920,
        "height": 1080,
        "backgroundImage": "https://images.unsplash.com/photo-1517999144091-3d9d7afb5a2b?q=80&w=2070"
      }
    ], null, 2)
  },
  {
    "name": "Podcast Cover",
    "json": JSON.stringify([
      {
        "textLayers": [
          {
            "text": "EPISODE 128",
            "textColor": "#BBBBBB",
            "fontSize": 32,
            "fontFamily": "'Roboto Mono', monospace",
            "textAlign": "center",
            "y": 150
          },
          {
            "text": "THE DIGITAL FRONTIER",
            "textColor": "#FFFFFF",
            "fontSize": 96,
            "fontFamily": "'Playfair Display', serif",
            "textAlign": "center",
            "addTextShadow": true
          },
          {
            "text": "with Hostname",
            "textColor": "#DDDDDD",
            "fontSize": 40,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "center",
            "y": 900
          }
        ],
        "width": 1080,
        "height": 1080,
        "background": "linear-gradient(to bottom, #141E30, #243B55)"
      }
    ], null, 2)
  },
  {
    "name": "Tutorial Step",
    "json": JSON.stringify([
      {
        "textLayers": [
          {
            "text": "STEP 01",
            "textColor": "#FFFFFF",
            "fontSize": 80,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "addTextBackground": true,
            "textBackgroundColor": "#3498db",
            "x": 100,
            "y": 150
          },
          {
            "text": "Configure Your Environment",
            "textColor": "#333333",
            "fontSize": 72,
            "fontFamily": "'Playfair Display', serif",
            "textAlign": "left",
            "x": 100,
            "y": 360
          },
          {
            "text": "Make sure you have all the necessary tools and software installed before proceeding to the next step. This is a crucial part of the process.",
            "textColor": "#555555",
            "fontSize": 32,
            "fontFamily": "'Inter', sans-serif",
            "textAlign": "left",
            "x": 100,
            "y": 500
          }
        ],
        "width": 1280,
        "height": 720,
        "background": "#FFFFFF"
      }
    ], null, 2)
  }
];

    
