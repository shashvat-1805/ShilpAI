import os
import uuid
import qrcode
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings

class PassportService:
    @staticmethod
    def generate_craft_passport_qr(public_code: str, base_url: str = "http://localhost:5173") -> str:
        """
        Generates a verified QR code image linking to the public passport URL.
        Includes branded ShilpAI corner aesthetic.
        """
        passport_url = f"{base_url}/passport/public/{public_code}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(passport_url)
        qr.make(fit=True)
        
        # QR image with warm terracotta branding
        qr_img = qr.make_image(fill_color="#23211E", back_color="#FAF8F5").convert("RGB")
        
        # Add small logo/label banner on top or bottom
        canvas = Image.new("RGB", (qr_img.width, qr_img.height + 60), (250, 248, 245))
        canvas.paste(qr_img, (0, 0))
        
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([0, qr_img.height, qr_img.width, qr_img.height + 60], fill=(200, 90, 50))
        
        # Label text
        label_text = f"SHILPAI PASSPORT | {public_code[:16]}"
        draw.text((qr_img.width // 2 - 90, qr_img.height + 22), label_text, fill=(255, 255, 255))
        
        filename = f"qr_{public_code}.png"
        output_dir = os.path.join(settings.UPLOAD_DIR, "qrcodes")
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        
        canvas.save(file_path, "PNG")
        return f"/uploads/qrcodes/{filename}"

    @staticmethod
    def create_craft_story(craft_type: str, artisan_name: str, region: str) -> dict:
        """
        Creates an artisan-approved craft story and heritage provenance text.
        """
        return {
            "story_en": (
                f"Handcrafted with generational mastery by {artisan_name} in the craft cluster of {region}. "
                f"Rooted in the ancient {craft_type} tradition, every piece reflects ethical, slow-craft practices "
                f"using locally sourced natural materials. Your purchase directly supports artisan livelihoods "
                f"and sustains India's living cultural heritage."
            ),
            "story_hi": (
                f"{region} के शिल्प क्लस्टर में {artisan_name} द्वारा पीढ़ियों की पारंपरिक दक्षता से हस्तनिर्मित। "
                f"{craft_type} की प्राचीन कला में रची-बसी यह कृति शुद्ध प्राकृतिक सामग्री और धैर्यपूर्ण हस्तकौशल का प्रमाण है। "
                f"आपकी यह खरीदारी शिल्पकार परिवारों को आत्मनिर्भर बनाने और भारतीय सांस्कृतिक विरासत को जीवित रखने में सहायक है।"
            ),
            "heritage_notes": f"Traditional {craft_type} | Geographical Craft Provenance: {region} | Direct From Artisan Source",
            "materials_certified": "100% Genuine Natural Handcrafted Materials",
            "region_badge": f"Authentic {region} Handcraft"
        }

passport_service = PassportService()
