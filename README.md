# Image Overlay Studio

This is a NextJS starter app that allows you to create beautiful images with text overlays. You can create images one by one or in batches.

## Features

- **Single Image Editor**: A user-friendly interface to create a single image with custom text, fonts, colors, and backgrounds.
- **Batch Image Creator**: A powerful tool for developers and power users to generate multiple images at once using a form-based UI or by providing a JSON configuration.
- **AI-Powered Backgrounds**: Generate unique background images using text prompts.
- **Advanced Text Styling**: Customize your text with options for stroke, shadow, letter spacing, and more.
- **Random Background Generator**: Quickly generate random beautiful backgrounds.

To get started, take a look at `src/app/page.tsx`.

---

## Batch Creation JSON Structure

For developers who prefer to work directly with JSON, the Batch Create page provides a powerful JSON editor. Below is the documentation for the JSON structure used to define a list of images to be generated. The root of the JSON must be an array of image configuration objects.

Each object in the array represents one image and can have the following properties:

| Property            | Type                         | Default Value             | Description                                                                                             |
| ------------------- | ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `text`              | `string`                     | `"Missing Text"`          | The main text to be overlaid on the image. Use `\n` for line breaks.                                   |
| `width`             | `number`                     | `1280`                    | The width of the image in pixels.                                                                       |
| `height`            | `number`                     | `720`                     | The height of the image in pixels.                                                                      |
| `background`        | `string`                     | `"#FFFFFF"`               | A CSS color (e.g., `#RRGGBB`, `hsl(...)`) or a `linear-gradient(...)` string for the background.      |
| `backgroundImage`   | `string`                     | `null`                    | A Data URI or a publicly accessible URL for a background image. If provided, this will be drawn on top of the `background` color. |
| `textColor`         | `string`                     | `"#000000"`               | The color of the text as a hex string.                                                                  |
| `fontFamily`        | `string`                     | `"'Inter', sans-serif"`   | The font family for the text. Should be a valid CSS `font-family` value.                              |
| `fontSize`          | `number`                     | `64`                      | The font size in pixels.                                                                                |
| `textAlign`         | `'left'`, `'center'`, `'right'` | `'center'`                | The horizontal alignment of the text.                                                                   |
| `letterSpacing`     | `number`                     | `0`                       | The spacing between characters in pixels. Can be negative.                                              |
| `addTextShadow`     | `boolean`                    | `false`                   | Set to `true` to enable the text shadow.                                                                |
| `textShadowColor`   | `string`                     | `'rgba(0,0,0,0.5)'`       | The color of the text shadow.                                                                           |
| `textShadowBlur`    | `number`                     | `10`                      | The blur radius of the shadow in pixels.                                                                |
`textShadowOffsetX` | `number`                     | `5`                       | The horizontal offset of the shadow in pixels.                                                          |
| `textShadowOffsetY` | `number`                     | `5`                       | The vertical offset of the shadow in pixels.                                                            |
| `textStrokeWidth`   | `number`                     | `0`                       | The width of the text outline (stroke) in pixels. Set to `0` to disable.                              |
| `textStrokeColor`   | `string`                     | `"#000000"`               | The color of the text stroke.                                                                           |

### Example JSON

```json
[
  {
    "text": "Hello World",
    "textColor": "#FFFFFF",
    "background": "linear-gradient(to right, #2b5876, #4e4376)",
    "fontSize": 96,
    "width": 1280,
    "height": 720,
    "fontFamily": "'Inter', sans-serif",
    "textAlign": "center"
  },
  {
    "text": "Using an Image URL",
    "backgroundImage": "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070",
    "textColor": "#000000",
    "fontSize": 80,
    "addTextShadow": true
  },
  {
    "text": "Batch\nCreation\nRocks!",
    "textColor": "#000000",
    "background": "#C1E1C1",
    "fontSize": 64,
    "width": 1080,
    "height": 1080,
    "fontFamily": "'Playfair Display', serif",
    "textAlign": "center",
    "addTextShadow": true,
    "textShadowBlur": 5,
    "textStrokeWidth": 2,
    "textStrokeColor": "#FFFFFF"
  }
]
```
