import vtracer

inp = "./icon.png"
out = "./icon.svg"

# Minimal example: use all default values, generate a multicolor SVG
vtracer.convert_image_to_svg_py(inp, out)

# Single-color example. Good for line art, and much faster than full color:
vtracer.convert_image_to_svg_py(inp, out, colormode='binary')

# Convert from raw image bytes
input_img_bytes: bytes = get_bytes() # e.g. reading bytes from a file or a HTTP request body
svg_str: str = vtracer.convert_raw_image_to_svg(input_img_bytes, img_format='jpg')

# Convert from RGBA image pixels
from PIL import Image
img = Image.open(inp).convert('RGBA')
pixels: list[tuple[int, int, int, int]] = list(img.getdata())
svg_str: str = vtracer.convert_pixels_to_svg(pixels, img.size)

# All the bells & whistles, also applicable to convert_raw_image_to_svg and convert_pixels_to_svg. 
vtracer.convert_image_to_svg_py(inp,
                                out,
                                colormode = 'color',        # ["color"] or "binary"
                                hierarchical = 'cutout',   # ["stacked"] or "cutout"
                                mode = 'spline',            # ["spline"] "polygon", or "none"
                                filter_speckle = 4,         # default: 4
                                color_precision = 6,        # default: 6
                                layer_difference = 16,      # default: 16
                                corner_threshold = 60,      # default: 60
                                length_threshold = 4.0,     # in [3.5, 10] default: 4.0
                                max_iterations = 10,        # default: 10
                                splice_threshold = 45,      # default: 45
                                path_precision = 8          # default: 8
                                )