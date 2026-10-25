from typing import List, Dict, Any

class MarketingService:
    @staticmethod
    def generate_marketing_pack(
        product_title: str,
        craft_type: str,
        materials: str,
        price: float,
        artisan_name: str,
        region: str,
        festival_focus: str = None
    ) -> List[Dict[str, Any]]:
        fest = festival_focus or "Festive & Wedding Season"
        
        pack = [
            {
                "asset_type": "instagram",
                "content_en": (
                    f"✨ Bring soulful Indian heritage into your home. Each '{product_title}' is patiently hand-crafted "
                    f"by master artisan {artisan_name} in {region} using age-old {craft_type} techniques. "
                    f"🌿 100% genuine {materials}. Direct from artisan hands to your doorstep. Tap link in bio to order! 🛍️"
                ),
                "content_hi": (
                    f"✨ भारतीय सांस्कृतिक विरासत की अनूठी चमक अपने घर लाएं। '{product_title}' को {region} के कुशल शिल्पकार {artisan_name} "
                    f"ने {craft_type} की पारंपरिक विधा से तैयार किया है। 🌿 शुद्ध {materials}। शिल्पकार से सीधे आपके घर तक। ऑर्डर के लिए बायो में दिए लिंक पर क्लिक करें!"
                ),
                "hashtags": "#IndianHandicrafts #VocalForLocal #ArtisanMade #EthicalLiving #HandmadeInIndia #SlowCraft #CraftCulture"
            },
            {
                "asset_type": "whatsapp",
                "content_en": (
                    f"🙏 *Namaste! New Craft Arrival from ShilpAI*\n\n"
                    f"*{product_title}*\n"
                    f"• *Craft:* {craft_type} ({region})\n"
                    f"• *Artisan:* {artisan_name}\n"
                    f"• *Material:* {materials}\n"
                    f"• *Special Price:* ₹{price:.2f} (Direct Artisan Price)\n"
                    f"• *Dispatch:* 2-3 Business Days with Digital Craft Passport QR.\n\n"
                    f"Reply 'INTERESTED' or call us to reserve your authentic piece!"
                ),
                "content_hi": (
                    f"🙏 *नमस्ते! शिल्पएआई से नया हस्तशिल्प संग्रह*\n\n"
                    f"*{product_title}*\n"
                    f"• *कला विधा:* {craft_type} ({region})\n"
                    f"• *शिल्पकार:* {artisan_name}\n"
                    f"• *सामग्री:* {materials}\n"
                    f"• *मूल्य:* मात्र ₹{price:.2f} (सीधे शिल्पकार से)\n"
                    f"• *डिस्पैच:* 2-3 कार्य दिवस में डिजिटल पासपोर्ट सहित।\n\n"
                    f"ऑर्डर या पूछताछ के लिए अभी रिप्लाई करें!"
                ),
                "hashtags": "#DirectArtisan #SpecialOffer"
            },
            {
                "asset_type": "facebook",
                "content_en": (
                    f"Support generational Indian artistry! 🇮🇳 Meet the maker behind our '{product_title}'. "
                    f"{artisan_name} preserves centuries-old {craft_type} in {region}. Every purchase provides fair wages "
                    f"and keeps our indigenous arts thriving. Price: ₹{price:.2f}. Free shipping available on bulk orders!"
                ),
                "content_hi": (
                    f"भारतीय हस्तशिल्प और कारीगरों का समर्थन करें! 🇮🇳 {region} के शिल्पकार {artisan_name} द्वारा सदियों पुरानी {craft_type} कला से तैयार '{product_title}'। "
                    f"प्रत्येक खरीदारी कारीगर परिवारों को सम्मानजनक आजीविका प्रदान करती है। मूल्य: ₹{price:.2f}।"
                ),
                "hashtags": "#MakeInIndia #SupportArtisans #TraditionalCrafts #HandmadeWithLove"
            },
            {
                "asset_type": "festival_campaign",
                "content_en": (
                    f"🪔 *Celebrate {fest} with Conscious Luxury!* Gift your loved ones something with a soul and story. "
                    f"The '{product_title}' is hand-crafted with auspicious motifs, natural {materials}, and authentic GI heritage. "
                    f"Special corporate and festive bulk gifting discounts available."
                ),
                "content_hi": (
                    f"🪔 *{fest} मनाएं शुद्ध भारतीय हस्तशिल्प के साथ!* अपनों को उपहार में दें आत्मा और परंपरा से जुड़ी कलाकृति। "
                    f"'{product_title}' शुद्ध {materials} और शुभ प्रतीकों से निर्मित है। कॉर्पोरेट व पारिवारिक उपहारों पर विशेष छूट उपलब्ध।"
                ),
                "hashtags": f"#FestiveGifting #{fest.replace(' ', '')} #CorporateGifting #IndianFestivals"
            },
            {
                "asset_type": "reel_script",
                "content_en": (
                    f"[SCENE 1: Close-up on artisan hands working on {craft_type}]\n"
                    f"VO: 'Did you know it takes over 3 days of focused patience to shape just one of these?'\n"
                    f"[SCENE 2: Wide shot of raw {materials} transforming into shape]\n"
                    f"VO: 'Meet {artisan_name} from {region}, keeping India's living heritage alive.'\n"
                    f"[SCENE 3: Finished '{product_title}' displayed in warm sunlight]\n"
                    f"VO: 'Genuine handmade soul. Scan the Craft Passport QR to verify its story. Tap to order!'"
                ),
                "content_hi": (
                    f"[दृश्य 1: {craft_type} पर काम करते शिल्पकार के हाथों का क्लोज-अप]\n"
                    f"आवाज: 'क्या आप जानते हैं कि एक कृति को गढ़ने में 3 दिन की निरंतर साधना लगती है?'\n"
                    f"[दृश्य 2: कच्ची {materials} को आकार लेते हुए दिखाना]\n"
                    f"आवाज: 'मिलिए {region} के मास्टर शिल्पकार {artisan_name} से।'\n"
                    f"[दृश्य 3: तैयार '{product_title}' की खूबसूरत झलक]\n"
                    f"आवाज: 'सच्ची हस्तकला, सीधा कारीगर से। क्राफ्ट पासपोर्ट स्कैन करें और अभी ऑर्डर करें!'"
                ),
                "hashtags": "#ReelCraft #ArtisanStory #BehindTheCraft #ViralHandmade"
            },
            {
                "asset_type": "b2b_catalog_sheet",
                "content_en": (
                    f"SPECIFICATION SHEET: {product_title}\n"
                    f"• Classification: {craft_type} | Category: Traditional Indian Art\n"
                    f"• Production Capacity: 50-200 units/month per cluster\n"
                    f"• Standard Wholesale MOQ: 25 units\n"
                    f"• Recommended Retail Price (MSRP): ₹{price:.2f}\n"
                    f"• Quality Certification: 100% Artisan Authenticity Guaranteed with digital QR passport."
                ),
                "content_hi": (
                    f"थोक खरीद विनिर्देश पत्र: {product_title}\n"
                    f"• शिल्प वर्गीकरण: {craft_type}\n"
                    f"• क्लस्टर उत्पादन क्षमता: 50-200 नग प्रति माह\n"
                    f"• न्यूनतम थोक मात्रा: 25 नग\n"
                    f"• सुझाई गई खुदरा दर: ₹{price:.2f}\n"
                    f"• गुणवत्ता प्रमाणन: डिजिटल क्राफ्ट पासपोर्ट सहित 100% हस्तनिर्मित।"
                ),
                "hashtags": "#B2BProcurement #WholesaleCrafts #ClusterSourcing"
            }
        ]
        return pack

marketing_service = MarketingService()
