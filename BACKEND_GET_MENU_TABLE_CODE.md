# Backend: إرجاع table_code من getMenu

الفرونت إند يرسل عند إنشاء الطلب `merchant_id` و `table_code` فقط. عند فتح المنيو بـ **`?t=JWT_TOKEN`** لا يوجد `tableCode` في الـ URL، فيجب أن يرجع **getMenu** حقل **`table_code`** في الـ response عندما تُحدَّد الطاولة.

## التعديل في controller getMenu

### 1) في بداية الدالة عرّف المتغير:

```js
let merchantId = queryMerchantId;
let branch_id = null;
let table_id = null;
let table_code = null;   // أضف هذا
```

### 2) داخل فرع `if (token)` بعد تعيين `table_id`:

```js
merchantId = tokenMerchantId;
branch_id = tbl.branch_id;
table_id = tbl.id;
table_code = tbl.qr_code ?? null;   // أضف هذا
```

### 3) داخل فرع `else` عند التعامل مع `tableCode`:

```js
if (tableCode) {
  const { data: tbl } = await supabaseAdmin
    .from("table")
    .select("id, branch_id, qr_code")   // أضف qr_code في select
    .eq("qr_code", tableCode)
    .eq("is_active", true)
    .single();
  if (tbl) {
    table_id = tbl.id;
    branch_id = tbl.branch_id;
    table_code = tbl.qr_code ?? tableCode;   // أضف هذا
  } else {
    table_code = tableCode;
  }
}
```

### 4) في الـ result:

```js
const result = {
  merchant_id: merchantId,
  branch_id,
  table_id,
  table_code,   // أضف هذا
  menu,
  categories: [],
};
```

بعد هذا التعديل، الفرونت إند سيستخدم `menuData.table_code` في صفحة الدفع مع create order عند فتح المنيو بـ `?t=TOKEN` أو `?merchantId=...&tableCode=...`.
