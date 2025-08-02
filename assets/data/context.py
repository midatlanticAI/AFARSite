# Add location context
LOCATION_CONTEXT = {
    "service_area": "Fredericksburg and surrounding areas including Spotsylvania, Stafford, Lake of the Woods, Wilderness, Chancellorsville, and Eastern Orange County",
    "cities": [
        "Fredericksburg", 
        "Spotsylvania", 
        "Stafford",
        "Lake of the Woods",
        "Wilderness",
        "Chancellorsville",
        "Hartwood",
        "Brokenburg",
        "Thornburg",
        "Dunavant",
        "Salem Fields",
        "Leavells",
        "Todds Tavern",
        "Alsop",
        "Spotsylvania Courthouse",
        "Paytes Corner",
        "Southern Gateway",
        "Leeland",
        "Brooke",
        "White Oak",
        "Little Falls",
        "New Post",
        "Potomac",
        "Passapatanzy",
        "Sealston",
        "Corbin",
        "Carters Store",
        "Artillery Ridge",
        "Bellvue",
        "Cosners Corner"
    ],
    "common_roads": [
        {"spoken": "low kiss", "actual": "Locust"},
        {"spoken": "locus", "actual": "Locust"},
        {"spoken": "lotus", "actual": "Locust"},
        {"spoken": "lay fayette", "actual": "Lafayette"},
        {"spoken": "laugh yet", "actual": "Lafayette"}, 
        {"spoken": "la fayette", "actual": "Lafayette"},
        {"spoken": "jeff davis", "actual": "Jefferson Davis"},
        {"spoken": "jefferson dave is", "actual": "Jefferson Davis"},
        {"spoken": "jefferson davies", "actual": "Jefferson Davis"},
        {"spoken": "blank road", "actual": "Plank Road"},
        {"spoken": "plank rode", "actual": "Plank Road"},
        {"spoken": "fall hill", "actual": "Fall Hill Avenue"},
        {"spoken": "fall hills", "actual": "Fall Hill Avenue"},
        {"spoken": "four hill", "actual": "Fall Hill Avenue"},
        {"spoken": "gore road", "actual": "Gore Road"},
        {"spoken": "gore rode", "actual": "Gore Road"},
        {"spoken": "route one", "actual": "US Route 1"},
        {"spoken": "route won", "actual": "US Route 1"},
        {"spoken": "you s route one", "actual": "US Route 1"},
        {"spoken": "ninety five", "actual": "I-95"},
        {"spoken": "eye ninety five", "actual": "I-95"},
        {"spoken": "i ninety five", "actual": "I-95"},
        {"spoken": "interstate ninety five", "actual": "I-95"},
        {"spoken": "three", "actual": "Route 3"},
        {"spoken": "route three", "actual": "Route 3"},
        {"spoken": "root three", "actual": "Route 3"},
        {"spoken": "seventeen", "actual": "Route 17"},
        {"spoken": "route seventeen", "actual": "Route 17"},
        {"spoken": "one seven", "actual": "Route 17"},
        {"spoken": "two oh eight", "actual": "Route 208"},
        {"spoken": "route two oh eight", "actual": "Route 208"},
        {"spoken": "two zero eight", "actual": "Route 208"},
        {"spoken": "two eleven", "actual": "Route 211"},
        {"spoken": "route two eleven", "actual": "Route 211"},
        {"spoken": "two one one", "actual": "Route 211"},
        {"spoken": "courthouse", "actual": "Courthouse Road"},
        {"spoken": "court house", "actual": "Courthouse Road"},
        {"spoken": "court house rode", "actual": "Courthouse Road"},
        {"spoken": "mine", "actual": "Mine Road"},
        {"spoken": "mine rode", "actual": "Mine Road"},
        {"spoken": "minds", "actual": "Mine Road"},
        {"spoken": "harrison", "actual": "Harrison Road"},
        {"spoken": "hair is in", "actual": "Harrison Road"},
        {"spoken": "harrisons", "actual": "Harrison Road"},
        {"spoken": "hood", "actual": "Hood Drive"},
        {"spoken": "hood dr", "actual": "Hood Drive"},
        {"spoken": "who'd drive", "actual": "Hood Drive"},
        {"spoken": "princess ann", "actual": "Princess Anne Street"},
        {"spoken": "princess anne", "actual": "Princess Anne Street"},
        {"spoken": "princess an", "actual": "Princess Anne Street"},
        {"spoken": "princess and", "actual": "Princess Anne Street"}
    ],
    "neighborhoods": [
        "Salem Fields",
        "Lake of the Woods",
        "Chancellorsville",
        "Wilderness",
        "Artillery Ridge",
        "Bellvue",
        "Southern Gateway",
        "Leeland Station",
        "Celebrate Virginia",
        "Central Park",
        "Cosners Corner",
        "Courthouse Commons",
        "Leavells Station",
        "Spotsylvania Towne Centre",
        "Harrison Crossing",
        "Lee's Hill",
        "River Club",
        "Falls Run",
        "Austin Ridge",
        "Idlewild",
        "Fawn Lake"
    ],
    "landmarks": [
        {"spoken": "mary wash", "actual": "Mary Washington Hospital"},
        {"spoken": "mary washington", "actual": "Mary Washington Hospital"},
        {"spoken": "spotsylvania town center", "actual": "Spotsylvania Towne Centre"},
        {"spoken": "spots town center", "actual": "Spotsylvania Towne Centre"},
        {"spoken": "central park", "actual": "Central Park Shopping Center"},
        {"spoken": "umw", "actual": "University of Mary Washington"},
        {"spoken": "mary washington university", "actual": "University of Mary Washington"},
        {"spoken": "spotsylvania courthouse", "actual": "Spotsylvania County Courthouse"},
        {"spoken": "spots courthouse", "actual": "Spotsylvania County Courthouse"},
        {"spoken": "stafford courthouse", "actual": "Stafford County Courthouse"},
        {"spoken": "pratt park", "actual": "Pratt Park"},
        {"spoken": "old mill park", "actual": "Old Mill Park"}
    ],
    "counties": [
        "Spotsylvania County",
        "Stafford County",
        "Orange County",
        "City of Fredericksburg",
        {"spoken": "spotsy", "actual": "Spotsylvania County"},
        {"spoken": "fred", "actual": "City of Fredericksburg"},
        {"spoken": "the burg", "actual": "City of Fredericksburg"},
        {"spoken": "fredericks burg", "actual": "City of Fredericksburg"}
    ],
    "zip_codes": [
        "22401",  # Downtown Fredericksburg
        "22405",  # North Stafford
        "22406",  # Falmouth/Stafford
        "22407",  # Spotsylvania/Chancellor
        "22408",  # Spotsylvania/Courthouse
        "22553",  # Spotsylvania/Salem Fields
        "22554",  # North Stafford
        "22556",  # South Stafford
        "22960",  # Orange/Lake of the Woods
        "22427",  # Spotsylvania/Post Oak
        "22508",  # Wilderness
        "22534",  # Spotsylvania/Thornburg
        "22485"   # King George
    ]
}

# Enhance appliance context
APPLIANCE_CONTEXT = {
    "brands": [
        {"spoken": "oil pool", "actual": "Whirlpool"},
        {"spoken": "world pool", "actual": "Whirlpool"},
        {"spoken": "mail tag", "actual": "Maytag"},
        {"spoken": "may tech", "actual": "Maytag"},
        {"spoken": "gee ee", "actual": "GE"},
        {"spoken": "general electric", "actual": "GE"},
        {"spoken": "el gee", "actual": "LG"},
        {"spoken": "life's good", "actual": "LG"},
        {"spoken": "kitchen aid", "actual": "KitchenAid"},
        {"spoken": "kitchen made", "actual": "KitchenAid"},
        {"spoken": "sam sung", "actual": "Samsung"},
        {"spoken": "sun song", "actual": "Samsung"},
        {"spoken": "ken more", "actual": "Kenmore"},
        {"spoken": "can more", "actual": "Kenmore"},
        {"spoken": "fridge a dare", "actual": "Frigidaire"},
        {"spoken": "frigidar", "actual": "Frigidaire"},
        {"spoken": "a mana", "actual": "Amana"},
        {"spoken": "amanda", "actual": "Amana"},
        {"spoken": "hot point", "actual": "Hotpoint"},
        {"spoken": "high point", "actual": "Hotpoint"}
    ],
    "excluded_brands": [
        "Bosch",
        "Viking",
        "Sub-Zero",
        "Wolf",
        "Miele",
        "Thermador",
        "Gaggenau",
        "La Cornue",
        "Dacor",
        "Fisher & Paykel",
        "Bertazzoni",
        "JennAir",
        "Monogram",
        "BlueStar",
        "AGA",
        "DCS",
        "Liebherr",
        "Midea"
    ],
    "supported_brands": [
        "Whirlpool",
        "Maytag", 
        "GE",
        "LG",
        "KitchenAid",
        "Samsung",
        "Kenmore",
        "Frigidaire",
        "Amana",
        "Hotpoint",
        "Roper",
        "Estate",
        "Admiral",
        "Magic Chef",
        "Premier",
        "Hisense",
        "Summit",
    ],
      
    "types of appliances serviced": [
        "washer", "dryer", "refrigerator", "dishwasher", "oven", "stove", 
        "microwave", "range", "cooktop", "freezer", "ice maker", 
        "wine cooler",
    ],

    "types of appliances not serviced": [
        "garbage disposal", "trash compactor", "ceiling fan", "air conditioner",
        "dehumidifier", "humidifier", "water heater", "toaster", "toaster oven",
        "coffee maker", "blender", "food processor", "slow cooker", "instant pot",
        
    ],
    "common_issues": [
        "not starting", "leaking", "making noise", "not heating", 
        "not cooling", "not draining", "not spinning", "door issues",
        "ice maker problems", "error codes", "won't turn on",
        "burning smell", "water leaking", "freezing up", "not dispensing",
        "not cleaning", "not drying", "not agitating", "not heating water", 
        "not filling", "tripping breaker", "blowing fuse", "overheating",
        "timer not advancing", "display not working", "buttons not responding",
        "vibrating excessively", "squealing", "grinding", "clicking",
        "power fluctuations", "rust", "corrosion", "mold", "bad odors",
        "water pressure issues", "uneven heating", "sparking", "smoking",
        "not defrosting", "ice buildup", "seal damage", "ventilation problems",
        "thermostat issues", "sensor failures", "motor burnout", "belt slipping",
        "water temperature issues", "drainage blockage", "filter clogs",
        "electrical shorts", "gas leaks", "pilot light problems",
        "won't start", "doesn't start", "stopped working", "broken",
        "making loud noise", "strange noise", "weird sound", "banging",
        "not working right", "acting up", "giving problems", "needs repair",
        "stopped running", "quit working", "broke down", "not functioning"
    ],
    "parts": [
        {"spoken": "control board", "actual": "control board"},
        {"spoken": "circuit board", "actual": "control board"},
        {"spoken": "mother board", "actual": "control board"},
        {"spoken": "motor", "actual": "motor"},
        {"spoken": "pump", "actual": "pump"},
        {"spoken": "water pump", "actual": "pump"},
        {"spoken": "heating element", "actual": "heating element"},
        {"spoken": "heater", "actual": "heating element"},
        {"spoken": "thermostat", "actual": "thermostat"},
        {"spoken": "temperature control", "actual": "thermostat"},
        {"spoken": "compressor", "actual": "compressor"},
        {"spoken": "seal", "actual": "seal"},
        {"spoken": "gasket", "actual": "gasket"},
        {"spoken": "rubber seal", "actual": "gasket"},
        {"spoken": "belt", "actual": "belt"},
        {"spoken": "drive belt", "actual": "belt"},
        {"spoken": "filter", "actual": "filter"},
        {"spoken": "water filter", "actual": "filter"},
        {"spoken": "drain hose", "actual": "drain hose"},
        {"spoken": "drainage hose", "actual": "drain hose"},
        {"spoken": "water inlet valve", "actual": "water inlet valve"},
        {"spoken": "water valve", "actual": "water inlet valve"},
        {"spoken": "drain pump", "actual": "drain pump"},
        {"spoken": "agitator", "actual": "agitator"},
        {"spoken": "impeller", "actual": "impeller"},
        {"spoken": "float switch", "actual": "float switch"},
        {"spoken": "fill valve", "actual": "fill valve"},
        {"spoken": "door latch", "actual": "door latch"},
        {"spoken": "door switch", "actual": "door switch"},
        {"spoken": "timer", "actual": "timer"},
        {"spoken": "temperature sensor", "actual": "temperature sensor"},
        {"spoken": "thermal fuse", "actual": "thermal fuse"},
        {"spoken": "igniter", "actual": "igniter"},
        {"spoken": "ignitor", "actual": "igniter"},
        {"spoken": "burner", "actual": "burner"},
        {"spoken": "flame sensor", "actual": "flame sensor"},
        {"spoken": "defrost timer", "actual": "defrost timer"},
        {"spoken": "defrost heater", "actual": "defrost heater"},
        {"spoken": "fan motor", "actual": "fan motor"},
        {"spoken": "condenser", "actual": "condenser"},
        {"spoken": "evaporator", "actual": "evaporator"},
        {"spoken": "door hinge", "actual": "door hinge"},
        {"spoken": "ice maker assembly", "actual": "ice maker assembly"},
        {"spoken": "water filter", "actual": "water filter"},
        {"spoken": "spray arm", "actual": "spray arm"},
        {"spoken": "circulation pump", "actual": "circulation pump"},
        {"spoken": "door spring", "actual": "door spring"},
        {"spoken": "door seal", "actual": "door seal"},
        {"spoken": "control panel", "actual": "control panel"},
        {"spoken": "display board", "actual": "display board"},
        {"spoken": "power supply board", "actual": "power supply board"},
        {"spoken": "drum", "actual": "drum"},
        {"spoken": "drum bearing", "actual": "drum bearing"},
        {"spoken": "drum roller", "actual": "drum roller"},
        {"spoken": "idler pulley", "actual": "idler pulley"},
        {"spoken": "drive belt", "actual": "drive belt"},
        {"spoken": "drive motor", "actual": "drive motor"},
        {"spoken": "transmission", "actual": "transmission"}
    ],
    
    "diagnostic_fee": 90,
    "service_hours": {
        "weekday": "8:00 AM - 5:00 PM",
        "weekend": "Closed"
    },
    "emergency_service": "Limited same-day service available, but no 24/7 emergency service specified"
}

COMPANY_INFO = {
    "name": "All Fixed Appliance Repairs LLC",
    "owner": "Lou Scott",
    "veteran_status": "Veteran - Air Force",
    "years_of_experience": 35,
    "years_in_business": 9,
    "license_info": {
        "number": "VA-2705123456",
        "type": "Class A Contractor",
        "state": "Virginia"
    },
    "certifications": [
        {
            "number": "822813905419661221M",
            "type": "EPA 608 Certification"
        }
    ],
    "insurance": {
        "liability": "$2,000,000",
        "workers_comp": "Yes"
    },
    "service_details": {
        "diagnostic_fee": 90,
        "warranty": {
            "labor": "30 days",
            "parts": "90 days"
        },
        "payment_methods": [
            "Credit Card", "Debit Card", "Cash", "Check"
        ],
        "service_hours": {
            "weekday": "8:00 AM - 5:00 PM",
            "weekend": "Closed",
            "emergency": "Limited availability for same-day service"
        }
    },
    "policies": {
        "cancellation": "24 hour notice required",
        "diagnostic_fee_policy": "Waived if repair is completed by All Fixed Appliance Repairs LLC",
        "warranty_terms": "Parts guaranteed for 90 days, labor for 30 days",
        "emergency_policy": "Limited same-day service available, additional fees may apply"
    },
    "specialties": {
        "appliance_types": [
            "Refrigerators", "Washers", "Dryers", "Dishwashers",
            "Ovens", "Stoves", "Microwaves", "Ice Makers"
        ],
        "services performed": [
            "Repairs", "Maintenance", "Part Replacement",
            "Diagnostic Services"
        ]
    },
        "services not offered": [
            "appliance installation", "appliance disposal", "dryer vent services",
            "sales", "commercial refrigeration", "commercial appliances"
    ],

    "recommened providers": [
        {
            "dryer vent cleaning": {
                "Dryer Vent guys": "thedvguys.com Phone number (540) 548-7200"
            }
        }
    ],
    
    "contact": {
        "phone": "540-441-4349",
        "email": "service@allfixedappliance.com",
        "website": "www.allfixedappliance.com",
        "hours": "8:00 AM - 5:00 PM EST, Closed on weekends"
    }
}
