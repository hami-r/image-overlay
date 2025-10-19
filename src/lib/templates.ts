
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
            "addTextBackground": true,
            "textBackgroundColor": "rgba(204, 0, 0, 0.8)",
            "layout": { "position": "center" }
          },
          {
            "text": "A Major Event Has Just Occurred",
            "textColor": "#FFFFFF",
            "fontSize": 48,
            "fontFamily": "'Inter', sans-serif",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(0, 0, 0, 0.7)",
            "layout": { "position": "center" }
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
            "layout": { "position": "center" }
          },
          {
            "text": "- Abraham Lincoln",
            "textColor": "#555555",
            "fontSize": 48,
            "fontFamily": "'Inter', sans-serif",
            "layout": { "position": "bottom-right", "margin": "10%" }
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
            "layout": { "position": "top-left", "margin": "10%" }
          },
          {
            "text": "Hyperion X1",
            "textColor": "#FFFFFF",
            "fontSize": 128,
            "fontFamily": "'Playfair Display', serif",
            "textStrokeWidth": 2,
            "textStrokeColor": "#000000",
            "letterSpacing": -5,
            "layout": { "position": "center-left", "margin": "10%" }
          },
           {
            "text": "• Faster Than Ever\n• Sleek New Design\n• 48-Hour Battery",
            "textColor": "#FFFFFF",
            "fontSize": 36,
            "fontFamily": "'Inter', sans-serif",
            "addTextShadow": true,
            "layout": { "position": "bottom-left", "margin": "10%" }
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
            "addTextBackground": true,
            "textBackgroundColor": "#CC0000",
            "layout": { "position": "bottom-left", "margin": "5%"}
          },
          {
            "text": "This is a sample news headline scrolling across the screen",
            "textColor": "#000000",
            "fontSize": 52,
            "fontFamily": "'Inter', sans-serif",
            "addTextBackground": true,
            "textBackgroundColor": "rgba(255, 255, 255, 0.9)",
            "layout": { "position": "bottom-right", "margin": "5%"}
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
            "layout": {"position": "center-left", "margin": "10%"}
          },
          {
            "text": "And a short, descriptive subtitle",
            "textColor": "#777777",
            "fontSize": 36,
            "fontFamily": "'Inter', sans-serif",
            "layout": {"position": "center-left", "margin": "10%", "marginTop": "25%"}
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
            "textStrokeWidth": 8,
            "textStrokeColor": "#000000",
            "letterSpacing": 10,
            "layout": { "position": "center"}
          },
          {
            "text": "FLASH SALE",
            "textColor": "#000000",
            "fontSize": 80,
            "fontFamily": "'Inter', sans-serif",
            "addTextBackground": true,
            "textBackgroundColor": "#FFFF00",
            "layout": { "position": "bottom-center", "margin": "10%" }
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
            "textShadowOffsetY": 0,
            "layout": { "position": "center" }
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
            "layout": { "position": "top-center", "margin": "10%" }
          },
          {
            "text": "THE DIGITAL FRONTIER",
            "textColor": "#FFFFFF",
            "fontSize": 96,
            "fontFamily": "'Playfair Display', serif",
            "addTextShadow": true,
             "layout": { "position": "center" }
          },
          {
            "text": "with Hostname",
            "textColor": "#DDDDDD",
            "fontSize": 40,
            "fontFamily": "'Inter', sans-serif",
            "layout": { "position": "bottom-center", "margin": "10%" }
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
            "addTextBackground": true,
            "textBackgroundColor": "#3498db",
            "layout": {"position": "top-left", "margin": "8%"}
          },
          {
            "text": "Configure Your Environment",
            "textColor": "#333333",
            "fontSize": 72,
            "fontFamily": "'Playfair Display', serif",
            "layout": {"position": "center-left", "margin": "8%"}
          },
          {
            "text": "Make sure you have all the necessary tools and software installed before proceeding to the next step. This is a crucial part of the process.",
            "textColor": "#555555",
            "fontSize": 32,
            "fontFamily": "'Inter', sans-serif",
            "layout": {"position": "bottom-left", "margin": "8%"}
          }
        ],
        "width": 1280,
        "height": 720,
        "background": "#FFFFFF"
      }
    ], null, 2)
  }
];

export interface CustomTemplate {
  name: string;
  json: string;
}

const CUSTOM_TEMPLATES_KEY = 'image-overlay-custom-templates';

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const saved = window.localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load custom templates from localStorage", e);
    return [];
  }
}

export function saveCustomTemplate(template: CustomTemplate) {
  if (typeof window === 'undefined') {
    return;
  }
  const templates = getCustomTemplates();
  // Avoid duplicates by name
  const existingIndex = templates.findIndex(t => t.name === template.name);
  if (existingIndex > -1) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  try {
    window.localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save custom template to localStorage", e);
  }
}

export function deleteCustomTemplate(name: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const templates = getCustomTemplates();
  const updatedTemplates = templates.filter(t => t.name !== name);
  try {
    window.localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
  } catch (e) {
    console.error("Failed to delete custom template from localStorage", e);
  }
}

    