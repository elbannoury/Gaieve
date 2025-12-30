// إنشاء أيقونة مؤقتة باستخدام JavaScript (احفظها كـ create-icon.js)
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // خلفية زرقاء
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, size, size);
    
    // دائرة بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // حرف G في المنتصف
    ctx.fillStyle = '#4f46e5';
    ctx.font = `bold ${size/3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', size/2, size/2);
    
    // حفظ الصورة
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon-${size}x${size}.png`, buffer);
});

console.log('تم إنشاء الأيقونات بنجاح');
