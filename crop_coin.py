from PIL import Image, ImageDraw

def create_circular_mask(h, w):
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, w, h), fill=255)
    return mask

# Open the original image
img = Image.open("/home/miguel/.gemini/antigravity/brain/8b419227-65a5-412a-a084-646d4a4f82b3/kmmo_coin_final_1784874714328.jpg").convert("RGBA")

# Ensure it's square
min_side = min(img.size)
left = (img.width - min_side)/2
top = (img.height - min_side)/2
right = (img.width + min_side)/2
bottom = (img.height + min_side)/2

img = img.crop((left, top, right, bottom))

# Further crop to remove the background padding (the coin doesn't touch the exact edges)
# The coin seems to have some padding. Let's crop a bit tighter.
# Through trial and error or standard padding: usually the object takes up 80-90% of the space.
# Let's crop it tighter by 12% on all sides
padding = int(min_side * 0.12)
img = img.crop((padding, padding, img.width - padding, img.height - padding))

# Create a transparent mask
mask = create_circular_mask(img.height, img.width)
img.putalpha(mask)

# Save the final transparent PNG
img.save("/home/miguel/.gemini/antigravity/scratch/kmmo-web/logo.png")
print("Saved transparent logo to logo.png")
