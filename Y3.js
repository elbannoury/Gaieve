// بيانات المنتجات الكاملة مع خيارات التخصيص المحدثة
const productsData = [
    {
        id: 1,
        name: "BMW M5 CS",
        description: "السيارة الأكثر قوة وأناقة في سلسلة BMW M5. تمتاز بتصميم رياضي أنيق وأداء متميز يجعلها من أفضل السيارات في فئتها.",
        price: 429,
        oldPrice: 499,
        images: [
            "images/file_0000000034e061f4b428852514e78443.png",
            "images/sketch1753465967766.png",
            "images/extra2.jpg",
            "images/extra3.jpg"
        ],
        tag: "الأكثر مبيعاً",
        category: "BMW",
        details: "هذه اللوحة الفنية تم رسمها بدقة عالية باستخدام ألوان زيتية على قماش فني عالي الجودة. تبرز اللوحة التفاصيل الدقيقة للسيارة من خلال استخدام الظلال والإضاءة المحترفة. الإطار الخشبي المصنوع يدوياً يضيف لمسة أنيقة وجمالية للعمل الفني.",
        specifications: [
            { name: "المادة", value: "ألوان زيتية على قماش" },
            { name: "الحجم", value: "80 × 60 سم" },
            { name: "الإطار", value: "خشب طبيعي" },
            { name: "الوزن", value: "2.5 كجم" },
            { name: "الوقت المتوقع للتوصيل", value: "3-5 أيام عمل" },
            { name: "الضمان", value: "5 سنوات" }
        ],
        // إضافة خيارات التخصيص
        sizes: [
            { id: "s1", name: "صغير (50×40 سم)", price: 0 },
            { id: "s2", name: "متوسط (80×60 سم)", price: 50 },
            { id: "s3", name: "كبير (120×90 سم)", price: 100 }
        ],
        frames: [
            { 
                id: "f1", 
                name: "بدون إطار", 
                price: 0,
                thumbnail: "images/pitsiky.png"
            },
            { 
                id: "f2", 
                name: "إطار أساسي", 
                price: 80,
                thumbnail: "images/c/alm.jpeg"
            },
            { 
                id: "f3", 
                name: "إطار مميز", 
                price: 150,
                thumbnail: "images/frames/premium-frame.jpg"
            }
        ],
        addons: [
            { id: "a1", name: "توقيع الفنان", price: 30, selected: false },
            { id: "a2", name: "شهادة أصالة", price: 50, selected: false },
            { id: "a3", name: "تغليف فاخر", price: 40, selected: false }
        ]
    },
