const CHIBI = `
Transform this person into an adorable chibi anime style character.
        Key characteristics:
        - Large, sparkling eyes that are 1/3 the height of the face
        - Small, cute nose and mouth
        - Head should be 1/2 to 2/3 of the total body height
        - Soft, rounded facial features
        - Maintain the person's distinctive features (hair color, style, clothing) but make them cute and stylized
        - Use bright, vibrant colors
        - Add a subtle anime/manga art style with clean lines
        - Keep the same pose and expression but make it more kawaii (cute)
        - Background should be simple or transparent
        - Overall style should be reminiscent of popular anime characters like those from Studio Ghibli or modern anime
        `;


const PIXELART = `Transform this person into a pixel art character.
        Key characteristics:
        - Use a limited color palette (16-32 colors)
        - Create a blocky, pixelated style with square pixels
        - Maintain the person's distinctive features (hair color, style, clothing) but simplify them into pixel shapes
        - Use a grid-based approach to create the character, ensuring each pixel is clearly defined
        - Keep the same pose and expression but make it more stylized and simplified
        - Background should be simple or transparent
        - Overall style should be reminiscent of classic video game characters or retro pixel art
        - Use a resolution of 32x32 or 64x64 pixels for a classic pixel art look
        `;

const CARTOON = `Transform this person into a cartoon character.
        Key characteristics:
        - Exaggerate facial features (large eyes, small nose, big smile)
        - Use bold, vibrant colors
        - Simplify the person's clothing into cartoonish styles
        - Maintain the person's distinctive features (hair color, style, clothing) but make them more exaggerated and stylized
        - Use clean, bold outlines for the character
        - Keep the same pose and expression but make it more animated and lively
        - Background should be simple or transparent
        - Overall style should be reminiscent of popular cartoon shows like "The Simpsons" or "Adventure Time"
        - Add a playful, whimsical touch to the character design
        `;

export const OpenAiPhotoEditPrompt = {
    chibi: CHIBI,
    pixelart: PIXELART,
    cartoon: CARTOON,
};