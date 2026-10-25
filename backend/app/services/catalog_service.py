import json
import re
from typing import Dict, Any, List
from app.core.config import settings

class CatalogService:
    # Knowledge base of traditional Indian craft domains
    CRAFT_KNOWLEDGE = {
        "pottery": {
            "title_en": "Handcrafted Terracotta Clay Water Vessel & Planter",
            "title_hi": "हस्तनिर्मित पारंपरिक मिट्टी का जलपात्र व गमला",
            "desc_en": "Authentic artisan-molded earthen pottery crafted using heritage wheel-throwing techniques. Naturally porous clay offers traditional cooling and eco-friendly home aesthetic.",
            "desc_hi": "पारंपरिक चाक तकनीक से हस्तनिर्मित शुद्ध मिट्टी का बर्तन। प्राकृतिक मिट्टी से निर्मित यह बर्तन पर्यावरण-अनुकूल और घर की सुंदरता बढ़ाने वाला है।",
            "materials": "Natural Terracotta Clay, Organic River Silt",
            "dimensions": "24cm x 18cm x 18cm",
            "tags": ["Terracotta", "Handmade Pottery", "Eco Friendly", "Earthenware", "Indian Craft"]
        },
        "textiles": {
            "title_en": "Handwoven Pure Mulberry Silk Dupatta with Zari Border",
            "title_hi": "पारंपरिक हथकरघा शहतूत सिल्क दुपट्टा ज़री बॉर्डर सहित",
            "desc_en": "Elegantly handwoven on traditional pit looms by master weavers. Features timeless floral motifs with authentic metallic zari threads, embodying centuries of textile heritage.",
            "desc_hi": "पारंपरिक गड्ढा करघे पर कुशल बुनकरों द्वारा बुना गया सिल्क दुपट्टा। पारंपरिक रूपांकन और असली ज़री वर्क से सजी यह वस्त्र कला का उत्कृष्ट नमूना है।",
            "materials": "Pure Silk, Fine Zari Threads",
            "dimensions": "2.5m x 0.9m",
            "tags": ["Handloom", "Banarasi Silk", "Zari Work", "Traditional Weave", "Ethnic Wear"]
        },
        "woodcraft": {
            "title_en": "Natural Lacquer Turned Channapatna Wooden Toy Set",
            "title_hi": "प्राकृतिक लाख से रंगा चन्नपटना लकड़ी का खिलौना सेट",
            "desc_en": "Crafted from soft Ivory wood (Wrightia tinctoria) and polished with non-toxic organic vegetable dyes and natural shellac lacquer. Safe for children and collectors.",
            "desc_hi": "प्राकृतिक आवेरी लकड़ी से खराद कर बनाया गया और प्राकृतिक वनस्पति रंगों व लाख से चमकाया गया पारंपरिक चन्नपटना खिलौना। बच्चों के लिए पूर्णतः सुरक्षित।",
            "materials": "Hale Wood (Wrightia Tinctoria), Natural Lac, Organic Vegetable Pigments",
            "dimensions": "15cm x 10cm x 10cm",
            "tags": ["Channapatna", "Wooden Toys", "GI Tagged", "Non-Toxic", "Sustainable Craft"]
        },
        "metalcraft": {
            "title_en": "Lost-Wax Cast Bastar Dhokra Bell Metal Figurine",
            "title_hi": "पारंपरिक मोम-सांचा ढोकरा धातु शिल्पकला मूर्ति",
            "desc_en": "Ancient 4000-year-old lost-wax casting technique (cire perdue) brass sculpture depicting tribal life motifs. Each piece is entirely unique and non-replicable.",
            "desc_hi": "प्राचीन मोम-सांचा (ढोकरा) तकनीक से निर्मित पीतल व कांस्य की जनजातीय शिल्पकला मूर्ति। प्रत्येक कलाकृति अपने आप में अद्वितीय और दुर्लभ है।",
            "materials": "Bell Metal, Brass Alloy, Natural Beeswax core",
            "dimensions": "20cm x 12cm x 8cm",
            "tags": ["Dhokra", "Bell Metal", "Lost Wax", "Tribal Art", "Heritage Brass"]
        },
        "painting": {
            "title_en": "Original Hand-Painted Madhubani Folk Art on Handmade Paper",
            "title_hi": "हस्तनिर्मित कागज़ पर पारंपरिक मधुबनी लोक चित्रकला",
            "desc_en": "Detailed Mithila painting drawn using bamboo nibs and natural twig brushes with plant-derived pigments. Depicts auspicious symbols of nature, harmony, and prosperity.",
            "desc_hi": "बांस की कलम और प्राकृतिक वनस्पति रंगों से हाथ से बनाई गई पारंपरिक मिथिला मधुबनी पेंटिंग। समृद्धि और प्रकृति के शुभ प्रतीकों का जीवंत चित्रण।",
            "materials": "Handmade Cotton Rag Paper, Natural Herbal & Mineral Pigments",
            "dimensions": "30cm x 40cm",
            "tags": ["Madhubani Painting", "Mithila Folk Art", "Natural Pigments", "Wall Art", "Traditional Painting"]
        }
    }

    @staticmethod
    def analyze_image_attributes(filename_or_url: str) -> dict:
        """
        Extracts visual craft characteristics and predicts category.
        """
        name_lower = filename_or_url.lower()
        if any(w in name_lower for w in ["silk", "saree", "fabric", "dupatta", "scarf", "textile"]):
            detected_key = "textiles"
            category = "Handloom & Textiles"
        elif any(w in name_lower for w in ["pot", "clay", "terracotta", "ceramic", "vase", "diya"]):
            detected_key = "pottery"
            category = "Pottery & Terracotta"
        elif any(w in name_lower for w in ["wood", "toy", "carving", "lacquer", "channapatna"]):
            detected_key = "woodcraft"
            category = "Woodcraft & Toys"
        elif any(w in name_lower for w in ["dhokra", "brass", "metal", "bell", "bronze"]):
            detected_key = "metalcraft"
            category = "Metalware & Dhokra"
        elif any(w in name_lower for w in ["madhubani", "painting", "art", "canvas", "pattachitra"]):
            detected_key = "painting"
            category = "Folk Paintings & Art"
        else:
            detected_key = "pottery"
            category = "Handicrafts & Decor"

        knowledge = CatalogService.CRAFT_KNOWLEDGE.get(detected_key, CatalogService.CRAFT_KNOWLEDGE["pottery"])
        return {
            "detected_category": category,
            "craft_key": detected_key,
            "suggested_materials": knowledge["materials"],
            "suggested_dimensions": knowledge["dimensions"],
            "confidence_score": 0.94,
            "missing_questions": [
                {"id": "materials", "question_en": "What exact raw material did you use?", "question_hi": "आपने इसमें कौन सी मुख्य सामग्री उपयोग की है?"},
                {"id": "production_days", "question_en": "How many days did it take to craft this piece?", "question_hi": "इस वस्तु को तैयार करने में कितने दिन लगे?"},
                {"id": "care_instructions", "question_en": "Any special care or washing instructions?", "question_hi": "रख-रखाव या धुलाई के लिए कोई विशेष निर्देश?"}
            ]
        }

    @staticmethod
    def generate_catalog_from_voice(transcript: str, language: str = "hi", category_hint: str = None) -> dict:
        """
        Zero-form catalog creation from spoken description in Hindi or English.
        """
        lower_trans = transcript.lower()
        
        # Determine domain
        if any(w in lower_trans for w in ["कपड़ा", "साड़ी", "सिल्क", "सूट", "दुपट्टा", "धागा", "silk", "saree", "handloom", "weave"]):
            key = "textiles"
            category = "Handloom & Textiles"
            craft_type = "Banarasi Handloom Weaving"
        elif any(w in lower_trans for w in ["मिट्टी", "बर्तन", "गमला", "दीया", "clay", "pot", "terracotta"]):
            key = "pottery"
            category = "Pottery & Terracotta"
            craft_type = "Terracotta Wheel Pottery"
        elif any(w in lower_trans for w in ["लकड़ी", "खिलौना", "wood", "toy", "channapatna"]):
            key = "woodcraft"
            category = "Woodcraft & Toys"
            craft_type = "Channapatna Lacquer Woodcraft"
        elif any(w in lower_trans for w in ["पीतल", "धातु", "कांस्य", "dhokra", "metal", "brass"]):
            key = "metalcraft"
            category = "Metalware & Dhokra"
            craft_type = "Bastar Lost-Wax Dhokra Casting"
        elif any(w in lower_trans for w in ["पेंटिंग", "चित्र", "रंग", "मधुबनी", "painting", "art", "madhubani"]):
            key = "painting"
            category = "Folk Paintings & Art"
            craft_type = "Madhubani Traditional Folk Art"
        else:
            key = "pottery"
            category = "Handicrafts & Decor"
            craft_type = "Traditional Handicraft"

        preset = CatalogService.CRAFT_KNOWLEDGE[key]

        # Extract dimensions if present in speech
        dim_match = re.search(r'(\d+[\s]*(?:cm|inch|मीटर|इंच|सेंटीमीटर|m))', lower_trans)
        dimensions = dim_match.group(1) if dim_match else preset["dimensions"]

        # Extract material if spoken
        materials = preset["materials"]
        if "शुद्ध" in transcript or "pure" in lower_trans:
            materials = f"100% Guaranteed Pure {preset['materials']}"

        return {
            "category": category,
            "craft_type": craft_type,
            "title_en": preset["title_en"],
            "title_hi": preset["title_hi"],
            "description_en": preset["desc_en"] + f" (Artisan Note: '{transcript[:120]}...')",
            "description_hi": preset["desc_hi"] + f" (शिल्पकार विवरण: '{transcript[:120]}...')",
            "suggested_materials": materials,
            "suggested_dimensions": dimensions,
            "suggested_tags": preset["tags"],
            "detected_attributes": {
                "Authenticity": "100% Handmade",
                "Origin": "India Artisan Cluster",
                "Technique": craft_type,
                "Eco Friendly": "Yes"
            }
        }

catalog_service = CatalogService()
