# Backend: GET /public/menu/:menuId?t=TOKEN

الفرونت إند يستخدم **GET /public/menu/:menuId?t=TOKEN** (getMenuById) عند فتح منيو محدد بعد مسح الـ QR.

- **التوكين (t) مطلوب** للأمان.
- الاستجابة الحالية: `{ menu, categories }` فقط.

**اختياري للمرونة:** إرجاع `merchant_id`, `branch_id`, `table_id`, `table_code` في نفس الاستجابة يسمح للفرونت بعدم طلب **/public/scan** مرة ثانية عند فتح المنيو. إن لم تُضفها، الفرونت يدمج مع بيانات الـ scan (يستدعي scan + menuById ثم يدمج).
