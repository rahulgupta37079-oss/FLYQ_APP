from PIL import Image
import requests
from io import BytesIO
import os

screenshots = [
    {
        'name': '1_Home_Screen',
        'url': 'https://www.genspark.ai/api/files/s/U4VDEgsA',
        'description': 'Home screen with Quick Access menu'
    },
    {
        'name': '2_WiFi_Connection',
        'url': 'https://www.genspark.ai/api/files/s/npbGRNUP',
        'description': 'WiFi Connection screen'
    },
    {
        'name': '3_Drone_Control',
        'url': 'https://www.genspark.ai/api/files/s/yEId6hwg',
        'description': 'Drone Control with dual joysticks'
    },
    {
        'name': '4_Camera_Stream',
        'url': 'https://www.genspark.ai/api/files/s/L5eTR2Fn',
        'description': 'Camera Stream with quality controls'
    },
    {
        'name': '5_Settings',
        'url': 'https://www.genspark.ai/api/files/s/CGru0W2H',
        'description': 'Settings and Contact Information'
    }
]

target_width = 1080
target_height = 2400
target_aspect = target_width / target_height

print("Processing screenshots for Google Play Store...")
print(f"Target resolution: {target_width}×{target_height} (9:16 aspect ratio)\n")

for i, screenshot in enumerate(screenshots, 1):
    try:
        print(f"[{i}/5] Processing: {screenshot['name']}...")
        
        # Download image
        response = requests.get(screenshot['url'], timeout=30)
        img = Image.open(BytesIO(response.content))
        
        original_width, original_height = img.size
        print(f"  Original size: {original_width}×{original_height}")
        
        # Calculate aspect ratios
        original_aspect = original_width / original_height
        
        # Resize to target resolution while maintaining aspect ratio
        if abs(original_aspect - target_aspect) < 0.01:
            # Aspect ratio is already correct, just resize
            img_resized = img.resize((target_width, target_height), Image.LANCZOS)
        else:
            # Need to crop and resize
            if original_aspect > target_aspect:
                # Image is too wide, crop width
                new_width = int(original_height * target_aspect)
                left = (original_width - new_width) // 2
                img = img.crop((left, 0, left + new_width, original_height))
            else:
                # Image is too tall, crop height
                new_height = int(original_width / target_aspect)
                top = (original_height - new_height) // 2
                img = img.crop((0, top, original_width, top + new_height))
            
            img_resized = img.resize((target_width, target_height), Image.LANCZOS)
        
        # Save as optimized PNG
        output_path = f"{screenshot['name']}.png"
        img_resized.save(output_path, 'PNG', optimize=True)
        
        file_size = os.path.getsize(output_path)
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"  ✅ Saved: {output_path}")
        print(f"  Final size: {target_width}×{target_height}")
        print(f"  File size: {file_size_mb:.2f} MB")
        print()
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)}\n")

print("=" * 60)
print("✅ All screenshots processed successfully!")
print("=" * 60)

